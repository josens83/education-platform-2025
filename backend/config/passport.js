/**
 * Passport.js Configuration
 *
 * Google, Kakao OAuth strategies 설정
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;
const pool = require('../lib/db');

/**
 * 사용자 직렬화 (세션에 저장)
 */
passport.serializeUser((user, done) => {
  done(null, user.id);
});

/**
 * 사용자 역직렬화 (세션에서 복원)
 */
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

/**
 * Google OAuth Strategy
 */
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const name = profile.displayName;
          const googleId = profile.id;

          // OAuth 사용자 찾기 또는 생성
          const user = await findOrCreateOAuthUser('google', googleId, email, name, profile);
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}

/**
 * Kakao OAuth Strategy
 */
if (process.env.KAKAO_CLIENT_ID) {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_CLIENT_ID,
        clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
        callbackURL: process.env.KAKAO_CALLBACK_URL || '/api/auth/kakao/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const kakaoAccount = profile._json.kakao_account;
          const email = kakaoAccount.email;
          const name = kakaoAccount.profile?.nickname || 'Kakao User';
          const kakaoId = profile.id;

          // OAuth 사용자 찾기 또는 생성
          const user = await findOrCreateOAuthUser('kakao', kakaoId, email, name, profile);
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}

/**
 * OAuth 사용자 찾기 또는 생성
 */
async function findOrCreateOAuthUser(provider, providerId, email, name, profile) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. OAuth 연결 확인
    const oauthResult = await client.query(
      'SELECT user_id FROM oauth_connections WHERE provider = $1 AND provider_user_id = $2',
      [provider, providerId]
    );

    if (oauthResult.rows.length > 0) {
      // 기존 OAuth 연결이 있음
      const userId = oauthResult.rows[0].user_id;
      const userResult = await client.query('SELECT * FROM users WHERE id = $1', [userId]);

      // 마지막 로그인 시간 업데이트
      await client.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [userId]);

      await client.query('COMMIT');
      return userResult.rows[0];
    }

    // 2. 이메일로 기존 사용자 찾기
    let user;
    const emailResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);

    if (emailResult.rows.length > 0) {
      // 기존 이메일 사용자에 OAuth 연결
      user = emailResult.rows[0];
    } else {
      // 3. 새 사용자 생성
      const username = name || email.split('@')[0];
      const newUserResult = await client.query(
        `INSERT INTO users (username, email, role, email_verified, created_at, last_login_at)
         VALUES ($1, $2, 'student', true, NOW(), NOW())
         RETURNING *`,
        [username, email]
      );
      user = newUserResult.rows[0];
    }

    // 4. OAuth 연결 생성
    await client.query(
      `INSERT INTO oauth_connections (user_id, provider, provider_user_id, provider_data, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [user.id, provider, providerId, JSON.stringify(profile)]
    );

    // 마지막 로그인 시간 업데이트
    await client.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    await client.query('COMMIT');
    return user;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = passport;
