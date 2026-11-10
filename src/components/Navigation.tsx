import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Network,
  Settings,
  Search,
  X,
} from 'lucide-react';
import { ActiveTab, ApiEndpoint } from '../types/api';
import { MethodBadge } from './MethodBadge';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  totalEndpoints: number;
  endpoints: ApiEndpoint[];
  onSelectEndpoint: (id: string) => void;
  onOpenSettings: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  totalEndpoints,
  endpoints,
  onSelectEndpoint,
  onOpenSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEndpoints = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return endpoints.filter(
      (ep) =>
        ep.title.toLowerCase().includes(q) ||
        ep.path.toLowerCase().includes(q) ||
        ep.method.toLowerCase().includes(q)
    );
  }, [endpoints, searchQuery]);
  return (
    <aside className="w-64 bg-[#EFECE6] border-r border-[#E3DDD3] flex flex-col justify-between shrink-0 select-none min-h-screen">
      {/* Top Brand & Tabs */}
      <div>
        {/* Brand Header */}
        <div className="px-6 py-5 border-b border-[#E3DDD3]/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C26D53] text-[#FFFFFF] flex items-center justify-center font-mono font-bold text-base shadow-xs">
              A
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-[#292524] flex items-center gap-1.5">
                <span>APIBench</span>
              </div>
              <p className="text-[11px] text-[#78716C] font-mono">Personal API Workbench</p>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="px-3 pt-3 pb-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search APIs..."
              aria-label="Search APIs by title, path, or HTTP method"
              className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#E3DDD3] text-xs text-[#292524] placeholder-[#A8A29E] focus:outline-none focus:border-[#C26D53] focus:ring-1 focus:ring-[#C26D53]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#292524]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results */}
          {searchQuery.trim().length > 0 && (
            <div className="mt-2 max-h-60 overflow-y-auto rounded-lg bg-[#FFFFFF] border border-[#E3DDD3] shadow-sm divide-y divide-[#E3DDD3]/60">
              {filteredEndpoints.length === 0 ? (
                <div className="px-3 py-2.5 text-[11px] text-[#78716C] text-center">
                  No matching APIs
                </div>
              ) : (
                filteredEndpoints.map((ep) => (
                  <button
                    key={ep.id}
                    type="button"
                    onClick={() => {
                      onSelectEndpoint(ep.id);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-2.5 py-2 hover:bg-[#FAF8F5] transition-colors flex flex-col gap-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MethodBadge method={ep.method} />
                      <span className="text-xs font-semibold text-[#292524] truncate">
                        {ep.title}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#78716C] truncate">
                      {ep.path}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className="p-3 space-y-1">
          <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-[#78716C] uppercase tracking-wider font-mono">
            Navigation
          </div>

          {/* Tab 1: Dashboard */}
          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-[#FFFFFF] text-[#C26D53] shadow-xs border border-[#E3DDD3]/80'
                : 'text-[#78716C] hover:text-[#292524] hover:bg-[#F7F5F0]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-[#C26D53]' : 'text-[#78716C]'}`} />
              <span>Dashboard</span>
            </div>
          </button>

          {/* Tab 2: APIs */}
          <button
            type="button"
            onClick={() => onSelectTab('apis')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'apis'
                ? 'bg-[#FFFFFF] text-[#C26D53] shadow-xs border border-[#E3DDD3]/80'
                : 'text-[#78716C] hover:text-[#292524] hover:bg-[#F7F5F0]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Network className={`w-4 h-4 ${activeTab === 'apis' ? 'text-[#C26D53]' : 'text-[#78716C]'}`} />
              <span>APIs Directory</span>
            </div>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-[#EFECE6] text-[#78716C] tabular-nums font-semibold border border-[#E3DDD3]/60">
              {totalEndpoints}
            </span>
          </button>
        </nav>
      </div>

      {/* Bottom Footer Section: Preferences Button */}
      <div className="p-3 border-t border-[#E3DDD3]/70">
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold text-[#292524] bg-[#FFFFFF] hover:bg-[#F7F5F0] border border-[#E3DDD3] shadow-xs transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#C26D53]" />
            <span>Preferences & Settings</span>
          </div>
          <span className="text-[10px] text-[#78716C] font-mono">Config</span>
        </button>
      </div>
    </aside>
  );
};
