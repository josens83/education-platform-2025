const express = require('express');
const router = express.Router();
const { query } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const logger = require('../lib/logger');

// ============================================
// 대시보드 통계 (기존 + 추가)
// ============================================
router.get('/dashboard/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // 병렬로 모든 통계 조회
    const [
      usersStats,
      subscriptionStats,
      revenueStats,
      contentStats,
      engagementStats,
      topBooks,
      recentActivities,
      growthStats,
    ] = await Promise.all([
      getUsersStats(),
      getSubscriptionStats(),
      getRevenueStats(),
      getContentStats(),
      getEngagementStats(),
      getTopBooks(),
      getRecentActivities(),
      getGrowthStats(),
    ]);

    res.json({
      status: 'success',
      data: {
        users: usersStats,
        subscriptions: subscriptionStats,
        revenue: revenueStats,
        content: contentStats,
        engagement: engagementStats,
        topBooks,
        recentActivities,
        growth: growthStats,
      },
    });
  } catch (error) {
    logger.error('Dashboard stats error', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: '통계 조회 중 오류가 발생했습니다',
    });
  }
});

// 사용자 통계
async function getUsersStats() {
  const result = await query(`
    SELECT
      COUNT(*) as total_users,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users_30d,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as new_users_7d,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '1 day' THEN 1 END) as new_users_today,
      COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
      COUNT(CASE WHEN role = 'teacher' THEN 1 END) as teacher_count,
      COUNT(CASE WHEN role = 'student' THEN 1 END) as student_count
    FROM users
  `);

  return result.rows[0];
}

// 구독 통계
async function getSubscriptionStats() {
  const result = await query(`
    SELECT
      COUNT(*) as total_subscriptions,
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_subscriptions,
      COUNT(CASE WHEN status = 'past_due' THEN 1 END) as past_due_subscriptions,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_subscriptions_30d,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as new_subscriptions_7d,
      ROUND(AVG(CASE WHEN status = 'active' THEN
        EXTRACT(EPOCH FROM (end_date - start_date)) / 86400
      END), 1) as avg_subscription_days
    FROM subscriptions
  `);

  return result.rows[0];
}

// 수익 통계
async function getRevenueStats() {
  const result = await query(`
    SELECT
      COALESCE(SUM(amount), 0) as total_revenue,
      COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN amount END), 0) as revenue_30d,
      COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN amount END), 0) as revenue_7d,
      COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '1 day' THEN amount END), 0) as revenue_today,
      COUNT(*) as total_transactions,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_transactions,
      COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions,
      ROUND(AVG(CASE WHEN status = 'completed' THEN amount END), 2) as avg_transaction_amount
    FROM payments
  `);

  return result.rows[0];
}

// 콘텐츠 통계
async function getContentStats() {
  const [books, chapters, quizzes, audio] = await Promise.all([
    query('SELECT COUNT(*) as count FROM books'),
    query('SELECT COUNT(*) as count FROM chapters'),
    query('SELECT COUNT(*) as count FROM quizzes'),
    query('SELECT COUNT(*) as count FROM audio_files'),
  ]);

  return {
    total_books: parseInt(books.rows[0].count),
    total_chapters: parseInt(chapters.rows[0].count),
    total_quizzes: parseInt(quizzes.rows[0].count),
    total_audio_files: parseInt(audio.rows[0].count),
  };
}

