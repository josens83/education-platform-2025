const express = require('express');
const router = express.Router();
const { query } = require('../database');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// ============================================
// 학습 진도 저장/업데이트
// ============================================
router.post('/', async (req, res) => {
  try {
    const { chapter_id, progress_percentage, last_position, time_spent_seconds } = req.body;

    // book_id 조회
    const chapterResult = await query(
      'SELECT book_id FROM chapters WHERE id = $1',
      [chapter_id]
    );

    if (chapterResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '챕터를 찾을 수 없습니다'
      });
    }

    const book_id = chapterResult.rows[0].book_id;

    // 진도 저장/업데이트 (UPSERT)
    const result = await query(
      `INSERT INTO learning_progress (
        user_id, book_id, chapter_id, progress_percentage, last_position, time_spent_seconds
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, chapter_id)
      DO UPDATE SET
        progress_percentage = EXCLUDED.progress_percentage,
        last_position = EXCLUDED.last_position,
        time_spent_seconds = learning_progress.time_spent_seconds + EXCLUDED.time_spent_seconds,
        is_completed = CASE WHEN EXCLUDED.progress_percentage >= 100 THEN true ELSE false END,
        completed_at = CASE WHEN EXCLUDED.progress_percentage >= 100 THEN CURRENT_TIMESTAMP ELSE NULL END,
        last_accessed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [req.user.id, book_id, chapter_id, progress_percentage, last_position, time_spent_seconds || 0]
    );

    res.json({
      status: 'success',
      message: '학습 진도가 저장되었습니다',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('진도 저장 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '진도 저장 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 내 진도 조회
// ============================================
router.get('/my', async (req, res) => {
  try {
    const result = await query(
      `SELECT lp.*, b.title as book_title, c.title as chapter_title
       FROM learning_progress lp
       JOIN books b ON lp.book_id = b.id
       JOIN chapters c ON lp.chapter_id = c.id
       WHERE lp.user_id = $1
       ORDER BY lp.last_accessed_at DESC`,
      [req.user.id]
    );

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('진도 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '진도 조회 중 오류가 발생했습니다'
    });
  }
});

module.exports = router;
