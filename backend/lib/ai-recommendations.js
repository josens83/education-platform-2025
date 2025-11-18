/**
 * AI 추천 시스템 (협업 필터링)
 *
 * 사용자의 학습 패턴과 다른 사용자들의 행동을 분석하여
 * 맞춤형 책 추천을 제공합니다.
 *
 * TODO: OpenAI API 또는 자체 ML 모델 통합
 */

const pool = require('./db');

/**
 * 협업 필터링 기반 책 추천
 *
 * User-Based Collaborative Filtering 알고리즘:
 * 1. 유사한 학습 패턴을 가진 사용자 찾기
 * 2. 그들이 읽은 책 중 현재 사용자가 아직 읽지 않은 책 추천
 */
async function getCollaborativeRecommendations(userId, limit = 5) {
  try {
    const result = await pool.query(
      `
      WITH user_reads AS (
        -- 현재 사용자가 읽은 책
        SELECT book_id FROM reading_progress WHERE user_id = $1
      ),
      similar_users AS (
        -- 유사한 책을 읽은 다른 사용자
        SELECT rp.user_id, COUNT(*) as common_books
        FROM reading_progress rp
        WHERE rp.book_id IN (SELECT book_id FROM user_reads)
          AND rp.user_id != $1
        GROUP BY rp.user_id
        ORDER BY common_books DESC
        LIMIT 20
      ),
      recommended_books AS (
        -- 유사 사용자들이 읽은 책 중 현재 사용자가 안 읽은 책
        SELECT rp.book_id, COUNT(*) as recommendation_score
        FROM reading_progress rp
        WHERE rp.user_id IN (SELECT user_id FROM similar_users)
          AND rp.book_id NOT IN (SELECT book_id FROM user_reads)
        GROUP BY rp.book_id
        ORDER BY recommendation_score DESC
        LIMIT $2
      )
      SELECT b.*, rb.recommendation_score
      FROM books b
      JOIN recommended_books rb ON b.id = rb.book_id
      WHERE b.published = true
      ORDER BY rb.recommendation_score DESC
      `,
      [userId, limit]
    );

    return result.rows;
  } catch (error) {
    console.error('Error in collaborative recommendations:', error);
    return [];
  }
}

/**
 * 콘텐츠 기반 추천
 *
 * Content-Based Filtering:
 * 사용자가 최근에 읽은 책과 유사한 카테고리/레벨의 책 추천
 */
async function getContentBasedRecommendations(userId, limit = 5) {
  try {
    const result = await pool.query(
      `
      WITH user_preferences AS (
        -- 사용자가 최근에 읽은 책의 카테고리와 레벨
        SELECT b.category, b.level, COUNT(*) as count
        FROM reading_progress rp
        JOIN books b ON rp.book_id = b.id
        WHERE rp.user_id = $1
          AND rp.created_at >= NOW() - INTERVAL '3 months'
        GROUP BY b.category, b.level
        ORDER BY count DESC
        LIMIT 3
      ),
      user_reads AS (
        SELECT book_id FROM reading_progress WHERE user_id = $1
      )
      SELECT b.*,
             CASE
               WHEN b.category IN (SELECT category FROM user_preferences) THEN 2
               ELSE 0
             END +
             CASE
               WHEN b.level IN (SELECT level FROM user_preferences) THEN 1
               ELSE 0
             END as relevance_score
      FROM books b
      WHERE b.id NOT IN (SELECT book_id FROM user_reads)
        AND b.published = true
        AND (
          b.category IN (SELECT category FROM user_preferences)
          OR b.level IN (SELECT level FROM user_preferences)
        )
      ORDER BY relevance_score DESC, b.created_at DESC
      LIMIT $2
      `,
      [userId, limit]
    );

    return result.rows;
  } catch (error) {
    console.error('Error in content-based recommendations:', error);
    return [];
  }
}

/**
 * 인기 도서 추천
 *
 * 최근 30일간 가장 많이 읽힌 책
 */
async function getPopularRecommendations(limit = 5) {
  try {
    const result = await pool.query(
      `
      SELECT b.*, COUNT(DISTINCT rp.user_id) as reader_count
      FROM books b
      JOIN reading_progress rp ON b.id = rp.book_id
      WHERE rp.created_at >= NOW() - INTERVAL '30 days'
        AND b.published = true
      GROUP BY b.id
      ORDER BY reader_count DESC, b.created_at DESC
      LIMIT $1
      `,
      [limit]
    );

    return result.rows;
  } catch (error) {
    console.error('Error in popular recommendations:', error);
    return [];
  }
}

/**
 * 하이브리드 추천
 *
 * 협업 필터링, 콘텐츠 기반, 인기도를 결합한 추천
 */
async function getHybridRecommendations(userId, limit = 10) {
  try {
    const [collaborative, contentBased, popular] = await Promise.all([
      getCollaborativeRecommendations(userId, limit),
      getContentBasedRecommendations(userId, limit),
      getPopularRecommendations(limit),
    ]);

    // 중복 제거 및 점수 계산
    const bookMap = new Map();

    collaborative.forEach((book, index) => {
      const score = (limit - index) * 3; // 협업 필터링 가중치 3
      bookMap.set(book.id, { ...book, score });
    });

    contentBased.forEach((book, index) => {
      const score = (limit - index) * 2; // 콘텐츠 기반 가중치 2
      if (bookMap.has(book.id)) {
        bookMap.get(book.id).score += score;
      } else {
        bookMap.set(book.id, { ...book, score });
      }
    });

    popular.forEach((book, index) => {
      const score = (limit - index) * 1; // 인기도 가중치 1
      if (bookMap.has(book.id)) {
        bookMap.get(book.id).score += score;
      } else {
        bookMap.set(book.id, { ...book, score });
      }
    });

    // 점수순으로 정렬
    const recommendations = Array.from(bookMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return recommendations;
  } catch (error) {
    console.error('Error in hybrid recommendations:', error);
    return [];
  }
}

/**
 * OpenAI 기반 추천 (선택적)
 *
 * TODO: OpenAI API를 사용한 고급 추천
 *
 * 사용법:
 * 1. npm install openai
 * 2. .env에 OPENAI_API_KEY 설정
 * 3. 이 함수에서 OpenAI API 호출
 */
async function getAIRecommendations(userId, userPreferences) {
  // TODO: OpenAI API 통합
  // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // const response = await openai.chat.completions.create({ ... });

  return {
    message: 'OpenAI 추천은 향후 구현 예정입니다',
    books: [],
  };
}

module.exports = {
  getCollaborativeRecommendations,
  getContentBasedRecommendations,
  getPopularRecommendations,
  getHybridRecommendations,
  getAIRecommendations,
};
