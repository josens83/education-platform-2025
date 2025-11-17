const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { query } = require('../database');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../lib/email');

// ============================================
// 회원가입
// ============================================
router.post('/register',
  [
    body('email').isEmail().withMessage('유효한 이메일을 입력해주세요'),
    body('password').isLength({ min: 6 }).withMessage('비밀번호는 최소 6자 이상이어야 합니다'),
    body('username').notEmpty().withMessage('사용자 이름을 입력해주세요')
  ],
  async (req, res) => {
    try {
      // 입력 검증
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: '입력 데이터가 올바르지 않습니다',
          errors: errors.array()
        });
      }

      const { email, password, username } = req.body;

      // 이메일 중복 확인
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          status: 'error',
          message: '이미 사용 중인 이메일입니다'
        });
      }

      // 비밀번호 해시
      const passwordHash = await bcrypt.hash(password, 10);

      // 사용자 생성
      const result = await query(
        `INSERT INTO users (email, password_hash, username, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, username, role, created_at`,
        [email, passwordHash, username, 'student']
      );

      const newUser = result.rows[0];

      // 기본 프로필 생성
      await query(
        `INSERT INTO user_profiles (user_id, full_name)
         VALUES ($1, $2)`,
        [newUser.id, username]
      );

      // 환영 이메일 발송 (비동기, 실패해도 회원가입은 성공)
      sendWelcomeEmail(email, username).catch(err => {
        console.error('환영 이메일 발송 실패:', err);
      });

      // JWT 토큰 생성
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        status: 'success',
        message: '회원가입이 완료되었습니다',
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
            role: newUser.role
          },
          token
        }
      });
    } catch (error) {
      console.error('회원가입 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '회원가입 처리 중 오류가 발생했습니다'
      });
    }
  }
);

// ============================================
// 로그인
// ============================================
router.post('/login',
  [
    body('email').isEmail().withMessage('유효한 이메일을 입력해주세요'),
    body('password').notEmpty().withMessage('비밀번호를 입력해주세요')
  ],
  async (req, res) => {
    try {
      // 입력 검증
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: '입력 데이터가 올바르지 않습니다',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // 사용자 조회
      const result = await query(
        'SELECT id, email, password_hash, username, role FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          status: 'error',
          message: '이메일 또는 비밀번호가 올바르지 않습니다'
        });
      }

      const user = result.rows[0];

      // 비밀번호 확인
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        return res.status(401).json({
          status: 'error',
          message: '이메일 또는 비밀번호가 올바르지 않습니다'
        });
      }

      // JWT 토큰 생성
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        status: 'success',
        message: '로그인에 성공했습니다',
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      console.error('로그인 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '로그인 처리 중 오류가 발생했습니다'
      });
    }
  }
);

// ============================================
// 토큰 갱신
// ============================================
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: '토큰이 필요합니다'
      });
    }

    // 토큰 검증 (만료된 토큰도 허용)
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });

    // 새 토큰 생성
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      status: 'success',
      message: '토큰이 갱신되었습니다',
      data: { token: newToken }
    });
  } catch (error) {
    console.error('토큰 갱신 오류:', error);
    res.status(401).json({
      status: 'error',
      message: '유효하지 않은 토큰입니다'
    });
  }
});

// ============================================
// 비밀번호 재설정 요청
// ============================================
router.post('/forgot-password',
  [
    body('email').isEmail().withMessage('유효한 이메일을 입력해주세요')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: '유효한 이메일을 입력해주세요',
          errors: errors.array()
        });
      }

      const { email } = req.body;

      // 사용자 조회
      const result = await query(
        'SELECT id, email, username FROM users WHERE email = $1',
        [email]
      );

      // 보안상 사용자가 없어도 성공 응답 (이메일 존재 여부 노출 방지)
      if (result.rows.length === 0) {
        return res.json({
          status: 'success',
          message: '비밀번호 재설정 이메일이 발송되었습니다'
        });
      }

      const user = result.rows[0];

      // 재설정 토큰 생성 (32바이트 랜덤 문자열)
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

      // 토큰 만료 시간 (1시간)
      const resetExpires = new Date(Date.now() + 3600000);

      // 토큰 저장
      await query(
        `UPDATE users
         SET password_reset_token = $1, password_reset_expires = $2
         WHERE id = $3`,
        [resetTokenHash, resetExpires, user.id]
      );

      // 비밀번호 재설정 이메일 발송
      try {
        await sendPasswordResetEmail(user.email, user.username, resetToken);
      } catch (emailError) {
        console.error('비밀번호 재설정 이메일 발송 실패:', emailError);
        return res.status(500).json({
          status: 'error',
          message: '이메일 발송에 실패했습니다'
        });
      }

      res.json({
        status: 'success',
        message: '비밀번호 재설정 이메일이 발송되었습니다'
      });
    } catch (error) {
      console.error('비밀번호 재설정 요청 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '비밀번호 재설정 요청 처리 중 오류가 발생했습니다'
      });
    }
  }
);

// ============================================
// 비밀번호 재설정 (토큰으로)
// ============================================
router.post('/reset-password',
  [
    body('token').notEmpty().withMessage('재설정 토큰이 필요합니다'),
    body('password').isLength({ min: 6 }).withMessage('비밀번호는 최소 6자 이상이어야 합니다')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: '입력 데이터가 올바르지 않습니다',
          errors: errors.array()
        });
      }

      const { token, password } = req.body;

      // 토큰 해시
      const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // 토큰으로 사용자 조회 (만료되지 않은 토큰만)
      const result = await query(
        `SELECT id, email, username
         FROM users
         WHERE password_reset_token = $1
         AND password_reset_expires > NOW()`,
        [resetTokenHash]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: '유효하지 않거나 만료된 토큰입니다'
        });
      }

      const user = result.rows[0];

      // 새 비밀번호 해시
      const passwordHash = await bcrypt.hash(password, 10);

      // 비밀번호 업데이트 및 토큰 삭제
      await query(
        `UPDATE users
         SET password_hash = $1,
             password_reset_token = NULL,
             password_reset_expires = NULL
         WHERE id = $2`,
        [passwordHash, user.id]
      );

      res.json({
        status: 'success',
        message: '비밀번호가 성공적으로 변경되었습니다'
      });
    } catch (error) {
      console.error('비밀번호 재설정 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '비밀번호 재설정 처리 중 오류가 발생했습니다'
      });
    }
  }
);

module.exports = router;
