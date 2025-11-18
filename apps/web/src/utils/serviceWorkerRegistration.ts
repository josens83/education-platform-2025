/**
 * Service Worker Registration Utility
 *
 * PWA 기능을 활성화하기 위한 Service Worker 등록 유틸리티
 */

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
};

export function register(config?: Config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${import.meta.env.BASE_URL}sw.js`;

      registerValidSW(swUrl, config);
    });
  }
}

async function registerValidSW(swUrl: string, config?: Config) {
  try {
    const registration = await navigator.serviceWorker.register(swUrl);

    console.log('[SW] Service Worker registered:', registration);

    registration.onupdatefound = () => {
      const installingWorker = registration.installing;

      if (!installingWorker) return;

      installingWorker.onstatechange = () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // 새로운 콘텐츠 사용 가능
            console.log('[SW] New content available; please refresh.');

            if (config && config.onUpdate) {
              config.onUpdate(registration);
            }
          } else {
            // 콘텐츠 캐싱 완료
            console.log('[SW] Content cached for offline use.');

            if (config && config.onSuccess) {
              config.onSuccess(registration);
            }
          }
        }
      };
    };
  } catch (error) {
    console.error('[SW] Error during service worker registration:', error);
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
        console.log('[SW] Service Worker unregistered');
      })
      .catch((error) => {
        console.error('[SW] Error unregistering:', error.message);
      });
  }
}

/**
 * 새로운 Service Worker가 대기 중일 때 활성화
 */
export function skipWaiting() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
}

/**
 * 백그라운드 동기화 등록
 */
export async function registerBackgroundSync(tag: string) {
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register(tag);
      console.log('[SW] Background sync registered:', tag);
    } catch (error) {
      console.error('[SW] Background sync failed:', error);
    }
  } else {
    console.warn('[SW] Background sync not supported');
  }
}

/**
 * 푸시 알림 구독
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[SW] Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // 알림 권한 요청
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.log('[SW] Push notification permission denied');
      return null;
    }

    // VAPID 공개 키 (백엔드에서 생성 필요)
    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
      console.warn('[SW] VAPID public key not configured');
      return null;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    console.log('[SW] Push subscription:', subscription);

    // 서버에 구독 정보 전송
    await fetch(`${import.meta.env.VITE_API_URL}/api/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(subscription),
    });

    return subscription;
  } catch (error) {
    console.error('[SW] Push subscription failed:', error);
    return null;
  }
}

/**
 * 푸시 알림 구독 해제
 */
export async function unsubscribeFromPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();

      // 서버에서도 구독 제거
      await fetch(`${import.meta.env.VITE_API_URL}/api/push/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(subscription),
      });

      console.log('[SW] Push unsubscribed');
    }
  } catch (error) {
    console.error('[SW] Push unsubscription failed:', error);
  }
}

/**
 * Base64 URL을 Uint8Array로 변환
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * 오프라인 상태 확인
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * 온라인/오프라인 이벤트 리스너
 */
export function addNetworkListeners(
  onOnline: () => void,
  onOffline: () => void
) {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}
