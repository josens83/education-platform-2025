const express = require('express');
const router = express.Router();
const { query } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// ============================================
// 구독 플랜 목록
// ============================================
router.get('/plans', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM subscription_plans WHERE is_active = true ORDER BY price'
    );

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('플랜 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '플랜 조회 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 내 구독 정보
// ============================================
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT s.*, p.name as plan_name, p.features
       FROM subscriptions s
       JOIN subscription_plans p ON s.plan_id = p.id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json({
        status: 'success',
        data: null,
        message: '구독 정보가 없습니다'
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('구독 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '구독 조회 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 구독 생성 (무료 체험 포함)
// ============================================
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { plan_id, payment_method } = req.body;

    // 플랜 정보 조회
    const planResult = await query(
      'SELECT * FROM subscription_plans WHERE id = $1 AND is_active = true',
      [plan_id]
    );

    if (planResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '플랜을 찾을 수 없습니다'
      });
    }

    const plan = planResult.rows[0];

    // 기존 구독 확인
    const existingResult = await query(
      'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2',
      [req.user.id, 'active']
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: '이미 활성화된 구독이 있습니다'
      });
    }

    // 종료일 계산
    let endDate = null;
    if (plan.billing_cycle === 'monthly') {
      endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.billing_cycle === 'annual') {
      endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else if (plan.billing_cycle === 'trial') {
      endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.trial_days);
    }

    // 구독 생성
    const result = await query(
      `INSERT INTO subscriptions (
        user_id, plan_id, status, start_date, end_date, payment_method
      ) VALUES ($1, $2, $3, NOW(), $4, $5)
      RETURNING *`,
      [req.user.id, plan_id, 'active', endDate, payment_method]
    );

    res.status(201).json({
      status: 'success',
      message: '구독이 시작되었습니다',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('구독 생성 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '구독 생성 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 구독 취소
// ============================================
router.delete('/my', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `UPDATE subscriptions
       SET status = 'cancelled', auto_renew = false, updated_at = NOW()
       WHERE user_id = $1 AND status = 'active'
       RETURNING *`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '활성화된 구독이 없습니다'
      });
    }

    res.json({
      status: 'success',
      message: '구독이 취소되었습니다',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('구독 취소 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '구독 취소 중 오류가 발생했습니다'
    });
  }
});

module.exports = router;
