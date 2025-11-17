const express = require('express');
const router = express.Router();
const { query } = require('../database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

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
      date_of_birth,
      birth_date,
      phone_number,
      bio,
      grade_level,
      target_exam,
      is_kids_mode,
      avatar_url,
      preferred_difficulty,
      learning_goals,
      preferences
    } = req.body;

    // date_of_birth와 birth_date 둘 다 지원
    const birthDate = date_of_birth || birth_date;

    // learning_goals를 preferences에 병합
    const updatedPreferences = {
      ...(preferences || {}),
      ...(learning_goals ? { learning_goals } : {}),
      ...(preferred_difficulty ? { preferred_difficulty } : {}),
      ...(phone_number ? { phone_number } : {}),
      ...(bio ? { bio } : {})
    };

    // preferences를 JSON 문자열로 변환
    const preferencesJson = JSON.stringify(updatedPreferences);

    // 먼저 프로필이 존재하는지 확인
    const existingProfile = await query(
      'SELECT id FROM user_profiles WHERE user_id = $1',
      [req.user.id]
    );

    let result;
    if (existingProfile.rows.length > 0) {
      // 프로필이 있으면 업데이트
      result = await query(
        `UPDATE user_profiles
         SET full_name = COALESCE($1, full_name),
             birth_date = COALESCE($2, birth_date),
             grade_level = COALESCE($3, grade_level),
             target_exam = COALESCE($4, target_exam),
             is_kids_mode = COALESCE($5, is_kids_mode),
             avatar_url = COALESCE($6, avatar_url),
             preferences = COALESCE($7::jsonb, preferences),
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $8
         RETURNING *`,
        [full_name, birthDate, grade_level, target_exam, is_kids_mode, avatar_url, preferencesJson, req.user.id]
      );
    } else {
      // 프로필이 없으면 생성
      result = await query(
        `INSERT INTO user_profiles (
          user_id, full_name, birth_date, grade_level, target_exam,
          is_kids_mode, avatar_url, preferences, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *`,
        [req.user.id, full_name, birthDate, grade_level, target_exam, is_kids_mode, avatar_url, preferencesJson]
      );
    }

    res.json({
      status: 'success',
      message: '프로필이 업데이트되었습니다',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '프로필 업데이트 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

// ============================================
// 학습 통계 조회
// ============================================
router.get('/me/stats', async (req, res) => {
  try {
    const { period = '7' } = req.query; // 기본 7일

    // Validate and sanitize input
    const periodDays = Math.min(Math.max(parseInt(period) || 7, 1), 365); // Limit between 1-365 days

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
       AND stat_date >= CURRENT_DATE - make_interval(days => $2)
       ORDER BY stat_date DESC`,
      [req.user.id, periodDays]
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

// ============================================
// 관리자 전용: 모든 사용자 목록 조회
// ============================================
router.get('/', authorizeRoles('admin'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      role = '',
      sort = 'created_at',
      order = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // 검색 및 필터 조건
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(u.email ILIKE $${paramIndex} OR u.username ILIKE $${paramIndex} OR p.full_name ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (role) {
      whereConditions.push(`u.role = $${paramIndex}`);
      queryParams.push(role);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // 정렬 컬럼 검증
    const allowedSortColumns = ['created_at', 'email', 'username', 'role'];
    const sortColumn = allowedSortColumns.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // 총 개수 조회
    const countResult = await query(
      `SELECT COUNT(*) as total
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       ${whereClause}`,
      queryParams
    );

    const total = parseInt(countResult.rows[0].total);

    // 사용자 목록 조회
    queryParams.push(parseInt(limit), offset);
    const result = await query(
      `SELECT
         u.id, u.email, u.username, u.role, u.created_at, u.last_login,
         p.full_name, p.grade_level, p.target_exam, p.avatar_url,
         (SELECT COUNT(*) FROM learning_progress WHERE user_id = u.id AND is_completed = true) as chapters_completed,
         (SELECT COUNT(*) FROM quiz_attempts WHERE user_id = u.id AND is_passed = true) as quizzes_passed
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       ${whereClause}
       ORDER BY u.${sortColumn} ${sortOrder}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      queryParams
    );

    res.json({
      status: 'success',
      data: {
        users: result.rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          total_pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '사용자 목록 조회 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 관리자 전용: 특정 사용자 상세 정보 조회
// ============================================
router.get('/:id', authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // 사용자 기본 정보
    const userResult = await query(
      `SELECT
         u.id, u.email, u.username, u.role, u.created_at, u.last_login,
         p.full_name, p.birth_date, p.grade_level, p.target_exam,
         p.is_kids_mode, p.avatar_url, p.preferences
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '사용자를 찾을 수 없습니다'
      });
    }

    // 학습 통계
    const statsResult = await query(
      `SELECT
         COUNT(DISTINCT lp.book_id) as books_started,
         COUNT(DISTINCT lp.chapter_id) as chapters_read,
         COUNT(DISTINCT lp.id) FILTER (WHERE lp.is_completed = true) as chapters_completed,
         COALESCE(SUM(lp.time_spent_seconds), 0) as total_time_seconds,
         COUNT(DISTINCT qa.id) as quizzes_taken,
         COUNT(DISTINCT qa.id) FILTER (WHERE qa.is_passed = true) as quizzes_passed,
         COUNT(DISTINCT v.id) as words_saved
       FROM users u
       LEFT JOIN learning_progress lp ON u.id = lp.user_id
       LEFT JOIN quiz_attempts qa ON u.id = qa.user_id
       LEFT JOIN vocabulary v ON u.id = v.user_id
       WHERE u.id = $1
       GROUP BY u.id`,
      [id]
    );

    // 최근 활동
    const recentActivityResult = await query(
      `SELECT
         'chapter' as type,
         b.title as book_title,
         c.title as chapter_title,
         lp.last_accessed_at as activity_date
       FROM learning_progress lp
       JOIN chapters c ON lp.chapter_id = c.id
       JOIN books b ON lp.book_id = b.id
       WHERE lp.user_id = $1
       ORDER BY lp.last_accessed_at DESC
       LIMIT 10`,
      [id]
    );

    res.json({
      status: 'success',
      data: {
        user: userResult.rows[0],
        stats: statsResult.rows[0] || {
          books_started: 0,
          chapters_read: 0,
          chapters_completed: 0,
          total_time_seconds: 0,
          quizzes_taken: 0,
          quizzes_passed: 0,
          words_saved: 0
        },
        recent_activity: recentActivityResult.rows
      }
    });
  } catch (error) {
    console.error('사용자 상세 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '사용자 상세 조회 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 관리자 전용: 사용자 역할 변경
// ============================================
router.put('/:id/role', authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // 유효한 역할인지 확인
    const validRoles = ['student', 'teacher', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: '유효하지 않은 역할입니다'
      });
    }

    // 자기 자신의 역할은 변경할 수 없음
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        status: 'error',
        message: '자기 자신의 역할은 변경할 수 없습니다'
      });
    }

    const result = await query(
      `UPDATE users
       SET role = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email, username, role`,
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '사용자를 찾을 수 없습니다'
      });
    }

    res.json({
      status: 'success',
      message: '사용자 역할이 변경되었습니다',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('역할 변경 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '역할 변경 중 오류가 발생했습니다'
    });
  }
});

module.exports = router;
