import React from 'react';
import { Plus, ArrowUpRight, Copy, Check, Clock, Layers, Sparkles } from 'lucide-react';
import { ApiEndpoint } from '../types/api';
import { MethodBadge } from './MethodBadge';
import { MethodPieChart } from './MethodPieChart';
import { ServiceBarChart } from './ServiceBarChart';
import { ExportDropdown } from './ExportDropdown';
import { generateCurlCommand } from '../lib/curl';

import { getLocalPreferences } from '../lib/storage';

interface DashboardViewProps {
  endpoints: ApiEndpoint[];
  onAddNewApi: () => void;
  onSelectEndpoint: (id: string) => void;
  onNotification: (msg: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  endpoints,
  onAddNewApi,
  onSelectEndpoint,
  onNotification,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const preferences = getLocalPreferences();

  const totalCount = endpoints.length;

  // Unique services
  const uniqueServices = new Set(endpoints.map((e) => e.service || 'DefaultController')).size;

  // Recently updated (sorted by updatedAt)
  const recentEndpoints = [...endpoints]
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
    .slice(0, 5);

  const handleCopyCurl = (e: React.MouseEvent, endpoint: ApiEndpoint) => {
    e.stopPropagation();
    const cmd = generateCurlCommand(endpoint, preferences.defaultBaseUrl);
    navigator.clipboard.writeText(cmd).then(() => {
      setCopiedId(endpoint.id);
      onNotification(`Copied cURL command for ${endpoint.method} ${endpoint.path}`);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Top Header & 2 Main Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E3DDD3]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#292524]">API Dashboard</h1>
          <p className="text-xs text-[#78716C] mt-1">
            Documentation catalog and endpoint health for {preferences.workspaceName || 'your microservices'}
          </p>
        </div>

        {/* 2 Buttons: ADD NEW API & Export all APIs */}
        <div className="flex items-center gap-3 shrink-0">
          <ExportDropdown endpoints={endpoints} onNotification={onNotification} />

          <button
            type="button"
            onClick={onAddNewApi}
            className="h-9 inline-flex items-center gap-2 px-4 text-xs font-semibold rounded-lg bg-[#C26D53] hover:bg-[#A8543B] text-[#FFFFFF] shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C26D53]"
          >
            <Plus className="w-4 h-4" />
            <span>ADD NEW API</span>
          </button>
        </div>
      </div>

      {/* 3 Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Total Endpoints count card */}
        <div className="bg-[#FFFFFF] border border-[#E3DDD3] rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C] font-mono">
                Total Endpoints
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#E5EFE7] text-[#265937] border border-[#C8DEC9]">
                Ready
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-5xl font-extrabold tracking-tight text-[#292524] font-mono tabular-nums">
                {totalCount}
              </span>
              <span className="text-xs text-[#78716C]">registered routes</span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#E3DDD3]/60 grid grid-cols-2 gap-3 text-xs text-[#78716C]">
            <div>
              <span className="block text-[11px] text-[#A8A29E]">Active Controllers</span>
              <span className="font-semibold text-[#292524] font-mono tabular-nums">{uniqueServices}</span>
            </div>
            <div>
              <span className="block text-[11px] text-[#A8A29E]">Workspace Status</span>
              <span className="font-semibold text-[#292524] text-xs">Synchronized</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Endpoints by Http Method card (displayed as pie chart) */}
        <div className="bg-[#FFFFFF] border border-[#E3DDD3] rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#E3DDD3]/60">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C] font-mono">
              Endpoints by HTTP Method
            </span>
            <span className="text-[11px] font-mono text-[#78716C]">Distribution</span>
          </div>
          <div className="mt-3">
            <MethodPieChart endpoints={endpoints} />
          </div>
        </div>

        {/* Card 3: Total Endpoints by Service/Controller (displayed as horizontal chart) */}
        <div className="bg-[#FFFFFF] border border-[#E3DDD3] rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#E3DDD3]/60">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C] font-mono">
              Endpoints by Controller
            </span>
            <span className="text-[11px] font-mono text-[#78716C]">Load Spread</span>
          </div>
          <div className="mt-3 max-h-56 overflow-y-auto pr-2.5">
            <ServiceBarChart endpoints={endpoints} />
          </div>
        </div>
      </div>

      {/* Recent Endpoints Quick Directory */}
      <div className="bg-[#FFFFFF] border border-[#E3DDD3] rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E3DDD3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C26D53]" />
            <h2 className="text-sm font-bold text-[#292524]">Recently Updated APIs</h2>
          </div>
          <span className="text-xs text-[#78716C] font-mono">Quick inspection</span>
        </div>

        {recentEndpoints.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#78716C]">
            No APIs created yet. Click "+ ADD NEW API" above to document your first endpoint.
          </div>
        ) : (
          <div className="divide-y divide-[#E3DDD3]/60">
            {recentEndpoints.map((ep) => {
              const formattedDate = new Date(ep.updatedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={ep.id}
                  onClick={() => onSelectEndpoint(ep.id)}
                  className="px-6 py-3.5 hover:bg-[#F7F5F0] transition-colors cursor-pointer flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <MethodBadge method={ep.method} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-[#292524] truncate">
                          {ep.path}
                        </span>
                        <span className="text-[11px] text-[#A8A29E] hidden md:inline">·</span>
                        <span className="text-xs text-[#78716C] truncate hidden md:inline">
                          {ep.title}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#78716C] flex items-center gap-2 mt-0.5">
                        <span className="font-medium text-[#57534E]">{ep.service}</span>
                        <span>·</span>
                        <span>{ep.responses?.length || 0} responses</span>
                        <span>·</span>
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleCopyCurl(e, ep)}
                      className="p-1.5 rounded-md hover:bg-[#EFECE6] text-[#78716C] hover:text-[#292524] transition-colors"
                      title="Copy cURL command"
                    >
                      {copiedId === ep.id ? (
                        <Check className="w-3.5 h-3.5 text-[#5E8268]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <ArrowUpRight className="w-4 h-4 text-[#A8A29E] group-hover:text-[#C26D53] transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
