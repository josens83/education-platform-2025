const express = require('express');
const router = express.Router();
const { query } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const logger = require('../lib/logger');

// ============================================
// 쿠폰 검증 (사용자)
// ============================================
router.post('/validate',
  authenticateToken,
  [
    body('code').trim().notEmpty().withMessage('쿠폰 코드를 입력해주세요'),
    body('plan_id').optional().isInt().withMessage('유효한 플랜 ID를 입력해주세요')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: errors.array()[0].msg
        });
      }

      const { code, plan_id } = req.body;
      const userId = req.user.id;

      // 쿠폰 검증 함수 호출
      const result = await query(
        'SELECT * FROM can_use_coupon($1, $2, $3)',
        [code.toUpperCase(), userId, plan_id || null]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: '쿠폰 검증에 실패했습니다'
        });
      }

      const validation = result.rows[0];

      if (!validation.can_use) {
        return res.status(400).json({
          status: 'error',
          message: validation.reason
        });
      }

      // 쿠폰 정보 조회
      const couponResult = await query(
        'SELECT id, code, description, discount_type, discount_value FROM coupons WHERE code = $1',
        [code.toUpperCase()]
      );

      res.json({
        status: 'success',
        data: {
          valid: true,
          coupon: couponResult.rows[0],
          discount_amount: parseFloat(validation.discount_amount),
          message: validation.reason
        }
      });
    } catch (error) {
      logger.error('Coupon validation error', { error: error.message, code: req.body.code });
      res.status(500).json({
        status: 'error',
        message: '쿠폰 검증 중 오류가 발생했습니다'
      });
    }
  }
);