// 사용자 참여 통계
async function getEngagementStats() {
  const [progress, vocabulary, bookmarks, notes, quizAttempts] = await Promise.all([
    query(`
      SELECT
        COUNT(*) as total_progress,
        COUNT(CASE WHEN is_completed THEN 1 END) as completed_chapters,
        ROUND(AVG(CASE WHEN is_completed THEN 1.0 ELSE 0.0 END) * 100, 1) as completion_rate
      FROM learning_progress
    `),
    query('SELECT COUNT(*) as count FROM vocabulary'),
    query('SELECT COUNT(*) as count FROM bookmarks'),
    query('SELECT COUNT(*) as count FROM notes'),
    query(`
      SELECT
        COUNT(*) as total_attempts,
        COUNT(CASE WHEN is_passed THEN 1 END) as passed_attempts,
        ROUND(AVG(CASE WHEN is_passed THEN 1.0 ELSE 0.0 END) * 100, 1) as pass_rate,
        ROUND(AVG(score), 1) as avg_score
      FROM quiz_attempts
    `),
  ]);

  return {
    total_progress: parseInt(progress.rows[0].total_progress),
    completed_chapters: parseInt(progress.rows[0].completed_chapters),
    completion_rate: parseFloat(progress.rows[0].completion_rate),
    total_vocabulary: parseInt(vocabulary.rows[0].count),
    total_bookmarks: parseInt(bookmarks.rows[0].count),
    total_notes: parseInt(notes.rows[0].count),
    quiz_attempts: parseInt(quizAttempts.rows[0].total_attempts),
    quiz_passed: parseInt(quizAttempts.rows[0].passed_attempts),
    quiz_pass_rate: parseFloat(quizAttempts.rows[0].pass_rate),
    avg_quiz_score: parseFloat(quizAttempts.rows[0].avg_score),
  };
}

// 인기 책 TOP 10
async function getTopBooks() {
  const result = await query(`
    SELECT
      b.id,
      b.title,
      b.author,
      b.cover_image_url,
      COUNT(DISTINCT lp.user_id) as readers_count,
      COUNT(DISTINCT CASE WHEN lp.is_completed THEN lp.user_id END) as completions_count,
      ROUND(AVG(lp.progress_percentage), 1) as avg_progress
    FROM books b
    LEFT JOIN chapters c ON b.id = c.book_id
    LEFT JOIN learning_progress lp ON c.id = lp.chapter_id
    GROUP BY b.id, b.title, b.author, b.cover_image_url
    ORDER BY readers_count DESC
    LIMIT 10
  `);

  return result.rows;
}

// 최근 활동
async function getRecentActivities() {
  const result = await query(`
    (
      SELECT
        'subscription' as type,
        u.username,
        sp.name as detail,
        s.created_at as timestamp
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE s.created_at >= NOW() - INTERVAL '7 days'
      ORDER BY s.created_at DESC
      LIMIT 5
    )
    UNION ALL
    (
      SELECT
        'quiz' as type,
        u.username,
        'Score: ' || qa.score || '%' as detail,
        qa.started_at as timestamp
      FROM quiz_attempts qa
      JOIN users u ON qa.user_id = u.id
      WHERE qa.started_at >= NOW() - INTERVAL '7 days'
      ORDER BY qa.started_at DESC
      LIMIT 5
    )
    UNION ALL
    (
      SELECT
        'payment' as type,
        u.username,
        amount::text as detail,
        p.created_at as timestamp
      FROM payments p
      JOIN users u ON p.user_id = u.id
      WHERE p.created_at >= NOW() - INTERVAL '7 days'
        AND p.status = 'completed'
      ORDER BY p.created_at DESC
      LIMIT 5
    )
    ORDER BY timestamp DESC
    LIMIT 20
  `);

  return result.rows;
}

// 성장 통계 (차트용 데이터)
async function getGrowthStats() {
  const [userGrowth, revenueGrowth, engagementGrowth] = await Promise.all([
    // 최근 30일 사용자 증가
    query(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `),
    // 최근 30일 수익
    query(`
      SELECT
        DATE(created_at) as date,
        SUM(amount) as revenue
      FROM payments
      WHERE created_at >= NOW() - INTERVAL '30 days'
        AND status = 'completed'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `),
    // 최근 30일 학습 활동
    query(`
      SELECT
        stat_date as date,
        SUM(chapters_read) as chapters,
        SUM(quizzes_completed) as quizzes
      FROM learning_stats
      WHERE stat_date >= NOW() - INTERVAL '30 days'
      GROUP BY stat_date
      ORDER BY stat_date ASC
    `),
  ]);

  return {
    user_growth: userGrowth.rows,
    revenue_growth: revenueGrowth.rows,
    engagement_growth: engagementGrowth.rows,
  };
}

// ============================================
// 쿠폰 통계
// ============================================
router.get('/dashboard/coupons', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM coupon_stats ORDER BY usage_count DESC
    `);

    // 전체 쿠폰 사용 통계
    const summary = await query(`
      SELECT
        COUNT(*) as total_coupons,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_coupons,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_coupons,
        SUM(usage_count) as total_uses,
        SUM(total_discount_given) as total_discount
      FROM coupon_stats
    `);

    res.json({
      status: 'success',
      data: {
        coupons: result.rows,
        summary: summary.rows[0],
      },
    });
  } catch (error) {
    logger.error('Coupon stats error', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: '쿠폰 통계 조회 중 오류가 발생했습니다',
    });
  }
});

