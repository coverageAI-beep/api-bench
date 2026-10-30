import React, { useState } from 'react';
import { ApiEndpoint } from '../types/api';

interface MethodPieChartProps {
  endpoints: ApiEndpoint[];
}

const METHOD_COLOR_MAP: Record<string, { fill: string; border: string; label: string }> = {
  GET: { fill: '#6E9A7B', border: '#537C5E', label: 'GET' },
  POST: { fill: '#5E7F9B', border: '#46657F', label: 'POST' },
  PUT: { fill: '#CFA058', border: '#A87E3A', label: 'PUT' },
  PATCH: { fill: '#8C6F8A', border: '#6E526C', label: 'PATCH' },
  DELETE: { fill: '#B85C52', border: '#96443B', label: 'DELETE' },
  OPTIONS: { fill: '#8C857B', border: '#6E675D', label: 'OPTIONS' },
};

export const MethodPieChart: React.FC<MethodPieChartProps> = ({ endpoints }) => {
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null);

  const counts: Record<string, number> = {};
  endpoints.forEach((ep) => {
    const m = (ep.method || 'GET').toUpperCase();
    counts[m] = (counts[m] || 0) + 1;
  });

  const total = endpoints.length;

  if (total === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-xs text-[#78716C] font-mono">
        No endpoints documented yet
      </div>
    );
  }

  // Calculate slice angles
  const slices: Array<{
    method: string;
    count: number;
    percentage: number;
    startAngle: number;
    endAngle: number;
    color: string;
  }> = [];

  let currentAngle = -90; // Start at top
  const sortedMethods = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

  sortedMethods.forEach((method) => {
    const count = counts[method];
    const percentage = (count / total) * 100;
    const angleSpan = (count / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angleSpan;
    currentAngle += angleSpan;

    slices.push({
      method,
      count,
      percentage,
      startAngle,
      endAngle,
      color: METHOD_COLOR_MAP[method]?.fill || '#A8A29E'
    });
  });

  // Well-calibrated compact geometry so the legend has ample breathing space and never hits the edge
  const size = 114;
  const center = size / 2;
  const radius = 46;
  const innerRadius = 28;

  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeDonutArc = (
    x: number,
    y: number,
    r: number,
    innerR: number,
    startAngle: number,
    endAngle: number
  ) => {
    const span = endAngle - startAngle;
    const safeEndAngle = span >= 359.99 ? startAngle + 359.99 : endAngle;

    const start = polarToCartesian(x, y, r, safeEndAngle);
    const end = polarToCartesian(x, y, r, startAngle);
    const innerStart = polarToCartesian(x, y, innerR, startAngle);
    const innerEnd = polarToCartesian(x, y, innerR, safeEndAngle);

    const largeArcFlag = safeEndAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', start.x, start.y,
      'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
      'L', innerStart.x, innerStart.y,
      'A', innerR, innerR, 0, largeArcFlag, 1, innerEnd.x, innerEnd.y,
      'Z',
    ].join(' ');
  };

  const activeSlice = hoveredMethod ? slices.find((s) => s.method === hoveredMethod) : null;

  return (
    <div className="flex items-center gap-3 justify-between pt-1">
      {/* Donut Chart SVG */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg width={size} height={size} className="drop-shadow-xs overflow-visible">
          {slices.map((slice) => {
            const isHovered = hoveredMethod === slice.method;
            const r = isHovered ? radius + 2.5 : radius;
            const ir = isHovered ? innerRadius - 1 : innerRadius;

            return (
              <path
                key={slice.method}
                d={describeDonutArc(center, center, r, ir, slice.startAngle, slice.endAngle)}
                fill={slice.color}
                stroke="#FFFFFF"
                strokeWidth="2"
                className="transition-all duration-200 cursor-pointer hover:opacity-95"
                onMouseEnter={() => setHoveredMethod(slice.method)}
                onMouseLeave={() => setHoveredMethod(null)}
              />
            );
          })}
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <span className="text-base font-bold font-mono tracking-tight text-[#292524] tabular-nums">
            {activeSlice ? activeSlice.count : total}
          </span>
          <span className="text-[9px] font-semibold text-[#78716C] uppercase tracking-wider">
            {activeSlice ? activeSlice.method : 'APIS'}
          </span>
        </div>
      </div>

      {/* Structured Legend Table - Guaranteed No Collision or Edge Clipping */}
      <div className="flex-1 min-w-0 pr-1 space-y-1">
        {slices.map((slice) => {
          const isHovered = hoveredMethod === slice.method;
          return (
            <div
              key={slice.method}
              onMouseEnter={() => setHoveredMethod(slice.method)}
              onMouseLeave={() => setHoveredMethod(null)}
              className={`flex items-center justify-between gap-1.5 px-2 py-0.5 rounded transition-colors cursor-pointer select-none ${
                isHovered ? 'bg-[#EFECE6]' : 'hover:bg-[#F7F5F0]'
              }`}
            >
              {/* Dot & Method Name with explicit spacing */}
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="font-mono text-xs font-semibold text-[#292524] tracking-tight truncate">
                  {slice.method}
                </span>
              </div>

              {/* Count and Percentage with explicit separation */}
              <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                <span className="font-semibold text-[#292524] tabular-nums min-w-[12px] text-right">
                  {slice.count}
                </span>
                <span className="text-[11px] text-[#78716C] tabular-nums min-w-[26px] text-right">
                  {slice.percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
