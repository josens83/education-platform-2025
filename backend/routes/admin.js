const express = require('express');
const router = express.Router();
const { query } = require('../database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// 모든 관리자 라우트는 관리자 권한 필요
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// ============================================
// 전체 플랫폼 통계 조회
// ============================================
router.get('/stats', async (req, res) => {
  try {
    // 전체 통계를 병렬로 조회
    const [
      usersCount,
      booksCount,
      chaptersCount,
      quizzesCount,
      activeSubscriptions,
      recentUsers,
      popularBooks,
      recentActivity
    ] = await Promise.all([
      // 전체 사용자 수
      query('SELECT COUNT(*) as total FROM users'),

      // 전체 책 수
      query('SELECT COUNT(*) as total FROM books'),

      // 전체 챕터 수
      query('SELECT COUNT(*) as total FROM chapters'),

      // 전체 퀴즈 수
      query('SELECT COUNT(*) as total FROM quizzes'),

      // 활성 구독 수
      query(`SELECT COUNT(*) as total
             FROM subscriptions
             WHERE status = 'active' AND end_date > CURRENT_DATE`),

      // 최근 가입 사용자 (최근 5명)
      query(`SELECT u.id, u.username, u.email, u.role, u.created_at, p.full_name
             FROM users u
             LEFT JOIN user_profiles p ON u.id = p.user_id
             ORDER BY u.created_at DESC
             LIMIT 5`),

      // 인기 책 (학습 진행이 많은 책 Top 5)
      query(`SELECT b.id, b.title, b.cover_image_url,
                    COUNT(DISTINCT lp.user_id) as learner_count,
                    COUNT(DISTINCT lp.id) as total_progress
             FROM books b
             LEFT JOIN learning_progress lp ON b.id = lp.book_id
             GROUP BY b.id, b.title, b.cover_image_url
             ORDER BY learner_count DESC, total_progress DESC
             LIMIT 5`),

      // 최근 7일간 일일 활동
      query(`SELECT
               DATE(last_accessed_at) as date,
               COUNT(DISTINCT user_id) as active_users,
               COUNT(DISTINCT chapter_id) as chapters_read
             FROM learning_progress
             WHERE last_accessed_at >= CURRENT_DATE - INTERVAL '7 days'
             GROUP BY DATE(last_accessed_at)
             ORDER BY date DESC`)
    ]);

    res.json({
      status: 'success',
      data: {
        overview: {
          totalUsers: parseInt(usersCount.rows[0].total),
          totalBooks: parseInt(booksCount.rows[0].total),
          totalChapters: parseInt(chaptersCount.rows[0].total),
          totalQuizzes: parseInt(quizzesCount.rows[0].total),
          activeSubscriptions: parseInt(activeSubscriptions.rows[0].total),
        },
        recentUsers: recentUsers.rows,
        popularBooks: popularBooks.rows,
        recentActivity: recentActivity.rows
      }
    });
  } catch (error) {
    console.error('관리자 통계 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '통계 조회 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 사용자 역할별 통계
// ============================================
router.get('/stats/users-by-role', async (req, res) => {
  try {
    const result = await query(`
      SELECT
        role,
        COUNT(*) as count
      FROM users
      GROUP BY role
      ORDER BY count DESC
    `);

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('역할별 사용자 통계 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '통계 조회 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 퀴즈 합격률 통계
// ============================================
router.get('/stats/quiz-performance', async (req, res) => {
  try {
    const result = await query(`
      SELECT
        COUNT(*) as total_attempts,
        COUNT(*) FILTER (WHERE is_passed = true) as passed_attempts,
        ROUND(AVG(percentage), 2) as avg_score,
        ROUND(COUNT(*) FILTER (WHERE is_passed = true)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as pass_rate
      FROM quiz_attempts
    `);

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('퀴즈 성과 통계 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '통계 조회 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 월별 가입자 통계
// ============================================
router.get('/stats/monthly-signups', async (req, res) => {
  try {
    const { months = 6 } = req.query;

    // Validate and sanitize input
    const monthsNum = Math.min(Math.max(parseInt(months) || 6, 1), 24); // Limit between 1-24 months

    const result = await query(`
      SELECT
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*) as signups
      FROM users
      WHERE created_at >= CURRENT_DATE - make_interval(months => $1)
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month DESC
    `, [monthsNum]);

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('월별 가입자 통계 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '통계 조회 중 오류가 발생했습니다'
    });
  }
});

module.exports = router;
