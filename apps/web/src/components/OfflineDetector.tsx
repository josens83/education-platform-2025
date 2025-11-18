import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

/**
 * Offline Detector Component
 * Monitors online/offline status and shows toast notifications
 */
export default function OfflineDetector() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      toast.success('인터넷 연결이 복구되었습니다', {
        icon: '✅',
        duration: 3000,
      });
    }

    function handleOffline() {
      setIsOnline(false);
      toast.error('인터넷 연결이 끊어졌습니다', {
        icon: '🌐',
        duration: Infinity, // Keep showing until online
      });
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show banner when offline
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-red-600 text-white px-4 py-2 text-center z-50 shadow-lg">
        <div className="flex items-center justify-center gap-2">
          <svg
            className="w-5 h-5 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
          <span className="font-semibold">인터넷 연결이 끊어졌습니다</span>
          <span className="text-sm opacity-90">- 일부 기능이 제한될 수 있습니다</span>
        </div>
      </div>
    );
  }

  return null;
}
