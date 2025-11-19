import { motion } from 'framer-motion';
import { FiWifi, FiWifiOff } from 'react-icons/fi';
import { useSocket } from '../hooks/useSocket';

/**
 * Online Indicator Component
 *
 * 실시간 연결 상태 및 온라인 사용자 수 표시
 */
export default function OnlineIndicator() {
  const { connected, onlineCount } = useSocket();

  return (
    <div className="flex items-center gap-3">
      {/* 연결 상태 */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-2"
      >
        {connected ? (
          <>
            <div className="relative">
              <FiWifi className="w-4 h-4 text-green-500" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-green-500 rounded-full opacity-20 blur-sm"
              />
            </div>
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              실시간 연결됨
            </span>
          </>
        ) : (
          <>
            <FiWifiOff className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600 dark:text-red-400 font-medium">
              연결 끊김
            </span>
          </>
        )}
      </motion.div>

      {/* 온라인 사용자 수 */}
      {connected && onlineCount > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 px-3 py-1 bg-primary-500/10 rounded-full"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-text-secondary font-medium">
            {onlineCount}명 온라인
          </span>
        </motion.div>
      )}
    </div>
  );
}
