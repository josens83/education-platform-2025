/**
 * Learning Reminder Email Script
 * 학습 리마인더 이메일 전송 스크립트
 *
 * 용도:
 * - 3일 이상 학습하지 않은 사용자에게 이메일 발송
 * - 구독이 만료 임박한 사용자에게 알림
 * - 미완료 퀴즈가 있는 사용자에게 알림
 *
 * 실행: node backend/scripts/send-learning-reminders.js
 * Cron: 매일 오전 9시 실행 권장
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { pool } = require('../database');
const { sendEmail } = require('../lib/email');
const logger = require('../lib/logger');

// ============================================
// 설정
// ============================================
const INACTIVE_DAYS_THRESHOLD = 3; // 비활성 기간 임계값
const SUBSCRIPTION_EXPIRY_DAYS = 7; // 구독 만료 알림 기간

// ============================================
// 비활성 사용자에게 학습 리마인더 발송
// ============================================
async function sendInactiveUserReminders() {
  try {
    logger.info('Fetching inactive users...');

    const result = await pool.query(
      `SELECT
        u.id,
        u.email,
        u.username,
        s.end_date,
        COALESCE(MAX(ls.stat_date), u.created_at) as last_activity
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
      LEFT JOIN learning_stats ls ON u.id = ls.user_id
      WHERE s.id IS NOT NULL
        AND COALESCE(MAX(ls.stat_date), u.created_at) < NOW() - INTERVAL '${INACTIVE_DAYS_THRESHOLD} days'
      GROUP BY u.id, u.email, u.username, s.end_date
      HAVING COALESCE(MAX(ls.stat_date), u.created_at) < NOW() - INTERVAL '${INACTIVE_DAYS_THRESHOLD} days'
      LIMIT 100` // 한 번에 최대 100명
    );

    logger.info(`Found ${result.rows.length} inactive users`);

    for (const user of result.rows) {
      await sendLearningReminderEmail(user);
      // Rate limiting을 위한 대기
      await sleep(100);
    }

    logger.info(`Sent ${result.rows.length} inactive user reminder emails`);
  } catch (error) {
    logger.error('Error sending inactive user reminders', { error: error.message });
    throw error;
  }
}

// ============================================
// 학습 리마인더 이메일 전송
// ============================================
async function sendLearningReminderEmail(user) {
  const { email, username, last_activity } = user;

  const daysSinceLastActivity = Math.floor(
    (Date.now() - new Date(last_activity).getTime()) / (1000 * 60 * 60 * 24)
  );

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px 20px;
          border-radius: 10px 10px 0 0;
          text-align: center;
        }
        .content {
          background: #f9fafb;
          padding: 30px 20px;
          border-radius: 0 0 10px 10px;
        }
        .cta-button {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 15px 40px;
          text-decoration: none;
          border-radius: 25px;
          font-weight: bold;
          margin: 20px 0;
        }
        .stats-box {
          background: white;
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
          border-left: 4px solid #667eea;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #6b7280;
          font-size: 0.9em;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📚 ${username}님, 오늘은 영어 공부하는 날!</h1>
        </div>
        <div class="content">
          <p>안녕하세요, ${username}님!</p>

          <p>
            마지막 학습 이후 <strong>${daysSinceLastActivity}일</strong>이 지났습니다.
            매일 조금씩 꾸준히 학습하는 것이 영어 실력 향상의 비결이에요! 😊
          </p>

          <div class="stats-box">
            <h3>💡 오늘의 학습 목표</h3>
            <ul>
              <li>15분만 투자해서 새로운 챕터 읽어보기</li>
              <li>어제 배운 단어 5개 복습하기</li>
              <li>짧은 퀴즈 하나 풀어보기</li>
            </ul>
          </div>

          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/books" class="cta-button">
              📖 지금 학습 시작하기
            </a>
          </p>

          <div class="stats-box" style="border-left-color: #10b981;">
            <h3>🎯 작은 목표, 큰 변화</h3>
            <p>
              하루 15분씩만 투자해도 한 달이면 7시간 30분,
              1년이면 91시간이 됩니다!
            </p>
            <p>
              <strong>지금 바로 시작하세요!</strong>
            </p>
          </div>

          <p style="color: #6b7280; font-size: 0.9em; margin-top: 30px;">
            더 이상 리마인더를 받고 싶지 않으시다면
            <a href="${process.env.FRONTEND_URL}/profile/notifications">설정</a>에서
            변경하실 수 있습니다.
          </p>
        </div>
        <div class="footer">
          <p>영어 학습 플랫폼 | 매일 성장하는 여러분을 응원합니다!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendEmail(
      email,
      `${username}님, 오늘도 함께 영어 공부해요! 📚`,
      html
    );

    logger.info('Learning reminder sent', { userId: user.id, email });
  } catch (error) {
    logger.error('Failed to send learning reminder', {
      userId: user.id,
      email,
      error: error.message,
    });
  }
}

// ============================================
// 구독 만료 임박 알림
// ============================================
async function sendSubscriptionExpiryReminders() {
  try {
    logger.info('Fetching subscriptions expiring soon...');

    const result = await pool.query(
      `SELECT
        u.id,
        u.email,
        u.username,
        s.end_date,
        sp.name as plan_name,
        sp.price
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE s.status = 'active'
        AND s.end_date BETWEEN NOW() AND NOW() + INTERVAL '${SUBSCRIPTION_EXPIRY_DAYS} days'
        AND s.end_date > NOW()
      LIMIT 100`
    );

    logger.info(`Found ${result.rows.length} subscriptions expiring soon`);

    for (const subscription of result.rows) {
      await sendExpiryReminderEmail(subscription);
      await sleep(100);
    }

    logger.info(`Sent ${result.rows.length} expiry reminder emails`);
  } catch (error) {
    logger.error('Error sending expiry reminders', { error: error.message });
    throw error;
  }
}

// ============================================
// 구독 만료 알림 이메일
// ============================================
async function sendExpiryReminderEmail(subscription) {
  const { email, username, end_date, plan_name, price } = subscription;

  const daysRemaining = Math.ceil(
    (new Date(end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header {
          background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
          color: white;
          padding: 30px 20px;
          border-radius: 10px 10px 0 0;
          text-align: center;
        }
        .content { background: #f9fafb; padding: 30px 20px; }
        .warning-box {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 20px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .cta-button {
          display: inline-block;
          background: #ef4444;
          color: white;
          padding: 15px 40px;
          text-decoration: none;
          border-radius: 25px;
          font-weight: bold;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ 구독이 곧 만료됩니다!</h1>
        </div>
        <div class="content">
          <p>안녕하세요, ${username}님!</p>

          <div class="warning-box">
            <h3>⚠️ 구독 만료 안내</h3>
            <p>
              <strong>${plan_name}</strong> 구독이
              <strong>${daysRemaining}일</strong> 후에 만료됩니다.
            </p>
            <p>만료일: ${new Date(end_date).toLocaleDateString('ko-KR')}</p>
          </div>

          <p>
            지금 갱신하시면 계속해서 모든 콘텐츠를 이용하실 수 있습니다!
          </p>

          <ul>
            <li>📚 수백 권의 영어 원서 무제한 읽기</li>
            <li>🎧 전문가 음성의 오디오북</li>
            <li>✍️ 학습 진도 및 통계 추적</li>
            <li>📝 단어장 및 노트 기능</li>
          </ul>

          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/subscription" class="cta-button">
              지금 구독 갱신하기
            </a>
          </p>

          <p style="color: #6b7280; font-size: 0.9em; margin-top: 30px;">
            구독을 갱신하지 않으시면 만료 후 콘텐츠 이용이 제한됩니다.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendEmail(
      email,
      `⏰ ${username}님, 구독이 ${daysRemaining}일 후에 만료됩니다`,
      html
    );

    logger.info('Expiry reminder sent', {
      userId: subscription.id,
      email,
      daysRemaining,
    });
  } catch (error) {
    logger.error('Failed to send expiry reminder', {
      userId: subscription.id,
      email,
      error: error.message,
    });
  }
}

// ============================================
// 유틸리티
// ============================================
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// 메인 실행
// ============================================
async function main() {
  logger.info('========================================');
  logger.info('Starting learning reminder script');
  logger.info('========================================');

  try {
    // 1. 비활성 사용자에게 학습 리마인더 발송
    await sendInactiveUserReminders();

    // 2. 구독 만료 임박 알림
    await sendSubscriptionExpiryReminders();

    logger.info('========================================');
    logger.info('Learning reminder script completed successfully');
    logger.info('========================================');

    process.exit(0);
  } catch (error) {
    logger.error('Learning reminder script failed', { error: error.message });
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = {
  sendInactiveUserReminders,
  sendSubscriptionExpiryReminders,
};
