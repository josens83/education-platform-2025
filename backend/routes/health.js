const express = require('express');
const router = express.Router();
const pool = require('../lib/db');
const os = require('os');
const { getCacheStats, invalidateCache, clearCache } = require('../middleware/cache');

/**
 * Health Check & Database Status Routes
 * 시스템 상태 모니터링 및 헬스체크
 */

// Track service start time
const SERVICE_START_TIME = Date.now();

// Health check metrics
let requestCount = 0;
let errorCount = 0;
let totalResponseTime = 0;

// Helper function to check Redis connection
async function checkRedis() {
  if (!process.env.REDIS_URL) {
    return { status: 'not_configured', available: false };
  }

  try {
    const redis = require('redis');
    const client = redis.createClient({ url: process.env.REDIS_URL });
    await client.connect();
    await client.ping();
    await client.disconnect();
    return { status: 'connected', available: true };
  } catch (error) {
    return { status: 'error', available: false, message: error.message };
  }
}

// Helper function to check external services
async function checkExternalServices() {
  const services = {
    s3: {
      configured: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_S3_BUCKET),
      status: 'configured'
    },
    sendgrid: {
      configured: !!process.env.SENDGRID_API_KEY,
      status: 'configured'
    },
    stripe: {
      configured: !!process.env.STRIPE_SECRET_KEY,
      status: 'configured'
    },
    openai: {
      configured: !!process.env.OPENAI_API_KEY,
      status: 'configured'
    },
    smtp: {
      configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
      status: 'configured'
    }
  };

  return services;
}

// Helper function to get CPU usage
function getCPUUsage() {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach(cpu => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });

  return {
    usage_percent: Math.round(100 - (100 * totalIdle / totalTick)),
    cores: cpus.length,
    model: cpus[0].model
  };
}

// Helper function to get system metrics
function getSystemMetrics() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  return {
    hostname: os.hostname(),
    platform: os.platform(),
    architecture: os.arch(),
    cpu: getCPUUsage(),
    memory: {
      total_mb: Math.round(totalMem / 1024 / 1024),
      used_mb: Math.round(usedMem / 1024 / 1024),
      free_mb: Math.round(freeMem / 1024 / 1024),
      usage_percent: Math.round((usedMem / totalMem) * 100)
    },
    load_average: os.loadavg().map(load => Math.round(load * 100) / 100),
    uptime_seconds: Math.floor(os.uptime())
  };
}

/**
 * @route GET /api/health
 * @desc Basic health check with enhanced metrics
 * @access Public
 */
router.get('/', async (req, res) => {
  const startTime = Date.now();
  requestCount++;

  try {
    // Database connection test
    const dbStart = Date.now();
    const dbResult = await pool.query('SELECT NOW() as timestamp, version() as db_version');
    const dbResponseTime = Date.now() - dbStart;

    // Check Redis (optional)
    const redisStatus = await checkRedis();

    // Get system metrics
    const processMemory = process.memoryUsage();
    const systemMetrics = getSystemMetrics();

    // Calculate service uptime
    const serviceUptimeSeconds = Math.floor((Date.now() - SERVICE_START_TIME) / 1000);

    const responseTime = Date.now() - startTime;
    totalResponseTime += responseTime;

    res.json({
      status: 'healthy',
      timestamp: dbResult.rows[0].timestamp,
      service: {
        name: 'English Education Platform API',
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime_seconds: serviceUptimeSeconds,
        process_uptime_seconds: Math.floor(process.uptime()),
        node_version: process.version,
        pid: process.pid
      },
      database: {
        status: 'connected',
        version: dbResult.rows[0].db_version,
        response_time_ms: dbResponseTime,
        pool: {
          total: pool.totalCount,
          idle: pool.idleCount,
          waiting: pool.waitingCount
        }
      },
      redis: redisStatus,
      memory: {
        process: {
          rss_mb: Math.round(processMemory.rss / 1024 / 1024),
          heap_total_mb: Math.round(processMemory.heapTotal / 1024 / 1024),
          heap_used_mb: Math.round(processMemory.heapUsed / 1024 / 1024),
          external_mb: Math.round(processMemory.external / 1024 / 1024),
          heap_usage_percent: Math.round((processMemory.heapUsed / processMemory.heapTotal) * 100)
        },
        system: systemMetrics.memory
      },
      cpu: systemMetrics.cpu,
      metrics: {
        request_count: requestCount,
        error_count: errorCount,
        average_response_time_ms: requestCount > 0 ? Math.round(totalResponseTime / requestCount) : 0,
        current_response_time_ms: responseTime
      }
    });
  } catch (error) {
    errorCount++;
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
      metrics: {
        request_count: requestCount,
        error_count: errorCount
      }
    });
  }
});

/**
 * @route GET /api/health/detailed
 * @desc Detailed system status with external services (admin only in production)
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

    // Get system metrics
    const systemMetrics = getSystemMetrics();

    // Check Redis
    const redisStatus = await checkRedis();

    // Check external services
    const externalServices = await checkExternalServices();

    // Memory usage
    const memUsage = process.memoryUsage();
    const memory = {
      process: {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heap_total: Math.round(memUsage.heapTotal / 1024 / 1024),
        heap_used: Math.round(memUsage.heapUsed / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
        unit: 'MB'
      },
      system: systemMetrics.memory
    };

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      system: {
        ...systemMetrics,
        node_version: process.version,
        environment: process.env.NODE_ENV || 'development'
      },
      memory,
      database: {
        status: 'connected',
        ...dbStats.rows[0],
        tables: tableCounts.rows[0],
        pool: {
          total: pool.totalCount,
          idle: pool.idleCount,
          waiting: pool.waitingCount
        }
      },
      redis: redisStatus,
      external_services: externalServices,
      metrics: {
        total_requests: requestCount,
        total_errors: errorCount,
        error_rate_percent: requestCount > 0 ? Math.round((errorCount / requestCount) * 100) : 0,
        average_response_time_ms: requestCount > 0 ? Math.round(totalResponseTime / requestCount) : 0
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

/**
 * @route GET /api/health/metrics
 * @desc Prometheus metrics endpoint
 * @access Public
 */
