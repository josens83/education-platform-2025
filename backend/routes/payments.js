const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { query } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimiter');
const { alertNewSubscription, alertPaymentFailure } = require('../lib/adminAlerts');

// ============================================
// Stripe Checkout Session 생성
// ============================================
router.post('/create-checkout-session', paymentLimiter, authenticateToken, async (req, res) => {
  try {
    const { plan_id } = req.body;

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

    // 무료 체험은 Stripe 없이 처리
    if (plan.price === 0) {
      return res.json({
        status: 'success',
        message: '무료 체험은 결제가 필요하지 않습니다',
        isFree: true,
        plan_id
      });
    }

    // Stripe Checkout Session 생성
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: plan.billing_cycle === 'annual' ? 'payment' : 'subscription',
      customer_email: req.user.email,
      client_reference_id: req.user.id.toString(),
      line_items: [
        {
          price_data: {
            currency: 'krw',
            product_data: {
              name: plan.name,
              description: plan.description || `${plan.name} 구독`,
            },
            unit_amount: plan.price,
            ...(plan.billing_cycle === 'monthly' && {
              recurring: {
                interval: 'month'
              }
            }),
            ...(plan.billing_cycle === 'annual' && {
              recurring: {
                interval: 'year'
              }
            })
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: req.user.id,
        plan_id: plan.id,
        plan_name: plan.name,
        billing_cycle: plan.billing_cycle
      },
      success_url: `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });

    res.json({
      status: 'success',
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    console.error('Stripe Checkout Session 생성 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '결제 세션 생성 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// Stripe Webhook 처리
// ============================================
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook 서명 검증 실패:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 이벤트 처리
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(event.data.object);
          break;

        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(event.data.object);
          break;

        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event.data.object);
          break;

        default:
          console.log(`처리되지 않은 이벤트 타입: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook 처리 오류:', error);
      res.status(500).json({ error: 'Webhook 처리 실패' });
    }
  }
);

// ============================================
// 결제 성공 후 구독 활성화
// ============================================
async function handleCheckoutSessionCompleted(session) {
  const userId = parseInt(session.metadata.user_id);
  const planId = parseInt(session.metadata.plan_id);
  const billingCycle = session.metadata.billing_cycle;

  console.log('결제 완료:', { userId, planId, billingCycle });

  // 종료일 계산
  let endDate = new Date();
  if (billingCycle === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (billingCycle === 'annual') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  // 기존 구독 취소
  await query(
    `UPDATE subscriptions
     SET status = 'cancelled', auto_renew = false, updated_at = NOW()
     WHERE user_id = $1 AND status = 'active'`,
    [userId]
  );

  // 새 구독 생성
  await query(
    `INSERT INTO subscriptions (
      user_id, plan_id, status, start_date, end_date,
      payment_method, stripe_subscription_id, auto_renew
    ) VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7)`,
    [
      userId,
      planId,
      'active',
      endDate,
      'card',
      session.subscription || session.id,
      true
    ]
  );

  // 결제 내역 저장
  await query(
    `INSERT INTO payments (
      user_id, amount, currency, status,
      payment_method, stripe_payment_intent_id
    ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      userId,
      session.amount_total,
      session.currency,
      'completed',
      'card',
      session.payment_intent
    ]
  );

  console.log('구독 활성화 완료:', userId);

  // 관리자에게 새 구독 알림
  try {
    const userResult = await query(
      'SELECT username, email FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      const planResult = await query(
        'SELECT name FROM subscription_plans WHERE id = $1',
        [planId]
      );

      const planName = planResult.rows.length > 0 ? planResult.rows[0].name : 'Unknown Plan';

      await alertNewSubscription(
        userId,
        user.username,
        user.email,
        planName,
        session.amount_total / 100 // Stripe는 센트 단위이므로 100으로 나눔
      );
    }
  } catch (alertError) {
    console.error('Admin alert failed:', alertError);
    // 알림 실패는 결제 프로세스에 영향을 주지 않음
  }
}

// ============================================
// 구독 업데이트 처리
// ============================================
async function handleSubscriptionUpdated(subscription) {
  console.log('구독 업데이트:', subscription.id);

  // Stripe subscription ID로 구독 찾기
  const result = await query(
    'SELECT * FROM subscriptions WHERE stripe_subscription_id = $1',
    [subscription.id]
  );

  if (result.rows.length === 0) {
    console.error('구독을 찾을 수 없습니다:', subscription.id);
    return;
  }

  const currentSubscription = result.rows[0];

  // 상태 업데이트
  let status = 'active';
  if (subscription.status === 'canceled') {
    status = 'cancelled';
  } else if (subscription.status === 'past_due') {
    status = 'past_due';
  }

  await query(
    `UPDATE subscriptions
     SET status = $1, end_date = $2, updated_at = NOW()
     WHERE id = $3`,
    [status, new Date(subscription.current_period_end * 1000), currentSubscription.id]
  );
}

// ============================================
// 구독 취소 처리
// ============================================
async function handleSubscriptionDeleted(subscription) {
  console.log('구독 취소:', subscription.id);

  await query(
    `UPDATE subscriptions
     SET status = 'cancelled', auto_renew = false, updated_at = NOW()
     WHERE stripe_subscription_id = $1`,
    [subscription.id]
  );
}

// ============================================
// 결제 성공 처리
// ============================================
async function handleInvoicePaymentSucceeded(invoice) {
  console.log('결제 성공:', invoice.id);

  if (!invoice.subscription) {
    return;
  }

  // 구독 찾기
  const result = await query(
    'SELECT * FROM subscriptions WHERE stripe_subscription_id = $1',
    [invoice.subscription]
  );

  if (result.rows.length === 0) {
    console.error('구독을 찾을 수 없습니다:', invoice.subscription);
    return;
  }

  const subscription = result.rows[0];

  // 결제 내역 저장
  await query(
    `INSERT INTO payments (
      user_id, amount, currency, status,
      payment_method, stripe_payment_intent_id
    ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      subscription.user_id,
      invoice.amount_paid,
      invoice.currency,
      'completed',
      'card',
      invoice.payment_intent
    ]
  );
}

// ============================================
// 결제 실패 처리
// ============================================
async function handleInvoicePaymentFailed(invoice) {
  console.log('결제 실패:', invoice.id);

  if (!invoice.subscription) {
    return;
  }

  // 구독 상태를 past_due로 변경
  await query(
    `UPDATE subscriptions
     SET status = 'past_due', updated_at = NOW()
     WHERE stripe_subscription_id = $1`,
    [invoice.subscription]
  );

  // 실패한 결제 내역 저장
  const result = await query(
    'SELECT * FROM subscriptions WHERE stripe_subscription_id = $1',
    [invoice.subscription]
  );

  if (result.rows.length > 0) {
    const subscription = result.rows[0];

    await query(
      `INSERT INTO payments (
        user_id, amount, currency, status,
        payment_method, stripe_payment_intent_id
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        subscription.user_id,
        invoice.amount_due,
        invoice.currency,
        'failed',
        'card',
        invoice.payment_intent
      ]
    );

    // 관리자에게 결제 실패 알림
    try {
      const userResult = await query(
        'SELECT username, email FROM users WHERE id = $1',
        [subscription.user_id]
      );

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        const planResult = await query(
          'SELECT name FROM subscription_plans WHERE id = $1',
          [subscription.plan_id]
        );

        const planName = planResult.rows.length > 0 ? planResult.rows[0].name : 'Unknown Plan';

        await alertPaymentFailure(
          subscription.user_id,
          user.username,
          user.email,
          planName,
          invoice.amount_due / 100, // Stripe는 센트 단위이므로 100으로 나눔
          invoice.last_payment_error?.message || 'Unknown error'
        );
      }
    } catch (alertError) {
      console.error('Admin alert failed:', alertError);
      // 알림 실패는 결제 프로세스에 영향을 주지 않음
    }
  }
}

// ============================================
// 결제 세션 상태 조회
// ============================================
router.get('/session/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.json({
      status: 'success',
      data: {
        payment_status: session.payment_status,
        customer_email: session.customer_email,
        amount_total: session.amount_total,
        currency: session.currency
      }
    });
  } catch (error) {
    console.error('세션 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '세션 조회 중 오류가 발생했습니다'
    });
  }
});

// ============================================
// 사용자 결제 내역 조회
// ============================================
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM payments
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('결제 내역 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '결제 내역 조회 중 오류가 발생했습니다'
    });
  }
});

module.exports = router;
