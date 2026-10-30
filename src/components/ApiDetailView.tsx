import React, { useState } from 'react';
import {
  ArrowLeft,
  Copy,
  Check,
  Edit3,
  Trash2,
  Terminal,
  ShieldCheck,
  Clock,
  Layers,
  AlertTriangle,
  Plus,
  Eye,
  Code2,
  Download,
  FileText,
} from 'lucide-react';
import { ApiEndpoint } from '../types/api';
import { MethodBadge } from './MethodBadge';
import { JsonCodeEditor } from './JsonCodeEditor';
import { MarkdownRenderer } from './MarkdownRenderer';
import { generateCurlCommand } from '../lib/curl';
import { getLocalPreferences } from '../lib/storage';
import { exportSingleEndpointToMarkdown, downloadFile } from '../lib/exporters';

interface ApiDetailViewProps {
  endpoint: ApiEndpoint;
  onBack: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onAddNewApi: () => void;
  onNotification: (msg: string) => void;
}

export const ApiDetailView: React.FC<ApiDetailViewProps> = ({
  endpoint,
  onBack,
  onEdit,
  onDelete,
  onAddNewApi,
  onNotification,
}) => {
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [descViewMode, setDescViewMode] = useState<'preview' | 'raw'>('preview');
  const [markdownScope, setMarkdownScope] = useState<'summary' | 'full'>('summary');
  const [activeResponseIdx, setActiveResponseIdx] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const preferences = getLocalPreferences();

  const curlCommand = generateCurlCommand(endpoint, preferences.defaultBaseUrl);
  const fullEndpointMarkdown = exportSingleEndpointToMarkdown(endpoint);
  const activeMarkdownContent =
    markdownScope === 'summary' ? (endpoint.summary || '') : fullEndpointMarkdown;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand).then(() => {
      setCopiedCurl(true);
      onNotification('cURL command copied to clipboard');
      setTimeout(() => setCopiedCurl(false), 2000);
    });
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(activeMarkdownContent).then(() => {
      setCopiedMarkdown(true);
      onNotification('Markdown copied to clipboard');
      setTimeout(() => setCopiedMarkdown(false), 2000);
    });
  };

  const handleExportMarkdown = () => {
    const safePath = endpoint.path.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${endpoint.service || 'api'}-${endpoint.method}-${safePath}.md`;
    downloadFile(filename, fullEndpointMarkdown, 'text/markdown');
    onNotification(`Exported Markdown documentation for ${endpoint.method} ${endpoint.path}`);
  };

  const currentResponse = endpoint.responses?.[activeResponseIdx] || endpoint.responses?.[0];

  const formattedUpdatedDate = new Date(endpoint.updatedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Top Header & Breadcrumb / Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DDD3]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#78716C] hover:text-[#292524] transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to APIs</span>
        </button>

        {/* Action Controls: Copy cURL, Edit, Delete, + Add New API */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopyCurl}
            className="h-9 inline-flex items-center gap-1.5 px-3.5 text-xs font-semibold rounded-lg bg-[#FFFFFF] text-[#292524] border border-[#E3DDD3] shadow-2xs hover:bg-[#F7F5F0] hover:border-[#D9D2C7] transition-colors"
          >
            {copiedCurl ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#5E8268]" />
                <span className="text-[#5E8268]">cURL Copied!</span>
              </>
            ) : (
              <>
                <Terminal className="w-3.5 h-3.5 text-[#C26D53]" />
                <span>Copy cURL</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportMarkdown}
            className="h-9 inline-flex items-center gap-1.5 px-3.5 text-xs font-semibold rounded-lg bg-[#FFFFFF] text-[#292524] border border-[#E3DDD3] shadow-2xs hover:bg-[#F7F5F0] hover:border-[#D9D2C7] transition-colors"
            title="Export Markdown documentation"
          >
            <Download className="w-3.5 h-3.5 text-[#78716C]" />
            <span>Export .md</span>
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="h-9 inline-flex items-center gap-1.5 px-3.5 text-xs font-semibold rounded-lg bg-[#FFFFFF] text-[#292524] border border-[#E3DDD3] shadow-2xs hover:bg-[#F7F5F0] hover:border-[#D9D2C7] transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#78716C]" />
            <span>Edit API</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="h-9 inline-flex items-center gap-1.5 px-3.5 text-xs font-semibold rounded-lg bg-[#FFFFFF] text-[#8A372E] border border-[#ECC4BE] hover:bg-[#F9E7E4] shadow-2xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#8A372E]" />
            <span>Delete</span>
          </button>

          <div className="h-5 w-px bg-[#E3DDD3] mx-1 hidden sm:block" />

          <button
            type="button"
            onClick={onAddNewApi}
            className="h-9 inline-flex items-center gap-1.5 px-4 text-xs font-semibold rounded-lg bg-[#C26D53] hover:bg-[#A8543B] text-[#FFFFFF] shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ADD NEW API</span>
          </button>
        </div>
      </div>

      {/* Main Endpoint Identity Banner */}
      <div className="bg-[#FFFFFF] border border-[#E3DDD3] rounded-xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <MethodBadge method={endpoint.method} size="lg" />
          <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#292524] tracking-tight break-all">
            {endpoint.path}
          </h1>
        </div>

        <div className="space-y-1">
          <h2 className="text-base font-semibold text-[#292524]">{endpoint.title}</h2>
        </div>

        {/* Metadata Strip */}
        <div className="pt-3.5 border-t border-[#E3DDD3]/60 flex flex-wrap items-center gap-5 text-xs text-[#78716C]">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] uppercase text-[#A8A29E]">Controller:</span>
            <span className="font-mono font-semibold text-[#292524] px-2.5 py-0.5 rounded bg-[#EFECE6] border border-[#E3DDD3]/80">
              {endpoint.service}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#A8A29E]" />
            <span>Updated {formattedUpdatedDate}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#A8A29E]" />
            <span>{endpoint.responses?.length || 0} documented responses</span>
          </div>
        </div>
      </div>

      {/* API Description & Markdown Documentation Card with Real-time Preview Toggle */}
      <div className="bg-[#FFFFFF] border border-[#E3DDD3] rounded-xl shadow-xs overflow-hidden">
        {/* Header bar with toggles and export tools */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 bg-[#FAF8F5] border-b border-[#E3DDD3]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#C26D53]" />
            <h3 className="text-xs font-bold text-[#292524] tracking-tight uppercase font-mono">
              API Description & Documentation
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Scope Selector: Description vs Full Endpoint Spec */}
            <div className="inline-flex items-center p-0.5 rounded-lg bg-[#EFECE6] border border-[#E3DDD3] text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setMarkdownScope('summary')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  markdownScope === 'summary'
                    ? 'bg-[#FFFFFF] text-[#292524] shadow-2xs font-bold'
                    : 'text-[#78716C] hover:text-[#292524]'
                }`}
                title="View endpoint summary & description only"
              >
                Description
              </button>
              <button
                type="button"
                onClick={() => setMarkdownScope('full')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  markdownScope === 'full'
                    ? 'bg-[#FFFFFF] text-[#292524] shadow-2xs font-bold'
                    : 'text-[#78716C] hover:text-[#292524]'
                }`}
                title="View full generated endpoint Markdown documentation"
              >
                Full Spec
              </button>
            </div>

            {/* View Mode Toggle: Preview vs Raw Markdown */}
            <div className="inline-flex items-center p-0.5 rounded-lg bg-[#EFECE6] border border-[#E3DDD3] text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setDescViewMode('preview')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                  descViewMode === 'preview'
                    ? 'bg-[#FFFFFF] text-[#C26D53] shadow-2xs font-bold'
                    : 'text-[#78716C] hover:text-[#292524]'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setDescViewMode('raw')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                  descViewMode === 'raw'
                    ? 'bg-[#FFFFFF] text-[#C26D53] shadow-2xs font-bold'
                    : 'text-[#78716C] hover:text-[#292524]'
                }`}
              >
                <Code2 className="w-3 h-3" />
                <span>Raw Markdown</span>
              </button>
            </div>

            {/* Quick Action: Copy Markdown */}
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className={`h-7 inline-flex items-center gap-1 px-2.5 text-[11px] font-semibold rounded-md border shadow-2xs transition-colors ${
                copiedMarkdown
                  ? 'bg-[#E5EFE7] text-[#265937] border-[#C8DEC9]'
                  : 'bg-[#FFFFFF] text-[#292524] border-[#E3DDD3] hover:bg-[#F7F5F0]'
              }`}
              title="Copy active markdown content to clipboard"
            >
              {copiedMarkdown ? (
                <>
                  <Check className="w-3 h-3 text-[#265937]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[#78716C]" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Quick Action: Download .md */}
            <button
              type="button"
              onClick={handleExportMarkdown}
              className="h-7 inline-flex items-center gap-1 px-2.5 text-[11px] font-semibold rounded-md bg-[#FFFFFF] text-[#292524] border border-[#E3DDD3] shadow-2xs hover:bg-[#F7F5F0] transition-colors"
              title="Download Markdown documentation file"
            >
              <Download className="w-3 h-3 text-[#78716C]" />
              <span>Export .md</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {descViewMode === 'preview' ? (
            <MarkdownRenderer
              content={activeMarkdownContent}
              fallbackText={
                markdownScope === 'summary'
                  ? 'No description provided for this endpoint yet. Click "Edit API" to add Markdown documentation.'
                  : 'No specification content available.'
              }
            />
          ) : (
            <div className="relative">
              <pre className="p-4 bg-[#FAF8F5] text-xs font-mono text-[#292524] overflow-x-auto whitespace-pre-wrap leading-relaxed border border-[#E3DDD3] rounded-lg max-h-96 selection:bg-[#F7ECE8] selection:text-[#C26D53]">
                <code>{activeMarkdownContent || '(No Markdown content)'}</code>
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Business Rules Container */}
      <div className="bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl p-6 sm:p-7 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#E8DFC8]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#CFA058]" />
            <h3 className="text-xs font-bold text-[#292524] tracking-tight uppercase font-mono">
              Business Rules & Governance
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#78716C]">Domain Invariants</span>
        </div>

        <MarkdownRenderer
          content={endpoint.businessRules || ''}
          fallbackText="No business rules documented for this endpoint yet."
        />
      </div>

      {/* Executable cURL Command Preview in Defined Pastel Earth Palette */}
      <div className="bg-[#FAF8F5] rounded-xl overflow-hidden border border-[#E3DDD3] shadow-xs">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#F4EFEA] border-b border-[#E3DDD3] text-xs font-mono">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#C26D53]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#292524] font-mono">
              Executable cURL Command
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyCurl}
            className={`h-7 flex items-center gap-1.5 px-2.5 rounded-md text-[11px] font-semibold transition-colors border shadow-2xs ${
              copiedCurl
                ? 'bg-[#E5EFE7] text-[#265937] border-[#C8DEC9]'
                : 'bg-[#FFFFFF] hover:bg-[#EFECE6] text-[#292524] border-[#E3DDD3]'
            }`}
          >
            {copiedCurl ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#265937]" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#78716C]" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <div className="p-4 bg-[#FAF8F5] overflow-x-auto text-xs font-mono leading-relaxed selection:bg-[#F7ECE8] selection:text-[#C26D53]">
          {curlCommand.split('\n').map((line, idx) => {
            const isFirst = idx === 0;
            const hasHeader = line.trim().startsWith('-H ');
            const hasData = line.trim().startsWith('-d ') || line.trim().startsWith('--data ');
            const hasMethod = line.includes('-X ');
            const endsWithSlash = line.trim().endsWith('\\');

            return (
              <div key={idx} className="flex items-baseline gap-2 py-0.5">
                <span className="text-[#C26D53] select-none font-bold text-[11px] w-3 shrink-0 text-right opacity-80">
                  {isFirst ? '$' : ' '}
                </span>
                <span className="flex-1 whitespace-pre-wrap break-all">
                  {isFirst ? (
                    <>
                      <span className="text-[#C26D53] font-bold">curl </span>
                      {hasMethod && (
                        <>
                          <span className="text-[#4A6E8C] font-semibold">-X </span>
                          <span className="font-bold text-[#292524] bg-[#EFECE6] px-1 py-0.2 rounded text-[11px] border border-[#E3DDD3]">
                            {endpoint.method}
                          </span>{' '}
                        </>
                      )}
                      <span className="text-[#5E8268] font-medium">
                        "{line.replace(/^curl\s+(-X\s+[A-Z]+\s+)?/, '').replace(/\s*\\$/, '').replace(/^"/, '').replace(/"$/, '')}"
                      </span>
                      {endsWithSlash && <span className="text-[#A8A29E] select-none"> \</span>}
                    </>
                  ) : hasHeader ? (
                    <>
                      <span className="text-[#4A6E8C] font-semibold">  -H </span>
                      <span className="text-[#B8833A] font-medium">"</span>
                      <span className="text-[#292524] font-medium">
                        {line.replace(/^\s*-H\s+"?/, '').replace(/"?\s*\\?$/, '')}
                      </span>
                      <span className="text-[#B8833A] font-medium">"</span>
                      {endsWithSlash && <span className="text-[#A8A29E] select-none"> \</span>}
                    </>
                  ) : hasData ? (
                    <>
                      <span className="text-[#4A6E8C] font-semibold">  -d </span>
                      <span className="text-[#2E6B3E] font-medium">
                        {line.replace(/^\s*-d\s+/, '').replace(/\s*\\$/, '')}
                      </span>
                      {endsWithSlash && <span className="text-[#A8A29E] select-none"> \</span>}
                    </>
                  ) : (
                    <span className="text-[#292524]">{line}</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Parameters & Request Body */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Headers & Params */}
        <div className="space-y-6">
          {/* Path Parameters */}
          {endpoint.pathParams && endpoint.pathParams.length > 0 && (
            <div className="bg-[#FFFFFF] border border-[#E3DDD3] rounded-xl p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716C] font-mono pb-2 border-b border-[#E3DDD3]/60">
                Path Parameters ({endpoint.pathParams.length})
              </h4>
              <div className="divide-y divide-[#E3DDD3]/60">
                {endpoint.pathParams.map((p) => (
                  <div key={p.id || p.key} className="py-2.5 flex items-start justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-[#292524]">{p.key}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-[#F9E7E4] text-[#8A372E] border border-[#ECC4BE]">
                          Required
                        </span>
                      </div>
                      {p.description && (
                        <p className="text-[11px] text-[#78716C] mt-0.5">{p.description}</p>
                      )}
                    </div>
                    {p.value && (
                      <span className="font-mono text-xs text-[#57534E] bg-[#F7F5F0] px-2 py-0.5 rounded border border-[#E3DDD3]/60">
                        {p.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Query Parameters */}
          {endpoint.queryParams && endpoint.queryParams.length > 0 && (
            <div className="bg-[#FFFFFF] border border-[#E3DDD3] rounded-xl p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716C] font-mono pb-2 border-b border-[#E3DDD3]/60">
                Query Parameters ({endpoint.queryParams.length})
              </h4>
              <div className="divide-y divide-[#E3DDD3]/60">
                {endpoint.queryParams.map((q) => (
                  <div key={q.id || q.key} className="py-2.5 flex items-start justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-[#292524]">{q.key}</span>
                        {q.required ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-[#F9E7E4] text-[#8A372E] border border-[#ECC4BE]">
                            Required
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-[#EFECE6] text-[#78716C]">
                            Optional
                          </span>
                        )}
                      </div>
                      {q.description && (
                        <p className="text-[11px] text-[#78716C] mt-0.5">{q.description}</p>
                      )}
                    </div>
                    {q.value && (
                      <span className="font-mono text-xs text-[#57534E] bg-[#F7F5F0] px-2 py-0.5 rounded border border-[#E3DDD3]/60">
                        {q.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request Headers */}
          <div className="bg-[#FFFFFF] border border-[#E3DDD3] rounded-xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716C] font-mono pb-2 border-b border-[#E3DDD3]/60">
              Request Headers ({endpoint.headers?.length || 0})
            </h4>
            {endpoint.headers && endpoint.headers.length > 0 ? (
              <div className="divide-y divide-[#E3DDD3]/60">
                {endpoint.headers.map((h) => (
                  <div key={h.id || h.key} className="py-2.5 flex items-start justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-[#292524]">{h.key}</span>
                        {h.required ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-[#F9E7E4] text-[#8A372E] border border-[#ECC4BE]">
                            Required
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-[#EFECE6] text-[#78716C]">
                            Optional
                          </span>
                        )}
                      </div>
                      {h.description && (
                        <p className="text-[11px] text-[#78716C] mt-0.5">{h.description}</p>
                      )}
                    </div>
                    {h.value && (
                      <span className="font-mono text-xs text-[#57534E] bg-[#F7F5F0] px-2 py-0.5 rounded border border-[#E3DDD3]/60 truncate max-w-[200px]">
                        {h.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#78716C]">No special headers required.</p>
            )}
          </div>
        </div>

        {/* Right Column: Request Body */}
        <div className="bg-[#FFFFFF] border border-[#E3DDD3] rounded-xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#E3DDD3]/60">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716C] font-mono">
                Request Body
              </h4>
              <span className="font-mono text-[11px] px-2.5 py-0.5 rounded bg-[#EFECE6] text-[#57534E] border border-[#E3DDD3]/80">
                {endpoint.requestBody?.contentType || 'none'}
              </span>
            </div>

            {endpoint.requestBody?.rawBody && endpoint.requestBody.rawBody.trim() ? (
              <div className="mt-3">
                <JsonCodeEditor
                  value={endpoint.requestBody.rawBody}
                  label={`${endpoint.requestBody.contentType} payload`}
                  readOnly={true}
                  minHeight="140px"
                  maxHeight="320px"
                />
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#78716C] font-mono">
                No request body payload for this route ({endpoint.method})
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Responses Section with Status Tabs */}
      <div className="bg-[#FFFFFF] border border-[#E3DDD3] rounded-xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E3DDD3]">
          <div>
            <h3 className="text-xs font-bold text-[#292524] uppercase font-mono tracking-wider">
              Documented Responses ({endpoint.responses?.length || 0})
            </h3>
            <p className="text-xs text-[#78716C] mt-0.5">
              Possible status codes, payload structures, and error contracts
            </p>
          </div>
        </div>

        {/* Response Status Tabs */}
        {endpoint.responses && endpoint.responses.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {endpoint.responses.map((res, idx) => {
                const isSelected = activeResponseIdx === idx;
                const is2xx = res.statusCode >= 200 && res.statusCode < 300;
                const is4xx = res.statusCode >= 400 && res.statusCode < 500;

                return (
                  <button
                    key={res.id || idx}
                    type="button"
                    onClick={() => setActiveResponseIdx(idx)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
                      isSelected
                        ? is2xx
                          ? 'bg-[#E5EFE7] text-[#265937] border-[#265937] shadow-xs'
                          : is4xx
                          ? 'bg-[#FAF0DF] text-[#7C5318] border-[#7C5318] shadow-xs'
                          : 'bg-[#F9E7E4] text-[#8A372E] border-[#8A372E] shadow-xs'
                        : 'bg-[#F7F5F0] text-[#78716C] border-[#E3DDD3] hover:text-[#292524] hover:bg-[#EFECE6]'
                    }`}
                  >
                    <span>{res.statusCode}</span>
                    <span className="font-sans font-medium text-[11px]">{res.statusText}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Response Details */}
            {currentResponse && (
              <div className="space-y-3 pt-2">
                <div className="text-xs text-[#292524] font-medium flex items-center gap-2">
                  <span className="text-[#78716C]">Description:</span>
                  <span>{currentResponse.description || 'No description provided.'}</span>
                </div>

                {currentResponse.body ? (
                  <div>
                    <JsonCodeEditor
                      value={currentResponse.body}
                      label={`Response ${currentResponse.statusCode} payload`}
                      readOnly={true}
                      minHeight="140px"
                      maxHeight="340px"
                    />
                  </div>
                ) : (
                  <div className="p-6 rounded-lg bg-[#F7F5F0] border border-[#E3DDD3] text-center text-xs text-[#78716C] font-mono">
                    Empty response body (HTTP {currentResponse.statusCode})
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-[#78716C] py-4">No responses documented for this endpoint.</p>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-[#292524]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#FFFFFF] border border-[#ECC4BE] rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-[#F9E7E4] text-[#8A372E] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#292524]">Delete API Documentation</h3>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  Are you sure you want to permanently remove <strong className="font-mono text-[#292524]">{endpoint.method} {endpoint.path}</strong> from your local repository?
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E3DDD3] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-[#78716C] hover:bg-[#F7F5F0] hover:text-[#292524] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  onDelete(endpoint.id);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#8A372E] hover:bg-[#722A22] text-white shadow-xs transition-colors"
              >
                Delete Endpoint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
