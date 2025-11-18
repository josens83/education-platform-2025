/**
 * Web Push Notifications
 *
 * 푸시 알림 관리 및 전송
 */

const webpush = require('web-push');
const pool = require('./db');

// VAPID 키 설정 (환경 변수에서 로드)
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@example.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
  console.log('[Push] VAPID configured successfully');
} else {
  console.warn('[Push] VAPID keys not configured. Push notifications disabled.');
  console.warn('[Push] Generate VAPID keys using: npx web-push generate-vapid-keys');
}

/**
 * 푸시 구독 저장
 */
async function savePushSubscription(userId, subscription) {
  try {
    await pool.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, endpoint)
       DO UPDATE SET p256dh = $3, auth = $4, updated_at = NOW()`,
      [
        userId,
        subscription.endpoint,
        subscription.keys.p256dh,
        subscription.keys.auth,
      ]
    );

    console.log(`[Push] Subscription saved for user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error('[Push] Error saving subscription:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 푸시 구독 삭제
 */
async function deletePushSubscription(userId, endpoint) {
  try {
    await pool.query(
      'DELETE FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2',
      [userId, endpoint]
    );

    console.log(`[Push] Subscription deleted for user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error('[Push] Error deleting subscription:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 특정 사용자에게 푸시 알림 전송
 */
async function sendPushToUser(userId, payload) {
  try {
    // 사용자의 구독 정보 가져오기
    const result = await pool.query(
      'SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      console.log(`[Push] No subscriptions found for user ${userId}`);
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    // 각 구독에 푸시 전송
    for (const subscription of result.rows) {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
        sent++;
        console.log(`[Push] Sent to user ${userId}`);
      } catch (error) {
        failed++;
        console.error(`[Push] Failed to send to user ${userId}:`, error);

        // 410 Gone: 구독이 만료된 경우 삭제
        if (error.statusCode === 410) {
          await pool.query(
            'DELETE FROM push_subscriptions WHERE endpoint = $1',
            [subscription.endpoint]
          );
          console.log(`[Push] Deleted expired subscription`);
        }
      }
    }

    return { sent, failed };
  } catch (error) {
    console.error('[Push] Error sending to user:', error);
    return { sent: 0, failed: 1, error: error.message };
  }
}

/**
 * 모든 사용자에게 푸시 알림 브로드캐스트
 */
async function broadcastPush(payload) {
  try {
    const result = await pool.query(
      'SELECT DISTINCT user_id FROM push_subscriptions'
    );

    let totalSent = 0;
    let totalFailed = 0;

    for (const row of result.rows) {
      const { sent, failed } = await sendPushToUser(row.user_id, payload);
      totalSent += sent;
      totalFailed += failed;
    }

    console.log(`[Push] Broadcast complete: ${totalSent} sent, ${totalFailed} failed`);
    return { sent: totalSent, failed: totalFailed };
  } catch (error) {
    console.error('[Push] Error broadcasting:', error);
    return { sent: 0, failed: 0, error: error.message };
  }
}

/**
 * 사용자 그룹에게 푸시 알림 전송
 */
async function sendPushToGroup(userIds, payload) {
  let totalSent = 0;
  let totalFailed = 0;

  for (const userId of userIds) {
    const { sent, failed } = await sendPushToUser(userId, payload);
    totalSent += sent;
    totalFailed += failed;
  }

  console.log(`[Push] Group push complete: ${totalSent} sent, ${totalFailed} failed`);
  return { sent: totalSent, failed: totalFailed };
}

/**
 * 학습 알림 전송
 */
async function sendLearningReminder(userId) {
  const payload = {
    title: '📚 학습 시간이에요!',
    body: '오늘의 영어 학습을 시작해볼까요?',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    url: '/dashboard',
    data: {
      type: 'learning_reminder',
      timestamp: new Date().toISOString(),
    },
  };

  return await sendPushToUser(userId, payload);
}

/**
 * 새 책 출시 알림
 */
async function sendNewBookNotification(bookId, bookTitle) {
  const payload = {
    title: '🎉 새로운 책이 출시되었어요!',
    body: `"${bookTitle}"를 지금 읽어보세요`,
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    url: `/books/${bookId}`,
    data: {
      type: 'new_book',
      bookId,
      timestamp: new Date().toISOString(),
    },
  };

  return await broadcastPush(payload);
}

/**
 * 퀴즈 통과 축하 알림
 */
async function sendQuizPassNotification(userId, quizTitle, score) {
  const payload = {
    title: '🎊 축하합니다!',
    body: `"${quizTitle}" 퀴즈를 ${score}점으로 통과했습니다!`,
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    url: '/dashboard',
    data: {
      type: 'quiz_pass',
      score,
      timestamp: new Date().toISOString(),
    },
  };

  return await sendPushToUser(userId, payload);
}

/**
 * 구독 만료 알림
 */
async function sendSubscriptionExpiryWarning(userId, daysRemaining) {
  const payload = {
    title: '⚠️ 구독 만료 예정',
    body: `구독이 ${daysRemaining}일 후 만료됩니다. 지금 갱신하세요!`,
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    url: '/subscription',
    data: {
      type: 'subscription_expiry',
      daysRemaining,
      timestamp: new Date().toISOString(),
    },
  };

  return await sendPushToUser(userId, payload);
}

module.exports = {
  savePushSubscription,
  deletePushSubscription,
  sendPushToUser,
  broadcastPush,
  sendPushToGroup,
  sendLearningReminder,
  sendNewBookNotification,
  sendQuizPassNotification,
  sendSubscriptionExpiryWarning,
};
