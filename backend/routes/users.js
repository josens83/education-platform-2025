const express = require('express');
const router = express.Router();
const { query } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// 모든 사용자 라우트는 인증 필요
router.use(authenticateToken);

// ============================================
// 내 프로필 조회
// ============================================
router.get('/me', async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.email, u.username, u.role, u.created_at,
              p.full_name, p.birth_date, p.grade_level, p.target_exam,
              p.is_kids_mode, p.avatar_url, p.preferences
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '사용자를 찾을 수 없습니다'
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '프로필 조회 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 프로필 업데이트
// ============================================
router.put('/me', async (req, res) => {
  try {
    const {
      full_name,
      birth_date,
      grade_level,
      target_exam,
      is_kids_mode,
      avatar_url,
      preferences
    } = req.body;

    const result = await query(
      `UPDATE user_profiles
       SET full_name = COALESCE($1, full_name),
           birth_date = COALESCE($2, birth_date),
           grade_level = COALESCE($3, grade_level),
           target_exam = COALESCE($4, target_exam),
           is_kids_mode = COALESCE($5, is_kids_mode),
           avatar_url = COALESCE($6, avatar_url),
           preferences = COALESCE($7, preferences),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $8
       RETURNING *`,
      [full_name, birth_date, grade_level, target_exam, is_kids_mode, avatar_url, preferences, req.user.id]
    );

    res.json({
      status: 'success',
      message: '프로필이 업데이트되었습니다',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '프로필 업데이트 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 학습 통계 조회
// ============================================
router.get('/me/stats', async (req, res) => {
  try {
    const { period = '7' } = req.query; // 기본 7일

    const result = await query(
      `SELECT
         stat_date,
         study_time_seconds,
         chapters_completed,
         quizzes_taken,
         quizzes_passed,
         words_learned
       FROM learning_stats
       WHERE user_id = $1
       AND stat_date >= CURRENT_DATE - INTERVAL '${parseInt(period)} days'
       ORDER BY stat_date DESC`,
      [req.user.id]
    );

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('학습 통계 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '학습 통계 조회 중 오류가 발생했습니다'
    });
  }
});

module.exports = router;
