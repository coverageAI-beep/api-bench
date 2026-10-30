import fs from 'fs/promises';
import path from 'path';
import { ApiEndpoint } from '../types/api';
import { getStorageDirectory } from './config-manager';

function sanitizeSlug(text: string): string {
  return text
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_');
}

export function generateFilename(endpoint: Pick<ApiEndpoint, 'service' | 'method' | 'path'>): string {
  const service = sanitizeSlug(endpoint.service || 'DefaultController');
  const method = (endpoint.method || 'GET').toUpperCase();
  const pathPart = sanitizeSlug(endpoint.path || 'root');
  return `${service}__${method}__${pathPart}.json`;
}

// Ensure the storage directory exists
export async function ensureInitializedStorage(): Promise<string> {
  const dir = await getStorageDirectory();
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    console.error('Error verifying storage directory initialization:', err);
  }
  return dir;
}

// 1. Get all stored API endpoints from active storage directory
export async function getAllStoredEndpoints(): Promise<ApiEndpoint[]> {
  const dir = await ensureInitializedStorage();
  try {
    const entries = await fs.readdir(dir);
    const jsonFiles = entries.filter((f) => f.endsWith('.json'));

    const endpoints: ApiEndpoint[] = [];
    for (const filename of jsonFiles) {
      try {
        const fullPath = path.join(dir, filename);
        const content = await fs.readFile(fullPath, 'utf-8');
        const parsed = JSON.parse(content) as ApiEndpoint;
        if (parsed && parsed.id && parsed.path && parsed.method) {
          endpoints.push(parsed);
        }
      } catch (fileErr) {
        console.warn(`Skipping unparseable JSON file: ${filename}`, fileErr);
      }
    }

    // Sort by updatedAt descending
    return endpoints.sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  } catch (err) {
    console.error('Failed to read endpoints from storage directory:', err);
    return [];
  }
}

// 2. Get single endpoint by ID
export async function getStoredEndpointById(id: string): Promise<ApiEndpoint | null> {
  const all = await getAllStoredEndpoints();
  return all.find((ep) => ep.id === id) || null;
}

// 3. Save or update an endpoint to active storage directory
export async function saveStoredEndpoint(
  endpoint: Omit<ApiEndpoint, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<ApiEndpoint> {
  const dir = await ensureInitializedStorage();
  const all = await getAllStoredEndpoints();
  const now = new Date().toISOString();

  const sanitizedService = (endpoint.service || 'DefaultController').toLowerCase().replace(/[^a-z0-9_-]/g, '_').replace(/_+/g, '_');
  const sanitizedPath = (endpoint.path || 'root').replace(/^\/+|\/+$/g, '').toLowerCase().replace(/[^a-z0-9_-]/g, '_').replace(/_+/g, '_') || 'root';
  const generatedId = `${sanitizedService}-${endpoint.method.toLowerCase()}-${sanitizedPath}`.replace(/-+/g, '-');

  const targetId = endpoint.id || generatedId;
  const existing = all.find((e) => e.id === targetId || (endpoint.id && e.id === endpoint.id));

  let recordToSave: ApiEndpoint;
  if (existing) {
    recordToSave = {
      ...existing,
      ...endpoint,
      id: targetId,
      updatedAt: now,
    };
  } else {
    recordToSave = {
      ...endpoint,
      id: targetId,
      createdAt: now,
      updatedAt: now,
    };
  }

  const newFilename = generateFilename(recordToSave);
  const newFilePath = path.join(dir, newFilename);

  // If old file had a different name (e.g. method or path was edited), remove old file
  try {
    const entries = await fs.readdir(dir);
    for (const f of entries.filter((e) => e.endsWith('.json'))) {
      if (f === newFilename) continue;
      const testPath = path.join(dir, f);
      try {
        const raw = await fs.readFile(testPath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.id === recordToSave.id) {
          await fs.unlink(testPath);
        }
      } catch {
        // ignore
      }
    }
  } catch (scanErr) {
    console.warn('Failed to clean up old file variant:', scanErr);
  }

  await fs.writeFile(newFilePath, JSON.stringify(recordToSave, null, 2), 'utf-8');
  return recordToSave;
}

// 4. Delete endpoint from storage directory
export async function deleteStoredEndpoint(id: string): Promise<boolean> {
  const dir = await ensureInitializedStorage();
  try {
    const entries = await fs.readdir(dir);
    let deleted = false;
    for (const f of entries.filter((e) => e.endsWith('.json'))) {
      const fullPath = path.join(dir, f);
      try {
        const raw = await fs.readFile(fullPath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.id === id) {
          await fs.unlink(fullPath);
          deleted = true;
        }
      } catch {
        // ignore
      }
    }
    return deleted;
  } catch (err) {
    console.error('Failed to delete endpoint file:', err);
    return false;
  }
}

// 5. Clear all endpoints from storage directory
export async function clearAllStoredEndpoints(): Promise<void> {
  const dir = await ensureInitializedStorage();
  try {
    const entries = await fs.readdir(dir);
    for (const f of entries.filter((e) => e.endsWith('.json'))) {
      await fs.unlink(path.join(dir, f));
    }
  } catch (err) {
    console.error('Failed to clear storage:', err);
  }
}

// 6. Migrate endpoints between directories
export async function migrateDirectoryContents(sourceDir: string, targetDir: string): Promise<{ count: number }> {
  try {
    await fs.mkdir(targetDir, { recursive: true });
    const entries = await fs.readdir(sourceDir);
    const jsonFiles = entries.filter((f) => f.endsWith('.json'));
    let count = 0;
    for (const f of jsonFiles) {
      const srcFile = path.join(sourceDir, f);
      const destFile = path.join(targetDir, f);
      const content = await fs.readFile(srcFile, 'utf-8');
      await fs.writeFile(destFile, content, 'utf-8');
      count++;
    }
    return { count };
  } catch (err) {
    console.error('Failed to migrate directory files:', err);
    return { count: 0 };
  }
}

// 7. Count files in directory
export async function countStoredEndpoints(): Promise<number> {
  try {
    const dir = await getStorageDirectory();
    const entries = await fs.readdir(dir);
    return entries.filter((f) => f.endsWith('.json')).length;
  } catch {
    return 0;
  }
}
