import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiX, FiSmartphone } from 'react-icons/fi';
import { MdInstallMobile } from 'react-icons/md';

/**
 * PWA Install Prompt
 *
 * 앱 설치를 유도하는 배너 컴포넌트
 */
export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // beforeinstallprompt 이벤트 리스너
    const handler = (e: Event) => {
      e.preventDefault();
      console.log('[PWA] Install prompt available');
      setDeferredPrompt(e);

      // 이전에 거부했거나 설치했는지 확인
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      const installed = localStorage.getItem('pwa-installed');

      if (!dismissed && !installed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // 이미 설치된 경우 (standalone 모드)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      localStorage.setItem('pwa-installed', 'true');
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  // 설치 완료 이벤트
  useEffect(() => {
    const handler = () => {
      console.log('[PWA] App installed');
      localStorage.setItem('pwa-installed', 'true');
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handler);

    return () => {
      window.removeEventListener('appinstalled', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // 설치 프롬프트 표시
    deferredPrompt.prompt();

    // 사용자 선택 대기
    const { outcome } = await deferredPrompt.userChoice;

    console.log('[PWA] User choice:', outcome);

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt');
    } else {
      console.log('[PWA] User dismissed the install prompt');
      localStorage.setItem('pwa-install-dismissed', 'true');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    setShowPrompt(false);
  };

  // iOS 감지
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;

  if (!showPrompt && !(isIOS && !isInStandaloneMode)) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:bottom-4 md:left-auto md:right-4 md:max-w-md"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* 헤더 배너 */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <MdInstallMobile className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">앱 설치하기</h3>
                  <p className="text-sm opacity-90">
                    더 빠르고 편리하게 이용하세요
                  </p>
                </div>
                <button
                  onClick={handleDismiss}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 내용 */}
            <div className="p-4">
              {isIOS ? (
                // iOS 설치 가이드
                <div className="space-y-3">
                  <p className="text-sm text-text-secondary">
                    Safari에서 다음 단계를 따라 앱을 설치하세요:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-text-secondary">
                    <li>하단의 공유 버튼(📤) 탭</li>
                    <li>"홈 화면에 추가" 선택</li>
                    <li>"추가" 버튼 탭</li>
                  </ol>
                  <div className="mt-4 flex items-center gap-2 text-xs text-text-tertiary">
                    <FiSmartphone className="w-4 h-4" />
                    <span>홈 화면에서 바로 실행 가능합니다</span>
                  </div>
                </div>
              ) : (
                // Android/Desktop 설치 버튼
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-text-secondary">
                        오프라인에서도 사용 가능
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-text-secondary">
                        빠른 로딩 속도
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span className="text-text-secondary">
                        푸시 알림 수신
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleInstallClick}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
                  >
                    <FiDownload className="w-5 h-5" />
                    <span>지금 설치하기</span>
                  </button>

                  <button
                    onClick={handleDismiss}
                    className="w-full text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    나중에 하기
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
