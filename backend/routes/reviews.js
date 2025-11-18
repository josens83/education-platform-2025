const express = require('express');
const router = express.Router();
const { query } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const logger = require('../lib/logger');

// ============================================
// 책의 리뷰 목록 조회
// ============================================
router.get('/books/:bookId/reviews', async (req, res) => {
  try {
    const { bookId } = req.params;
    const { sort = 'recent', limit = 10, offset = 0 } = req.query;

    let orderBy = 'r.created_at DESC';
    if (sort === 'helpful') {
      orderBy = 'r.helpful_count DESC, r.created_at DESC';
    } else if (sort === 'rating_high') {
      orderBy = 'r.rating DESC, r.created_at DESC';
    } else if (sort === 'rating_low') {
      orderBy = 'r.rating ASC, r.created_at DESC';
    }

    const result = await query(
      `SELECT
        r.id,
        r.rating,
        r.title,
        r.content,
        r.is_verified_purchase,
        r.helpful_count,
        r.created_at,
        r.updated_at,
        u.id as user_id,
        u.username,
        CASE WHEN COUNT(lp.id) > 0 THEN true ELSE false END as has_read_book
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN chapters c ON c.book_id = $1
      LEFT JOIN learning_progress lp ON lp.user_id = r.user_id AND lp.chapter_id = c.id
      WHERE r.book_id = $1
      GROUP BY r.id, r.rating, r.title, r.content, r.is_verified_purchase,
               r.helpful_count, r.created_at, r.updated_at, u.id, u.username
      ORDER BY ${orderBy}
      LIMIT $2 OFFSET $3`,
      [bookId, parseInt(limit), parseInt(offset)]
    );

    // 총 리뷰 수 조회
    const countResult = await query(
      'SELECT COUNT(*) as total FROM reviews WHERE book_id = $1',
      [bookId]
    );

    res.json({
      status: 'success',
      data: {
        reviews: result.rows,
        total: parseInt(countResult.rows[0].total),
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    logger.error('Fetch reviews error', { error: error.message, bookId: req.params.bookId });
    res.status(500).json({
      status: 'error',
      message: '리뷰 조회 중 오류가 발생했습니다',
    });
  }
});

// ============================================
// 책의 평점 통계 조회
// ============================================
router.get('/books/:bookId/rating-stats', async (req, res) => {
  try {
    const { bookId } = req.params;

    const result = await query(
      'SELECT * FROM book_ratings WHERE book_id = $1',
      [bookId]
    );

    if (result.rows.length === 0) {
      return res.json({
        status: 'success',
        data: {
          book_id: parseInt(bookId),
          review_count: 0,
          average_rating: 0,
          rating_distribution: {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
          },
          verified_review_count: 0,
        },
      });
    }

    const stats = result.rows[0];
    res.json({
      status: 'success',
      data: {
        book_id: stats.book_id,
        review_count: parseInt(stats.review_count),
        average_rating: parseFloat(stats.average_rating),
        rating_distribution: {
          5: parseInt(stats.rating_5_count),
          4: parseInt(stats.rating_4_count),
          3: parseInt(stats.rating_3_count),
          2: parseInt(stats.rating_2_count),
          1: parseInt(stats.rating_1_count),
        },
        verified_review_count: parseInt(stats.verified_review_count),
      },
    });
  } catch (error) {
    logger.error('Fetch rating stats error', { error: error.message, bookId: req.params.bookId });
    res.status(500).json({
      status: 'error',
      message: '평점 통계 조회 중 오류가 발생했습니다',
    });
  }
});

// ============================================
// 리뷰 작성
// ============================================
router.post(
  '/books/:bookId/reviews',
  authenticateToken,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('평점은 1-5 사이여야 합니다'),
    body('title').optional().isLength({ max: 200 }).withMessage('제목은 200자 이하여야 합니다'),
    body('content').optional().isLength({ max: 2000 }).withMessage('내용은 2000자 이하여야 합니다'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: errors.array()[0].msg,
        });
      }

      const { bookId } = req.params;
      const { rating, title, content } = req.body;
      const userId = req.user.id;

      // 검증된 구매 확인
      const isVerified = await query(
        'SELECT is_verified_purchase($1, $2) as is_verified',
        [userId, bookId]
      );
      const verifiedPurchase = isVerified.rows[0].is_verified;

      // 리뷰 작성
      const result = await query(
        `INSERT INTO reviews (user_id, book_id, rating, title, content, is_verified_purchase)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, bookId, rating, title || null, content || null, verifiedPurchase]
      );

      logger.info('Review created', {
        userId,
        bookId,
        rating,
        isVerified: verifiedPurchase,
      });

      res.status(201).json({
        status: 'success',
        data: result.rows[0],
      });
    } catch (error) {
      logger.error('Create review error', { error: error.message, bookId: req.params.bookId });

      // 중복 리뷰 에러
      if (error.code === '23505') {
        return res.status(400).json({
          status: 'error',
          message: '이미 이 책에 대한 리뷰를 작성하셨습니다',
        });
      }

      res.status(500).json({
        status: 'error',
        message: '리뷰 작성 중 오류가 발생했습니다',
      });
    }
  }
);

// ============================================
// 리뷰 수정
// ============================================
router.put(
  '/reviews/:id',
  authenticateToken,
  [
    body('rating').optional().isInt({ min: 1, max: 5 }),
    body('title').optional().isLength({ max: 200 }),
    body('content').optional().isLength({ max: 2000 }),
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, title, content } = req.body;
      const userId = req.user.id;

      // 리뷰 소유자 확인
      const reviewResult = await query(
        'SELECT user_id FROM reviews WHERE id = $1',
        [id]
      );

      if (reviewResult.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: '리뷰를 찾을 수 없습니다',
        });
      }

      if (reviewResult.rows[0].user_id !== userId) {
        return res.status(403).json({
          status: 'error',
          message: '권한이 없습니다',
        });
      }

      // 리뷰 업데이트
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (rating !== undefined) {
        updates.push(`rating = $${paramCount++}`);
        values.push(rating);
      }
      if (title !== undefined) {
        updates.push(`title = $${paramCount++}`);
        values.push(title);
      }
      if (content !== undefined) {
        updates.push(`content = $${paramCount++}`);
        values.push(content);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: '수정할 내용이 없습니다',
        });
      }

      values.push(id);

      const result = await query(
        `UPDATE reviews SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      logger.info('Review updated', { reviewId: id, userId });

      res.json({
        status: 'success',
        data: result.rows[0],
      });
    } catch (error) {
      logger.error('Update review error', { error: error.message, reviewId: req.params.id });
      res.status(500).json({
        status: 'error',
        message: '리뷰 수정 중 오류가 발생했습니다',
      });
    }
  }
);

