import { motion } from 'framer-motion';

/**
 * Skeleton Loading Components
 *
 * Netflix/Linear 스타일의 스켈레톤 로딩 컴포넌트들
 */

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Base Skeleton Component
 */
export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseStyles = 'bg-gray-200 dark:bg-gray-700';

  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animationClass = {
    pulse: 'animate-pulse',
    wave: 'animate-wave',
    none: '',
  };

  const style: React.CSSProperties = {
    width,
    height,
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${animationClass[animation]} ${className}`}
      style={style}
    />
  );
}

/**
 * Book Card Skeleton
 */
export function SkeletonBookCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex gap-4">
        {/* Cover */}
        <Skeleton variant="rectangular" width={80} height={120} />

        {/* Content */}
        <div className="flex-1 space-y-3">
          <Skeleton variant="text" height={24} width="70%" />
          <Skeleton variant="text" height={16} width="50%" />
          <div className="flex gap-2 mt-3">
            <Skeleton variant="rectangular" width={60} height={24} />
            <Skeleton variant="rectangular" width={80} height={24} />
          </div>
          <Skeleton variant="text" height={14} width="90%" />
          <Skeleton variant="text" height={14} width="80%" />
        </div>
      </div>
    </div>
  );
}

/**
 * Book Grid Skeleton
 */
export function SkeletonBookGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBookCard key={i} />
      ))}
    </div>
  );
}

/**
 * Dashboard Stats Skeleton
 */
export function SkeletonDashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Skeleton variant="text" width={100} height={20} />
            <Skeleton variant="circular" width={40} height={40} />
          </div>
          <Skeleton variant="text" width={80} height={32} />
          <Skeleton variant="text" width={120} height={14} className="mt-2" />
        </div>
      ))}
    </div>
  );
}

/**
 * Table Row Skeleton
 */
export function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-200 dark:border-gray-700">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="60%" height={16} />
        <Skeleton variant="text" width="40%" height={14} />
      </div>
      <Skeleton variant="rectangular" width={80} height={32} />
    </div>
  );
}

/**
 * Table Skeleton
 */
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {/* Header */}
      <div className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <Skeleton variant="text" width={150} height={20} />
        <Skeleton variant="text" width={200} height={20} />
        <Skeleton variant="text" width={100} height={20} />
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} />
      ))}
    </div>
  );
}

/**
 * Chapter List Skeleton
 */
export function SkeletonChapterList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <Skeleton variant="circular" width={32} height={32} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="70%" height={18} />
            <Skeleton variant="text" width="40%" height={14} />
          </div>
          <Skeleton variant="circular" width={24} height={24} />
        </div>
      ))}
    </div>
  );
}

/**
 * Profile Skeleton
 */
export function SkeletonProfile() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton variant="circular" width={80} height={80} />
        <div className="flex-1 space-y-3">
          <Skeleton variant="text" width="40%" height={24} />
          <Skeleton variant="text" width="60%" height={16} />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Skeleton variant="text" width={100} height={14} className="mb-2" />
          <Skeleton variant="text" width="100%" height={40} />
        </div>
        <div>
          <Skeleton variant="text" width={100} height={14} className="mb-2" />
          <Skeleton variant="text" width="100%" height={40} />
        </div>
        <div>
          <Skeleton variant="text" width={100} height={14} className="mb-2" />
          <Skeleton variant="text" width="100%" height={80} />
        </div>
      </div>
    </div>
  );
}

/**
 * Loading Screen
 */
export function SkeletonLoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="mb-4"
      >
        <Skeleton variant="circular" width={64} height={64} />
      </motion.div>
      <Skeleton variant="text" width={200} height={20} />
      {message && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{message}</p>
      )}
    </div>
  );
}

export default Skeleton;