// ============================================
// 실시간 통계 (최근 1시간)
// ============================================
router.get('/dashboard/realtime', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [activeUsers, recentSignups, recentPayments, activeReaders] = await Promise.all([
      // 최근 1시간 활동 사용자
      query(`
        SELECT COUNT(DISTINCT user_id) as count
        FROM learning_stats
        WHERE updated_at >= NOW() - INTERVAL '1 hour'
      `),
      // 최근 1시간 신규 가입
      query(`
        SELECT COUNT(*) as count
        FROM users
        WHERE created_at >= NOW() - INTERVAL '1 hour'
      `),
      // 최근 1시간 결제
      query(`
        SELECT
          COUNT(*) as count,
          COALESCE(SUM(amount), 0) as revenue
        FROM payments
        WHERE created_at >= NOW() - INTERVAL '1 hour'
          AND status = 'completed'
      `),
      // 현재 읽고 있는 사용자 (최근 10분 활동)
      query(`
        SELECT COUNT(DISTINCT user_id) as count
        FROM learning_progress
        WHERE updated_at >= NOW() - INTERVAL '10 minutes'
      `),
    ]);

    res.json({
      status: 'success',
      data: {
        active_users_1h: parseInt(activeUsers.rows[0].count),
        new_signups_1h: parseInt(recentSignups.rows[0].count),
        payments_1h: parseInt(recentPayments.rows[0].count),
        revenue_1h: parseFloat(recentPayments.rows[0].revenue),
        active_readers_now: parseInt(activeReaders.rows[0].count),
      },
    });
  } catch (error) {
    logger.error('Realtime stats error', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: '실시간 통계 조회 중 오류가 발생했습니다',
    });
  }
});

// ============================================
// 사용자 상세 분석
// ============================================
router.get('/dashboard/user-analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [deviceStats, locationStats, cohortAnalysis] = await Promise.all([
      // 디바이스별 사용자 (user_profiles의 preferences에서 가져온다고 가정)
      query(`
        SELECT
          'Desktop' as device,
          COUNT(*) as count
        FROM users
        LIMIT 0
      `), // 실제로는 세션 데이터나 analytics에서 가져와야 함

      // 지역별 사용자 (간단 버전)
      query(`
        SELECT
          'Korea' as location,
          COUNT(*) as count
        FROM users
      `),

      // 코호트 분석 (가입 월별 retention)
      query(`
        SELECT
          TO_CHAR(u.created_at, 'YYYY-MM') as cohort_month,
          COUNT(DISTINCT u.id) as total_users,
          COUNT(DISTINCT CASE
            WHEN ls.stat_date >= u.created_at + INTERVAL '7 days'
            THEN u.id
          END) as retained_7d,
          COUNT(DISTINCT CASE
            WHEN ls.stat_date >= u.created_at + INTERVAL '30 days'
            THEN u.id
          END) as retained_30d
        FROM users u
        LEFT JOIN learning_stats ls ON u.id = ls.user_id
        WHERE u.created_at >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR(u.created_at, 'YYYY-MM')
        ORDER BY cohort_month DESC
      `),
    ]);

    res.json({
      status: 'success',
      data: {
        devices: deviceStats.rows,
        locations: locationStats.rows,
        cohorts: cohortAnalysis.rows,
      },
    });
  } catch (error) {
    logger.error('User analytics error', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: '사용자 분석 조회 중 오류가 발생했습니다',
    });
  }
});

module.exports = router;
