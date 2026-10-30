import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { ApiEndpoint, HttpMethod, KeyValueItem, ApiResponseDef } from '../types/api';
import { getUniqueServices } from '../lib/storage';
import { JsonCodeEditor } from './JsonCodeEditor';
import { CustomSelect } from './CustomSelect';
import { MethodBadge } from './MethodBadge';

interface ApiFormViewProps {
  initialEndpoint?: ApiEndpoint | null;
  onSave: (endpoint: ApiEndpoint) => void;
  onCancel: () => void;
  onNotification: (msg: string) => void;
}

export const ApiFormView: React.FC<ApiFormViewProps> = ({
  initialEndpoint,
  onSave,
  onCancel,
  onNotification,
}) => {
  const isEditing = !!initialEndpoint;

  const [existingServices, setExistingServices] = useState<string[]>([]);

  // Form State
  const [service, setService] = useState(initialEndpoint?.service || '');
  const [method, setMethod] = useState<HttpMethod>(initialEndpoint?.method || 'GET');
  const [path, setPath] = useState(initialEndpoint?.path || '');
  const [title, setTitle] = useState(initialEndpoint?.title || '');
  const [summary, setSummary] = useState(initialEndpoint?.summary || '');
  const [businessRules, setBusinessRules] = useState(initialEndpoint?.businessRules || '');

  // Headers
  const [headers, setHeaders] = useState<KeyValueItem[]>(
    initialEndpoint?.headers || [
      { id: '1', key: 'Content-Type', value: 'application/json', required: true, description: 'Payload content' }
    ]
  );

  // Path Params
  const [pathParams, setPathParams] = useState<KeyValueItem[]>(initialEndpoint?.pathParams || []);

  // Query Params
  const [queryParams, setQueryParams] = useState<KeyValueItem[]>(initialEndpoint?.queryParams || []);

  // Request Body
  const [bodyContentType, setBodyContentType] = useState<
    'application/json' | 'multipart/form-data' | 'application/x-www-form-urlencoded' | 'none'
  >(initialEndpoint?.requestBody?.contentType || (['GET', 'DELETE'].includes(method) ? 'none' : 'application/json'));
  const [rawBody, setRawBody] = useState(initialEndpoint?.requestBody?.rawBody || '');

  // Responses
  const [responses, setResponses] = useState<ApiResponseDef[]>(
    initialEndpoint?.responses || [
      {
        id: 'r_1',
        statusCode: 200,
        statusText: 'OK',
        description: 'Successful operation',
        body: JSON.stringify({ success: true }, null, 2)
      }
    ]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setExistingServices(getUniqueServices());
  }, []);

  // Detect path variables automatically (e.g. :id or {id})
  const handlePathChange = (newPath: string) => {
    setPath(newPath);
    const colonMatches = Array.from(newPath.matchAll(/:([a-zA-Z0-9_]+)/g)).map((m) => m[1]);
    const braceMatches = Array.from(newPath.matchAll(/\{([a-zA-Z0-9_]+)\}/g)).map((m) => m[1]);
    const detected = Array.from(new Set([...colonMatches, ...braceMatches]));

    setPathParams((prev) => {
      const existingKeys = new Set(prev.map((p) => p.key));
      const added = detected
        .filter((k) => !existingKeys.has(k))
        .map((k, i) => ({
          id: `p_auto_${Date.now()}_${i}`,
          key: k,
          value: '',
          required: true,
          description: `Path variable for ${k}`
        }));
      return [...prev, ...added];
    });
  };

  // Header helpers
  const addHeader = () => {
    setHeaders([
      ...headers,
      { id: `h_${Date.now()}`, key: '', value: '', required: false, description: '' }
    ]);
  };
  const removeHeader = (idx: number) => {
    setHeaders(headers.filter((_, i) => i !== idx));
  };
  const updateHeader = (idx: number, field: keyof KeyValueItem, val: any) => {
    const updated = [...headers];
    updated[idx] = { ...updated[idx], [field]: val };
    setHeaders(updated);
  };

  // Path Param helpers
  const addPathParam = () => {
    setPathParams([
      ...pathParams,
      { id: `p_${Date.now()}`, key: '', value: '', required: true, description: '' }
    ]);
  };
  const removePathParam = (idx: number) => {
    setPathParams(pathParams.filter((_, i) => i !== idx));
  };
  const updatePathParam = (idx: number, field: keyof KeyValueItem, val: any) => {
    const updated = [...pathParams];
    updated[idx] = { ...updated[idx], [field]: val };
    setPathParams(updated);
  };

  // Query Param helpers
  const addQueryParam = () => {
    setQueryParams([
      ...queryParams,
      { id: `q_${Date.now()}`, key: '', value: '', required: false, description: '' }
    ]);
  };
  const removeQueryParam = (idx: number) => {
    setQueryParams(queryParams.filter((_, i) => i !== idx));
  };
  const updateQueryParam = (idx: number, field: keyof KeyValueItem, val: any) => {
    const updated = [...queryParams];
    updated[idx] = { ...updated[idx], [field]: val };
    setQueryParams(updated);
  };

  // Response helpers
  const addResponse = (statusCode = 200, statusText = 'OK') => {
    setResponses([
      ...responses,
      {
        id: `res_${Date.now()}`,
        statusCode,
        statusText,
        description: '',
        body: JSON.stringify({ message: statusText }, null, 2)
      }
    ]);
  };
  const removeResponse = (idx: number) => {
    if (responses.length <= 1) {
      onNotification('At least one response status is required.');
      return;
    }
    setResponses(responses.filter((_, i) => i !== idx));
  };
  const updateResponse = (idx: number, field: keyof ApiResponseDef, val: any) => {
    const updated = [...responses];
    updated[idx] = { ...updated[idx], [field]: val };
    setResponses(updated);
  };

  // Validate and submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!path.trim() || path.trim() === '/') {
      newErrors.path = 'API path is required (e.g. /api/v1/users)';
    } else if (!path.startsWith('/')) {
      newErrors.path = 'API path must start with a leading slash /';
    }

    if (!title.trim()) {
      newErrors.title = 'Title is required (e.g. Fetch User Profile)';
    }

    if (!service.trim()) {
      newErrors.service = 'Service/Controller name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      onNotification('Please fill in all required fields');
      return;
    }

    const payload: ApiEndpoint = {
      id: initialEndpoint?.id || '',
      title: title.trim(),
      service: service.trim(),
      path: path.trim(),
      method,
      summary: summary.trim(),
      businessRules: businessRules.trim(),
      headers: headers.filter((h) => h.key.trim().length > 0),
      pathParams: pathParams.filter((p) => p.key.trim().length > 0),
      queryParams: queryParams.filter((q) => q.key.trim().length > 0),
      requestBody: {
        contentType: bodyContentType,
        rawBody: rawBody.trim()
      },
      responses,
      createdAt: initialEndpoint?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(payload);
  };

  const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

  const methodOptions = HTTP_METHODS.map((m) => ({
    value: m,
    label: m,
    badge: <MethodBadge method={m} size="sm" />,
    badgeOnly: true,
  }));
  const contentTypeOptions = [
    { value: 'none', label: 'none (No Body)' },
    { value: 'application/json', label: 'application/json' },
    { value: 'multipart/form-data', label: 'multipart/form-data' },
    { value: 'application/x-www-form-urlencoded', label: 'application/x-www-form-urlencoded' },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DDD3]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-[#78716C] hover:text-[#292524] hover:bg-[#FFFFFF] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#292524]">
              {isEditing ? 'Edit API Documentation' : 'Add New API Documentation'}
            </h1>
            <p className="text-xs text-[#78716C] mt-0.5">
              Specify routes, business invariants, headers, payloads, and response models
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={onCancel}
            className="h-9 px-4 text-xs font-semibold rounded-lg bg-[#FFFFFF] text-[#78716C] hover:text-[#292524] border border-[#E3DDD3] transition-colors shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="h-9 inline-flex items-center gap-2 px-5 text-xs font-semibold rounded-lg bg-[#C26D53] hover:bg-[#A8543B] text-[#FFFFFF] shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save API</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Route & Core Metadata */}
        <div className="bg-[#FFFFFF] border border-[#E3DDD3] rounded-xl p-6 sm:p-7 shadow-xs space-y-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#78716C] font-mono pb-2 border-b border-[#E3DDD3]/60">
            1. Endpoint Definition & Controller
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* HTTP Method */}
            <div className="md:col-span-3 space-y-1">
              <label className="block text-xs font-semibold text-[#292524]">
                HTTP Method <span className="text-[#8A372E]">*</span>
              </label>
              <div className="w-full">
                <CustomSelect
                  options={methodOptions}
                  value={method}
                  onChange={(e) => setMethod(e.target.value as HttpMethod)}
                  className="w-full font-mono font-semibold"
                />
              </div>
            </div>

            {/* API Path */}
            <div className="md:col-span-9 space-y-1">
              <label className="block text-xs font-semibold text-[#292524]">
                API Path <span className="text-[#8A372E]">*</span>
              </label>
              <input
                type="text"
                value={path}
                onChange={(e) => handlePathChange(e.target.value)}
                placeholder="/api/v1/resource/:id"
                className={`w-full h-9 px-3 text-xs font-mono rounded-lg border ${
                  errors.path ? 'border-[#8A372E]' : 'border-[#E3DDD3]'
                } bg-[#F7F5F0] text-[#292524] focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#C26D53]`}
              />
              {errors.path && <p className="text-[11px] text-[#8A372E]">{errors.path}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#292524]">
                Endpoint Title / Name <span className="text-[#8A372E]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fetch Single User Profile"
                className={`w-full h-9 px-3 text-xs rounded-lg border ${
                  errors.title ? 'border-[#8A372E]' : 'border-[#E3DDD3]'
                } bg-[#F7F5F0] text-[#292524] focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#C26D53]`}
              />
              {errors.title && <p className="text-[11px] text-[#8A372E]">{errors.title}</p>}
            </div>

            {/* Service / Controller */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#292524]">
                Service / Controller <span className="text-[#8A372E]">*</span>
              </label>
              <input
                type="text"
                list="service-suggestions"
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="e.g. UserController, BillingController"
                className={`w-full h-9 px-3 text-xs font-mono rounded-lg border ${
                  errors.service ? 'border-[#8A372E]' : 'border-[#E3DDD3]'
                } bg-[#F7F5F0] text-[#292524] focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#C26D53]`}
              />
              <datalist id="service-suggestions">
                {existingServices.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
              {errors.service && <p className="text-[11px] text-[#8A372E]">{errors.service}</p>}
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#292524]">Summary & Purpose</label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief 1-2 sentence description of what this endpoint does"
              className="w-full h-9 px-3 text-xs rounded-lg border border-[#E3DDD3] bg-[#F7F5F0] text-[#292524] focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#C26D53]"
            />
          </div>
        </div>

        {/* Section 2: Business Rules & Domain Logic (First Class) */}
        <div className="bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl p-6 sm:p-7 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8DFC8]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#CFA058]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#292524] font-mono">
                2. Business Rules & Governance
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[#78716C]">Markdown formatted</span>
          </div>

          <p className="text-xs text-[#78716C] leading-relaxed">
            Record operational constraints, authentication tiers, validation thresholds, idempotency requirements, or business edge cases.
          </p>

          <textarea
            rows={5}
            value={businessRules}
            onChange={(e) => setBusinessRules(e.target.value)}
            placeholder={`### Invariants & Access Control\n- Only users with ROLE_ADMIN or account owner can execute this action.\n- Requests over $5,000 require 2FA authorization token.\n- Returns 404 if the record is soft-deleted unless includeDeleted=true.\n- Emits audit log AUDIT_EVENT_CREATED on success.`}
            className="w-full p-3.5 text-xs font-mono leading-relaxed rounded-lg border border-[#E8DFC8] bg-[#FFFFFF] text-[#292524] placeholder-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#C26D53]"
          />
        </div>

        {/* Section 3: Request Headers & Parameters */}
        <div className="bg-[#FFFFFF] border border-[#E3DDD3] rounded-xl p-6 sm:p-7 shadow-xs space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#78716C] font-mono pb-2 border-b border-[#E3DDD3]/60">
            3. Headers & Parameters
          </h2>

          {/* Headers Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#292524]">Request Headers</span>
              <button
                type="button"
                onClick={addHeader}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C26D53] hover:text-[#A8543B]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Header</span>
              </button>
            </div>

            {headers.length === 0 ? (
              <p className="text-xs text-[#78716C] italic">No headers configured.</p>
            ) : (
              <div className="space-y-2">
                {headers.map((h, idx) => (
                  <div key={h.id || idx} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Header Name (e.g. Authorization)"
                      value={h.key}
                      onChange={(e) => updateHeader(idx, 'key', e.target.value)}
                      className="col-span-4 min-w-0 w-full px-2.5 py-1.5 text-xs font-mono text-[#292524] placeholder-[#A8A29E] rounded-md border border-[#E3DDD3] bg-[#F7F5F0] focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#C26D53] focus:border-[#C26D53]"
                    />
                    <input
                      type="text"
                      placeholder="Example Value (e.g. Bearer <token>)"
                      value={h.value}
                      onChange={(e) => updateHeader(idx, 'value', e.target.value)}
                      className="col-span-4 min-w-0 w-full px-2.5 py-1.5 text-xs font-mono text-[#292524] placeholder-[#A8A29E] rounded-md border border-[#E3DDD3] bg-[#F7F5F0] focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#C26D53] focus:border-[#C26D53]"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={h.description || ''}
                      onChange={(e) => updateHeader(idx, 'description', e.target.value)}
                      className="col-span-2 min-w-0 w-full px-2.5 py-1.5 text-xs text-[#292524] placeholder-[#A8A29E] rounded-md border border-[#E3DDD3] bg-[#F7F5F0] focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#C26D53] focus:border-[#C26D53]"
                    />
                    <div className="col-span-1 flex items-center justify-center">
                      <label className="flex items-center gap-1 text-[10px] text-[#78716C] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={h.required}
                          onChange={(e) => updateHeader(idx, 'required', e.target.checked)}
                          className="rounded text-[#C26D53] focus:ring-[#C26D53]"
                        />
                        <span>Req</span>
                      </label>
                    </div>
                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => removeHeader(idx)}
                        className="p-1 text-[#78716C] hover:text-[#8A372E]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Path Parameters Table */}
          <div className="space-y-3 pt-3 border-t border-[#E3DDD3]/60">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#292524]">Path Parameters</span>
                <span className="text-[11px] text-[#78716C] ml-2">(Variables inside the route)</span>
              </div>
              <button
                type="button"
                onClick={addPathParam}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C26D53] hover:text-[#A8543B]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Path Param</span>
              </button>
            </div>

            {pathParams.length === 0 ? (
              <p className="text-xs text-[#78716C] italic">No path parameters in current route.</p>
            ) : (
              <div className="space-y-2">
                {pathParams.map((p, idx) => (
                  <div key={p.id || idx} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Param Name (e.g. id)"
                      value={p.key}
                      onChange={(e) => updatePathParam(idx, 'key', e.target.value)}
                      className="col-span-4 min-w-0 w-full px-2.5 py-1.5 text-xs font-mono text-[#292524] placeholder-[#A8A29E] rounded-md border border-[#E3DDD3] bg-[#F7F5F0] focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#C26D53] focus:border-[#C26D53]"
                    />
                    <input
                      type="text"
                      placeholder="Sample Value (e.g. usr_123)"
                      value={p.value}
                      onChange={(e) => updatePathParam(idx, 'value', e.target.value)}
                      className="col-span-4 min-w-0 w-full px-2.5 py-1.5 text-xs font-mono text-[#292524] placeholder-[#A8A29E] rounded-md border border-[#E3DDD3] bg-[#F7F5F0] focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#C26D53] focus:border-[#C26D53]"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={p.description || ''}
                      onChange={(e) => updatePathParam(idx, 'description', e.target.value)}
                      className="col-span-3 min-w-0 w-full px-2.5 py-1.5 text-xs text-[#292524] placeholder-[#A8A29E] rounded-md border border-[#E3DDD3] bg-[#F7F5F0] focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#C26D53] focus:border-[#C26D53]"
                    />
                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => removePathParam(idx)}
                        className="p-1 text-[#78716C] hover:text-[#8A372E]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Query Parameters Table */}
          <div className="space-y-3 pt-3 border-t border-[#E3DDD3]/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#292524]">Query Parameters</span>
              <button
                type="button"
                onClick={addQueryParam}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C26D53] hover:text-[#A8543B]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Query Param</span>
              </button>
            </div>

            {queryParams.length === 0 ? (
              <p className="text-xs text-[#78716C] italic">No query parameters defined.</p>
            ) : (
              <div className="space-y-2">
                {queryParams.map((q, idx) => (
                  <div key={q.id || idx} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Param Name (e.g. page)"
                      value={q.key}
                      onChange={(e) => updateQueryParam(idx, 'key', e.target.value)}
                      className="col-span-4 min-w-0 w-full px-2.5 py-1.5 text-xs font-mono text-[#292524] placeholder-[#A8A29E] rounded-md border border-[#E3DDD3] bg-[#F7F5F0] focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#C26D53] focus:border-[#C26D53]"
                    />
                    <input
                      type="text"
                      placeholder="Sample Value (e.g. 1)"
                      value={q.value}
                      onChange={(e) => updateQueryParam(idx, 'value', e.target.value)}
                      className="col-span-4 min-w-0 w-full px-2.5 py-1.5 text-xs font-mono text-[#292524] placeholder-[#A8A29E] rounded-md border border-[#E3DDD3] bg-[#F7F5F0] focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#C26D53] focus:border-[#C26D53]"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={q.description || ''}
                      onChange={(e) => updateQueryParam(idx, 'description', e.target.value)}
                      className="col-span-2 min-w-0 w-full px-2.5 py-1.5 text-xs text-[#292524] placeholder-[#A8A29E] rounded-md border border-[#E3DDD3] bg-[#F7F5F0] focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#C26D53] focus:border-[#C26D53]"
                    />
                    <div className="col-span-1 flex items-center justify-center">
                      <label className="flex items-center gap-1 text-[10px] text-[#78716C] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => updateQueryParam(idx, 'required', e.target.checked)}
                          className="rounded text-[#C26D53] focus:ring-[#C26D53]"
                        />
                        <span>Req</span>
                      </label>
                    </div>
                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => removeQueryParam(idx)}
                        className="p-1 text-[#78716C] hover:text-[#8A372E]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Request Body with Production-Grade JsonCodeEditor */}
        <div className="bg-[#FFFFFF] border border-[#E3DDD3] rounded-xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E3DDD3]/60">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#78716C] font-mono">
                4. Request Body Payload
              </h2>
              <p className="text-xs text-[#78716C] mt-0.5">
                Auto-formatted with syntax validation and line numbers
              </p>
            </div>
            <div className="w-full sm:w-64 shrink-0">
              <CustomSelect
                options={contentTypeOptions}
                value={bodyContentType}
                onChange={(e) => setBodyContentType(e.target.value as any)}
                className="w-full font-mono text-xs"
                menuWidth="auto"
                align="right"
              />
            </div>
          </div>

          {bodyContentType !== 'none' ? (
            <JsonCodeEditor
              label={`${bodyContentType} payload`}
              value={rawBody}
              onChange={setRawBody}
              placeholder={`{\n  "name": "Jane Doe",\n  "email": "jane@example.com"\n}`}
              minHeight="160px"
            />
          ) : (
            <p className="text-xs text-[#78716C] italic py-2">
              No request body configured for this endpoint ({method}).
            </p>
          )}
        </div>

        {/* Section 5: Responses Builder with JsonCodeEditor */}
        <div className="bg-[#FFFFFF] border border-[#E3DDD3] rounded-xl p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E3DDD3]/60">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#78716C] font-mono">
                5. Documented Responses
              </h2>
              <p className="text-xs text-[#78716C]">
                Define expected HTTP status codes, error payloads, and success contracts
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-[#78716C] font-mono mr-1">Quick Add:</span>
              <button
                type="button"
                onClick={() => addResponse(200, 'OK')}
                className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#E5EFE7] text-[#265937] hover:bg-[#d5e7d9]"
              >
                +200
              </button>
              <button
                type="button"
                onClick={() => addResponse(201, 'Created')}
                className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#E5EFE7] text-[#265937] hover:bg-[#d5e7d9]"
              >
                +201
              </button>
              <button
                type="button"
                onClick={() => addResponse(400, 'Bad Request')}
                className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#FAF0DF] text-[#7C5318] hover:bg-[#f3e5ca]"
              >
                +400
              </button>
              <button
                type="button"
                onClick={() => addResponse(404, 'Not Found')}
                className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#FAF0DF] text-[#7C5318] hover:bg-[#f3e5ca]"
              >
                +404
              </button>
              <button
                type="button"
                onClick={() => addResponse(500, 'Internal Server Error')}
                className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#F9E7E4] text-[#8A372E] hover:bg-[#f5d7d3]"
              >
                +500
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {responses.map((res, idx) => (
              <div
                key={res.id || idx}
                className="p-5 rounded-xl border border-[#E3DDD3] bg-[#F7F5F0]/60 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {/* Status Code */}
                    <input
                      type="number"
                      value={res.statusCode}
                      onChange={(e) => updateResponse(idx, 'statusCode', parseInt(e.target.value) || 200)}
                      className="w-20 px-2.5 py-1 text-xs font-mono font-bold rounded-md border border-[#E3DDD3] bg-[#FFFFFF] text-[#292524] placeholder-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#C26D53] focus:border-[#C26D53]"
                    />
                    {/* Status Text */}
                    <input
                      type="text"
                      placeholder="Status Text (e.g. OK)"
                      value={res.statusText}
                      onChange={(e) => updateResponse(idx, 'statusText', e.target.value)}
                      className="w-36 px-2.5 py-1 text-xs font-semibold rounded-md border border-[#E3DDD3] bg-[#FFFFFF] text-[#292524] placeholder-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#C26D53] focus:border-[#C26D53]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeResponse(idx)}
                    className="p-1.5 rounded text-[#78716C] hover:text-[#8A372E] hover:bg-[#FFFFFF] transition-colors"
                    title="Delete response status"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Description */}
                <input
                  type="text"
                  placeholder="Response description or trigger conditions"
                  value={res.description}
                  onChange={(e) => updateResponse(idx, 'description', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-[#E3DDD3] bg-[#FFFFFF] text-[#292524] placeholder-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#C26D53] focus:border-[#C26D53]"
                />

                {/* Response Body with JsonCodeEditor */}
                <div>
                  <JsonCodeEditor
                    label={`Response ${res.statusCode} Payload`}
                    value={res.body}
                    onChange={(val) => updateResponse(idx, 'body', val)}
                    placeholder={`{\n  "data": { ... }\n}`}
                    minHeight="140px"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#E3DDD3] flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="h-9 px-4 text-xs font-semibold rounded-lg bg-[#FFFFFF] text-[#78716C] hover:text-[#292524] border border-[#E3DDD3] transition-colors shadow-2xs"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="h-9 inline-flex items-center gap-2 px-6 text-xs font-semibold rounded-lg bg-[#C26D53] hover:bg-[#A8543B] text-[#FFFFFF] shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save API Documentation</span>
          </button>
        </div>
      </form>
    </div>
  );
};
