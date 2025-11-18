/**
 * Admin Alert System
 * 관리자에게 중요한 이벤트를 이메일로 알립니다.
 *
 * 알림 종류:
 * - 결제 실패
 * - 새로운 구독 가입
 * - 시스템 오류 (연속 5회 이상)
 * - 서버 다운타임
 * - 의심스러운 활동 (비정상적인 로그인 시도 등)
 */

const { sendEmail } = require('./email');
const logger = require('./logger');

// 관리자 이메일 목록 (환경 변수에서 로드)
const ADMIN_EMAILS = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(',').map(email => email.trim())
  : ['admin@example.com'];

// 알림 임계값 설정
const ALERT_THRESHOLDS = {
  errorCount: 5,          // 연속 오류 발생 횟수
  errorTimeWindow: 300000, // 5분 (밀리초)
  paymentFailureWindow: 3600000, // 1시간
  suspiciousLoginAttempts: 10,
};

// 최근 이벤트 추적 (메모리 기반 - 프로덕션에서는 Redis 사용 권장)
const recentErrors = [];
const recentPaymentFailures = [];
const recentLoginAttempts = new Map();

/**
 * 관리자에게 이메일 전송
 */
async function sendAdminAlert(subject, htmlContent, priority = 'normal') {
  try {
    const priorityEmoji = {
      low: '📘',
      normal: '⚠️',
      high: '🚨',
      critical: '🔴'
    };

    const fullSubject = `${priorityEmoji[priority]} [Education Platform] ${subject}`;

    const promises = ADMIN_EMAILS.map(email =>
      sendEmail(
        email,
        fullSubject,
        htmlContent
      )
    );

    await Promise.all(promises);
    logger.info('Admin alert sent', { subject, recipients: ADMIN_EMAILS.length, priority });
  } catch (error) {
    logger.error('Failed to send admin alert', { error: error.message, subject });
  }
}

/**
 * 새로운 구독 알림
 */
