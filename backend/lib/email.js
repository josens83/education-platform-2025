const nodemailer = require('nodemailer');

// Nodemailer transporter 생성
let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  return transporter;
}

// ============================================
// 회원가입 환영 이메일
// ============================================
async function sendWelcomeEmail(to, username) {
  const transporter = getTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: '영어 학습 플랫폼에 오신 것을 환영합니다! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>환영합니다! 🎓</h1>
          </div>
          <div class="content">
            <p>안녕하세요, <strong>${username}</strong>님!</p>
            <p>영어 학습 플랫폼에 가입해 주셔서 감사합니다.</p>
            <p>이제 다양한 영어 학습 콘텐츠를 즐기실 수 있습니다:</p>
            <ul>
              <li>📚 전자책 리더 + 오디오북</li>
              <li>✅ 퀴즈 시스템</li>
              <li>📊 학습 진도 추적</li>
              <li>📝 나만의 단어장</li>
            </ul>
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/books" class="button">
                지금 시작하기
              </a>
            </p>
            <p>문의사항이 있으시면 언제든지 연락 주세요!</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 영어 학습 플랫폼. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('환영 이메일 발송 성공:', to);
  } catch (error) {
    console.error('환영 이메일 발송 실패:', error);
    throw error;
  }
}

// ============================================
// 비밀번호 재설정 이메일
// ============================================
async function sendPasswordResetEmail(to, username, resetToken) {
  const transporter = getTransporter();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: '비밀번호 재설정 요청',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔐 비밀번호 재설정</h1>
          </div>
          <div class="content">
            <p>안녕하세요, <strong>${username}</strong>님!</p>
            <p>비밀번호 재설정 요청을 받았습니다.</p>
            <p>아래 버튼을 클릭하여 새로운 비밀번호를 설정하세요:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">
                비밀번호 재설정하기
              </a>
            </p>
            <div class="warning">
              <p><strong>⚠️ 주의사항:</strong></p>
              <ul>
                <li>이 링크는 1시간 동안만 유효합니다.</li>
                <li>비밀번호 재설정을 요청하지 않으셨다면, 이 이메일을 무시하세요.</li>
                <li>링크를 클릭할 수 없다면, 아래 URL을 복사하여 브라우저에 붙여넣으세요:</li>
              </ul>
              <p style="font-size: 12px; word-break: break-all;">${resetUrl}</p>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2025 영어 학습 플랫폼. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('비밀번호 재설정 이메일 발송 성공:', to);
  } catch (error) {
    console.error('비밀번호 재설정 이메일 발송 실패:', error);
    throw error;
  }
}

// ============================================
// 구독 시작 이메일
// ============================================
async function sendSubscriptionStartEmail(to, username, planName, endDate) {
  const transporter = getTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: `${planName} 구독이 시작되었습니다! 🎉`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .info-box {
              background: white;
              border: 2px solid #667eea;
              padding: 20px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>구독이 시작되었습니다! 🎉</h1>
          </div>
          <div class="content">
            <p>안녕하세요, <strong>${username}</strong>님!</p>
            <p><strong>${planName}</strong> 구독이 성공적으로 시작되었습니다.</p>
            <div class="info-box">
              <p><strong>구독 정보:</strong></p>
              <ul>
                <li>플랜: ${planName}</li>
                <li>시작일: ${new Date().toLocaleDateString('ko-KR')}</li>
                <li>만료일: ${new Date(endDate).toLocaleDateString('ko-KR')}</li>
              </ul>
            </div>
            <p>이제 모든 프리미엄 기능을 이용하실 수 있습니다!</p>
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/dashboard" class="button">
                대시보드 가기
              </a>
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2025 영어 학습 플랫폼. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('구독 시작 이메일 발송 성공:', to);
  } catch (error) {
    console.error('구독 시작 이메일 발송 실패:', error);
    throw error;
  }
}

// ============================================
// 구독 만료 알림 이메일
// ============================================
async function sendSubscriptionExpiringEmail(to, username, planName, daysLeft) {
  const transporter = getTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: `구독이 ${daysLeft}일 후 만료됩니다`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>⏰ 구독 만료 알림</h1>
          </div>
          <div class="content">
            <p>안녕하세요, <strong>${username}</strong>님!</p>
            <p><strong>${planName}</strong> 구독이 <strong>${daysLeft}일 후</strong>에 만료됩니다.</p>
            <p>계속해서 프리미엄 기능을 이용하시려면 구독을 갱신해 주세요.</p>
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/subscription" class="button">
                구독 갱신하기
              </a>
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2025 영어 학습 플랫폼. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('구독 만료 알림 이메일 발송 성공:', to);
  } catch (error) {
    console.error('구독 만료 알림 이메일 발송 실패:', error);
    throw error;
  }
}

// ============================================
// 결제 실패 알림 이메일
// ============================================
async function sendPaymentFailedEmail(to, username, planName) {
  const transporter = getTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: '결제 실패 알림 - 조치가 필요합니다',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>❌ 결제 실패</h1>
          </div>
          <div class="content">
            <p>안녕하세요, <strong>${username}</strong>님!</p>
            <p><strong>${planName}</strong> 구독 결제가 실패했습니다.</p>
            <p>카드 정보를 확인하시고 다시 시도해 주세요.</p>
            <p>결제가 완료되지 않으면 구독이 일시 중지될 수 있습니다.</p>
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/subscription" class="button">
                결제 방법 업데이트
              </a>
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2025 영어 학습 플랫폼. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('결제 실패 이메일 발송 성공:', to);
  } catch (error) {
    console.error('결제 실패 이메일 발송 실패:', error);
    throw error;
  }
}

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendSubscriptionStartEmail,
  sendSubscriptionExpiringEmail,
  sendPaymentFailedEmail,
};
