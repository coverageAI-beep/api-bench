import { ApiEndpoint, UserPreferences } from '../types/api';

const STORAGE_KEY = 'apibench_endpoints_v1';
const UPDATE_EVENT = 'apibench_storage_update';

let inMemoryCache: ApiEndpoint[] | null = null;
let isInitialSyncDone = false;

export const DEFAULT_PREFERENCES: UserPreferences = {
  workspaceName: 'Production API Workspace',
  defaultBaseUrl: 'http://localhost:8080',
  requestTimeoutSeconds: 30,
  autoFormatJson: true,
  wordWrap: false,
  defaultContentType: 'application/json',
  globalAuthHeader: '',
  theme: 'earth',
};

const PREFERENCES_KEY = 'apibench_preferences_v1';

export interface ClientSettingsData {
  workspaceName?: string;
  defaultBaseUrl?: string;
  requestTimeoutSeconds?: number;
  autoFormatJson?: boolean;
  wordWrap?: boolean;
  defaultContentType?: string;
  globalAuthHeader?: string;
  theme?: 'earth' | 'slate';
  storagePath?: string;
  hasCursorKey?: boolean;
  cursorApiKeyMasked?: string | null;
  activeStorageDir?: string;
  isOneDrive?: boolean;
  fileCount?: number;
}

// Safe localStorage wrappers to avoid DOMException in sandboxed iframes
function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Sandboxed iframe or cookies disabled
  }
  return null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Sandboxed iframe or cookies disabled
  }
}

// Read cache or localStorage immediately
export function getAllEndpoints(): ApiEndpoint[] {
  if (inMemoryCache) {
    return inMemoryCache;
  }

  const raw = safeGetItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        inMemoryCache = parsed;
        if (!isInitialSyncDone) {
          syncWithServer();
        }
        return parsed;
      }
    } catch {
      // invalid JSON
    }
  }

  inMemoryCache = [];
  if (!isInitialSyncDone) {
    syncWithServer();
  }
  return [];
}

// Background sync with /api/apis
export async function syncWithServer(): Promise<ApiEndpoint[]> {
  isInitialSyncDone = true;
  try {
    const res = await fetch('/api/apis');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.endpoints)) {
      inMemoryCache = data.endpoints;
      safeSetItem(STORAGE_KEY, JSON.stringify(data.endpoints));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: { sync: true } }));
      }
      return data.endpoints;
    }
  } catch (err) {
    // Server endpoint sync fallback to memory cache
  }
  return inMemoryCache || [];
}

export function getEndpointById(id: string): ApiEndpoint | null {
  const all = getAllEndpoints();
  return all.find((e) => e.id === id) || null;
}

export function saveEndpoint(
  endpoint: Omit<ApiEndpoint, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): ApiEndpoint {
  const all = getAllEndpoints();
  const now = new Date().toISOString();

  const sanitizedService = (endpoint.service || 'DefaultController').toLowerCase().replace(/[^a-z0-9_-]/g, '_').replace(/_+/g, '_');
  const sanitizedPath = (endpoint.path || 'root').replace(/^\/+|\/+$/g, '').toLowerCase().replace(/[^a-z0-9_-]/g, '_').replace(/_+/g, '_') || 'root';
  const generatedId = `${sanitizedService}-${endpoint.method.toLowerCase()}-${sanitizedPath}`.replace(/-+/g, '-');

  const targetId = endpoint.id || generatedId;
  const existingIndex = all.findIndex((e) => e.id === targetId || (endpoint.id && e.id === endpoint.id));

  let savedRecord: ApiEndpoint;

  if (existingIndex >= 0) {
    savedRecord = {
      ...all[existingIndex],
      ...endpoint,
      id: targetId,
      updatedAt: now,
    };
    all[existingIndex] = savedRecord;
  } else {
    savedRecord = {
      ...endpoint,
      id: targetId,
      createdAt: now,
      updatedAt: now,
    };
    all.unshift(savedRecord);
  }

  inMemoryCache = [...all];

  safeSetItem(STORAGE_KEY, JSON.stringify(all));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: savedRecord }));
  }

  // Persist to server disk asynchronously
  fetch('/api/apis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(savedRecord),
  }).catch(() => {
    // offline or dev reload
  });

  return savedRecord;
}

