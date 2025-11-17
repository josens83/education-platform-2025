const express = require('express');
const router = express.Router();
const { query } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// 모든 라우트는 인증 필요
router.use(authenticateToken);

// ============================================
// 노트 생성
// ============================================
router.post('/', async (req, res) => {
  try {
    const { chapter_id, position, content, tags } = req.body;

    const result = await query(
      `INSERT INTO notes (user_id, chapter_id, position, content, tags)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, chapter_id, position, content, tags]
    );

    res.status(201).json({
      status: 'success',
      message: '노트가 생성되었습니다',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('노트 생성 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '노트 생성 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 내 노트 조회
// ============================================
router.get('/', async (req, res) => {
  try {
    const { chapter_id } = req.query;

    let result;
    if (chapter_id) {
      // 특정 챕터의 노트
      result = await query(
        `SELECT n.*, c.title as chapter_title, bk.title as book_title
         FROM notes n
         JOIN chapters c ON n.chapter_id = c.id
         JOIN books bk ON c.book_id = bk.id
         WHERE n.user_id = $1 AND n.chapter_id = $2
         ORDER BY n.created_at DESC`,
        [req.user.id, chapter_id]
      );
    } else {
      // 모든 노트
      result = await query(
        `SELECT n.*, c.title as chapter_title, bk.title as book_title
         FROM notes n
         JOIN chapters c ON n.chapter_id = c.id
         JOIN books bk ON c.book_id = bk.id
         WHERE n.user_id = $1
         ORDER BY n.created_at DESC`,
        [req.user.id]
      );
    }

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('노트 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '노트 조회 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 노트 수정
// ============================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, tags } = req.body;

    const result = await query(
      `UPDATE notes
       SET content = COALESCE($1, content),
           tags = COALESCE($2, tags),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [content, tags, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '노트를 찾을 수 없습니다'
      });
    }

    res.json({
      status: 'success',
      message: '노트가 수정되었습니다',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('노트 수정 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '노트 수정 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 노트 삭제
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '노트를 찾을 수 없습니다'
      });
    }

    res.json({
      status: 'success',
      message: '노트가 삭제되었습니다'
    });
  } catch (error) {
    console.error('노트 삭제 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '노트 삭제 중 오류가 발생했습니다'
    });
  }
});

module.exports = router;
