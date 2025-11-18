/**
 * Analytics Tracking System
 * Google Analytics 및 사용자 행동 추적
 */

// Google Analytics 타입 정의
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Google Analytics Measurement ID (환경 변수에서 로드)
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

/**
 * Google Analytics 초기화
 */
export function initializeAnalytics(): void {
  if (!GA_MEASUREMENT_ID) {
    console.warn('Google Analytics Measurement ID가 설정되지 않았습니다');
    return;
  }

  // Google Analytics 스크립트 동적 로드
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  // DataLayer 초기화
  window.dataLayer = window.dataLayer || [];

  // gtag 함수 정의
  window.gtag = function() {
    window.dataLayer?.push(arguments);
  };

  // GA 초기화
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
    send_page_view: false, // 수동으로 페이지 뷰 전송
  });

  console.log('Google Analytics initialized:', GA_MEASUREMENT_ID);
}

/**
 * 페이지 뷰 추적
 */
export function trackPageView(path: string, title?: string): void {
  if (!window.gtag || !GA_MEASUREMENT_ID) return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
  });

  console.log('Page view tracked:', path);
}

/**
 * 이벤트 추적
 */
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
): void {
  if (!window.gtag || !GA_MEASUREMENT_ID) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });

  console.log('Event tracked:', { action, category, label, value });
}

/**
 * 사용자 ID 설정
 */
export function setUserId(userId: number | string): void {
  if (!window.gtag || !GA_MEASUREMENT_ID) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    user_id: userId.toString(),
  });

  console.log('User ID set:', userId);
}

/**
 * 사용자 속성 설정
 */
export function setUserProperties(properties: Record<string, any>): void {
  if (!window.gtag || !GA_MEASUREMENT_ID) return;

  window.gtag('set', 'user_properties', properties);

  console.log('User properties set:', properties);
}

// ============================================
// 비즈니스 이벤트 추적 함수
// ============================================

/**
 * 회원가입 추적
 */
export function trackSignup(method: string = 'email'): void {
  trackEvent('sign_up', 'engagement', method);
}

/**
 * 로그인 추적
 */
export function trackLogin(method: string = 'email'): void {
  trackEvent('login', 'engagement', method);
}

/**
 * 구독 시작 추적
 */
export function trackSubscriptionStart(planName: string, value: number): void {
  if (!window.gtag || !GA_MEASUREMENT_ID) return;

  window.gtag('event', 'begin_checkout', {
    currency: 'KRW',
    value: value,
    items: [
      {
        item_id: planName.toLowerCase().replace(/\s+/g, '_'),
        item_name: planName,
        item_category: 'subscription',
        price: value,
        quantity: 1,
      },
    ],
  });

  trackEvent('subscription_start', 'subscription', planName, value);
}

/**
 * 구독 완료 추적 (결제 성공)
 */
export function trackPurchase(
  planName: string,
  value: number,
  transactionId?: string
): void {
  if (!window.gtag || !GA_MEASUREMENT_ID) return;

  window.gtag('event', 'purchase', {
    transaction_id: transactionId || Date.now().toString(),
    currency: 'KRW',
    value: value,
    items: [
      {
        item_id: planName.toLowerCase().replace(/\s+/g, '_'),
        item_name: planName,
        item_category: 'subscription',
        price: value,
        quantity: 1,
      },
    ],
  });

  trackEvent('purchase_complete', 'subscription', planName, value);
}

/**
 * 쿠폰 사용 추적
 */
export function trackCouponUsage(
  couponCode: string,
  discountAmount: number,
  planName: string
): void {
  trackEvent('coupon_used', 'marketing', couponCode, discountAmount);
  trackEvent('discount_applied', 'marketing', `${couponCode}_${planName}`, discountAmount);
}

/**
 * 책 읽기 시작 추적
 */
export function trackBookRead(bookId: number, bookTitle: string): void {
  trackEvent('book_read_start', 'content', bookTitle);
  trackEvent('engagement', 'content', `book_${bookId}_${bookTitle}`);
}

/**
 * 챕터 완료 추적
 */
export function trackChapterComplete(
  bookTitle: string,
  chapterTitle: string,
  chapterNumber: number
): void {
  trackEvent('chapter_complete', 'content', `${bookTitle} - ${chapterTitle}`, chapterNumber);
}

/**
 * 퀴즈 완료 추적
 */
export function trackQuizComplete(
  quizTitle: string,
  score: number,
  isPassed: boolean
): void {
  trackEvent('quiz_complete', 'learning', quizTitle, score);
  trackEvent(isPassed ? 'quiz_passed' : 'quiz_failed', 'learning', quizTitle, score);
}

/**
 * 오디오 재생 추적
 */
export function trackAudioPlay(bookTitle: string, chapterTitle: string): void {
  trackEvent('audio_play', 'content', `${bookTitle} - ${chapterTitle}`);
}

/**
 * 검색 추적
 */
export function trackSearch(searchTerm: string, resultCount: number): void {
  if (!window.gtag || !GA_MEASUREMENT_ID) return;

  window.gtag('event', 'search', {
    search_term: searchTerm,
  });

  trackEvent('search', 'navigation', searchTerm, resultCount);
}

