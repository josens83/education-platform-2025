import { motion } from 'framer-motion';
import { IconType } from 'react-icons';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: IconType;
  color?: string;
  suffix?: string;
  loading?: boolean;
}

/**
 * Premium Stat Card Component
 * - Glass morphism design
 * - Trend indicators
 * - Icon with gradient background
 * - Animated values
 */
export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color = 'from-primary-500 to-purple-500',
  suffix = '',
  loading = false,
}: StatCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-text-tertiary';
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return '↑';
    if (change < 0) return '↓';
    return '→';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bento-item p-6 hover:shadow-smooth-lg transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-tertiary mb-1">{title}</p>

          {loading ? (
            <div className="h-8 w-24 bg-surface-hover rounded animate-pulse" />
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-baseline gap-2"
            >
              <h3 className="text-3xl font-bold text-text-primary">
                {formatValue(value)}
                {suffix && <span className="text-lg text-text-secondary ml-1">{suffix}</span>}
              </h3>
            </motion.div>
          )}

          {/* Trend indicator */}
          {change !== undefined && !loading && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className={`flex items-center gap-1 mt-2 text-sm font-medium ${getTrendColor(change)}`}
            >
              <span>{getTrendIcon(change)}</span>
              <span>{Math.abs(change)}%</span>
              <span className="text-text-tertiary">vs 지난 주</span>
            </motion.div>
          )}
        </div>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-glow`}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
      </div>
    </motion.div>
  );
}