async function alertNewSubscription(userId, username, email, planName, amount) {
  const subject = `새로운 구독 가입: ${planName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.9em; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>✅ 새로운 구독 가입</h2>
        </div>
        <div class="content">
          <p>새로운 사용자가 구독을 시작했습니다!</p>

          <div class="info-box">
            <h3>사용자 정보</h3>
            <ul>
              <li><strong>사용자 ID:</strong> ${userId}</li>
              <li><strong>이름:</strong> ${username}</li>
              <li><strong>이메일:</strong> ${email}</li>
            </ul>
          </div>

          <div class="info-box">
            <h3>구독 정보</h3>
            <ul>
              <li><strong>플랜:</strong> ${planName}</li>
              <li><strong>금액:</strong> ${amount.toLocaleString('ko-KR')}원</li>
              <li><strong>가입 시간:</strong> ${new Date().toLocaleString('ko-KR')}</li>
            </ul>
          </div>

          <div class="footer">
            <p>이 알림은 자동으로 발송되었습니다.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendAdminAlert(subject, html, 'low');
}

/**
 * 결제 실패 알림
 */
async function alertPaymentFailure(userId, username, email, planName, amount, errorMessage) {
  // 최근 1시간 내 결제 실패 추적
  const now = Date.now();
  recentPaymentFailures.push({ userId, timestamp: now });

  // 오래된 기록 제거
  const cutoff = now - ALERT_THRESHOLDS.paymentFailureWindow;
  const recentFailures = recentPaymentFailures.filter(f => f.timestamp > cutoff);

  const subject = `결제 실패 발생: ${username}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f44336; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #f44336; }
        .warning { background: #fff3cd; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.9em; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>❌ 결제 실패 알림</h2>
        </div>
        <div class="content">
          <p>결제 처리 중 오류가 발생했습니다.</p>

          ${recentFailures.length > 3 ? `
            <div class="warning">
              <strong>⚠️ 주의:</strong> 최근 1시간 동안 ${recentFailures.length}건의 결제 실패가 발생했습니다.
            </div>
          ` : ''}

          <div class="info-box">
            <h3>사용자 정보</h3>
            <ul>
              <li><strong>사용자 ID:</strong> ${userId}</li>
              <li><strong>이름:</strong> ${username}</li>
              <li><strong>이메일:</strong> ${email}</li>
            </ul>
          </div>

          <div class="info-box">
            <h3>결제 정보</h3>
            <ul>
              <li><strong>플랜:</strong> ${planName}</li>
              <li><strong>금액:</strong> ${amount.toLocaleString('ko-KR')}원</li>
              <li><strong>실패 시간:</strong> ${new Date().toLocaleString('ko-KR')}</li>
            </ul>
          </div>

          <div class="info-box">
            <h3>오류 메시지</h3>
            <p><code>${errorMessage}</code></p>
          </div>

          <div class="footer">
            <p>사용자에게 결제 실패 안내 이메일이 발송되었습니다.</p>
            <p>필요시 사용자에게 직접 연락하여 문제를 해결하세요.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const priority = recentFailures.length > 5 ? 'high' : 'normal';
  await sendAdminAlert(subject, html, priority);
}

/**
 * 시스템 오류 알림 (연속 오류 발생 시)
 */
async function alertSystemError(errorMessage, stackTrace, context = {}) {
  const now = Date.now();

  // 최근 오류 추적
  recentErrors.push({ message: errorMessage, timestamp: now });

  // 오래된 오류 제거
  const cutoff = now - ALERT_THRESHOLDS.errorTimeWindow;
  const recentErrorList = recentErrors.filter(e => e.timestamp > cutoff);

  // 임계값 초과 시에만 알림
  if (recentErrorList.length < ALERT_THRESHOLDS.errorCount) {
    return;
  }

  const subject = `시스템 오류 다발 감지 (${recentErrorList.length}건)`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ff9800; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #ff9800; }
        .error-box { background: #ffebee; padding: 15px; margin: 15px 0; border-radius: 5px; font-family: monospace; font-size: 0.9em; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.9em; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>⚠️ 시스템 오류 다발 감지</h2>
        </div>
        <div class="content">
          <p><strong>최근 ${Math.round(ALERT_THRESHOLDS.errorTimeWindow / 60000)}분 동안 ${recentErrorList.length}건의 오류가 발생했습니다.</strong></p>

          <div class="info-box">
            <h3>최근 오류 메시지</h3>
            <div class="error-box">${errorMessage}</div>
          </div>

          ${stackTrace ? `
            <div class="info-box">
              <h3>스택 트레이스</h3>
              <div class="error-box">${stackTrace.substring(0, 500)}${stackTrace.length > 500 ? '...' : ''}</div>
            </div>
          ` : ''}

          ${Object.keys(context).length > 0 ? `
            <div class="info-box">
              <h3>추가 정보</h3>
              <ul>
                ${Object.entries(context).map(([key, value]) =>
                  `<li><strong>${key}:</strong> ${JSON.stringify(value)}</li>`
                ).join('')}
              </ul>
            </div>
          ` : ''}

          <div class="footer">
            <p>발생 시간: ${new Date().toLocaleString('ko-KR')}</p>
            <p>즉시 서버 로그를 확인하고 필요한 조치를 취하세요.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const priority = recentErrorList.length > 10 ? 'critical' : 'high';
  await sendAdminAlert(subject, html, priority);

  // 알림 전송 후 오류 목록 초기화 (중복 알림 방지)
  recentErrors.length = 0;
}

/**
 * 의심스러운 활동 알림 (로그인 시도 실패 등)
 */
async function alertSuspiciousActivity(activityType, details) {
  const subject = `의심스러운 활동 감지: ${activityType}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #9c27b0; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #9c27b0; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.9em; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🔒 의심스러운 활동 감지</h2>
        </div>
        <div class="content">
          <p>보안팀의 주의가 필요한 활동이 감지되었습니다.</p>

          <div class="info-box">
            <h3>활동 유형</h3>
            <p><strong>${activityType}</strong></p>
          </div>

          <div class="info-box">
            <h3>상세 정보</h3>
            <ul>
              ${Object.entries(details).map(([key, value]) =>
                `<li><strong>${key}:</strong> ${value}</li>`
              ).join('')}
            </ul>
          </div>

          <div class="footer">
            <p>감지 시간: ${new Date().toLocaleString('ko-KR')}</p>
            <p>필요시 해당 IP를 차단하거나 추가 보안 조치를 취하세요.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendAdminAlert(subject, html, 'high');
}

/**
 * 서버 다운타임 알림
 */
async function alertServerDowntime(service, duration) {
  const subject = `서버 다운타임 발생: ${service}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #d32f2f; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #d32f2f; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.9em; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🔴 서버 다운타임 발생</h2>
        </div>
        <div class="content">
          <p><strong>긴급:</strong> 서비스가 응답하지 않습니다!</p>

          <div class="info-box">
            <h3>다운타임 정보</h3>
            <ul>
              <li><strong>서비스:</strong> ${service}</li>
              <li><strong>지속 시간:</strong> ${duration}</li>
              <li><strong>감지 시간:</strong> ${new Date().toLocaleString('ko-KR')}</li>
            </ul>
          </div>

          <div class="footer">
            <p><strong>즉시 서버 상태를 확인하고 복구 작업을 시작하세요!</strong></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendAdminAlert(subject, html, 'critical');
}

/**
 * 디스크 사용량 경고
 */
async function alertDiskUsage(usage, threshold) {
  const subject = `디스크 사용량 경고: ${usage}%`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ff5722; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #ff5722; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.9em; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>💾 디스크 사용량 경고</h2>
        </div>
        <div class="content">
          <p>서버 디스크 사용량이 임계값을 초과했습니다.</p>

          <div class="info-box">
            <h3>디스크 상태</h3>
            <ul>
              <li><strong>현재 사용량:</strong> ${usage}%</li>
              <li><strong>경고 임계값:</strong> ${threshold}%</li>
              <li><strong>확인 시간:</strong> ${new Date().toLocaleString('ko-KR')}</li>
            </ul>
          </div>

          <div class="footer">
            <p>불필요한 파일을 삭제하거나 디스크 용량을 확장하세요.</p>
            <p>로그 파일, 백업 파일, 임시 파일을 확인하세요.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const priority = usage > 95 ? 'critical' : 'high';
  await sendAdminAlert(subject, html, priority);
}

// 주기적으로 오래된 추적 데이터 정리
setInterval(() => {
  const now = Date.now();
  const cutoff = now - ALERT_THRESHOLDS.errorTimeWindow;

  // 오래된 오류 기록 제거
  while (recentErrors.length > 0 && recentErrors[0].timestamp < cutoff) {
    recentErrors.shift();
  }

  // 오래된 결제 실패 기록 제거
  while (recentPaymentFailures.length > 0 && recentPaymentFailures[0].timestamp < cutoff) {
    recentPaymentFailures.shift();
  }

  // 오래된 로그인 시도 기록 제거
  for (const [ip, data] of recentLoginAttempts.entries()) {
    if (data.timestamp < cutoff) {
      recentLoginAttempts.delete(ip);
    }
  }
}, 60000); // 1분마다

module.exports = {
  alertNewSubscription,
  alertPaymentFailure,
  alertSystemError,
  alertSuspiciousActivity,
  alertServerDowntime,
  alertDiskUsage,
};
