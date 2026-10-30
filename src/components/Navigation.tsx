import React from 'react';
import {
  LayoutDashboard,
  Network,
  Settings,
} from 'lucide-react';
import { ActiveTab } from '../types/api';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  totalEndpoints: number;
  onOpenSettings: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  totalEndpoints,
  onOpenSettings,
}) => {
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
