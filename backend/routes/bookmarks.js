const express = require('express');
const router = express.Router();
const { query } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// 모든 라우트는 인증 필요
router.use(authenticateToken);

// ============================================
// 북마크 생성
// ============================================
router.post('/', async (req, res) => {
  try {
    const { chapter_id, position, highlighted_text, color = 'yellow' } = req.body;

    const result = await query(
      `INSERT INTO bookmarks (user_id, chapter_id, position, highlighted_text, color)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, chapter_id, position, highlighted_text, color]
    );

    res.status(201).json({
      status: 'success',
      message: '북마크가 생성되었습니다',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('북마크 생성 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '북마크 생성 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 내 북마크 조회
// ============================================
router.get('/', async (req, res) => {
  try {
    const { chapter_id } = req.query;

    let result;
    if (chapter_id) {
      // 특정 챕터의 북마크
      result = await query(
        `SELECT b.*, c.title as chapter_title, bk.title as book_title
         FROM bookmarks b
         JOIN chapters c ON b.chapter_id = c.id
         JOIN books bk ON c.book_id = bk.id
         WHERE b.user_id = $1 AND b.chapter_id = $2
         ORDER BY b.created_at DESC`,
        [req.user.id, chapter_id]
      );
    } else {
      // 모든 북마크
      result = await query(
        `SELECT b.*, c.title as chapter_title, bk.title as book_title
         FROM bookmarks b
         JOIN chapters c ON b.chapter_id = c.id
         JOIN books bk ON c.book_id = bk.id
         WHERE b.user_id = $1
         ORDER BY b.created_at DESC`,
        [req.user.id]
      );
    }

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('북마크 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '북마크 조회 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 북마크 삭제
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM bookmarks WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '북마크를 찾을 수 없습니다'
      });
    }

    res.json({
      status: 'success',
      message: '북마크가 삭제되었습니다'
    });
  } catch (error) {
    console.error('북마크 삭제 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '북마크 삭제 중 오류가 발생했습니다'
    });
  }
});

module.exports = router;
