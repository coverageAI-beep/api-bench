import React from 'react';
import { ApiEndpoint } from '../types/api';

interface ServiceBarChartProps {
  endpoints: ApiEndpoint[];
}

export const ServiceBarChart: React.FC<ServiceBarChartProps> = ({ endpoints }) => {
  const serviceCounts: Record<string, number> = {};
  endpoints.forEach((ep) => {
    const s = ep.service || 'DefaultController';
    serviceCounts[s] = (serviceCounts[s] || 0) + 1;
  });

  const total = endpoints.length;
  const sortedServices = Object.entries(serviceCounts)
    .map(([service, count]) => ({
      service,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count);

  if (total === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-xs text-[#78716C] font-mono">
        No controllers documented yet
      </div>
    );
  }

  const maxCount = Math.max(...sortedServices.map((s) => s.count), 1);

  const BAR_COLORS = [
    '#C26D53', // Terracotta Clay
    '#5E7F9B', // River Slate
    '#6E9A7B', // Sage Green
    '#CFA058', // Baked Ochre
    '#8C6F8A', // Dusty Plum
  ];

  return (
    <div className="space-y-3.5 pt-1 pr-1.5 pl-0.5">
      {sortedServices.map((item, idx) => {
        const widthPercent = (item.count / maxCount) * 100;
        const barColor = BAR_COLORS[idx % BAR_COLORS.length];

        return (
          <div key={item.service} className="space-y-1.5 group select-none">
            <div className="flex items-center justify-between text-xs gap-2">
              <span
                className="font-mono text-xs font-semibold text-[#292524] truncate flex-1 min-w-0"
                title={item.service}
              >
                {item.service}
              </span>
              <div className="flex items-center gap-2 text-[#78716C] font-mono tabular-nums shrink-0">
                <span className="font-semibold text-[#292524]">{item.count}</span>
                <span className="text-[11px] text-[#A8A29E] min-w-[34px] text-right">
                  ({item.percentage.toFixed(0)}%)
                </span>
              </div>
            </div>

            {/* Horizontal Track */}
            <div className="h-2 w-full bg-[#EFECE6] rounded-full overflow-hidden p-0.5 border border-[#E3DDD3]/60">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.max(widthPercent, 5)}%`,
                  backgroundColor: barColor,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
