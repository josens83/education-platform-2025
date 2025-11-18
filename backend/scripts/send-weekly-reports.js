/**
 * Weekly Learning Report Email Script
 * 주간 학습 리포트 이메일 전송 스크립트
 *
 * 용도:
 * - 매주 월요일 오전 9시 실행
 * - 지난 주 학습 통계를 이메일로 발송
 * - 학습 동기 부여 및 지속성 향상
 *
 * 실행: node backend/scripts/send-weekly-reports.js
 * Cron: 0 9 * * 1 (Every Monday at 9 AM)
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { pool } = require('../database');
const { sendEmail } = require('../lib/email');
const logger = require('../lib/logger');

// ============================================
// 주간 학습 리포트 생성 및 발송
// ============================================
async function sendWeeklyReports() {
  try {
    logger.info('Fetching active users for weekly reports...');

    // 활성 구독 사용자 목록 조회
    const usersResult = await pool.query(`
      SELECT DISTINCT
        u.id,
        u.email,
        u.username
      FROM users u
      JOIN subscriptions s ON u.id = s.user_id
      WHERE s.status = 'active'
        AND s.end_date > NOW()
      ORDER BY u.id
      LIMIT 500
    `);

    logger.info(`Found ${usersResult.rows.length} active users`);

    let sentCount = 0;
    let errorCount = 0;

    for (const user of usersResult.rows) {
      try {
        // 사용자별 학습 통계 조회
        const stats = await getUserWeeklyStats(user.id);

        // 학습 활동이 있는 사용자에게만 발송
        if (stats.hasActivity) {
          await sendWeeklyReportEmail(user, stats);
          sentCount++;

          // Rate limiting
          await sleep(200);
        }
      } catch (error) {
        logger.error('Error sending weekly report', {
          userId: user.id,
          error: error.message,
        });
        errorCount++;
      }
    }

    logger.info(`Weekly reports sent: ${sentCount}, errors: ${errorCount}`);
  } catch (error) {
    logger.error('Error in weekly reports process', { error: error.message });
    throw error;
  }
}

// ============================================
// 사용자의 주간 학습 통계 조회
// ============================================
async function getUserWeeklyStats(userId) {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  // 학습 통계
  const statsResult = await pool.query(
    `SELECT
      COALESCE(SUM(chapters_read), 0) as chapters_read,
      COALESCE(SUM(quizzes_completed), 0) as quizzes_completed,
      COALESCE(SUM(words_learned), 0) as words_learned,
      COALESCE(SUM(study_time_minutes), 0) as study_time_minutes
    FROM learning_stats
    WHERE user_id = $1
      AND stat_date >= $2`,
    [userId, weekStart]
  );

  const stats = statsResult.rows[0];

  // 읽은 책 목록
  const booksResult = await pool.query(
    `SELECT DISTINCT
      b.id,
      b.title,
      COUNT(DISTINCT lp.chapter_id) as chapters_completed
    FROM learning_progress lp
    JOIN chapters c ON lp.chapter_id = c.id
    JOIN books b ON c.book_id = b.id
    WHERE lp.user_id = $1
      AND lp.updated_at >= $2
      AND lp.is_completed = true
    GROUP BY b.id, b.title
    ORDER BY chapters_completed DESC
    LIMIT 3`,
    [userId, weekStart]
  );

  // 퀴즈 성적
  const quizResult = await pool.query(
    `SELECT
      COUNT(*) as attempts,
      COUNT(CASE WHEN is_passed THEN 1 END) as passed,
      ROUND(AVG(score), 1) as avg_score
    FROM quiz_attempts
    WHERE user_id = $1
      AND started_at >= $2`,
    [userId, weekStart]
  );

  // 스트릭 정보
  const streakResult = await pool.query(
    `SELECT
      COUNT(DISTINCT stat_date) as days_active
    FROM learning_stats
    WHERE user_id = $1
      AND stat_date >= $2
      AND (chapters_read > 0 OR quizzes_completed > 0 OR words_learned > 0)`,
    [userId, weekStart]
  );

  const hasActivity =
    parseInt(stats.chapters_read) > 0 ||
    parseInt(stats.quizzes_completed) > 0 ||
    parseInt(stats.words_learned) > 0;

  return {
    hasActivity,
    chaptersRead: parseInt(stats.chapters_read),
    quizzesCompleted: parseInt(stats.quizzes_completed),
    wordsLearned: parseInt(stats.words_learned),
    studyTimeMinutes: parseInt(stats.study_time_minutes),
    booksRead: booksResult.rows,
    quizStats: quizResult.rows[0],
    daysActive: parseInt(streakResult.rows[0].days_active),
  };
}

// ============================================
// 주간 리포트 이메일 발송
// ============================================
async function sendWeeklyReportEmail(user, stats) {
  const { email, username } = user;
  const {
    chaptersRead,
    quizzesCompleted,
    wordsLearned,
    studyTimeMinutes,
    booksRead,
    quizStats,
    daysActive,
  } = stats;

  // 학습 시간 포맷팅
  const hours = Math.floor(studyTimeMinutes / 60);
  const minutes = studyTimeMinutes % 60;
  const studyTimeFormatted =
    hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;

  // 퀴즈 통과율
  const quizPassRate =
    parseInt(quizStats.attempts) > 0
      ? Math.round((parseInt(quizStats.passed) / parseInt(quizStats.attempts)) * 100)
      : 0;

  // 격려 메시지 생성
  let encouragement = '';
  if (daysActive === 7) {
    encouragement = '🎉 완벽해요! 매일 학습하셨네요!';
  } else if (daysActive >= 5) {
    encouragement = '👏 훌륭해요! 거의 매일 학습하셨어요!';
  } else if (daysActive >= 3) {
    encouragement = '👍 좋아요! 꾸준히 학습하고 계시네요!';
  } else if (daysActive >= 1) {
    encouragement = '💪 시작이 반입니다! 계속 해봐요!';
  }

  // 목표 달성도
  const goalsHtml =
    chaptersRead >= 7
      ? '<span style="color: #10b981;">✓ 주간 챕터 목표 달성!</span>'
      : `<span style="color: #6b7280;">목표까지 ${7 - chaptersRead}챕터 남았어요</span>`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
          border-radius: 0;
        }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 30px; }
        .stat-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin: 25px 0;
        }
        .stat-box {
          background: #f9fafb;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          border: 2px solid #e5e7eb;
        }
        .stat-number {
          font-size: 32px;
          font-weight: 700;
          color: #6366f1;
          margin: 0;
        }
        .stat-label {
          font-size: 14px;
          color: #6b7280;
          margin: 5px 0 0 0;
        }
        .book-list {
          background: #fef3c7;
          padding: 20px;
          border-radius: 10px;
          border-left: 4px solid #f59e0b;
          margin: 20px 0;
        }
        .book-list h3 {
          margin: 0 0 15px 0;
          color: #92400e;
          font-size: 16px;
        }
        .book-item {
          padding: 10px 0;
          border-bottom: 1px solid #fde68a;
        }
        .book-item:last-child { border-bottom: none; }
        .achievement {
          background: #dcfce7;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          margin: 20px 0;
          border: 2px solid #86efac;
        }
        .achievement h2 {
          margin: 0;
          color: #166534;
          font-size: 24px;
        }
        .cta-button {
          display: inline-block;
          background: #6366f1;
          color: white;
          padding: 15px 40px;
          text-decoration: none;
          border-radius: 25px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          background: #f9fafb;
          padding: 30px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        .goals {
          background: white;
          padding: 20px;
          border-radius: 10px;
          border: 2px solid #e5e7eb;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 주간 학습 리포트</h1>
          <p>${new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 기준</p>
        </div>

        <div class="content">
          <h2 style="color: #1f2937; margin-top: 0;">안녕하세요, ${username}님!</h2>
          <p style="font-size: 16px; color: #4b5563;">
            지난 주 학습 활동을 정리해드립니다. ${encouragement}
          </p>

          <div class="achievement">
            <h2>🔥 ${daysActive}일 연속 학습</h2>
            <p style="color: #166534; margin: 10px 0 0 0;">
              ${studyTimeFormatted} 동안 영어 실력을 키웠어요!
            </p>
          </div>

          <div class="stat-grid">
            <div class="stat-box">
              <p class="stat-number">${chaptersRead}</p>
              <p class="stat-label">읽은 챕터</p>
            </div>
            <div class="stat-box">
              <p class="stat-number">${quizzesCompleted}</p>
              <p class="stat-label">완료한 퀴즈</p>
            </div>
            <div class="stat-box">
              <p class="stat-number">${wordsLearned}</p>
              <p class="stat-label">학습한 단어</p>
            </div>
            <div class="stat-box">
              <p class="stat-number">${quizPassRate}%</p>
              <p class="stat-label">퀴즈 통과율</p>
            </div>
          </div>

          ${booksRead.length > 0 ? `
            <div class="book-list">
              <h3>📚 이번 주에 읽은 책</h3>
              ${booksRead.map(book => `
                <div class="book-item">
                  <strong>${book.title}</strong>
                  <span style="color: #92400e; font-size: 14px;">
                    - ${book.chapters_completed}챕터 완료
                  </span>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div class="goals">
            <h3 style="margin: 0 0 10px 0; color: #1f2937;">이번 주 목표</h3>
            <p style="margin: 5px 0;">${goalsHtml}</p>
            <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
              매일 1챕터씩 읽어보세요!
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" class="cta-button">
              📖 오늘도 학습 시작하기
            </a>
          </div>

          <div style="background: #eff6ff; padding: 20px; border-radius: 10px; border-left: 4px solid #3b82f6;">
            <h3 style="margin: 0 0 10px 0; color: #1e40af;">💡 이번 주 팁</h3>
            <p style="margin: 0; color: #1e40af;">
              매일 같은 시간에 학습하면 습관이 됩니다.
              하루 15분만 투자해보세요!
            </p>
          </div>
        </div>

        <div class="footer">
          <p style="margin: 0 0 10px 0;">계속 성장하는 여러분을 응원합니다! 💪</p>
          <p style="margin: 0; font-size: 13px;">
            주간 리포트를 받고 싶지 않으시다면
            <a href="${process.env.FRONTEND_URL}/profile/notifications" style="color: #6366f1;">설정</a>에서 변경하실 수 있습니다.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendEmail(
      email,
      `${username}님의 주간 학습 리포트 📊`,
      html
    );

    logger.info('Weekly report sent', { userId: user.id, email });
  } catch (error) {
    logger.error('Failed to send weekly report', {
      userId: user.id,
      email,
      error: error.message,
    });
    throw error;
  }
}

// ============================================
// 유틸리티
// ============================================
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// 메인 실행
// ============================================
async function main() {
  logger.info('========================================');
  logger.info('Starting weekly reports script');
  logger.info('========================================');

  try {
    await sendWeeklyReports();

    logger.info('========================================');
    logger.info('Weekly reports script completed successfully');
    logger.info('========================================');

    process.exit(0);
  } catch (error) {
    logger.error('Weekly reports script failed', { error: error.message });
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = {
  sendWeeklyReports,
};
