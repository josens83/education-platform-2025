/**
 * Notifications Routes
 *
 * - 알림 조회
 * - 읽음 표시
 * - 알림 삭제
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../lib/db');

/**
 * Get user notifications
 * GET /api/notifications
 */
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;

    const result = await pool.query(
      `SELECT id, type, title, message, read, action_url, metadata, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    const unreadCount = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = false',
      [userId]
    );

    res.json({
      success: true,
      notifications: result.rows,
      unreadCount: parseInt(unreadCount.rows[0].count),
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: '알림 조회 중 오류가 발생했습니다',
    });
  }
});

/**
 * Mark notification as read
 * PATCH /api/notifications/:id/read
 */
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = parseInt(req.params.id);

    await pool.query(
      'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2',
      [notificationId, userId]
    );

    res.json({
      success: true,
      message: '알림을 읽음으로 표시했습니다',
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: '알림 업데이트 중 오류가 발생했습니다',
    });
  }
});

/**
 * Mark all as read
 * POST /api/notifications/mark-all-read
 */
router.post('/mark-all-read', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query(
      'UPDATE notifications SET read = true WHERE user_id = $1 AND read = false',
      [userId]
    );

    res.json({
      success: true,
      message: '모든 알림을 읽음으로 표시했습니다',
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: '알림 업데이트 중 오류가 발생했습니다',
    });
  }
});

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = parseInt(req.params.id);

    await pool.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [notificationId, userId]
    );

    res.json({
      success: true,
      message: '알림이 삭제되었습니다',
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: '알림 삭제 중 오류가 발생했습니다',
    });
  }
});

module.exports = router;
