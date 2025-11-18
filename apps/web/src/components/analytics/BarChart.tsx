import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: DataPoint[];
  height?: number;
  showValues?: boolean;
  animate?: boolean;
  horizontal?: boolean;
}

/**
 * Premium Bar Chart Component
 * - SVG-based with gradient fills
 * - Vertical or horizontal orientation
 * - Animated bars with Framer Motion
 */
export default function BarChart({
  data,
  height = 300,
  showValues = true,
  animate = true,
  horizontal = false,
}: BarChartProps) {
  const padding = { top: 20, right: 20, bottom: 60, left: 80 };
  const chartWidth = 600;
  const chartHeight = height;

  const { bars, maxValue } = useMemo(() => {
    if (data.length === 0) return { bars: [], maxValue: 0 };

    const values = data.map(d => d.value);
    const maxValue = Math.max(...values, 1);

    const width = chartWidth - padding.left - padding.right;
    const height = chartHeight - padding.top - padding.bottom;

    if (horizontal) {
      const barHeight = height / data.length;
      const barPadding = barHeight * 0.2;

      const bars = data.map((d, i) => ({
        x: padding.left,
        y: padding.top + i * barHeight + barPadding / 2,
        width: (d.value / maxValue) * width,
        height: barHeight - barPadding,
        value: d.value,
        label: d.label,
        color: d.color || 'rgb(99, 102, 241)', // primary-600
      }));

      return { bars, maxValue };
    } else {
      const barWidth = width / data.length;
      const barPadding = barWidth * 0.2;

      const bars = data.map((d, i) => ({
        x: padding.left + i * barWidth + barPadding / 2,
        y: padding.top + height - (d.value / maxValue) * height,
        width: barWidth - barPadding,
        height: (d.value / maxValue) * height,
        value: d.value,
        label: d.label,
        color: d.color || 'rgb(99, 102, 241)',
      }));

      return { bars, maxValue };
    }
  }, [data, chartWidth, chartHeight, padding, horizontal]);

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
  const valueStep = maxValue / gridLines;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full"
        style={{ height: `${height}px` }}
      >
        {/* Gradient definitions */}
        <defs>
          {bars.map((bar, i) => (
            <linearGradient
              key={i}
              id={`barGradient-${i}`}
              x1="0%"
              y1="0%"
              x2={horizontal ? '100%' : '0%'}
              y2={horizontal ? '0%' : '100%'}
            >
              <stop offset="0%" stopColor={bar.color} stopOpacity="1" />
              <stop offset="100%" stopColor={bar.color} stopOpacity="0.7" />
            </linearGradient>
          ))}
        </defs>

        {/* Grid lines */}
        {!horizontal && (
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

        {horizontal && (
          <g className="text-border">
            {Array.from({ length: gridLines + 1 }, (_, i) => {
              const x = padding.left + ((chartWidth - padding.left - padding.right) / gridLines) * i;
              const value = (maxValue / gridLines) * i;

              return (
                <g key={i}>
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={chartHeight - padding.bottom}
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.2"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={x}
                    y={chartHeight - padding.bottom + 20}
                    textAnchor="middle"
                    className="text-xs fill-text-tertiary"
                  >
                    {Math.round(value).toLocaleString()}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Bars */}
        {bars.map((bar, i) => (
          <g key={i}>
            {animate ? (
              <motion.rect
                x={bar.x}
                y={horizontal ? bar.y : chartHeight - padding.bottom}
                width={horizontal ? 0 : bar.width}
                height={horizontal ? bar.height : 0}
                animate={{
                  y: bar.y,
                  width: bar.width,
                  height: bar.height,
                }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: 'easeOut',
                }}
                fill={`url(#barGradient-${i})`}
                rx="6"
                className="cursor-pointer hover:opacity-90 transition-opacity"
              />
            ) : (
              <rect
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                fill={`url(#barGradient-${i})`}
                rx="6"
                className="cursor-pointer hover:opacity-90 transition-opacity"
              />
            )}

            {/* Value label */}
            {showValues && (
              <motion.text
                x={horizontal ? bar.x + bar.width + 10 : bar.x + bar.width / 2}
                y={horizontal ? bar.y + bar.height / 2 + 4 : bar.y - 10}
                textAnchor={horizontal ? 'start' : 'middle'}
                className="text-sm font-bold fill-text-primary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.1 + 0.3 }}
              >
                {bar.value.toLocaleString()}
              </motion.text>
            )}

            {/* Tooltip */}
            <title>{`${bar.label}: ${bar.value.toLocaleString()}`}</title>
          </g>
        ))}

        {/* Axis labels */}
        {!horizontal && (
          <g>
            {bars.map((bar, i) => (
              <text
                key={i}
                x={bar.x + bar.width / 2}
                y={chartHeight - padding.bottom + 20}
                textAnchor="middle"
                className="text-xs fill-text-secondary font-medium"
              >
                {bar.label.length > 10 ? bar.label.slice(0, 10) + '...' : bar.label}
              </text>
            ))}
          </g>
        )}

        {horizontal && (
          <g>
            {bars.map((bar, i) => (
              <text
                key={i}
                x={padding.left - 10}
                y={bar.y + bar.height / 2 + 4}
                textAnchor="end"
                className="text-sm fill-text-secondary font-medium"
              >
                {bar.label.length > 15 ? bar.label.slice(0, 15) + '...' : bar.label}
              </text>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
