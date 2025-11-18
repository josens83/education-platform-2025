const express = require('express');
const router = express.Router();
const pool = require('../lib/db');

/**
 * Health Check & Database Status Routes
 * 시스템 상태 모니터링 및 헬스체크
 */

/**
 * @route GET /api/health
 * @desc Basic health check
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    // Database connection test
    const dbResult = await pool.query('SELECT NOW() as timestamp, version() as db_version');

    res.json({
      status: 'healthy',
      timestamp: dbResult.rows[0].timestamp,
      database: {
        status: 'connected',
        version: dbResult.rows[0].db_version
      },
      service: {
        name: 'English Education Platform API',
        version: '2.0.0',
        uptime: Math.floor(process.uptime()),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB'
        },
        node_version: process.version
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/health/detailed
 * @desc Detailed system status (admin only in production)
 * @access Public (should be protected in production)
 */
router.get('/detailed', async (req, res) => {
  try {
    // Database stats
    const dbStats = await pool.query(`
      SELECT
        (SELECT count(*) FROM pg_stat_activity) as active_connections,
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_queries,
        pg_size_pretty(pg_database_size(current_database())) as database_size
    `);

    // Table counts
    const tableCounts = await pool.query(`
      SELECT
        (SELECT count(*) FROM users) as users_count,
        (SELECT count(*) FROM books) as books_count,
        (SELECT count(*) FROM chapters) as chapters_count,
        (SELECT count(*) FROM subscriptions WHERE status = 'active') as active_subscriptions,
        (SELECT count(*) FROM quiz_attempts WHERE created_at > NOW() - INTERVAL '24 hours') as quiz_attempts_24h,
        (SELECT count(*) FROM reviews) as reviews_count
    `);

    // System info
    const systemInfo = {
      platform: process.platform,
      architecture: process.arch,
      node_version: process.version,
      uptime_seconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development'
    };

    // Memory usage
    const memUsage = process.memoryUsage();
    const memory = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heap_total: Math.round(memUsage.heapTotal / 1024 / 1024),
      heap_used: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
      unit: 'MB'
    };

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      system: systemInfo,
      memory,
      database: {
        status: 'connected',
        ...dbStats.rows[0],
        tables: tableCounts.rows[0]
      }
    });
  } catch (error) {
    console.error('Detailed health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/health/db
 * @desc Database-specific health check
 * @access Public
 */
router.get('/db', async (req, res) => {
  try {
    const start = Date.now();

    // Test query
    await pool.query('SELECT 1');

    const duration = Date.now() - start;

    // Pool stats
    const poolStats = {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount
    };

    res.json({
      status: 'healthy',
      database: 'connected',
      response_time_ms: duration,
      connection_pool: poolStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/health/ready
 * @desc Kubernetes readiness probe
 * @access Public
 */
router.get('/ready', async (req, res) => {
  try {
    // Check if database is ready
    await pool.query('SELECT 1');

    // Check if critical tables exist
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      ) as tables_exist
    `);

    if (result.rows[0].tables_exist) {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not ready', reason: 'tables not initialized' });
    }
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});

/**
 * @route GET /api/health/live
 * @desc Kubernetes liveness probe
 * @access Public
 */
router.get('/live', (req, res) => {
  // Simple liveness check - just verify the process is running
  res.status(200).json({ status: 'alive' });
});

module.exports = router;
