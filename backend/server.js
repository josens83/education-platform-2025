require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { pool, initializeDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARE
// ============================================

// CORS 설정
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// JSON 파싱
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15분
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 최대 100 요청
  message: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// 요청 로깅
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// ============================================
// ROUTES
// ============================================

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      message: '서버가 정상 작동 중입니다',
      timestamp: result.rows[0].now,
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '서버 오류',
      error: error.message
    });
  }
});

// API 정보
app.get('/api', (req, res) => {
  res.json({
    name: 'Education Platform API',
    version: '1.0.0',
    description: '구독형 영어 교육 콘텐츠 플랫폼 API',
    endpoints: {
      auth: '/api/auth/*',
      users: '/api/users/*',
      books: '/api/books/*',
      chapters: '/api/chapters/*',
      progress: '/api/progress/*',
      quizzes: '/api/quizzes/*',
      subscriptions: '/api/subscriptions/*'
    }
  });
});

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const bookRoutes = require('./routes/books');
const chapterRoutes = require('./routes/chapters');
const progressRoutes = require('./routes/progress');
const quizRoutes = require('./routes/quizzes');
const subscriptionRoutes = require('./routes/subscriptions');
const audioRoutes = require('./routes/audio');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/audio', audioRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: '요청하신 리소스를 찾을 수 없습니다',
    path: req.path
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('❌ 에러 발생:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || '서버 내부 오류가 발생했습니다';

  res.status(statusCode).json({
    status: 'error',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// SERVER START
// ============================================

const startServer = async () => {
  try {
    // 데이터베이스 연결 테스트
    await pool.query('SELECT NOW()');
    console.log('✅ 데이터베이스 연결 성공');

    // 개발 모드에서는 자동으로 스키마 초기화 (선택사항)
    // if (process.env.NODE_ENV === 'development') {
    //   await initializeDatabase();
    // }

    // 서버 시작
    app.listen(PORT, () => {
      console.log('\n🚀 교육 플랫폼 API 서버 시작');
      console.log(`📍 서버 주소: http://localhost:${PORT}`);
      console.log(`📍 API 문서: http://localhost:${PORT}/api`);
      console.log(`📍 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🌍 환경: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('❌ 서버 시작 실패:', error);
    process.exit(1);
  }
};

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('\n⏸️  SIGTERM 신호 수신. 서버 종료 중...');
  pool.end(() => {
    console.log('✅ 데이터베이스 연결 종료');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⏸️  SIGINT 신호 수신. 서버 종료 중...');
  pool.end(() => {
    console.log('✅ 데이터베이스 연결 종료');
    process.exit(0);
  });
});

startServer();
