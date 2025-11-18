/**
 * Service Worker for Progressive Web App
 * 오프라인 지원 및 캐싱 전략
 */

const CACHE_NAME = 'education-platform-v1';
const RUNTIME_CACHE = 'education-platform-runtime';

// 캐시할 정적 파일 목록
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// 설치 이벤트 - 정적 자원 캐싱
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install event');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );

  // 즉시 활성화
  self.skipWaiting();
});

// 활성화 이벤트 - 이전 캐시 정리
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate event');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // 즉시 클라이언트 제어
  self.clients.claim();
});

// Fetch 이벤트 - 네트워크 요청 가로채기 및 캐싱 전략
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API 요청은 Network First 전략
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 정적 파일은 Cache First 전략
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML 페이지는 Network First (with fallback to cache)
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // 기본 전략: Network First
  event.respondWith(networkFirst(request));
});

// Cache First 전략: 캐시 우선, 캐시 없으면 네트워크
async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    console.log('[Service Worker] Cache hit:', request.url);
    return cached;
  }

  try {
    const response = await fetch(request);

    // 성공적인 응답만 캐싱
    if (response.status === 200) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);

    // 오프라인 폴백 페이지 (선택적)
    if (request.mode === 'navigate') {
      const fallback = await cache.match('/offline.html');
      if (fallback) return fallback;
    }

    throw error;
  }
}

// Network First 전략: 네트워크 우선, 실패하면 캐시
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const response = await fetch(request);

    // 성공적인 응답만 캐싱
    if (response.status === 200 && request.method === 'GET') {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[Service Worker] Network request failed:', error);

    // 캐시에서 가져오기
    const cached = await cache.match(request);
    if (cached) {
      console.log('[Service Worker] Serving from cache (offline):', request.url);
      return cached;
    }

    throw error;
  }
}

// Push 알림 이벤트 (선택적 - 푸시 알림 기능 추가 시 사용)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push event');

  if (!event.data) return;

  const data = event.data.json();
  const title = data.title || '영어 학습 플랫폼';
  const options = {
    body: data.body || '새로운 알림이 있습니다',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    data: data.url || '/',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 알림 클릭 이벤트
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click');

  event.notification.close();

  const url = event.notification.data || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 이미 열린 창이 있으면 포커스
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }

      // 새 창 열기
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Background Sync 이벤트 (선택적 - 오프라인에서 생성한 데이터 동기화)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);

  if (event.tag === 'sync-learning-progress') {
    event.waitUntil(syncLearningProgress());
  }
});

async function syncLearningProgress() {
  // 오프라인에서 저장한 학습 진도 데이터를 서버와 동기화
  try {
    const cache = await caches.open('offline-progress');
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const data = await response.json();
        // 서버에 POST 요청
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        // 성공하면 캐시에서 제거
        await cache.delete(request);
      }
    }

    console.log('[Service Worker] Learning progress synced');
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
    throw error; // 재시도
  }
}
