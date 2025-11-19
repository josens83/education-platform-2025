/**
 * Push Notification Routes
 *
 * 푸시 알림 구독 및 관리
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  savePushSubscription,
  deletePushSubscription,
  sendPushToUser,
  sendLearningReminder,
} = require('../lib/pushNotifications');

/**
 * 푸시 알림 구독 등록
 * POST /api/push/subscribe
 */
router.post('/subscribe', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const subscription = req.body;

    // 구독 정보 검증
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({
        success: false,
        message: '잘못된 구독 정보입니다',
      });
    }

    const result = await savePushSubscription(userId, subscription);

    if (result.success) {
      res.json({
        success: true,
        message: '푸시 알림이 활성화되었습니다',
      });
    } else {
      res.status(500).json({
        success: false,
        message: '구독 저장에 실패했습니다',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Push subscribe error:', error);
    res.status(500).json({
      success: false,
      message: '푸시 알림 구독 중 오류가 발생했습니다',
      error: error.message,
    });
  }
});

/**
 * 푸시 알림 구독 해제
 * POST /api/push/unsubscribe
 */
router.post('/unsubscribe', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        message: 'endpoint가 필요합니다',
      });
    }

    const result = await deletePushSubscription(userId, endpoint);

    if (result.success) {
      res.json({
        success: true,
        message: '푸시 알림이 비활성화되었습니다',
      });
    } else {
      res.status(500).json({
        success: false,
        message: '구독 해제에 실패했습니다',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: '푸시 알림 해제 중 오류가 발생했습니다',
      error: error.message,
    });
  }
});

/**
 * 테스트 알림 전송
 * POST /api/push/test
 */
router.post('/test', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const payload = {
      title: '테스트 알림',
      body: '푸시 알림이 정상적으로 작동합니다! 🎉',
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      url: '/dashboard',
      data: {
        type: 'test',
        timestamp: new Date().toISOString(),
      },
    };

    const result = await sendPushToUser(userId, payload);

    res.json({
      success: true,
      message: '테스트 알림이 전송되었습니다',
      result,
    });
  } catch (error) {
    console.error('Push test error:', error);
    res.status(500).json({
      success: false,
      message: '테스트 알림 전송에 실패했습니다',
      error: error.message,
    });
  }
});

/**
 * 학습 리마인더 전송 (사용자 요청)
 * POST /api/push/reminder
 */
router.post('/reminder', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await sendLearningReminder(userId);

    res.json({
      success: true,
      message: '학습 리마인더가 전송되었습니다',
      result,
    });
  } catch (error) {
    console.error('Push reminder error:', error);
    res.status(500).json({
      success: false,
      message: '리마인더 전송에 실패했습니다',
      error: error.message,
    });
  }
});

/**
 * VAPID 공개 키 조회
 * GET /api/push/vapid-public-key
 */
router.get('/vapid-public-key', (req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;

  if (!publicKey) {
    return res.status(503).json({
      success: false,
      message: 'VAPID 키가 설정되지 않았습니다',
    });
  }

  res.json({
    success: true,
    publicKey,
  });
});

module.exports = router;
