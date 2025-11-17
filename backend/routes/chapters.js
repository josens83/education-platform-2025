const express = require('express');
const router = express.Router();
const { query } = require('../database');
const { authenticateToken, checkSubscription, authorizeRoles } = require('../middleware/auth');

// ============================================
// 챕터 조회 (공개 - 테스트용)
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const chapterResult = await query(
      `SELECT c.*, b.title as book_title
       FROM chapters c
       JOIN books b ON c.book_id = b.id
       WHERE c.id = $1 AND c.is_published = true`,
      [id]
    );

    if (chapterResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '챕터를 찾을 수 없습니다'
      });
    }

    // 오디오 파일도 함께 조회
    const audioResult = await query(
      `SELECT * FROM audio_files WHERE chapter_id = $1`,
      [id]
    );

    res.json({
      status: 'success',
      data: {
        chapter: chapterResult.rows[0],
        audio: audioResult.rows[0] || null
      }
    });
  } catch (error) {
    console.error('챕터 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '챕터 조회 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 챕터 수정 (관리자 전용)
// ============================================
router.put('/:id', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      chapter_number,
      title,
      content,
      content_type,
      estimated_minutes,
      is_published,
      display_order,
    } = req.body;

    // Generate slug from title if updating title
    const slug = title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined;

    const result = await query(
      `UPDATE chapters SET
        chapter_number = COALESCE($1, chapter_number),
        title = COALESCE($2, title),
        slug = COALESCE($3, slug),
        content = COALESCE($4, content),
        content_type = COALESCE($5, content_type),
        estimated_minutes = COALESCE($6, estimated_minutes),
        is_published = COALESCE($7, is_published),
        display_order = COALESCE($8, display_order),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *`,
      [chapter_number, title, slug, content, content_type, estimated_minutes, is_published, display_order, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '챕터를 찾을 수 없습니다'
      });
    }

    res.json({
      status: 'success',
      message: '챕터가 수정되었습니다',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('챕터 수정 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '챕터 수정 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 챕터 삭제 (관리자 전용)
// ============================================
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // 챕터와 관련된 모든 데이터는 ON DELETE CASCADE로 자동 삭제됨
    const result = await query('DELETE FROM chapters WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '챕터를 찾을 수 없습니다'
      });
    }

    res.json({
      status: 'success',
      message: '챕터가 삭제되었습니다'
    });
  } catch (error) {
    console.error('챕터 삭제 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '챕터 삭제 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 챕터의 퀴즈 목록 조회
// ============================================
router.get('/:id/quizzes', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT * FROM quizzes
       WHERE chapter_id = $1 AND is_active = true
       ORDER BY display_order, id`,
      [id]
    );

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('퀴즈 목록 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '퀴즈 조회 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 챕터에 퀴즈 추가 (관리자 전용)
// ============================================
router.post('/:id/quizzes', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { id: chapterId } = req.params;
    const {
      title,
      description,
      quiz_type,
      passing_score,
      time_limit_minutes,
      is_active,
      display_order,
    } = req.body;

    const result = await query(
      `INSERT INTO quizzes (
        chapter_id, title, description, quiz_type, passing_score,
        time_limit_minutes, is_active, display_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [chapterId, title, description, quiz_type, passing_score || 70,
       time_limit_minutes || 0, is_active !== undefined ? is_active : true, display_order || 0]
    );

    res.status(201).json({
      status: 'success',
      message: '퀴즈가 생성되었습니다',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('퀴즈 생성 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '퀴즈 생성 중 오류가 발생했습니다'
    });
  }
});

module.exports = router;
