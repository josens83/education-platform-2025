require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const { pool, initializeDatabase } = require('./database');
const logger = require('./lib/logger');
const { alertSystemError } = require('./lib/adminAlerts');
const { initializeSocket } = require('./lib/socket');
const passport = require('./config/passport');

// Sentry Configuration (must be imported BEFORE app creation)
const {
  initSentry,
  requestHandler,
  tracingHandler,
  errorHandler: sentryErrorHandler,
} = require('./config/sentry');

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

const {
  cookieParser,
  generateToken,
  conditionalCsrfProtection,
  csrfErrorHandler,
} = require('./middleware/csrf');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Socket.IO 초기화
const io = initializeSocket(server);

// Initialize Sentry (must be first)
initSentry(app);

// ============================================
// MIDDLEWARE
// ============================================

// Sentry request handler (must be FIRST middleware)
app.use(requestHandler());

// Sentry tracing handler (must be AFTER request handler)
app.use(tracingHandler());

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

// Cookie parser (required for CSRF)
app.use(cookieParser());

// Passport 초기화 (OAuth 인증)
app.use(passport.initialize());

// 정적 파일 서빙 (업로드된 파일)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d', // Cache static files for 1 day
  etag: true, // Enable ETags for conditional requests
}));

// Global rate limiting (applies to all API routes)
app.use('/api', defaultLimiter);

// CSRF Protection (applies to mutation routes: POST, PUT, PATCH, DELETE)
// Automatically skips GET, HEAD, OPTIONS, webhooks, and API token authentication
app.use('/api', conditionalCsrfProtection);

// 요청 로깅
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.request(req, res, duration);
  });
  next();
});

// ============================================
// ROUTES
// ============================================

// Health Check Routes (Premium with detailed monitoring)
const healthRoutes = require('./routes/health');
app.use('/api/health', healthRoutes);

// CSRF Token endpoint (must be before CSRF protection middleware)
app.get('/api/csrf-token', generateToken, (req, res) => {
  res.json({
    status: 'success',
    token: req.csrfToken(),
  });
});