export function deleteEndpoint(id: string): boolean {
  const all = getAllEndpoints();
  const filtered = all.filter((e) => e.id !== id);
  inMemoryCache = filtered;

  safeSetItem(STORAGE_KEY, JSON.stringify(filtered));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: { id, deleted: true } }));
  }

  // Delete from backend file storage asynchronously
  fetch(`/api/apis/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }).catch(() => {
    // offline or dev reload
  });

  return true;
}

export async function clearAllEndpoints(): Promise<void> {
  try {
    await fetch('/api/apis/clear', { method: 'POST' });
  } catch {
    // fallback
  }

  inMemoryCache = [];
  safeSetItem(STORAGE_KEY, JSON.stringify([]));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
  }
}

export function getUniqueServices(): string[] {
  const all = getAllEndpoints();
  const set = new Set<string>();
  all.forEach((e) => {
    if (e.service && e.service.trim()) {
      set.add(e.service.trim());
    }
  });
  return Array.from(set).sort();
}

export function subscribeToStorageUpdates(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(UPDATE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(UPDATE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

export function getLocalPreferences(): UserPreferences {
  const raw = safeGetItem(PREFERENCES_KEY);
  if (raw) {
    try {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
    } catch {
      // ignore
    }
  }
  return DEFAULT_PREFERENCES;
}

export function saveLocalPreferences(prefs: Partial<UserPreferences>): UserPreferences {
  const current = getLocalPreferences();
  const updated = { ...current, ...prefs };
  safeSetItem(PREFERENCES_KEY, JSON.stringify(updated));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('apibench_preferences_update', { detail: updated }));
  }
  return updated;
}

// Settings API helpers
export async function fetchServerSettings(): Promise<ClientSettingsData | null> {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && data.settings) {
      // Sync to local preferences
      saveLocalPreferences(data.settings);
      return data.settings;
    }
  } catch (err) {
    console.warn('Failed fetching server settings:', err);
  }
  return getLocalPreferences();
}

export async function saveServerSettings(
  payload: Partial<UserPreferences> & {
    storagePath?: string;
    cursorApiKey?: string;
    migrateExisting?: boolean;
  }
): Promise<{ success: boolean; settings?: ClientSettingsData; migratedCount?: number }> {
  // Update locally first
  saveLocalPreferences(payload);

  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { success: true, settings: getLocalPreferences() };
    const data = await res.json();
    if (data.success) {
      if (payload.storagePath) {
        await syncWithServer();
      }
      return { success: true, settings: data.settings, migratedCount: data.migratedCount };
    }
  } catch (err) {
    console.error('Failed saving server settings:', err);
  }
  return { success: true, settings: getLocalPreferences() };
}

export async function saveCursorApiKey(apiKey: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch('/api/settings/cursor-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
    const data = await res.json();
    return { success: Boolean(data.success), message: data.message };
  } catch (err) {
    console.error('Failed saving cursor key:', err);
    return { success: false };
  }
}

export async function importEndpoints(
  endpoints: ApiEndpoint[],
  mode: 'replace' | 'merge' = 'merge'
): Promise<{ success: boolean; count: number }> {
  try {
    const res = await fetch('/api/apis/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoints, mode }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.endpoints)) {
        inMemoryCache = data.endpoints;
        safeSetItem(STORAGE_KEY, JSON.stringify(data.endpoints));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
        }
        return { success: true, count: data.count || data.endpoints.length };
      }
    }
  } catch (err) {
    console.error('Server import failed, falling back to local memory:', err);
  }

  // Fallback merge
  let combined: ApiEndpoint[] = [];
  if (mode === 'replace') {
    combined = endpoints;
  } else {
    const current = getAllEndpoints();
    const map = new Map<string, ApiEndpoint>();
    current.forEach((e) => map.set(e.id, e));
    endpoints.forEach((e) => map.set(e.id, e));
    combined = Array.from(map.values());
  }

  inMemoryCache = combined;
  safeSetItem(STORAGE_KEY, JSON.stringify(combined));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
  }
  return { success: true, count: combined.length };
}
