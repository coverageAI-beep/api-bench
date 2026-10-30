import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Copy, Check, ArrowRight, X } from 'lucide-react';
import { ApiEndpoint } from '../types/api';
import { MethodBadge } from './MethodBadge';
import { CustomSelect } from './CustomSelect';
import { generateCurlCommand } from '../lib/curl';

interface ApisTableViewProps {
  endpoints: ApiEndpoint[];
  onAddNewApi: () => void;
  onSelectEndpoint: (id: string) => void;
  onNotification: (msg: string) => void;
}

export const ApisTableView: React.FC<ApisTableViewProps> = ({
  endpoints,
  onAddNewApi,
  onSelectEndpoint,
  onNotification,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [selectedService, setSelectedService] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Available unique services
  const uniqueServices = useMemo(() => {
    const set = new Set<string>();
    endpoints.forEach((e) => {
      if (e.service && e.service.trim()) set.add(e.service.trim());
    });
    return Array.from(set).sort();
  }, [endpoints]);

  // Filtered endpoints
  const filteredEndpoints = useMemo(() => {
    return endpoints.filter((ep) => {
      // Method filter
      if (selectedMethod !== 'ALL' && ep.method.toUpperCase() !== selectedMethod) {
        return false;
      }
      // Service filter
      if (selectedService !== 'ALL' && ep.service !== selectedService) {
        return false;
      }
      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const pathMatch = ep.path.toLowerCase().includes(query);
        const titleMatch = ep.title.toLowerCase().includes(query);
        const serviceMatch = ep.service.toLowerCase().includes(query);
        const rulesMatch = ep.businessRules?.toLowerCase().includes(query);
        const summaryMatch = ep.summary?.toLowerCase().includes(query);
        if (!pathMatch && !titleMatch && !serviceMatch && !rulesMatch && !summaryMatch) {
          return false;
        }
      }
      return true;
    });
  }, [endpoints, selectedMethod, selectedService, searchQuery]);

  const handleCopyCurl = (e: React.MouseEvent, endpoint: ApiEndpoint) => {
    e.stopPropagation();
    const cmd = generateCurlCommand(endpoint);
    navigator.clipboard.writeText(cmd).then(() => {
      setCopiedId(endpoint.id);
      onNotification(`Copied cURL for ${endpoint.method} ${endpoint.path}`);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const METHOD_FILTERS = ['ALL', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

  const serviceOptions = [
    { value: 'ALL', label: `All Controllers (${endpoints.length})` },
    ...uniqueServices.map((svc) => ({
      value: svc,
      label: `${svc} (${endpoints.filter((e) => e.service === svc).length})`
    }))
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Top Header & ADD NEW API button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DDD3]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#292524]">APIs Directory</h1>
          <p className="text-xs text-[#78716C] mt-1">
            Browse, search, and inspect all endpoints documented in your local workspace
          </p>
        </div>

        <button
          type="button"
          onClick={onAddNewApi}
          className="h-9 inline-flex items-center gap-2 px-4 text-xs font-semibold rounded-lg bg-[#C26D53] hover:bg-[#A8543B] text-[#FFFFFF] shadow-xs transition-colors self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C26D53]"
        >
          <Plus className="w-4 h-4" />
          <span>ADD NEW API</span>
        </button>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="bg-[#FFFFFF] border border-[#E3DDD3] rounded-xl p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by path, title, controller, or business rules..."
              className="w-full h-9 pl-9 pr-9 text-xs rounded-lg border border-[#E3DDD3] bg-[#F7F5F0]/60 placeholder-[#A8A29E] text-[#292524] focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#C26D53] focus:border-[#C26D53] transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#292524]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Service Filter Dropdown with perfectly aligned Chevron arrow */}
          <div className="w-full md:w-64 shrink-0">
            <CustomSelect
              options={serviceOptions}
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              icon={<Filter className="w-3.5 h-3.5" />}
              className="w-full"
              menuWidth="auto"
            />
          </div>
        </div>

        {/* Method Filter Segmented Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-[#E3DDD3]/60">
          <span className="text-[11px] font-mono font-medium text-[#78716C] mr-1 uppercase">Method:</span>
          {METHOD_FILTERS.map((m) => {
            const isActive = selectedMethod === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMethod(m)}
                className={`px-3 py-1 rounded-md text-xs font-mono font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#292524] text-[#FFFFFF] shadow-xs'
                    : 'bg-[#EFECE6] text-[#78716C] hover:text-[#292524] hover:bg-[#E3DDD3]'
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabular APIs Table */}
      <div className="bg-[#FFFFFF] border border-[#E3DDD3] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#EFECE6]/80 border-b border-[#E3DDD3] text-[#78716C] uppercase font-mono text-[11px] tracking-wider select-none">
              <tr>
                <th scope="col" className="px-5 py-3.5 w-24">Method</th>
                <th scope="col" className="px-4 py-3.5">API Path</th>
                <th scope="col" className="px-4 py-3.5">Title & Description</th>
                <th scope="col" className="px-4 py-3.5 w-44">Service</th>
                <th scope="col" className="px-4 py-3.5 w-28 text-center">Responses</th>
                <th scope="col" className="px-5 py-3.5 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3DDD3]/70 font-sans">
              {filteredEndpoints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#78716C]">
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="font-semibold text-sm text-[#292524]">No matching endpoints found</p>
                      <p className="text-xs">
                        {searchQuery || selectedMethod !== 'ALL' || selectedService !== 'ALL'
                          ? 'Try clearing the active search query or filter tags.'
                          : 'No endpoints exist in your workspace yet. Click "ADD NEW API" to create your first.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEndpoints.map((ep) => {
                  return (
                    <tr
                      key={ep.id}
                      onClick={() => onSelectEndpoint(ep.id)}
                      className="hover:bg-[#F7F5F0] transition-colors cursor-pointer group"
                    >
                      {/* Method */}
                      <td className="px-5 py-3.5 align-middle">
                        <MethodBadge method={ep.method} size="sm" />
                      </td>

                      {/* Path */}
                      <td className="px-4 py-3.5 align-middle font-mono font-semibold text-[#292524]">
                        <span className="group-hover:text-[#C26D53] transition-colors">
                          {ep.path}
                        </span>
                      </td>

                      {/* Title & Summary */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="font-medium text-[#292524]">{ep.title}</div>
                        {ep.summary && (
                          <div className="text-[11px] text-[#78716C] line-clamp-1 mt-0.5">
                            {ep.summary}
                          </div>
                        )}
                      </td>

                      {/* Service / Controller */}
                      <td className="px-4 py-3.5 align-middle">
                        <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-[#EFECE6] text-[#57534E] border border-[#E3DDD3]/80">
                          {ep.service}
                        </span>
                      </td>

                      {/* Responses count */}
                      <td className="px-4 py-3.5 align-middle text-center">
                        <div className="flex items-center justify-center gap-1">
                          {ep.responses && ep.responses.length > 0 ? (
                            ep.responses.slice(0, 3).map((res) => {
                              const is2xx = res.statusCode >= 200 && res.statusCode < 300;
                              const is4xx = res.statusCode >= 400 && res.statusCode < 500;
                              return (
                                <span
                                  key={res.id || res.statusCode}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                                    is2xx
                                      ? 'bg-[#E5EFE7] text-[#265937] border-[#C8DEC9]'
                                      : is4xx
                                      ? 'bg-[#FAF0DF] text-[#7C5318] border-[#EED7B0]'
                                      : 'bg-[#F9E7E4] text-[#8A372E] border-[#ECC4BE]'
                                  }`}
                                  title={`${res.statusCode} ${res.statusText}`}
                                >
                                  {res.statusCode}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-[11px] text-[#A8A29E] font-mono">None</span>
                          )}
                          {ep.responses && ep.responses.length > 3 && (
                            <span className="text-[10px] text-[#78716C] font-mono">
                              +{ep.responses.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 align-middle text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => handleCopyCurl(e, ep)}
                            className="p-1.5 rounded-md hover:bg-[#EAE7E0] text-[#78716C] hover:text-[#292524] transition-colors"
                            title="Copy cURL command"
                          >
                            {copiedId === ep.id ? (
                              <Check className="w-3.5 h-3.5 text-[#5E8268]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => onSelectEndpoint(ep.id)}
                            className="p-1.5 rounded-md hover:bg-[#EAE7E0] text-[#78716C] hover:text-[#C26D53] transition-colors"
                            title="View API Details"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Count */}
        <div className="px-5 py-3 bg-[#EFECE6]/50 border-t border-[#E3DDD3] flex items-center justify-between text-xs text-[#78716C] font-mono">
          <span>
            Showing <strong className="text-[#292524] tabular-nums">{filteredEndpoints.length}</strong> of{' '}
            <strong className="text-[#292524] tabular-nums">{endpoints.length}</strong> total endpoints
          </span>
          <span>Click any row to view full details</span>
        </div>
      </div>
    </div>
  );
};
