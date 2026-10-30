import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.apibench');
const CREDENTIALS_FILE = path.join(CONFIG_DIR, 'credentials.json');
const SETTINGS_FILE = path.join(CONFIG_DIR, 'settings.json');
const DEFAULT_DATA_DIR = path.join(CONFIG_DIR, 'data', 'apis');

export interface UserSettings {
  workspaceName?: string;
  defaultBaseUrl?: string;
  requestTimeoutSeconds?: number;
  autoFormatJson?: boolean;
  wordWrap?: boolean;
  defaultContentType?: string;
  globalAuthHeader?: string;
  theme?: 'earth' | 'slate';
  storagePath?: string;
}

export interface SettingsResponse extends UserSettings {
  workspaceName: string;
  defaultBaseUrl: string;
  requestTimeoutSeconds: number;
  autoFormatJson: boolean;
  wordWrap: boolean;
  defaultContentType: string;
  globalAuthHeader: string;
  theme: 'earth' | 'slate';
  storagePath: string;
  hasCursorKey: boolean;
  cursorApiKeyMasked: string | null;
  activeStorageDir: string;
  isOneDrive: boolean;
}

// Ensure the ~/.apibench directory exists with strict permissions (rwx------)
export async function ensureConfigDir(): Promise<void> {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 });
  } catch (err) {
    // Directory already exists or permissions handled
  }
}

// 1. Save Cursor API Key securely with 0600 permissions
export async function saveCursorKey(apiKey: string): Promise<void> {
  await ensureConfigDir();
  const trimmed = apiKey.trim();
  const data = {
    cursorApiKey: trimmed,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(CREDENTIALS_FILE, JSON.stringify(data, null, 2), { mode: 0o600 });
}

// 2. Read Cursor API Key
export async function getCursorKey(): Promise<string | null> {
  try {
    const raw = await fs.readFile(CREDENTIALS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed.cursorApiKey || null;
  } catch {
    return null;
  }
}

// 3. Resolve Active API Storage Directory (Handles custom OneDrive paths & ~ expansion)
export async function getStorageDirectory(): Promise<string> {
  await ensureConfigDir();
  try {
    const raw = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const settings: UserSettings = JSON.parse(raw);
    if (settings.storagePath && settings.storagePath.trim()) {
      let resolved = settings.storagePath.trim();
      if (resolved.startsWith('~')) {
        resolved = path.join(os.homedir(), resolved.slice(1));
      }
      resolved = path.resolve(resolved);
      await fs.mkdir(resolved, { recursive: true });
      return resolved;
    }
  } catch {
    // Settings file does not exist yet; fall back to default
  }

  await fs.mkdir(DEFAULT_DATA_DIR, { recursive: true });
  return DEFAULT_DATA_DIR;
}

// 4. Save User Settings (Storage Path, Theme, etc.)
export async function saveSettings(newSettings: Partial<UserSettings>): Promise<void> {
  await ensureConfigDir();
  let current: UserSettings = {
    storagePath: DEFAULT_DATA_DIR,
    theme: 'earth',
  };

  try {
    const raw = await fs.readFile(SETTINGS_FILE, 'utf-8');
    current = { ...current, ...JSON.parse(raw) };
  } catch {
    // file doesn't exist yet
  }

  const updated: UserSettings = {
    ...current,
    ...newSettings,
  };

  // Ensure target storage path exists
  let targetPath = (updated.storagePath || DEFAULT_DATA_DIR).trim();
  if (targetPath.startsWith('~')) {
    targetPath = path.join(os.homedir(), targetPath.slice(1));
  }
  await fs.mkdir(path.resolve(targetPath), { recursive: true });

  await fs.writeFile(SETTINGS_FILE, JSON.stringify(updated, null, 2), { mode: 0o600 });
}

// 5. Get Settings with clean user configuration
export async function getSettings(): Promise<SettingsResponse> {
  await ensureConfigDir();
  let settings: UserSettings = {
    workspaceName: 'Production API Workspace',
    defaultBaseUrl: 'http://localhost:8080',
    requestTimeoutSeconds: 30,
    autoFormatJson: true,
    wordWrap: false,
    defaultContentType: 'application/json',
    globalAuthHeader: '',
    theme: 'earth',
    storagePath: DEFAULT_DATA_DIR,
  };

  try {
    const raw = await fs.readFile(SETTINGS_FILE, 'utf-8');
    settings = { ...settings, ...JSON.parse(raw) };
  } catch {
    // Default settings
  }

  const cursorKey = await getCursorKey();
  const activeDir = await getStorageDirectory();
  const isOneDrive =
    activeDir.toLowerCase().includes('onedrive') ||
    activeDir.toLowerCase().includes('cloudstorage') ||
    (settings.storagePath || '').toLowerCase().includes('onedrive');

  const cursorApiKeyMasked =
    cursorKey && cursorKey.length > 8
      ? `${cursorKey.slice(0, 4)}••••••••${cursorKey.slice(-4)}`
      : cursorKey
      ? '••••••••'
      : null;

  return {
    workspaceName: settings.workspaceName || 'Production API Workspace',
    defaultBaseUrl: settings.defaultBaseUrl || 'http://localhost:8080',
    requestTimeoutSeconds: Number(settings.requestTimeoutSeconds) || 30,
    autoFormatJson: settings.autoFormatJson !== false,
    wordWrap: Boolean(settings.wordWrap),
    defaultContentType: settings.defaultContentType || 'application/json',
    globalAuthHeader: settings.globalAuthHeader || '',
    theme: settings.theme || 'earth',
    storagePath: settings.storagePath || DEFAULT_DATA_DIR,
    hasCursorKey: Boolean(cursorKey && cursorKey.length > 0),
    cursorApiKeyMasked,
    activeStorageDir: activeDir,
    isOneDrive,
  };
}

export function getDefaultDataDir(): string {
  return DEFAULT_DATA_DIR;
}

export function getConfigDir(): string {
  return CONFIG_DIR;
}
