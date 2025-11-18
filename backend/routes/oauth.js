/**
 * OAuth 인증 라우트
 *
 * Google, Kakao 소셜 로그인을 처리합니다.
 */

const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');

/**
 * Google OAuth 로그인 시작
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

/**
 * Google OAuth 콜백
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_oauth_failed`
  }),
  (req, res) => {
    try {
      // JWT 토큰 생성
      const token = jwt.sign(
        {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // 리프레시 토큰 생성
      const refreshToken = jwt.sign(
        { id: req.user.id },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
      );

      // 프론트엔드로 리다이렉트 (토큰 포함)
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?token=${token}&refreshToken=${refreshToken}&provider=google`
      );
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

/**
 * Kakao OAuth 로그인 시작
 */
router.get(
  '/kakao',
  passport.authenticate('kakao')
);

/**
 * Kakao OAuth 콜백
 */
router.get(
  '/kakao/callback',
  passport.authenticate('kakao', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=kakao_oauth_failed`
  }),
  (req, res) => {
    try {
      // JWT 토큰 생성
      const token = jwt.sign(
        {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // 리프레시 토큰 생성
      const refreshToken = jwt.sign(
        { id: req.user.id },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
      );

      // 프론트엔드로 리다이렉트 (토큰 포함)
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?token=${token}&refreshToken=${refreshToken}&provider=kakao`
      );
    } catch (error) {
      console.error('Kakao OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

/**
 * OAuth 연결 해제
 */
router.delete('/disconnect/:provider', async (req, res) => {
  try {
    const userId = req.user.id;
    const { provider } = req.params;

    await pool.query(
      'DELETE FROM oauth_connections WHERE user_id = $1 AND provider = $2',
      [userId, provider]
    );

    res.json({
      success: true,
      message: `${provider} 연결이 해제되었습니다.`
    });
  } catch (error) {
    console.error('OAuth disconnect error:', error);
    res.status(500).json({
      success: false,
      message: '연결 해제 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 연결된 OAuth 제공자 목록 조회
 */
router.get('/connections', async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT provider, created_at FROM oauth_connections WHERE user_id = $1',
      [userId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('OAuth connections fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'OAuth 연결 정보를 가져오는 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;