router.get('/metrics', async (req, res) => {
  try {
    // Get current metrics
    const memUsage = process.memoryUsage();
    const systemMetrics = getSystemMetrics();
    const serviceUptimeSeconds = Math.floor((Date.now() - SERVICE_START_TIME) / 1000);

    // Database pool stats
    const dbPoolTotal = pool.totalCount || 0;
    const dbPoolIdle = pool.idleCount || 0;
    const dbPoolWaiting = pool.waitingCount || 0;

    // Prometheus format metrics
    const metrics = `
# HELP nodejs_version_info Node.js version info
# TYPE nodejs_version_info gauge
nodejs_version_info{version="${process.version}"} 1

# HELP service_uptime_seconds Service uptime in seconds
# TYPE service_uptime_seconds counter
service_uptime_seconds ${serviceUptimeSeconds}

# HELP process_uptime_seconds Process uptime in seconds
# TYPE process_uptime_seconds counter
process_uptime_seconds ${Math.floor(process.uptime())}

# HELP process_memory_rss_bytes Resident Set Size in bytes
# TYPE process_memory_rss_bytes gauge
process_memory_rss_bytes ${memUsage.rss}

# HELP process_memory_heap_total_bytes Total heap size in bytes
# TYPE process_memory_heap_total_bytes gauge
process_memory_heap_total_bytes ${memUsage.heapTotal}

# HELP process_memory_heap_used_bytes Used heap size in bytes
# TYPE process_memory_heap_used_bytes gauge
process_memory_heap_used_bytes ${memUsage.heapUsed}

# HELP process_memory_external_bytes External memory in bytes
# TYPE process_memory_external_bytes gauge
process_memory_external_bytes ${memUsage.external}

# HELP system_memory_total_bytes Total system memory in bytes
# TYPE system_memory_total_bytes gauge
system_memory_total_bytes ${systemMetrics.memory.total_mb * 1024 * 1024}

# HELP system_memory_free_bytes Free system memory in bytes
# TYPE system_memory_free_bytes gauge
system_memory_free_bytes ${systemMetrics.memory.free_mb * 1024 * 1024}

# HELP system_cpu_usage_percent CPU usage percentage
# TYPE system_cpu_usage_percent gauge
system_cpu_usage_percent ${systemMetrics.cpu.usage_percent}

# HELP system_cpu_cores Number of CPU cores
# TYPE system_cpu_cores gauge
system_cpu_cores ${systemMetrics.cpu.cores}

# HELP system_load_average_1m System load average (1 minute)
# TYPE system_load_average_1m gauge
system_load_average_1m ${systemMetrics.load_average[0]}

# HELP system_load_average_5m System load average (5 minutes)
# TYPE system_load_average_5m gauge
system_load_average_5m ${systemMetrics.load_average[1]}

# HELP system_load_average_15m System load average (15 minutes)
# TYPE system_load_average_15m gauge
system_load_average_15m ${systemMetrics.load_average[2]}

# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total ${requestCount}

# HELP http_errors_total Total number of HTTP errors
# TYPE http_errors_total counter
http_errors_total ${errorCount}

# HELP http_request_duration_ms_avg Average HTTP request duration in milliseconds
# TYPE http_request_duration_ms_avg gauge
http_request_duration_ms_avg ${requestCount > 0 ? Math.round(totalResponseTime / requestCount) : 0}

# HELP db_pool_connections_total Total database pool connections
# TYPE db_pool_connections_total gauge
db_pool_connections_total ${dbPoolTotal}

# HELP db_pool_connections_idle Idle database pool connections
# TYPE db_pool_connections_idle gauge
db_pool_connections_idle ${dbPoolIdle}

# HELP db_pool_connections_waiting Waiting database pool connections
# TYPE db_pool_connections_waiting gauge
db_pool_connections_waiting ${dbPoolWaiting}
`.trim();

    res.set('Content-Type', 'text/plain; version=0.0.4');
    res.send(metrics);
  } catch (error) {
    console.error('Metrics endpoint failed:', error);
    res.status(500).send('# Error generating metrics\n');
  }
});

/**
 * @route GET /api/health/cache
 * @desc Cache statistics
 * @access Public (should be protected in production)
 */
router.get('/cache', async (req, res) => {
  try {
    const stats = await getCacheStats();
    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      cache: stats
    });
  } catch (error) {
    console.error('Cache stats failed:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route POST /api/health/cache/invalidate
 * @desc Invalidate cache by pattern
 * @access Admin only (should be protected in production)
 */
router.post('/cache/invalidate', async (req, res) => {
  try {
    const { pattern } = req.body;

    if (!pattern) {
      return res.status(400).json({
        status: 'error',
        message: 'Pattern is required'
      });
    }

    const deletedCount = await invalidateCache(pattern);

    res.json({
      status: 'success',
      message: `Invalidated ${deletedCount} cache entries`,
      pattern,
      deletedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache invalidation failed:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route POST /api/health/cache/clear
 * @desc Clear all cache
 * @access Admin only (should be protected in production)
 */
router.post('/cache/clear', async (req, res) => {
  try {
    const cleared = await clearCache();

    res.json({
      status: 'success',
      message: 'Cache cleared successfully',
      storesCleared: cleared,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache clear failed:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
