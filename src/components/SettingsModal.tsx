import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sliders,
  Code2,
  Database,
  Cloud,
  Key,
  CheckCircle2,
  Download,
  Upload,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  HardDrive,
} from 'lucide-react';
import {
  getLocalPreferences,
  saveServerSettings,
  fetchServerSettings,
  importEndpoints,
  getAllEndpoints,
  ClientSettingsData,
} from '../lib/storage';
import { UserPreferences, ApiEndpoint } from '../types/api';
import { exportToJson, downloadFile } from '../lib/exporters';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotification: (message: string, type?: 'success' | 'info') => void;
}

type TabType = 'onedrive' | 'cursor' | 'editor' | 'backup';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onNotification,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('onedrive');
  const [preferences, setPreferences] = useState<UserPreferences>(getLocalPreferences());
  const [serverSettings, setServerSettings] = useState<ClientSettingsData | null>(null);
  const [storagePath, setStoragePath] = useState('');
  const [migrateExisting, setMigrateExisting] = useState(true);
  const [cursorApiKey, setCursorApiKey] = useState('');
  const [showCursorKey, setShowCursorKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setPreferences(getLocalPreferences());
    setEndpoints(getAllEndpoints());
    setSavedSuccess(false);

    fetchServerSettings().then((settings) => {
      if (settings) {
        setServerSettings(settings);
        setStoragePath(settings.storagePath || '~/.apibench/data/apis');
      }
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const isCurrentOneDrive =
    serverSettings?.isOneDrive ||
    storagePath.toLowerCase().includes('onedrive') ||
    storagePath.toLowerCase().includes('cloudstorage');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    const payload = {
      ...preferences,
      storagePath: storagePath.trim() || undefined,
      migrateExisting,
      cursorApiKey: cursorApiKey.trim() || undefined,
    };

    const result = await saveServerSettings(payload);
    setIsSaving(false);

    if (result.success) {
      setSavedSuccess(true);
      if (result.settings) {
        setServerSettings(result.settings);
      }
      if (cursorApiKey.trim()) {
        setCursorApiKey('');
      }

      onNotification('Preferences updated successfully', 'success');
      setTimeout(() => {
        onClose();
      }, 600);
    } else {
      onNotification('Failed to update preferences', 'info');
    }
  };

  const handleExportWorkspace = () => {
    const jsonStr = exportToJson(endpoints);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(`apibench-workspace-${dateStr}.json`, jsonStr);
    onNotification(`Exported ${endpoints.length} endpoints to JSON backup`, 'success');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      let candidateEndpoints: ApiEndpoint[] = [];
      if (Array.isArray(parsed)) {
        candidateEndpoints = parsed;
      } else if (parsed && Array.isArray(parsed.endpoints)) {
        candidateEndpoints = parsed.endpoints;
      } else {
        throw new Error('Invalid backup file format');
      }

      if (candidateEndpoints.length === 0) {
        onNotification('No endpoints found in file', 'info');
        setImporting(false);
        return;
      }

      const res = await importEndpoints(candidateEndpoints, importMode);
      setEndpoints(getAllEndpoints());
      onNotification(
        `Successfully imported ${res.count} endpoints`,
        'success'
      );
    } catch (err: any) {
      onNotification(err.message || 'Failed to read file', 'info');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#FFFFFF] border border-[#E3DDD3] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E3DDD3] flex items-center justify-between bg-[#F7F5F0]/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C26D53]/15 text-[#C26D53] border border-[#C26D53]/25 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#292524] tracking-tight">
                Settings
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#78716C] hover:text-[#292524] hover:bg-[#EFECE6] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-1.5 border-b border-[#E3DDD3] bg-[#FAF8F5] flex gap-1 sm:gap-2">
          {/* Tab 1: OneDrive */}
          <button
            type="button"
            onClick={() => setActiveTab('onedrive')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'onedrive'
                ? 'border-[#C26D53] text-[#C26D53]'
                : 'border-transparent text-[#78716C] hover:text-[#292524]'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>OneDrive</span>
          </button>

          {/* Tab 2: Cursor AI */}
          <button
            type="button"
            onClick={() => setActiveTab('cursor')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'cursor'
                ? 'border-[#C26D53] text-[#C26D53]'
                : 'border-transparent text-[#78716C] hover:text-[#292524]'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Cursor AI</span>
            {serverSettings?.hasCursorKey && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#5E8268]" />
            )}
          </button>

          {/* Tab 3: Editor */}
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'editor'
                ? 'border-[#C26D53] text-[#C26D53]'
                : 'border-transparent text-[#78716C] hover:text-[#292524]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>

          {/* Tab 4: Backups */}
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'backup'
                ? 'border-[#C26D53] text-[#C26D53]'
                : 'border-transparent text-[#78716C] hover:text-[#292524]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Backups</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: ONEDRIVE & STORAGE */}
          {activeTab === 'onedrive' && (
            <div className="space-y-4">
              {/* Sync Status Badge */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-[#E3DDD3] bg-[#FAF8F5]">
                <div className="flex items-center gap-2 text-xs font-medium text-[#292524]">
                  {isCurrentOneDrive ? (
                    <Cloud className="w-4 h-4 text-[#5E8268]" />
                  ) : (
                    <HardDrive className="w-4 h-4 text-[#78716C]" />
                  )}
                  <span>Storage Mode</span>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    isCurrentOneDrive
                      ? 'bg-[#EAF2ED] text-[#265937] border-[#B8D5C2]'
                      : 'bg-[#FFFFFF] text-[#78716C] border-[#E3DDD3]'
                  }`}
                >
                  {isCurrentOneDrive ? 'OneDrive Synced' : 'Local Storage'}
                </span>
              </div>

              {/* Storage Path Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#292524]">
                  Directory Path
                </label>
                <input
                  type="text"
                  value={storagePath}
                  onChange={(e) => setStoragePath(e.target.value)}
                  placeholder="e.g. ~/OneDrive/APIBench"
                  className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] border border-[#E3DDD3] text-xs font-mono text-[#292524] placeholder-[#A8A29E] focus:outline-none focus:border-[#C26D53] focus:ring-1 focus:ring-[#C26D53]"
                />
              </div>

              {/* Preset Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStoragePath('~/.apibench/data/apis')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    storagePath === '~/.apibench/data/apis'
                      ? 'bg-[#C26D53] text-white border-[#C26D53]'
                      : 'bg-[#FFFFFF] text-[#57534E] border-[#E3DDD3] hover:border-[#D9D2C7]'
                  }`}
                >
                  Local Default
                </button>
                <button
                  type="button"
                  onClick={() => setStoragePath('~/OneDrive/APIBench')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    storagePath === '~/OneDrive/APIBench'
                      ? 'bg-[#C26D53] text-white border-[#C26D53]'
                      : 'bg-[#FFFFFF] text-[#57534E] border-[#E3DDD3] hover:border-[#D9D2C7]'
                  }`}
                >
                  OneDrive (Windows)
                </button>
                <button
                  type="button"
                  onClick={() => setStoragePath('~/Library/CloudStorage/OneDrive/APIBench')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    storagePath === '~/Library/CloudStorage/OneDrive/APIBench'
                      ? 'bg-[#C26D53] text-white border-[#C26D53]'
                      : 'bg-[#FFFFFF] text-[#57534E] border-[#E3DDD3] hover:border-[#D9D2C7]'
                  }`}
                >
                  OneDrive (macOS)
                </button>
              </div>

              {/* Migrate Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={migrateExisting}
                    onChange={(e) => setMigrateExisting(e.target.checked)}
                    className="w-4 h-4 rounded text-[#C26D53] focus:ring-[#C26D53]"
                  />
                  <span className="text-xs text-[#57534E]">
                    Migrate existing data to new path
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: CURSOR AI KEY */}
          {activeTab === 'cursor' && (
            <div className="space-y-4">
              {/* Status Header */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-[#E3DDD3] bg-[#FAF8F5]">
                <span className="text-xs font-medium text-[#292524]">Key Status</span>
                {serverSettings?.hasCursorKey ? (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-[#EAF2ED] text-[#265937] border-[#B8D5C2]">
                    Configured ({serverSettings.cursorApiKeyMasked || 'Active'})
                  </span>
                ) : (
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border bg-[#FFFFFF] text-[#78716C] border-[#E3DDD3]">
                    Not Configured
                  </span>
                )}
              </div>

              {/* Key Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#292524]">
                  Cursor AI API Key
                </label>
                <div className="relative">
                  <input
                    type={showCursorKey ? 'text' : 'password'}
                    value={cursorApiKey}
                    onChange={(e) => setCursorApiKey(e.target.value)}
                    placeholder="Enter API key"
                    className="w-full pl-3 pr-10 py-2 rounded-lg bg-[#FFFFFF] border border-[#E3DDD3] text-xs font-mono text-[#292524] placeholder-[#A8A29E] focus:outline-none focus:border-[#C26D53] focus:ring-1 focus:ring-[#C26D53]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCursorKey(!showCursorKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#292524] cursor-pointer"
                  >
                    {showCursorKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EDITOR & FORMATTING */}
          {activeTab === 'editor' && (
            <div className="space-y-4">
              {/* 2-Column Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-[#E3DDD3] bg-[#FAF8F5] flex items-center justify-between">
                  <span className="text-xs font-medium text-[#292524]">Auto-Format JSON</span>
                  <button
                    type="button"
                    onClick={() =>
                      setPreferences((prev) => ({ ...prev, autoFormatJson: !prev.autoFormatJson }))
                    }
                    className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                      preferences.autoFormatJson ? 'bg-[#C26D53]' : 'bg-[#D9D2C7]'
                    }`}
                  >
                    <div
                      className={`bg-white w-4.5 h-4.5 rounded-full shadow-sm transform transition-transform ${
                        preferences.autoFormatJson ? 'translate-x-4.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-3.5 rounded-xl border border-[#E3DDD3] bg-[#FAF8F5] flex items-center justify-between">
                  <span className="text-xs font-medium text-[#292524]">Wrap Long Lines</span>
                  <button
                    type="button"
                    onClick={() =>
                      setPreferences((prev) => ({ ...prev, wordWrap: !prev.wordWrap }))
                    }
                    className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                      preferences.wordWrap ? 'bg-[#C26D53]' : 'bg-[#D9D2C7]'
                    }`}
                  >
                    <div
                      className={`bg-white w-4.5 h-4.5 rounded-full shadow-sm transform transition-transform ${
                        preferences.wordWrap ? 'translate-x-4.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Content-Type Selection */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold text-[#292524]">
                  Default Content-Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { value: 'application/json', label: 'application/json' },
                    { value: 'application/x-www-form-urlencoded', label: 'form-urlencoded' },
                    { value: 'multipart/form-data', label: 'multipart/form-data' },
                  ].map((opt) => {
                    const isSelected = preferences.defaultContentType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setPreferences((prev) => ({ ...prev, defaultContentType: opt.value }))
                        }
                        className={`p-2.5 text-center rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#C26D53] text-white border-[#C26D53] font-semibold'
                            : 'bg-[#FFFFFF] border-[#E3DDD3] text-[#57534E] hover:border-[#D9D2C7]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WORKSPACE BACKUPS */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              {/* Export */}
              <div className="p-4 rounded-xl border border-[#E3DDD3] bg-[#FAF8F5] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#292524]">Export Workspace</div>
                  <div className="text-xs text-[#78716C] mt-0.5">{endpoints.length} routes</div>
                </div>
                <button
                  type="button"
                  onClick={handleExportWorkspace}
                  className="h-8.5 inline-flex items-center gap-1.5 px-3.5 text-xs font-semibold rounded-lg bg-[#FFFFFF] text-[#292524] border border-[#E3DDD3] hover:bg-[#F7F5F0] transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#C26D53]" />
                  <span>Export JSON</span>
                </button>
              </div>

              {/* Import */}
              <div className="p-4 rounded-xl border border-[#E3DDD3] bg-[#FAF8F5] space-y-3">
                <div className="text-xs font-semibold text-[#292524]">Import Workspace</div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'merge'}
                        onChange={() => setImportMode('merge')}
                        className="text-[#C26D53] focus:ring-[#C26D53]"
                      />
                      <span className="text-[#57534E]">Merge</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="text-[#C26D53] focus:ring-[#C26D53]"
                      />
                      <span className="text-[#57534E]">Replace</span>
                    </label>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={importing}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8.5 inline-flex items-center gap-1.5 px-3.5 text-xs font-semibold rounded-lg bg-[#FFFFFF] text-[#292524] border border-[#E3DDD3] hover:bg-[#F7F5F0] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#C26D53]" />
                    <span>{importing ? 'Importing...' : 'Select File'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-3 border-t border-[#E3DDD3] flex items-center justify-between">
            <div>
              {savedSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-[#5E8268] font-semibold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#78716C] hover:text-[#292524] hover:bg-[#EFECE6] transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#C26D53] text-[#FFFFFF] hover:bg-[#A8543B] disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
              >
                {isSaving ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <span>Save</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
