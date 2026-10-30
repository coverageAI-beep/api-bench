import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  getSettings,
  saveSettings,
  saveCursorKey,
  getStorageDirectory,
} from './src/lib/config-manager';
import {
  getAllStoredEndpoints,
  getStoredEndpointById,
  saveStoredEndpoint,
  deleteStoredEndpoint,
  clearAllStoredEndpoints,
  migrateDirectoryContents,
  countStoredEndpoints,
} from './src/lib/local-db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const isProd = process.env.NODE_ENV === 'production';
  const port = 3000;

  app.use(express.json({ limit: '10mb' }));

  // --- API Endpoints ---

  // 1. Settings: GET
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await getSettings();
      const fileCount = await countStoredEndpoints();
      res.json({
        success: true,
        settings: {
          ...settings,
          fileCount,
        },
      });
    } catch (err) {
      console.error('Error fetching settings:', err);
      res.status(500).json({ success: false, error: 'Failed to read settings' });
    }
  });

  // 2. Settings: POST
  app.post('/api/settings', async (req, res) => {
    try {
      const {
        workspaceName,
        defaultBaseUrl,
        requestTimeoutSeconds,
        autoFormatJson,
        wordWrap,
        defaultContentType,
        globalAuthHeader,
        theme,
        storagePath,
        cursorApiKey,
        migrateExisting,
      } = req.body;

      const prevDir = await getStorageDirectory();

      await saveSettings({
        workspaceName,
        defaultBaseUrl,
        requestTimeoutSeconds,
        autoFormatJson,
        wordWrap,
        defaultContentType,
        globalAuthHeader,
        theme,
        ...(storagePath ? { storagePath } : {}),
      });

      const newDir = await getStorageDirectory();

      let migratedCount = 0;
      if (migrateExisting && prevDir !== newDir) {
        const result = await migrateDirectoryContents(prevDir, newDir);
        migratedCount = result.count;
      }

      if (cursorApiKey && typeof cursorApiKey === 'string' && cursorApiKey.trim().length > 0) {
        await saveCursorKey(cursorApiKey);
      }

      const updated = await getSettings();
      const fileCount = await countStoredEndpoints();

      res.json({
        success: true,
        migratedCount,
        settings: {
          ...updated,
          fileCount,
        },
      });
    } catch (err) {
      console.error('Error saving settings:', err);
      res.status(500).json({ success: false, error: 'Failed to save settings' });
    }
  });

  // 3. APIs: Bulk Import
  app.post('/api/apis/import', async (req, res) => {
    try {
      const { endpoints: importedList, mode } = req.body;
      if (!Array.isArray(importedList)) {
        res.status(400).json({ success: false, error: 'Invalid JSON array of endpoints' });
        return;
      }
      if (mode === 'replace') {
        const existing = await getAllStoredEndpoints();
        for (const ep of existing) {
          await deleteStoredEndpoint(ep.id);
        }
      }
      for (const ep of importedList) {
        if (ep && ep.path && ep.method) {
          await saveStoredEndpoint(ep);
        }
      }
      const endpoints = await getAllStoredEndpoints();
      res.json({ success: true, count: endpoints.length, endpoints });
    } catch (err) {
      console.error('Error importing endpoints:', err);
      res.status(500).json({ success: false, error: 'Failed to import endpoints' });
    }
  });

  // 3. Cursor API Key: POST
  app.post('/api/settings/cursor-key', async (req, res) => {
    try {
      const { apiKey } = req.body;
      if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
        res.status(400).json({ success: false, error: 'API key is required' });
        return;
      }
      await saveCursorKey(apiKey);
      res.json({
        success: true,
        message: 'Cursor AI API key securely saved in ~/.apibench/credentials.json (0600 permissions)',
      });
    } catch (err) {
      console.error('Error saving cursor key:', err);
      res.status(500).json({ success: false, error: 'Failed to store credentials' });
    }
  });

  // 4. APIs: GET all
  app.get('/api/apis', async (req, res) => {
    try {
      const endpoints = await getAllStoredEndpoints();
      res.json({ success: true, endpoints });
    } catch (err) {
      console.error('Error fetching endpoints:', err);
      res.status(500).json({ success: false, error: 'Failed to read endpoints' });
    }
  });

  // 5. APIs: GET single by ID
  app.get('/api/apis/:id', async (req, res) => {
    try {
      const endpoint = await getStoredEndpointById(req.params.id);
      if (!endpoint) {
        res.status(404).json({ success: false, error: 'Endpoint not found' });
        return;
      }
      res.json({ success: true, endpoint });
    } catch (err) {
      console.error('Error fetching endpoint:', err);
      res.status(500).json({ success: false, error: 'Failed to read endpoint' });
    }
  });

  // 6. APIs: POST / PUT save
  app.post('/api/apis', async (req, res) => {
    try {
      const saved = await saveStoredEndpoint(req.body);
      res.json({ success: true, endpoint: saved });
    } catch (err) {
      console.error('Error saving endpoint:', err);
      res.status(500).json({ success: false, error: 'Failed to save endpoint' });
    }
  });

  // 7. APIs: DELETE
  app.delete('/api/apis/:id', async (req, res) => {
    try {
      const success = await deleteStoredEndpoint(req.params.id);
      res.json({ success });
    } catch (err) {
      console.error('Error deleting endpoint:', err);
      res.status(500).json({ success: false, error: 'Failed to delete endpoint' });
    }
  });

  // 8. APIs: Clear all
  app.post('/api/apis/clear', async (req, res) => {
    try {
      await clearAllStoredEndpoints();
      res.json({ success: true, endpoints: [] });
    } catch (err) {
      console.error('Error clearing endpoints:', err);
      res.status(500).json({ success: false, error: 'Failed to clear endpoints' });
    }
  });

  // --- Static / Dev Integration ---
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[APIBench] Full-stack server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('[APIBench] Failed to launch server:', err);
  process.exit(1);
});
