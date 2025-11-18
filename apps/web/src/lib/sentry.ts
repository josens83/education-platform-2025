/**
 * Sentry Configuration - Frontend
 *
 * Production-grade error tracking for React application
 */

import * as Sentry from '@sentry/react';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import { useEffect } from 'react';

/**
 * Initialize Sentry for React frontend
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_ENV || import.meta.env.MODE || 'development';

  // Only enable Sentry if DSN is configured
  if (!dsn) {
    console.log('⚠️  Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment,

    // Performance Monitoring
    integrations: [
      // React Router integration
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),

      // Replay integration for session recording
      Sentry.replayIntegration({
        maskAllText: true, // Mask all text for privacy
        blockAllMedia: true, // Block all media
      }),
    ],

    // Performance monitoring sample rate
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% in production

    // Session Replay sample rate
    replaysSessionSampleRate: environment === 'production' ? 0.01 : 0.1, // 1% in production
    replaysOnErrorSampleRate: 1.0, // 100% on errors

    // Release tracking
    release: import.meta.env.VITE_APP_VERSION || 'unknown',

    // Ignore certain errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension',
      'moz-extension',
      // Network errors
      'NetworkError',
      'Network request failed',
      'Failed to fetch',
      // User cancellations
      'AbortError',
      'The user aborted a request',
      // ResizeObserver errors (safe to ignore)
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
    ],

    // Denylist for URLs (third-party scripts)
    denyUrls: [
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      /^moz-extension:\/\//i,
    ],

    // Before sending events
    beforeSend(event, hint) {
      // Don't send events in development (unless explicitly enabled)
      if (environment === 'development' && !import.meta.env.VITE_SENTRY_DEBUG) {
        return null;
      }

      // Filter out sensitive data
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }

      // Enhance error with custom fingerprinting
      if (event.exception?.values?.[0]) {
        const error = event.exception.values[0];
        event.fingerprint = [
          error.type || 'Error',
          error.value || 'Unknown',
          event.transaction || 'unknown',
        ];
      }

      return event;
    },
  });

  console.log(`✅ Sentry initialized (${environment})`);
}

/**
 * Set user context for Sentry
 */
export function setSentryUser(user: {
  id: number;
  email: string;
  username: string;
} | null) {
  if (user) {
    Sentry.setUser({
      id: user.id.toString(),
      email: user.email,
      username: user.username,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Capture exception manually
 */
export function captureSentryException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture message manually
 */
export function captureSentryMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>
) {
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Add breadcrumb for debugging
 */
export function addSentryBreadcrumb(breadcrumb: {
  message: string;
  category?: string;
  level?: Sentry.SeverityLevel;
  data?: Record<string, any>;
}) {
  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Start a new transaction for performance monitoring
 */
export function startSentryTransaction(name: string, op: string) {
  return Sentry.startTransaction({ name, op });
}

export { Sentry };
