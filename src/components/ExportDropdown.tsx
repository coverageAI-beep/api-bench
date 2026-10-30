import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileCode2, Send, FileText, Database, Check } from 'lucide-react';
import { ApiEndpoint } from '../types/api';
import { exportToOpenAPI, exportToPostman, exportToMarkdown, exportToJson, downloadFile } from '../lib/exporters';

interface ExportDropdownProps {
  endpoints: ApiEndpoint[];
  onNotification?: (msg: string) => void;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({ endpoints, onNotification }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastExported, setLastExported] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (format: 'openapi' | 'postman' | 'markdown' | 'json') => {
    setIsOpen(false);
    setLastExported(format);
    setTimeout(() => setLastExported(null), 2500);

    const count = endpoints.length;

    switch (format) {
      case 'openapi': {
        const content = exportToOpenAPI(endpoints);
        downloadFile('openapi_3.1.json', content, 'application/json');
        onNotification?.(`Exported ${count} APIs as OpenAPI 3.1 specification`);
        break;
      }
      case 'postman': {
        const content = exportToPostman(endpoints);
        downloadFile('postman_collection.json', content, 'application/json');
        onNotification?.(`Exported ${count} APIs as Postman Collection v2.1`);
        break;
      }
      case 'markdown': {
        const content = exportToMarkdown(endpoints);
        downloadFile('API_DOCS.md', content, 'text/markdown');
        onNotification?.(`Exported ${count} APIs as Markdown report`);
        break;
      }
      case 'json': {
        const content = exportToJson(endpoints);
        downloadFile('apibench_backup.json', content, 'application/json');
        onNotification?.(`Exported full backup of ${count} APIs`);
        break;
      }
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-9 inline-flex items-center justify-between gap-2 px-3.5 text-xs font-semibold rounded-lg bg-[#FFFFFF] text-[#292524] border border-[#E3DDD3] shadow-2xs hover:bg-[#F7F5F0] hover:border-[#D9D2C7] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C26D53] ${
          isOpen ? 'ring-1 ring-[#C26D53] border-[#C26D53] bg-[#F7F5F0]' : ''
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <Download className="w-3.5 h-3.5 text-[#78716C]" />
          <span>Export all APIs</span>
        </span>
        <span className="shrink-0 flex items-center justify-center text-[#78716C] ml-1 pointer-events-none">
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#C26D53]' : ''}`} />
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-64 origin-top-right rounded-xl bg-[#FFFFFF] border border-[#E3DDD3] shadow-lg py-1.5 z-50 focus:outline-none animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-[#78716C] uppercase tracking-wider border-b border-[#E3DDD3]/60">
            Select Export Format ({endpoints.length} APIs)
          </div>

          <button
            onClick={() => handleExport('openapi')}
            className="w-full text-left px-3.5 py-2.5 text-xs text-[#292524] hover:bg-[#F7F5F0] flex items-start gap-2.5 transition-colors group"
          >
            <FileCode2 className="w-4 h-4 text-[#5E8268] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold flex items-center justify-between">
                <span>OpenAPI 3.1.0</span>
                {lastExported === 'openapi' && <Check className="w-3 h-3 text-[#5E8268]" />}
              </div>
              <p className="text-[11px] text-[#78716C] truncate">Standard specification (JSON)</p>
            </div>
          </button>

          <button
            onClick={() => handleExport('postman')}
            className="w-full text-left px-3.5 py-2.5 text-xs text-[#292524] hover:bg-[#F7F5F0] flex items-start gap-2.5 transition-colors group"
          >
            <Send className="w-4 h-4 text-[#C26D53] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold flex items-center justify-between">
                <span>Postman Collection</span>
                {lastExported === 'postman' && <Check className="w-3 h-3 text-[#5E8268]" />}
              </div>
              <p className="text-[11px] text-[#78716C] truncate">v2.1.0 collection file</p>
            </div>
          </button>

          <button
            onClick={() => handleExport('markdown')}
            className="w-full text-left px-3.5 py-2.5 text-xs text-[#292524] hover:bg-[#F7F5F0] flex items-start gap-2.5 transition-colors group"
          >
            <FileText className="w-4 h-4 text-[#4A6E8C] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold flex items-center justify-between">
                <span>Markdown Report</span>
                {lastExported === 'markdown' && <Check className="w-3 h-3 text-[#5E8268]" />}
              </div>
              <p className="text-[11px] text-[#78716C] truncate">API_DOCS.md for Git README</p>
            </div>
          </button>

          <div className="my-1 border-t border-[#E3DDD3]/60" />

          <button
            onClick={() => handleExport('json')}
            className="w-full text-left px-3.5 py-2.5 text-xs text-[#292524] hover:bg-[#F7F5F0] flex items-start gap-2.5 transition-colors group"
          >
            <Database className="w-4 h-4 text-[#78716C] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold flex items-center justify-between">
                <span>Raw JSON Backup</span>
                {lastExported === 'json' && <Check className="w-3 h-3 text-[#5E8268]" />}
              </div>
              <p className="text-[11px] text-[#78716C] truncate">Full editable state snapshot</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