// Swagger API 문서화
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Education Platform API Documentation',
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API 정보
app.get('/api', (req, res) => {
  res.json({
    name: 'Education Platform API',
    version: '2.0.0',
    description: '구독형 영어 교육 콘텐츠 플랫폼 API - Premium Design System',
    documentation: '/api-docs (Swagger UI)',
    endpoints: {
      health: '/api/health/* (헬스체크)',
      auth: '/api/auth/* (인증, OAuth)',
      users: '/api/users/* (사용자)',
      books: '/api/books/* (책)',
      chapters: '/api/chapters/* (챕터)',
      progress: '/api/progress/* (학습 진도)',
      quizzes: '/api/quizzes/* (퀴즈)',
      subscriptions: '/api/subscriptions/* (구독)',
      payments: '/api/payments/* (결제)',
      coupons: '/api/coupons/* (쿠폰)',
      reviews: '/api/reviews/* (리뷰)',
      analytics: '/api/analytics/* (분석)',
      audio: '/api/audio/* (오디오)',
      bookmarks: '/api/bookmarks/* (북마크)',
      notes: '/api/notes/* (노트)',
      vocabulary: '/api/vocabulary/* (단어장)',
      stats: '/api/stats/* (통계)',
      admin: '/api/admin/* (관리자)',
      ai: '/api/ai/* (AI 추천 및 챗봇)',
      push: '/api/push/* (푸시 알림)',
      search: '/api/search/* (전역 검색)',
      twoFactor: '/api/2fa/* (2단계 인증)'
    },
    features: {
      design_system: 'Linear/Stripe Premium Style',
      dark_mode: true,
      animations: 'Framer Motion',
      accessibility: 'WCAG 2.1 AA',
      performance: 'Optimized with caching & rate limiting',
      monitoring: 'Health checks & analytics',
      oauth: 'Google, Kakao OAuth 2.0',
      ai: 'GPT-4 기반 AI 추천 및 챗봇',
      realtime: 'Socket.IO WebSocket',
      pwa: 'Progressive Web App with offline support',
      push: 'Web Push Notifications'
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
const couponRoutes = require('./routes/coupons');
const analyticsRoutes = require('./routes/analytics');
const reviewRoutes = require('./routes/reviews');
const oauthRoutes = require('./routes/oauth');
const aiRoutes = require('./routes/ai');
const pushRoutes = require('./routes/push');
const sessionsRoutes = require('./routes/sessions');
const notificationsRoutes = require('./routes/notifications');
const searchRoutes = require('./routes/search');
const twoFactorRoutes = require('./routes/twoFactor');

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

// Coupons - moderate rate limiting
app.use('/api/coupons', mutationLimiter, couponRoutes);

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

// Analytics - admin only, no cache for fresh data
app.use('/api/analytics', readLimiter, analyticsRoutes);

// Reviews - moderate rate limiting
app.use('/api', mutationLimiter, reviewRoutes);

// OAuth - auth limiter (prevent abuse)
app.use('/api/auth', authLimiter, oauthRoutes);

// AI - moderate rate limiting (AI calls can be expensive)
app.use('/api/ai', mutationLimiter, aiRoutes);

// Push Notifications - moderate rate limiting
app.use('/api/push', mutationLimiter, pushRoutes);

// Sessions - moderate rate limiting
app.use('/api/sessions', mutationLimiter, sessionsRoutes);

// Notifications - read-heavy with short cache
app.use('/api/notifications', readLimiter, cacheMiddleware(CACHE_DURATIONS.SHORT), notificationsRoutes);

// Search - read-heavy with short cache (search results change frequently)
app.use('/api/search', readLimiter, cacheMiddleware(CACHE_DURATIONS.SHORT), searchRoutes);

// Two-Factor Authentication - strict rate limiting (security-sensitive)
app.use('/api/2fa', authLimiter, twoFactorRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// Sentry error handler (must be BEFORE other error handlers)
app.use(sentryErrorHandler());

// CSRF error handler (must be AFTER Sentry but BEFORE other error handlers)
app.use(csrfErrorHandler);

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
  const statusCode = err.statusCode || 500;
  const message = err.message || '서버 내부 오류가 발생했습니다';

  // Log error with full details
  logger.error('Server Error', {
    statusCode,
    message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id
  });

  // Send admin alert for server errors (500+)
  if (statusCode >= 500) {
    alertSystemError(
      message,
      err.stack,
      {
        path: req.path,
        method: req.method,
        statusCode,
        userId: req.user?.id,
        ip: req.ip
      }
    ).catch(alertError => {
      logger.error('Failed to send admin alert', { error: alertError.message });
    });
  }

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
    logger.system('데이터베이스 연결 성공');

    // 개발 모드에서는 자동으로 스키마 초기화 (선택사항)
    // if (process.env.NODE_ENV === 'development') {
    //   await initializeDatabase();
    // }

    // 서버 시작 (HTTP + Socket.IO)
    server.listen(PORT, () => {
      logger.system('교육 플랫폼 API 서버 시작', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        apiUrl: `http://localhost:${PORT}/api`,
        healthCheck: `http://localhost:${PORT}/api/health`,
        socketIO: 'enabled'
      });

      // Console output for visibility
      console.log('\n🚀 교육 플랫폼 API 서버 시작');
      console.log(`📍 서버 주소: http://localhost:${PORT}`);
      console.log(`📍 API 문서: http://localhost:${PORT}/api`);
      console.log(`📍 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🔌 Socket.IO: 실시간 통신 활성화`);
      console.log(`🤖 AI 기능: ${process.env.OPENAI_API_KEY ? '활성화' : '비활성화'}`);
      console.log(`🌍 환경: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    logger.error('서버 시작 실패', { error: error.message, stack: error.stack });
    console.error('❌ 서버 시작 실패:', error);
    process.exit(1);
  }
};

// Graceful Shutdown
process.on('SIGTERM', () => {
  logger.system('SIGTERM 신호 수신 - 서버 종료 중');
  console.log('\n⏸️  SIGTERM 신호 수신. 서버 종료 중...');
  pool.end(() => {
    logger.system('데이터베이스 연결 종료');
    console.log('✅ 데이터베이스 연결 종료');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.system('SIGINT 신호 수신 - 서버 종료 중');
  console.log('\n⏸️  SIGINT 신호 수신. 서버 종료 중...');
  pool.end(() => {
    logger.system('데이터베이스 연결 종료');
    console.log('✅ 데이터베이스 연결 종료');
    process.exit(0);
  });
});

startServer();