// ============================================
// 쿠폰 적용 (결제 시)
// ============================================
router.post('/apply',
  authenticateToken,
  [
    body('code').trim().notEmpty().withMessage('쿠폰 코드를 입력해주세요'),
    body('plan_id').isInt().withMessage('유효한 플랜 ID를 입력해주세요'),
    body('subscription_id').optional().isInt().withMessage('유효한 구독 ID를 입력해주세요')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: errors.array()[0].msg
        });
      }

      const { code, plan_id, subscription_id } = req.body;
      const userId = req.user.id;

      // 쿠폰 검증
      const validationResult = await query(
        'SELECT * FROM can_use_coupon($1, $2, $3)',
        [code.toUpperCase(), userId, plan_id]
      );

      if (validationResult.rows.length === 0 || !validationResult.rows[0].can_use) {
        return res.status(400).json({
          status: 'error',
          message: validationResult.rows[0]?.reason || '쿠폰을 사용할 수 없습니다'
        });
      }

      // 플랜 정보 조회
      const planResult = await query(
        'SELECT * FROM subscription_plans WHERE id = $1',
        [plan_id]
      );

      if (planResult.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: '플랜을 찾을 수 없습니다'
        });
      }

      const plan = planResult.rows[0];
      const originalAmount = parseFloat(plan.price);
      const discountAmount = parseFloat(validationResult.rows[0].discount_amount);
      const finalAmount = Math.max(0, originalAmount - discountAmount);

      // 쿠폰 정보 조회
      const couponResult = await query(
        'SELECT id FROM coupons WHERE code = $1',
        [code.toUpperCase()]
      );

      const couponId = couponResult.rows[0].id;

      // 쿠폰 사용 기록
      await query(
        `INSERT INTO coupon_usages (coupon_id, user_id, subscription_id, discount_amount, original_amount, final_amount)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [couponId, userId, subscription_id || null, discountAmount, originalAmount, finalAmount]
      );

      logger.info('Coupon applied', {
        userId,
        code: code.toUpperCase(),
        discountAmount,
        finalAmount
      });

      res.json({
        status: 'success',
        data: {
          original_amount: originalAmount,
          discount_amount: discountAmount,
          final_amount: finalAmount,
          coupon_code: code.toUpperCase()
        }
      });
    } catch (error) {
      logger.error('Coupon application error', { error: error.message, code: req.body.code });

      // 중복 사용 에러 처리
      if (error.code === '23505') {
        return res.status(400).json({
          status: 'error',
          message: '이미 사용한 쿠폰입니다'
        });
      }

      res.status(500).json({
        status: 'error',
        message: '쿠폰 적용 중 오류가 발생했습니다'
      });
    }
  }
);

// ============================================
// 내 쿠폰 사용 내역 (사용자)
// ============================================
router.get('/my-usage', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT
        cu.id,
        c.code,
        c.description,
        cu.discount_amount,
        cu.original_amount,
        cu.final_amount,
        cu.used_at,
        sp.name AS plan_name
      FROM coupon_usages cu
      JOIN coupons c ON cu.coupon_id = c.id
      LEFT JOIN subscriptions s ON cu.subscription_id = s.id
      LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE cu.user_id = $1
      ORDER BY cu.used_at DESC`,
      [req.user.id]
    );

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    logger.error('Fetch user coupon usage error', { error: error.message, userId: req.user.id });
    res.status(500).json({
      status: 'error',
      message: '쿠폰 사용 내역 조회 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 관리자: 모든 쿠폰 조회
// ============================================
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM coupon_stats ORDER BY created_at DESC`
    );

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    logger.error('Fetch all coupons error', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: '쿠폰 목록 조회 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 관리자: 쿠폰 생성
// ============================================
router.post('/admin/create',
  authenticateToken,
  requireAdmin,
  [
    body('code').trim().notEmpty().isLength({ min: 3, max: 50 }).withMessage('쿠폰 코드는 3-50자여야 합니다'),
    body('description').optional().isString(),
    body('discount_type').isIn(['percentage', 'fixed']).withMessage('할인 타입은 percentage 또는 fixed여야 합니다'),
    body('discount_value').isFloat({ min: 0 }).withMessage('할인 값은 0보다 커야 합니다'),
    body('max_discount_amount').optional().isFloat({ min: 0 }),
    body('min_purchase_amount').optional().isFloat({ min: 0 }),
    body('usage_limit').optional().isInt({ min: 1 }),
    body('usage_per_user').optional().isInt({ min: 1 }),
    body('valid_from').isISO8601().withMessage('유효 시작일을 입력해주세요'),
    body('valid_until').isISO8601().withMessage('유효 종료일을 입력해주세요'),
    body('applicable_plans').optional().isArray()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: errors.array()[0].msg
        });
      }

      const {
        code,
        description,
        discount_type,
        discount_value,
        max_discount_amount,
        min_purchase_amount,
        usage_limit,
        usage_per_user,
        valid_from,
        valid_until,
        applicable_plans
      } = req.body;

      // 퍼센트 할인 검증
      if (discount_type === 'percentage' && (discount_value <= 0 || discount_value > 100)) {
        return res.status(400).json({
          status: 'error',
          message: '퍼센트 할인은 0-100 사이여야 합니다'
        });
      }

      // 쿠폰 생성
      const result = await query(
        `INSERT INTO coupons (
          code, description, discount_type, discount_value,
          max_discount_amount, min_purchase_amount,
          usage_limit, usage_per_user,
          valid_from, valid_until, applicable_plans,
          created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [
          code.toUpperCase(),
          description || null,
          discount_type,
          discount_value,
          max_discount_amount || null,
          min_purchase_amount || 0,
          usage_limit || null,
          usage_per_user || 1,
          valid_from,
          valid_until,
          applicable_plans ? JSON.stringify(applicable_plans) : null,
          req.user.id
        ]
      );

      logger.info('Coupon created', { code: code.toUpperCase(), createdBy: req.user.id });

      res.status(201).json({
        status: 'success',
        data: result.rows[0]
      });
    } catch (error) {
      logger.error('Coupon creation error', { error: error.message, code: req.body.code });

      // 중복 코드 에러
      if (error.code === '23505') {
        return res.status(400).json({
          status: 'error',
          message: '이미 존재하는 쿠폰 코드입니다'
        });
      }

      res.status(500).json({
        status: 'error',
        message: '쿠폰 생성 중 오류가 발생했습니다'
      });
    }
  }
);

