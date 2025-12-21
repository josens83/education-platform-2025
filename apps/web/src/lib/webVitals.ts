/**
 * Web Vitals Performance Tracking
 * Tracks Core Web Vitals and sends to analytics
 */

// Metric type definition (matches web-vitals library)
interface Metric {
  name: string
  value: number
  delta: number
  rating: 'good' | 'needs-improvement' | 'poor'
  id: string
  navigationType: string
}

interface WebVitalsConfig {
  reportToAnalytics?: boolean
  reportToConsole?: boolean
  thresholds?: {
    LCP: number // Largest Contentful Paint
    FID: number // First Input Delay
    CLS: number // Cumulative Layout Shift
    FCP: number // First Contentful Paint
    TTFB: number // Time to First Byte
  }
}

const defaultConfig: WebVitalsConfig = {
  reportToAnalytics: true,
  reportToConsole: import.meta.env.DEV,
  thresholds: {
    LCP: 2500, // Good: < 2.5s
    FID: 100, // Good: < 100ms
    CLS: 0.1, // Good: < 0.1
    FCP: 1800, // Good: < 1.8s
    TTFB: 800, // Good: < 800ms
  },
}

class WebVitalsTracker {
  private config: WebVitalsConfig
  private metrics: Map<string, Metric> = new Map()

  constructor(config: WebVitalsConfig = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  /**
   * Initialize Web Vitals tracking
   */
  async init() {
    if (typeof window === 'undefined') {
      return
    }

    try {
      // Dynamic import to handle optional dependency
      // @ts-expect-error - web-vitals is an optional dependency
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals')

      getCLS(this.handleMetric.bind(this))
      getFID(this.handleMetric.bind(this))
      getFCP(this.handleMetric.bind(this))
      getLCP(this.handleMetric.bind(this))
      getTTFB(this.handleMetric.bind(this))
    } catch (error) {
      console.warn('web-vitals not installed. Run: npm install web-vitals')
      return
    }

    // Track custom metrics
    this.trackCustomMetrics()

    // Report on page unload
    window.addEventListener('beforeunload', () => {
      this.reportAllMetrics()
    })
  }

  /**
   * Handle Web Vitals metric
   */
  private handleMetric(metric: Metric) {
    this.metrics.set(metric.name, metric)

    const threshold = this.config.thresholds?.[metric.name as keyof typeof this.config.thresholds]
    const isGood = threshold ? metric.value < threshold : true

    if (this.config.reportToConsole) {
      console.log(
        `[Web Vitals] ${metric.name}:`,
        metric.value,
        isGood ? '✅ Good' : '⚠️ Needs Improvement',
        metric
      )
    }

    if (this.config.reportToAnalytics) {
      this.sendToAnalytics(metric, isGood)
    }
  }

  /**
   * Send metric to analytics service
   */
  private sendToAnalytics(metric: Metric, isGood: boolean) {
    // Send to Google Analytics
    if (window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        metric_rating: isGood ? 'good' : 'needs-improvement',
        metric_delta: metric.delta,
        non_interaction: true,
      })
    }

    // Send to custom analytics endpoint
    if (import.meta.env.VITE_API_URL) {
      fetch(`${import.meta.env.VITE_API_URL}/api/analytics/web-vitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: metric.name,
          value: metric.value,
          rating: isGood ? 'good' : 'needs-improvement',
          id: metric.id,
          navigationType: metric.navigationType,
          page: window.location.pathname,
          timestamp: Date.now(),
        }),
        keepalive: true,
      }).catch(console.error)
    }
  }

  /**
   * Track custom performance metrics
   */
  private trackCustomMetrics() {
    // Track page load time
    window.addEventListener('load', () => {
      const pageLoadTime = performance.now()
      this.trackCustom('PageLoadTime', pageLoadTime)
    })

    // Track time to interactive
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              this.trackCustom('TTI', entry.startTime)
            }
          }
        })
        observer.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (e) {
        console.error('Failed to observe performance', e)
      }
    }
  }

  /**
   * Track custom metric
   */
  private trackCustom(name: string, value: number) {
    if (this.config.reportToConsole) {
      console.log(`[Custom Metric] ${name}:`, value)
    }

    if (window.gtag) {
      window.gtag('event', name, {
        event_category: 'Custom Metrics',
        value: Math.round(value),
        non_interaction: true,
      })
    }
  }

  /**
   * Report all collected metrics
   */
  private reportAllMetrics() {
    const report = {
      metrics: Object.fromEntries(this.metrics),
      page: window.location.pathname,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection?.effectiveType,
    }

    if (this.config.reportToConsole) {
      console.table(
        Array.from(this.metrics.values()).map((m) => ({
          Metric: m.name,
          Value: m.value,
          Rating: m.rating,
          Delta: m.delta,
        }))
      )
    }

    return report
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return Object.fromEntries(this.metrics)
  }
}

// Singleton instance
export const webVitalsTracker = new WebVitalsTracker()

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  webVitalsTracker.init()
}

export default webVitalsTracker