// ============================================
// 리뷰 삭제
// ============================================
router.delete('/reviews/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // 리뷰 소유자 확인
    const reviewResult = await query(
      'SELECT user_id FROM reviews WHERE id = $1',
      [id]
    );

    if (reviewResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '리뷰를 찾을 수 없습니다',
      });
    }

    // 관리자이거나 본인의 리뷰인 경우만 삭제 가능
    if (!isAdmin && reviewResult.rows[0].user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: '권한이 없습니다',
      });
    }

    await query('DELETE FROM reviews WHERE id = $1', [id]);

    logger.info('Review deleted', { reviewId: id, userId, isAdmin });

    res.json({
      status: 'success',
      message: '리뷰가 삭제되었습니다',
    });
  } catch (error) {
    logger.error('Delete review error', { error: error.message, reviewId: req.params.id });
    res.status(500).json({
      status: 'error',
      message: '리뷰 삭제 중 오류가 발생했습니다',
    });
  }
});

// ============================================
// 리뷰 도움됨 표시
// ============================================
router.post('/reviews/:id/helpful', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await query(
      'INSERT INTO review_helpful (review_id, user_id) VALUES ($1, $2)',
      [id, userId]
    );

    logger.info('Review marked as helpful', { reviewId: id, userId });

    res.json({
      status: 'success',
      message: '도움이 됨으로 표시했습니다',
    });
  } catch (error) {
    // 이미 표시한 경우
    if (error.code === '23505') {
      return res.status(400).json({
        status: 'error',
        message: '이미 도움이 됨으로 표시하셨습니다',
      });
    }

    logger.error('Mark helpful error', { error: error.message, reviewId: req.params.id });
    res.status(500).json({
      status: 'error',
      message: '도움이 됨 표시 중 오류가 발생했습니다',
    });
  }
});

// ============================================
// 리뷰 도움됨 취소
// ============================================
router.delete('/reviews/:id/helpful', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      'DELETE FROM review_helpful WHERE review_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: '도움이 됨 표시를 찾을 수 없습니다',
      });
    }

    logger.info('Review helpful removed', { reviewId: id, userId });

    res.json({
      status: 'success',
      message: '도움이 됨 표시가 취소되었습니다',
    });
  } catch (error) {
    logger.error('Remove helpful error', { error: error.message, reviewId: req.params.id });
    res.status(500).json({
      status: 'error',
      message: '도움이 됨 취소 중 오류가 발생했습니다',
    });
  }
});

// ============================================
// 리뷰 신고
// ============================================
router.post(
  '/reviews/:id/report',
  authenticateToken,
  [
    body('reason')
      .isIn(['spam', 'inappropriate', 'offensive', 'misleading'])
      .withMessage('유효한 신고 사유를 선택해주세요'),
    body('details').optional().isLength({ max: 500 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: errors.array()[0].msg,
        });
      }

      const { id } = req.params;
      const { reason, details } = req.body;
      const userId = req.user.id;

      await query(
        `INSERT INTO review_reports (review_id, reported_by, reason, details)
         VALUES ($1, $2, $3, $4)`,
        [id, userId, reason, details || null]
      );

      logger.info('Review reported', { reviewId: id, userId, reason });

      res.json({
        status: 'success',
        message: '신고가 접수되었습니다. 검토 후 조치하겠습니다.',
      });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({
          status: 'error',
          message: '이미 신고하신 리뷰입니다',
        });
      }

      logger.error('Report review error', { error: error.message, reviewId: req.params.id });
      res.status(500).json({
        status: 'error',
        message: '리뷰 신고 중 오류가 발생했습니다',
      });
    }
  }
);

// ============================================
// 관리자: 신고된 리뷰 목록
// ============================================
router.get('/admin/reported-reviews', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status = 'pending' } = req.query;

    const result = await query(
      `SELECT
        rr.id,
        rr.reason,
        rr.details,
        rr.status,
        rr.created_at,
        r.id as review_id,
        r.rating,
        r.title as review_title,
        r.content as review_content,
        u_reporter.username as reporter_username,
        u_author.username as review_author
      FROM review_reports rr
      JOIN reviews r ON rr.review_id = r.id
      JOIN users u_reporter ON rr.reported_by = u_reporter.id
      JOIN users u_author ON r.user_id = u_author.id
      WHERE rr.status = $1
      ORDER BY rr.created_at DESC`,
      [status]
    );

    res.json({
      status: 'success',
      data: result.rows,
    });
  } catch (error) {
    logger.error('Fetch reported reviews error', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: '신고된 리뷰 조회 중 오류가 발생했습니다',
    });
  }
});

module.exports = router;