// ============================================
// 관리자: 쿠폰 수정
// ============================================
router.put('/admin/:id',
  authenticateToken,
  requireAdmin,
  [
    body('description').optional().isString(),
    body('is_active').optional().isBoolean(),
    body('valid_until').optional().isISO8601()
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { description, is_active, valid_until } = req.body;

      const updates = [];
      const values = [];
      let paramCount = 1;

      if (description !== undefined) {
        updates.push(`description = $${paramCount++}`);
        values.push(description);
      }

      if (is_active !== undefined) {
        updates.push(`is_active = $${paramCount++}`);
        values.push(is_active);
      }

      if (valid_until !== undefined) {
        updates.push(`valid_until = $${paramCount++}`);
        values.push(valid_until);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: '수정할 내용이 없습니다'
        });
      }

      updates.push(`updated_at = NOW()`);
      values.push(id);

      const result = await query(
        `UPDATE coupons SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: '쿠폰을 찾을 수 없습니다'
        });
      }

      logger.info('Coupon updated', { couponId: id, updatedBy: req.user.id });

      res.json({
        status: 'success',
        data: result.rows[0]
      });
    } catch (error) {
      logger.error('Coupon update error', { error: error.message, couponId: req.params.id });
      res.status(500).json({
        status: 'error',
        message: '쿠폰 수정 중 오류가 발생했습니다'
      });
    }
  }
);

// ============================================
// 관리자: 쿠폰 삭제
// ============================================
router.delete('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // 사용 이력이 있는지 확인
    const usageResult = await query(
      'SELECT COUNT(*) as count FROM coupon_usages WHERE coupon_id = $1',
      [id]
    );

    const usageCount = parseInt(usageResult.rows[0].count);

    if (usageCount > 0) {
      // 사용 이력이 있으면 비활성화만
      await query(
        'UPDATE coupons SET is_active = FALSE WHERE id = $1',
        [id]
      );

      logger.info('Coupon deactivated (has usage history)', { couponId: id, usageCount });

      return res.json({
        status: 'success',
        message: '사용 이력이 있어 쿠폰이 비활성화되었습니다'
      });
    }

    // 사용 이력이 없으면 완전 삭제
    const result = await query(
      'DELETE FROM coupons WHERE id = $1 RETURNING code',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '쿠폰을 찾을 수 없습니다'
      });
    }

    logger.info('Coupon deleted', { couponId: id, code: result.rows[0].code });

    res.json({
      status: 'success',
      message: '쿠폰이 삭제되었습니다'
    });
  } catch (error) {
    logger.error('Coupon deletion error', { error: error.message, couponId: req.params.id });
    res.status(500).json({
      status: 'error',
      message: '쿠폰 삭제 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 관리자: 쿠폰 사용 내역
// ============================================
router.get('/admin/:id/usages', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        cu.id,
        cu.discount_amount,
        cu.original_amount,
        cu.final_amount,
        cu.used_at,
        u.username,
        u.email,
        sp.name AS plan_name
      FROM coupon_usages cu
      JOIN users u ON cu.user_id = u.id
      LEFT JOIN subscriptions s ON cu.subscription_id = s.id
      LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE cu.coupon_id = $1
      ORDER BY cu.used_at DESC`,
      [id]
    );

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    logger.error('Fetch coupon usages error', { error: error.message, couponId: req.params.id });
    res.status(500).json({
      status: 'error',
      message: '쿠폰 사용 내역 조회 중 오류가 발생했습니다'
    });
  }
});

module.exports = router;
