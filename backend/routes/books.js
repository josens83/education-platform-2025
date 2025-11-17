const express = require('express');
const router = express.Router();
const { query } = require('../database');
const { authenticateToken, checkSubscription, authorizeRoles } = require('../middleware/auth');

// ============================================
// 책 목록 조회 (공개)
// ============================================
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT b.*, c.name as category_name
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.is_published = true
    `;
    const params = [];
    let paramCount = 1;

    if (category) {
      queryText += ` AND c.slug = $${paramCount++}`;
      params.push(category);
    }

    if (difficulty) {
      queryText += ` AND b.difficulty_level = $${paramCount++}`;
      params.push(difficulty);
    }

    if (search) {
      queryText += ` AND (b.title ILIKE $${paramCount} OR b.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    queryText += ` ORDER BY b.is_featured DESC, b.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    res.json({
      status: 'success',
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rowCount
      }
    });
  } catch (error) {
    console.error('책 목록 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '책 목록 조회 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 책 상세 조회
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const bookResult = await query(
      `SELECT b.*, c.name as category_name
       FROM books b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.id = $1 AND b.is_published = true`,
      [id]
    );

    if (bookResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '책을 찾을 수 없습니다'
      });
    }

    // 챕터 목록도 함께 조회
    const chaptersResult = await query(
      `SELECT id, chapter_number, title, slug, estimated_minutes, is_published
       FROM chapters
       WHERE book_id = $1 AND is_published = true
       ORDER BY chapter_number`,
      [id]
    );

    res.json({
      status: 'success',
      data: {
        book: bookResult.rows[0],
        chapters: chaptersResult.rows
      }
    });
  } catch (error) {
    console.error('책 상세 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '책 조회 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 책의 챕터 목록 조회
// ============================================
router.get('/:id/chapters', async (req, res) => {
  try {
    const { id } = req.params;

    // 관리자는 모든 챕터를, 일반 사용자는 출판된 챕터만 조회
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'teacher');

    let queryText = `SELECT id, book_id, chapter_number, title, slug, content, content_type, estimated_minutes, is_published, display_order
       FROM chapters
       WHERE book_id = $1`;

    if (!isAdmin) {
      queryText += ` AND is_published = true`;
    }

    queryText += ` ORDER BY display_order, chapter_number`;

    const chaptersResult = await query(queryText, [id]);

    res.json({
      status: 'success',
      data: chaptersResult.rows
    });
  } catch (error) {
    console.error('챕터 목록 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '챕터 조회 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 책에 챕터 추가 (관리자 전용)
// ============================================
router.post('/:id/chapters', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { id: bookId } = req.params;
    const {
      chapter_number,
      title,
      content,
      content_type,
      estimated_minutes,
      is_published,
      display_order,
    } = req.body;

    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const result = await query(
      `INSERT INTO chapters (
        book_id, chapter_number, title, slug, content, content_type,
        estimated_minutes, is_published, display_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [bookId, chapter_number, title, slug, content, content_type || 'html',
       estimated_minutes, is_published || false, display_order || 0]
    );

    res.status(201).json({
      status: 'success',
      message: '챕터가 생성되었습니다',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('챕터 생성 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '챕터 생성 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 책 생성 (관리자 전용)
// ============================================
router.post('/', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const {
      title,
      slug,
      subtitle,
      description,
      category_id,
      cover_image_url,
      author,
      difficulty_level,
      target_grade,
      target_exam,
      estimated_hours,
      is_published,
      metadata
    } = req.body;

    // Generate slug from title if not provided
    const bookSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const result = await query(
      `INSERT INTO books (
        title, slug, subtitle, description, category_id, cover_image_url,
        author, difficulty_level, target_grade, target_exam, estimated_hours,
        is_published, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [title, bookSlug, subtitle, description, category_id, cover_image_url,
       author, difficulty_level, target_grade, target_exam, estimated_hours,
       is_published || false, metadata]
    );

    res.status(201).json({
      status: 'success',
      message: '책이 생성되었습니다',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('책 생성 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '책 생성 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 책 수정 (관리자 전용)
// ============================================
router.put('/:id', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      subtitle,
      description,
      category_id,
      cover_image_url,
      author,
      difficulty_level,
      target_grade,
      target_exam,
      estimated_hours,
      is_published,
      is_featured,
      metadata
    } = req.body;

    const result = await query(
      `UPDATE books SET
        title = COALESCE($1, title),
        subtitle = COALESCE($2, subtitle),
        description = COALESCE($3, description),
        category_id = COALESCE($4, category_id),
        cover_image_url = COALESCE($5, cover_image_url),
        author = COALESCE($6, author),
        difficulty_level = COALESCE($7, difficulty_level),
        target_grade = COALESCE($8, target_grade),
        target_exam = COALESCE($9, target_exam),
        estimated_hours = COALESCE($10, estimated_hours),
        is_published = COALESCE($11, is_published),
        is_featured = COALESCE($12, is_featured),
        metadata = COALESCE($13, metadata),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *`,
      [title, subtitle, description, category_id, cover_image_url, author,
       difficulty_level, target_grade, target_exam, estimated_hours,
       is_published, is_featured, metadata, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '책을 찾을 수 없습니다'
      });
    }

    res.json({
      status: 'success',
      message: '책이 수정되었습니다',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('책 수정 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '책 수정 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 책 삭제 (관리자 전용)
// ============================================
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // 책과 관련된 모든 데이터는 ON DELETE CASCADE로 자동 삭제됨
    const result = await query('DELETE FROM books WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '책을 찾을 수 없습니다'
      });
    }

    res.json({
      status: 'success',
      message: '책이 삭제되었습니다'
    });
  } catch (error) {
    console.error('책 삭제 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '책 삭제 중 오류가 발생했습니다'
    });
  }
});

module.exports = router;
