/**
 * OAuth 인증 라우트
 *
 * Google, Kakao, Naver 소셜 로그인을 처리합니다.
 *
 * 사용법:
 * 1. passport 패키지 설치: npm install passport passport-google-oauth20 passport-kakao
 * 2. .env 파일에 OAuth 키 설정
 * 3. 이 라우트를 server.js에 등록
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../lib/db');

/**
 * Google OAuth 콜백
 *
 * TODO: Passport.js Google Strategy 구현
 *
 * 구현 방법:
 * 1. npm install passport passport-google-oauth20
 * 2. config/passport.js에서 Google Strategy 설정
 * 3. 이 엔드포인트에서 Passport 미들웨어 사용
 */
router.get('/google/callback', async (req, res) => {
  try {
    // TODO: Passport Google Strategy로 대체
    // 임시 구현 (실제 구현 시 Passport 사용)

    const { code } = req.query;

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }

    // Google OAuth로 사용자 정보 가져오기
    // const userInfo = await getGoogleUserInfo(code);

    // 사용자 확인 또는 생성
    // const user = await findOrCreateGoogleUser(userInfo);

    // JWT 토큰 생성
    // const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // 프론트엔드로 리다이렉트 (토큰 포함)
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=TEMP_TOKEN`);
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
});

/**
 * Kakao OAuth 콜백
 *
 * TODO: Passport.js Kakao Strategy 구현
 */
router.get('/kakao/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }

    // TODO: Passport Kakao Strategy 구현
    // const userInfo = await getKakaoUserInfo(code);
    // const user = await findOrCreateKakaoUser(userInfo);
    // const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=TEMP_TOKEN`);
  } catch (error) {
    console.error('Kakao OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
});

/**
 * Naver OAuth 콜백 (선택적)
 */
router.get('/naver/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }

    // TODO: Passport Naver Strategy 구현

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=TEMP_TOKEN`);
  } catch (error) {
    console.error('Naver OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
});

/**
 * OAuth 사용자 찾기 또는 생성 (헬퍼 함수)
 */
async function findOrCreateOAuthUser(provider, providerId, email, name) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // OAuth 연결 확인
    const oauthResult = await client.query(
      'SELECT user_id FROM oauth_connections WHERE provider = $1 AND provider_user_id = $2',
      [provider, providerId]
    );

    if (oauthResult.rows.length > 0) {
      // 기존 OAuth 연결이 있음
      const userId = oauthResult.rows[0].user_id;
      const userResult = await client.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );

      await client.query('COMMIT');
      return userResult.rows[0];
    }

    // 이메일로 기존 사용자 찾기
    let user;
    const emailResult = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (emailResult.rows.length > 0) {
      // 기존 이메일 사용자에 OAuth 연결
      user = emailResult.rows[0];
    } else {
      // 새 사용자 생성
      const newUserResult = await client.query(
        `INSERT INTO users (username, email, role, created_at)
         VALUES ($1, $2, 'student', NOW())
         RETURNING *`,
        [name || email.split('@')[0], email]
      );
      user = newUserResult.rows[0];
    }

    // OAuth 연결 생성
    await client.query(
      `INSERT INTO oauth_connections (user_id, provider, provider_user_id, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [user.id, provider, providerId]
    );

    await client.query('COMMIT');
    return user;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = router;
