require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const { pool, initializeDatabase } = require('./database');

// Import enhanced middleware
const {
  defaultLimiter,
  authLimiter,
  mutationLimiter,
  readLimiter,
  uploadLimiter,
} = require('./middleware/rateLimiter');

const {
  cacheMiddleware,
  CACHE_DURATIONS,
} = require('./middleware/cache');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARE
// ============================================

// Security headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for now (configure based on needs)
  crossOriginEmbedderPolicy: false, // Allow cross-origin resources
}));

// Compression
app.use(compression({
  level: 6, // Compression level (0-9)
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
}));

// CORS 설정
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// JSON 파싱
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 정적 파일 서빙 (업로드된 파일)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d', // Cache static files for 1 day
  etag: true, // Enable ETags for conditional requests
}));

// Global rate limiting (applies to all API routes)
app.use('/api', defaultLimiter);

// 요청 로깅
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`📨 ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
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
      subscriptions: '/api/subscriptions/*',
      payments: '/api/payments/*',
      audio: '/api/audio/*',
      bookmarks: '/api/bookmarks/*',
      notes: '/api/notes/*',
      vocabulary: '/api/vocabulary/*'
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
const paymentsRoutes = require('./routes/payments');
const audioRoutes = require('./routes/audio');
const bookmarkRoutes = require('./routes/bookmarks');
const noteRoutes = require('./routes/notes');
const vocabularyRoutes = require('./routes/vocabulary');
const statsRoutes = require('./routes/stats');
const adminRoutes = require('./routes/admin');

// Use Routes with specific rate limiters and caching

// Auth routes - strict rate limiting (prevent brute force)
app.use('/api/auth', authLimiter, authRoutes);

// User routes - moderate rate limiting
app.use('/api/users', mutationLimiter, userRoutes);

// Books & Chapters - read-heavy with caching
app.use('/api/books', readLimiter, cacheMiddleware(CACHE_DURATIONS.LONG), bookRoutes);
app.use('/api/chapters', readLimiter, cacheMiddleware(CACHE_DURATIONS.LONG), chapterRoutes);

// Progress tracking - moderate rate limiting, short cache
app.use('/api/progress', mutationLimiter, cacheMiddleware(CACHE_DURATIONS.SHORT), progressRoutes);

// Quizzes - moderate rate limiting, medium cache
app.use('/api/quizzes', mutationLimiter, cacheMiddleware(CACHE_DURATIONS.MEDIUM), quizRoutes);

// Subscriptions - moderate rate limiting
app.use('/api/subscriptions', mutationLimiter, subscriptionRoutes);

// Payments - moderate rate limiting (webhooks handled separately)
app.use('/api/payments', mutationLimiter, paymentsRoutes);

// Audio - upload limiter for uploads, read limiter for downloads
app.use('/api/audio', cacheMiddleware(CACHE_DURATIONS.VERY_LONG), audioRoutes);

// Bookmarks & Notes - moderate rate limiting, short cache
app.use('/api/bookmarks', mutationLimiter, cacheMiddleware(CACHE_DURATIONS.SHORT), bookmarkRoutes);
app.use('/api/notes', mutationLimiter, cacheMiddleware(CACHE_DURATIONS.SHORT), noteRoutes);

// Vocabulary - moderate rate limiting, medium cache
app.use('/api/vocabulary', mutationLimiter, cacheMiddleware(CACHE_DURATIONS.MEDIUM), vocabularyRoutes);

// Stats - read-heavy with medium cache
app.use('/api/stats', readLimiter, cacheMiddleware(CACHE_DURATIONS.MEDIUM), statsRoutes);

// Admin - read-heavy with short cache (admin data should be relatively fresh)
app.use('/api/admin', readLimiter, cacheMiddleware(CACHE_DURATIONS.SHORT), adminRoutes);

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
