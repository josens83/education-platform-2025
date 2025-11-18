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
 * OpenAI 기반 추천
 *
 * GPT-4를 사용하여 사용자의 학습 기록과 선호도를 분석하고
 * 개인화된 책 추천 및 학습 조언을 제공합니다.
 */
async function getAIRecommendations(userId, userPreferences) {
  try {
    // OpenAI API가 비활성화된 경우 기본 추천으로 대체
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured, falling back to hybrid recommendations');
      return {
        message: '하이브리드 추천 알고리즘을 사용하여 책을 추천합니다',
        books: await getHybridRecommendations(userId, 5),
        aiEnabled: false,
      };
    }

    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // 사용자의 학습 기록 가져오기
    const userHistory = await pool.query(
      `
      SELECT b.title, b.category, b.level, b.description,
             rp.progress, rp.completed_at
      FROM reading_progress rp
      JOIN books b ON rp.book_id = b.id
      WHERE rp.user_id = $1
      ORDER BY rp.updated_at DESC
      LIMIT 10
      `,
      [userId]
    );

    // 사용 가능한 책 목록
    const availableBooks = await pool.query(
      `
      SELECT id, title, category, level, description
      FROM books
      WHERE published = true
        AND id NOT IN (
          SELECT book_id FROM reading_progress WHERE user_id = $1
        )
      ORDER BY created_at DESC
      LIMIT 50
      `,
      [userId]
    );

    // GPT-4에게 추천 요청
    const prompt = `
당신은 영어 교육 전문가입니다. 학생의 학습 기록을 분석하여 최적의 책을 추천해주세요.

**학생의 학습 기록:**
${userHistory.rows.map(r => `- ${r.title} (${r.category}, ${r.level}) - 진도: ${r.progress}%`).join('\n')}

**학생 선호도:**
${userPreferences ? JSON.stringify(userPreferences, null, 2) : '정보 없음'}

**추천 가능한 책 목록:**
${availableBooks.rows.map((b, i) => `${i + 1}. [ID: ${b.id}] ${b.title} - ${b.category}, ${b.level}\n   ${b.description}`).join('\n\n')}

위 목록에서 학생에게 가장 적합한 3-5권의 책을 추천하고, 각 책에 대한 추천 이유를 설명해주세요.

응답은 다음 JSON 형식으로만 작성하세요:
{
  "recommendations": [
    {
      "bookId": 책ID(숫자),
      "reason": "추천 이유 (한글로 2-3문장)",
      "priority": 우선순위(1-5)
    }
  ],
  "learningAdvice": "전반적인 학습 조언 (한글로 3-4문장)"
}
`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 영어 교육 전문가입니다. 학생의 레벨과 관심사를 고려하여 최적의 학습 자료를 추천합니다.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = JSON.parse(response.choices[0].message.content);

    // 추천된 책 정보 가져오기
    const recommendedBookIds = aiResponse.recommendations.map(r => r.bookId);
    const booksResult = await pool.query(
      'SELECT * FROM books WHERE id = ANY($1)',
      [recommendedBookIds]
    );

    // 책 정보와 AI 추천 이유 결합
    const recommendations = booksResult.rows.map(book => {
      const aiRec = aiResponse.recommendations.find(r => r.bookId === book.id);
      return {
        ...book,
        aiReason: aiRec?.reason,
        aiPriority: aiRec?.priority,
      };
    });

    return {
      message: aiResponse.learningAdvice,
      books: recommendations,
      aiEnabled: true,
    };
  } catch (error) {
    console.error('Error in AI recommendations:', error);

    // 오류 발생 시 기본 추천으로 대체
    return {
      message: '일시적으로 AI 추천을 사용할 수 없어 기본 추천을 제공합니다',
      books: await getHybridRecommendations(userId, 5),
      aiEnabled: false,
      error: error.message,
    };
  }
}

module.exports = {
  getCollaborativeRecommendations,
  getContentBasedRecommendations,
  getPopularRecommendations,
  getHybridRecommendations,
  getAIRecommendations,
};
