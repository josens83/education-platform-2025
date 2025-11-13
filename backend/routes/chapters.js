const express = require('express');
const router = express.Router();
const { query } = require('../database');
const { authenticateToken, checkSubscription } = require('../middleware/auth');

// ============================================
// 챕터 조회 (구독자만)
// ============================================
router.get('/:id', authenticateToken, checkSubscription, async (req, res) => {
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

module.exports = router;
