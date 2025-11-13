const jwt = require('jsonwebtoken');

// JWT 토큰 검증 미들웨어
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: '인증 토큰이 필요합니다'
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          status: 'error',
          message: '유효하지 않은 토큰입니다'
        });
      }

      req.user = user; // { id, email, role }
      next();
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: '인증 처리 중 오류가 발생했습니다'
    });
  }
};

// 역할 기반 접근 제어
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: '인증이 필요합니다'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: '이 작업을 수행할 권한이 없습니다'
      });
    }

    next();
  };
};

// 구독 상태 확인 미들웨어
const checkSubscription = async (req, res, next) => {
  try {
    const { query } = require('../database');

    const result = await query(
      `SELECT s.* FROM subscriptions s
       WHERE s.user_id = $1
       AND s.status = 'active'
       AND (s.end_date IS NULL OR s.end_date > NOW())
       LIMIT 1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: '유효한 구독이 필요합니다',
        code: 'SUBSCRIPTION_REQUIRED'
      });
    }

    req.subscription = result.rows[0];
    next();
  } catch (error) {
    console.error('구독 확인 오류:', error);
    return res.status(500).json({
      status: 'error',
      message: '구독 상태 확인 중 오류가 발생했습니다'
    });
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  checkSubscription
};
