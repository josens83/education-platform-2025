/**
 * Session Management Routes
 *
 * - 활성 세션 조회
 * - 세션 취소
 * - 로그인 기록
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getUserSessions,
  revokeSession,
  revokeAllSessions,
  getLoginHistory,
} = require('../lib/sessionManager');

/**
 * Get user's active sessions
 * GET /api/sessions
 */
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await getUserSessions(userId);

    res.json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: '세션 조회 중 오류가 발생했습니다',
    });
  }
});

/**
 * Revoke a specific session
 * DELETE /api/sessions/:id
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = parseInt(req.params.id);

    const result = await revokeSession(userId, sessionId);

    if (result.success) {
      res.json({
        success: true,
        message: '세션이 취소되었습니다',
      });
    } else {
      res.status(400).json({
        success: false,
        message: '세션 취소에 실패했습니다',
      });
    }
  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({
      success: false,
      message: '세션 취소 중 오류가 발생했습니다',
    });
  }
});

/**
 * Revoke all sessions except current
 * POST /api/sessions/revoke-all
 */
router.post('/revoke-all', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const currentToken = req.headers.authorization?.replace('Bearer ', '');

    const result = await revokeAllSessions(userId, currentToken);

    if (result.success) {
      res.json({
        success: true,
        message: `${result.count}개의 세션이 취소되었습니다`,
        count: result.count,
      });
    } else {
      res.status(400).json({
        success: false,
        message: '세션 취소에 실패했습니다',
      });
    }
  } catch (error) {
    console.error('Revoke all sessions error:', error);
    res.status(500).json({
      success: false,
      message: '세션 취소 중 오류가 발생했습니다',
    });
  }
});

/**
 * Get login history
 * GET /api/sessions/history
 */
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;

    const history = await getLoginHistory(userId, limit);

    res.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error('Get login history error:', error);
    res.status(500).json({
      success: false,
      message: '로그인 기록 조회 중 오류가 발생했습니다',
    });
  }
});

module.exports = router;