/**
 * 단어 추가 추적
 */
export function trackVocabularyAdd(word: string): void {
  trackEvent('vocabulary_add', 'learning', word);
}

/**
 * 북마크 추가 추적
 */
export function trackBookmarkAdd(bookTitle: string): void {
  trackEvent('bookmark_add', 'engagement', bookTitle);
}

/**
 * 노트 작성 추적
 */
export function trackNoteCreate(bookTitle: string): void {
  trackEvent('note_create', 'engagement', bookTitle);
}

/**
 * 에러 추적
 */
export function trackError(errorMessage: string, errorLevel: 'warning' | 'error' | 'fatal'): void {
  trackEvent('error', 'error_tracking', errorMessage);
  trackEvent(`error_${errorLevel}`, 'error_tracking', errorMessage);
}

/**
 * 외부 링크 클릭 추적
 */
export function trackOutboundLink(url: string, label?: string): void {
  trackEvent('click', 'outbound_link', label || url);
}

/**
 * 소셜 공유 추적
 */
export function trackSocialShare(platform: string, contentType: string, contentId: string): void {
  trackEvent('share', 'social', `${platform}_${contentType}_${contentId}`);
}

/**
 * 다운로드 추적
 */
export function trackDownload(fileName: string, fileType: string): void {
  trackEvent('download', 'file', `${fileType}_${fileName}`);
}

/**
 * 타이밍 추적 (성능 측정)
 */
export function trackTiming(
  category: string,
  variable: string,
  value: number,
  label?: string
): void {
  if (!window.gtag || !GA_MEASUREMENT_ID) return;

  window.gtag('event', 'timing_complete', {
    name: variable,
    value: value,
    event_category: category,
    event_label: label,
  });
}

// ============================================
// 사용자 행동 패턴 추적 (로컬 저장)
// ============================================

interface UserBehavior {
  sessionId: string;
  userId?: number;
  events: Array<{
    type: string;
    timestamp: number;
    data?: any;
  }>;
  sessionStart: number;
  lastActivity: number;
}

let currentSession: UserBehavior | null = null;

/**
 * 세션 시작
 */
export function startSession(userId?: number): void {
  currentSession = {
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    events: [],
    sessionStart: Date.now(),
    lastActivity: Date.now(),
  };

  // 세션 시작 이벤트 추적
  trackEvent('session_start', 'engagement', userId ? 'authenticated' : 'guest');
}

/**
 * 세션 종료
 */
export function endSession(): void {
  if (!currentSession) return;

  const sessionDuration = Date.now() - currentSession.sessionStart;

  // 세션 종료 이벤트 추적
  trackTiming('engagement', 'session_duration', sessionDuration);
  trackEvent('session_end', 'engagement', '', Math.round(sessionDuration / 1000));

  // 세션 데이터를 로컬 스토리지에 저장 (선택적)
  try {
    const sessions = JSON.parse(localStorage.getItem('user_sessions') || '[]');
    sessions.push({
      ...currentSession,
      sessionEnd: Date.now(),
      duration: sessionDuration,
    });

    // 최근 10개 세션만 유지
    if (sessions.length > 10) {
      sessions.shift();
    }

    localStorage.setItem('user_sessions', JSON.stringify(sessions));
  } catch (error) {
    console.error('Failed to save session data:', error);
  }

  currentSession = null;
}

/**
 * 이벤트 기록
 */
export function logUserEvent(type: string, data?: any): void {
  if (!currentSession) {
    startSession();
  }

  if (currentSession) {
    currentSession.events.push({
      type,
      timestamp: Date.now(),
      data,
    });
    currentSession.lastActivity = Date.now();
  }
}

/**
 * 비활성 시간 확인 및 세션 종료
 */
export function checkInactivity(): void {
  if (!currentSession) return;

  const INACTIVITY_THRESHOLD = 30 * 60 * 1000; // 30분
  const inactiveTime = Date.now() - currentSession.lastActivity;

  if (inactiveTime > INACTIVITY_THRESHOLD) {
    endSession();
  }
}

// 페이지 언로드 시 세션 종료
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    endSession();
  });

  // 비활성 체크 (5분마다)
  setInterval(checkInactivity, 5 * 60 * 1000);
}

// Export all tracking functions
export default {
  initialize: initializeAnalytics,
  pageView: trackPageView,
  event: trackEvent,
  setUserId,
  setUserProperties,
  signup: trackSignup,
  login: trackLogin,
  subscriptionStart: trackSubscriptionStart,
  purchase: trackPurchase,
  couponUsage: trackCouponUsage,
  bookRead: trackBookRead,
  chapterComplete: trackChapterComplete,
  quizComplete: trackQuizComplete,
  audioPlay: trackAudioPlay,
  search: trackSearch,
  vocabularyAdd: trackVocabularyAdd,
  bookmarkAdd: trackBookmarkAdd,
  noteCreate: trackNoteCreate,
  error: trackError,
  outboundLink: trackOutboundLink,
  socialShare: trackSocialShare,
  download: trackDownload,
  timing: trackTiming,
  startSession,
  endSession,
  logUserEvent,
};
