import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
  showGrid?: boolean;
  showPoints?: boolean;
  animate?: boolean;
}

/**
 * Premium Line Chart Component
 * - SVG-based with Framer Motion animations
 * - Linear/Stripe style gradients
 * - Responsive and accessible
 */
export default function LineChart({
  data,
  color = 'rgb(99, 102, 241)', // primary-600
  height = 200,
  showGrid = true,
  showPoints = true,
  animate = true,
}: LineChartProps) {
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = 600;
  const chartHeight = height;

  const { points, path, maxValue, minValue } = useMemo(() => {
    if (data.length === 0) return { points: [], path: '', maxValue: 0, minValue: 0 };

    const values = data.map(d => d.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values, 0);
    const range = maxValue - minValue || 1;

    const width = chartWidth - padding.left - padding.right;
    const height = chartHeight - padding.top - padding.bottom;
    const stepX = width / Math.max(data.length - 1, 1);

    const points = data.map((d, i) => ({
      x: padding.left + i * stepX,
      y: padding.top + height - ((d.value - minValue) / range) * height,
      value: d.value,
      label: d.label,
    }));

    // Create smooth path using quadratic curves
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX = (prev.x + curr.x) / 2;
      path += ` Q ${cpX} ${prev.y}, ${cpX} ${prev.y} Q ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    return { points, path, maxValue, minValue };
  }, [data, chartWidth, chartHeight, padding]);

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-surface-hover rounded-lg text-text-tertiary"
        style={{ height: `${height}px` }}
      >
        데이터가 없습니다
      </div>
    );
  }

  const gridLines = 5;
  const valueStep = (maxValue - minValue) / gridLines;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full"
        style={{ height: `${height}px` }}
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {showGrid && (
          <g className="text-border">
            {Array.from({ length: gridLines + 1 }, (_, i) => {
              const y = padding.top + ((chartHeight - padding.top - padding.bottom) / gridLines) * i;
              const value = maxValue - valueStep * i;

              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.2"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-xs fill-text-tertiary"
                  >
                    {Math.round(value).toLocaleString()}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Area under the line */}
        {animate ? (
          <motion.path
            d={`${path} L ${points[points.length - 1].x} ${chartHeight - padding.bottom} L ${padding.left} ${chartHeight - padding.bottom} Z`}
            fill="url(#lineGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        ) : (
          <path
            d={`${path} L ${points[points.length - 1].x} ${chartHeight - padding.bottom} L ${padding.left} ${chartHeight - padding.bottom} Z`}
            fill="url(#lineGradient)"
          />
        )}

        {/* Line */}
        {animate ? (
          <motion.path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
        ) : (
          <path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points */}
        {showPoints && points.map((point, i) => (
          <g key={i}>
            {animate ? (
              <motion.circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill="white"
                stroke={color}
                strokeWidth="3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
                className="cursor-pointer hover:r-6 transition-all"
              />
            ) : (
              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill="white"
                stroke={color}
                strokeWidth="3"
                className="cursor-pointer"
              />
            )}

            {/* Tooltip on hover */}
            <title>{`${point.label}: ${point.value.toLocaleString()}`}</title>
          </g>
        ))}

        {/* X-axis labels */}
        <g>
          {points.map((point, i) => (
            <text
              key={i}
              x={point.x}
              y={chartHeight - padding.bottom + 20}
              textAnchor="middle"
              className="text-xs fill-text-tertiary"
            >
              {point.label}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
}
