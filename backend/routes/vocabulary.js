const express = require('express');
const router = express.Router();
const { query } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// 모든 라우트는 인증 필요
router.use(authenticateToken);

// ============================================
// 단어 추가
// ============================================
router.post('/', async (req, res) => {
  try {
    const { word, definition, example_sentence, chapter_id } = req.body;

    // 단어가 비어있는지 확인
    if (!word || !word.trim()) {
      return res.status(400).json({
        status: 'error',
        message: '단어를 입력해주세요'
      });
    }

    const result = await query(
      `INSERT INTO vocabulary (user_id, word, definition, example_sentence, chapter_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, word.trim(), definition, example_sentence, chapter_id]
    );

    res.status(201).json({
      status: 'success',
      message: '단어가 추가되었습니다',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('단어 추가 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '단어 추가 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 내 단어장 조회
// ============================================
router.get('/', async (req, res) => {
  try {
    const { is_mastered, search } = req.query;

    let sqlQuery = `
      SELECT v.*, c.title as chapter_title, b.title as book_title
      FROM vocabulary v
      LEFT JOIN chapters c ON v.chapter_id = c.id
      LEFT JOIN books b ON c.book_id = b.id
      WHERE v.user_id = $1
    `;
    const params = [req.user.id];
    let paramIndex = 2;

    // 학습 완료 여부 필터
    if (is_mastered !== undefined) {
      sqlQuery += ` AND v.is_mastered = $${paramIndex}`;
      params.push(is_mastered === 'true');
      paramIndex++;
    }

    // 검색 필터
    if (search) {
      sqlQuery += ` AND (v.word ILIKE $${paramIndex} OR v.definition ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sqlQuery += ' ORDER BY v.created_at DESC';

    const result = await query(sqlQuery, params);

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('단어장 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '단어장 조회 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 단어 상세 조회
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT v.*, c.title as chapter_title, b.title as book_title
       FROM vocabulary v
       LEFT JOIN chapters c ON v.chapter_id = c.id
       LEFT JOIN books b ON c.book_id = b.id
       WHERE v.id = $1 AND v.user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '단어를 찾을 수 없습니다'
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('단어 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '단어 조회 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 단어 마스터 상태 토글
// ============================================
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_mastered } = req.body;

    const result = await query(
      `UPDATE vocabulary
       SET is_mastered = COALESCE($1, is_mastered),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [is_mastered, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '단어를 찾을 수 없습니다'
      });
    }

    res.json({
      status: 'success',
      message: '단어 상태가 업데이트되었습니다',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('단어 상태 업데이트 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '단어 상태 업데이트 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 단어 수정
// ============================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { word, definition, example_sentence } = req.body;

    const result = await query(
      `UPDATE vocabulary
       SET word = COALESCE($1, word),
           definition = COALESCE($2, definition),
           example_sentence = COALESCE($3, example_sentence),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [word, definition, example_sentence, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '단어를 찾을 수 없습니다'
      });
    }

    res.json({
      status: 'success',
      message: '단어가 수정되었습니다',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('단어 수정 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '단어 수정 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 단어 삭제
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM vocabulary WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '단어를 찾을 수 없습니다'
      });
    }

    res.json({
      status: 'success',
      message: '단어가 삭제되었습니다'
    });
  } catch (error) {
    console.error('단어 삭제 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '단어 삭제 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 학습 통계
// ============================================
router.get('/stats/summary', async (req, res) => {
  try {
    const result = await query(
      `SELECT
         COUNT(*) as total_words,
         COUNT(*) FILTER (WHERE is_mastered = true) as mastered_words,
         COUNT(*) FILTER (WHERE is_mastered = false) as learning_words
       FROM vocabulary
       WHERE user_id = $1`,
      [req.user.id]
    );

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('통계 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '통계 조회 중 오류가 발생했습니다'
    });
  }
});

module.exports = router;
