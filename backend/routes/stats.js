const express = require('express');
const router = express.Router();
const { query } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// 모든 라우트는 인증 필요
router.use(authenticateToken);

// ============================================
// 학습 스트릭 계산 및 조회
// ============================================
router.get('/streak', async (req, res) => {
  try {
    const userId = req.user.id;

    // 오늘부터 역순으로 학습 활동 조회
    const activityResult = await query(
      `SELECT DISTINCT DATE(last_accessed_at) as activity_date
       FROM learning_progress
       WHERE user_id = $1 AND last_accessed_at IS NOT NULL
       ORDER BY activity_date DESC`,
      [userId]
    );

    if (activityResult.rows.length === 0) {
      return res.json({
        status: 'success',
        data: {
          current_streak: 0,
          longest_streak: 0,
          total_days: 0,
          last_activity: null
        }
      });
    }

    const activities = activityResult.rows.map(row => new Date(row.activity_date));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 현재 스트릭 계산
    let currentStreak = 0;
    let checkDate = new Date(today);

    for (const activityDate of activities) {
      const actDate = new Date(activityDate);
      actDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((checkDate - actDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0 || daysDiff === 1) {
        currentStreak++;
        checkDate = new Date(actDate);
      } else {
        break;
      }
    }

    // 최장 스트릭 계산
    let longestStreak = 0;
    let tempStreak = 1;
    let prevDate = activities[0];

    for (let i = 1; i < activities.length; i++) {
      const curr = new Date(activities[i]);
      curr.setHours(0, 0, 0, 0);

      const prev = new Date(prevDate);
      prev.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((prev - curr) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }

      prevDate = activities[i];
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    res.json({
      status: 'success',
      data: {
        current_streak: currentStreak,
        longest_streak: longestStreak,
        total_days: activities.length,
        last_activity: activities[0].toISOString().split('T')[0],
        is_today_complete: activities[0].toDateString() === today.toDateString()
      }
    });
  } catch (error) {
    console.error('스트릭 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '스트릭 조회 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 주간/월간 학습 통계
// ============================================
router.get('/overview', async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'week' } = req.query; // week, month, year

    let startDate;
    const today = new Date();

    switch (period) {
      case 'week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
    }

    // 기간별 통계 조회
    const statsResult = await query(
      `SELECT
         COUNT(DISTINCT lp.chapter_id) as chapters_read,
         COUNT(DISTINCT lp.book_id) as books_started,
         COUNT(DISTINCT lp.id) FILTER (WHERE lp.is_completed = true) as chapters_completed,
         COALESCE(SUM(lp.time_spent_seconds), 0) as total_time_seconds,
         COUNT(DISTINCT qa.id) as quizzes_taken,
         COUNT(DISTINCT qa.id) FILTER (WHERE qa.is_passed = true) as quizzes_passed,
         COUNT(DISTINCT v.id) as words_added
       FROM users u
       LEFT JOIN learning_progress lp ON u.id = lp.user_id AND lp.last_accessed_at >= $2
       LEFT JOIN quiz_attempts qa ON u.id = qa.user_id AND qa.started_at >= $2
       LEFT JOIN vocabulary v ON u.id = v.user_id AND v.created_at >= $2
       WHERE u.id = $1
       GROUP BY u.id`,
      [userId, startDate]
    );

    // 일별 활동 데이터
    const dailyActivityResult = await query(
      `SELECT
         DATE(last_accessed_at) as date,
         COUNT(DISTINCT chapter_id) as chapters,
         SUM(time_spent_seconds) as time_seconds
       FROM learning_progress
       WHERE user_id = $1 AND last_accessed_at >= $2
       GROUP BY DATE(last_accessed_at)
       ORDER BY date ASC`,
      [userId, startDate]
    );

    const stats = statsResult.rows[0] || {
      chapters_read: 0,
      books_started: 0,
      chapters_completed: 0,
      total_time_seconds: 0,
      quizzes_taken: 0,
      quizzes_passed: 0,
      words_added: 0
    };

    res.json({
      status: 'success',
      data: {
        period,
        start_date: startDate.toISOString().split('T')[0],
        end_date: today.toISOString().split('T')[0],
        summary: {
          chapters_read: parseInt(stats.chapters_read),
          books_started: parseInt(stats.books_started),
          chapters_completed: parseInt(stats.chapters_completed),
          total_time_minutes: Math.round(parseInt(stats.total_time_seconds) / 60),
          quizzes_taken: parseInt(stats.quizzes_taken),
          quizzes_passed: parseInt(stats.quizzes_passed),
          quiz_pass_rate: parseInt(stats.quizzes_taken) > 0
            ? Math.round((parseInt(stats.quizzes_passed) / parseInt(stats.quizzes_taken)) * 100)
            : 0,
          words_added: parseInt(stats.words_added)
        },
        daily_activity: dailyActivityResult.rows.map(row => ({
          date: row.date,
          chapters: parseInt(row.chapters),
          time_minutes: Math.round(parseInt(row.time_seconds) / 60)
        }))
      }
    });
  } catch (error) {
    console.error('통계 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '통계 조회 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 성취 및 마일스톤
// ============================================
router.get('/achievements', async (req, res) => {
  try {
    const userId = req.user.id;

    // 여러 통계를 한 번에 조회
    const [
      progressStats,
      quizStats,
      vocabStats,
      streakStats
    ] = await Promise.all([
      // 진도 통계
      query(
        `SELECT
           COUNT(DISTINCT book_id) as books_started,
           COUNT(DISTINCT id) FILTER (WHERE is_completed = true) as chapters_completed,
           COALESCE(SUM(time_spent_seconds), 0) as total_time_seconds
         FROM learning_progress
         WHERE user_id = $1`,
        [userId]
      ),
      // 퀴즈 통계
      query(
        `SELECT
           COUNT(*) as total_attempts,
           COUNT(*) FILTER (WHERE is_passed = true) as passed_attempts,
           COALESCE(AVG(percentage), 0) as avg_score
         FROM quiz_attempts
         WHERE user_id = $1`,
        [userId]
      ),
      // 단어장 통계
      query(
        `SELECT
           COUNT(*) as total_words,
           COUNT(*) FILTER (WHERE is_mastered = true) as mastered_words
         FROM vocabulary
         WHERE user_id = $1`,
        [userId]
      ),
      // 스트릭 통계 (간단 버전)
      query(
        `SELECT COUNT(DISTINCT DATE(last_accessed_at)) as total_days
         FROM learning_progress
         WHERE user_id = $1 AND last_accessed_at IS NOT NULL`,
        [userId]
      )
    ]);

    const progress = progressStats.rows[0];
    const quiz = quizStats.rows[0];
    const vocab = vocabStats.rows[0];
    const streak = streakStats.rows[0];

    // 성취 목록 생성
    const achievements = [];

    // 독서 성취
    if (parseInt(progress.chapters_completed) >= 1) achievements.push({ id: 'first_chapter', name: '첫 챕터 완료', unlocked: true });
    if (parseInt(progress.chapters_completed) >= 10) achievements.push({ id: 'chapter_10', name: '10개 챕터 완료', unlocked: true });
    if (parseInt(progress.chapters_completed) >= 50) achievements.push({ id: 'chapter_50', name: '50개 챕터 완료', unlocked: true });
    if (parseInt(progress.books_started) >= 3) achievements.push({ id: 'books_3', name: '3권의 책 시작', unlocked: true });

    // 퀴즈 성취
    if (parseInt(quiz.total_attempts) >= 1) achievements.push({ id: 'first_quiz', name: '첫 퀴즈 도전', unlocked: true });
    if (parseInt(quiz.passed_attempts) >= 5) achievements.push({ id: 'quiz_master_5', name: '5개 퀴즈 합격', unlocked: true });
    if (parseInt(quiz.passed_attempts) >= 20) achievements.push({ id: 'quiz_master_20', name: '20개 퀴즈 합격', unlocked: true });
    if (parseFloat(quiz.avg_score) >= 90) achievements.push({ id: 'high_scorer', name: '평균 점수 90점 이상', unlocked: true });

    // 단어장 성취
    if (parseInt(vocab.total_words) >= 10) achievements.push({ id: 'vocab_10', name: '10개 단어 수집', unlocked: true });
    if (parseInt(vocab.total_words) >= 50) achievements.push({ id: 'vocab_50', name: '50개 단어 수집', unlocked: true });
    if (parseInt(vocab.total_words) >= 100) achievements.push({ id: 'vocab_100', name: '100개 단어 수집', unlocked: true });
    if (parseInt(vocab.mastered_words) >= 20) achievements.push({ id: 'vocab_master_20', name: '20개 단어 마스터', unlocked: true });

    // 시간 성취
    const totalHours = Math.floor(parseInt(progress.total_time_seconds) / 3600);
    if (totalHours >= 1) achievements.push({ id: 'time_1h', name: '1시간 학습', unlocked: true });
    if (totalHours >= 10) achievements.push({ id: 'time_10h', name: '10시간 학습', unlocked: true });
    if (totalHours >= 50) achievements.push({ id: 'time_50h', name: '50시간 학습', unlocked: true });

    // 스트릭 성취
    if (parseInt(streak.total_days) >= 7) achievements.push({ id: 'streak_7', name: '7일 학습', unlocked: true });
    if (parseInt(streak.total_days) >= 30) achievements.push({ id: 'streak_30', name: '30일 학습', unlocked: true });

    res.json({
      status: 'success',
      data: {
        total_achievements: achievements.length,
        achievements,
        stats: {
          chapters_completed: parseInt(progress.chapters_completed),
          books_started: parseInt(progress.books_started),
          quiz_pass_rate: parseInt(quiz.total_attempts) > 0
            ? Math.round((parseInt(quiz.passed_attempts) / parseInt(quiz.total_attempts)) * 100)
            : 0,
          total_words: parseInt(vocab.total_words),
          mastered_words: parseInt(vocab.mastered_words),
          total_hours: totalHours,
          total_days: parseInt(streak.total_days)
        }
      }
    });
  } catch (error) {
    console.error('성취 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '성취 조회 중 오류가 발생했습니다'
    });
  }
});

module.exports = router;
