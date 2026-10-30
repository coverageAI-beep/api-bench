import React, { useState, useEffect, useCallback } from 'react';
import {
  ActiveTab,
  ApiEndpoint,
  ViewMode
} from './types/api';
import {
  getAllEndpoints,
  getEndpointById,
  saveEndpoint,
  deleteEndpoint,
  subscribeToStorageUpdates
} from './lib/storage';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { ApisTableView } from './components/ApisTableView';
import { ApiDetailView } from './components/ApiDetailView';
import { ApiFormView } from './components/ApiFormView';
import { SettingsModal } from './components/SettingsModal';
import { CheckCircle2, X } from 'lucide-react';

export default function App() {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [viewMode, setViewMode] = useState<ViewMode>({ type: 'dashboard' });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Load endpoints
  const refreshEndpoints = useCallback(() => {
    const list = getAllEndpoints();
    setEndpoints(list);
  }, []);

  useEffect(() => {
    refreshEndpoints();
    const unsubscribe = subscribeToStorageUpdates(() => {
      refreshEndpoints();
    });
    return () => unsubscribe();
  }, [refreshEndpoints]);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 3000);
  };

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'dashboard') {
      setViewMode({ type: 'dashboard' });
    } else {
      setViewMode({ type: 'list' });
    }
  };

  const handleAddNewApi = () => {
    setActiveTab('apis');
    setViewMode({ type: 'create' });
  };

  const handleSelectEndpoint = (id: string) => {
    setActiveTab('apis');
    setViewMode({ type: 'detail', endpointId: id });
  };

  const handleEditEndpoint = (id: string) => {
    setActiveTab('apis');
    setViewMode({ type: 'edit', endpointId: id });
  };

  const handleSaveEndpoint = (data: ApiEndpoint) => {
    const saved = saveEndpoint(data);
    showNotification(`Saved "${saved.title}" to local repository`);
    setViewMode({ type: 'detail', endpointId: saved.id });
    refreshEndpoints();
  };

  const handleDeleteEndpoint = (id: string) => {
    const ep = getEndpointById(id);
    deleteEndpoint(id);
    showNotification(`Deleted ${ep?.method || 'API'} ${ep?.path || ''}`);
    setViewMode({ type: 'list' });
    refreshEndpoints();
  };

  // Determine current endpoint for detail or edit views
  let currentDetailEndpoint: ApiEndpoint | null = null;
  if (viewMode.type === 'detail') {
    currentDetailEndpoint = endpoints.find((e) => e.id === viewMode.endpointId) || null;
  }
  let currentEditEndpoint: ApiEndpoint | null = null;
  if (viewMode.type === 'edit') {
    currentEditEndpoint = endpoints.find((e) => e.id === viewMode.endpointId) || null;
  }

  return (
    <div className="flex min-h-screen bg-[#F7F5F0] text-[#292524] font-sans antialiased">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#292524] text-white shadow-xl text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#6E9A7B] shrink-0" />
          <span>{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="ml-2 text-[#A8A29E] hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Left Navigation Sidebar */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        totalEndpoints={endpoints.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          refreshEndpoints();
        }}
        onNotification={(msg, type) => showNotification(msg, type)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 overflow-y-auto min-h-screen">
        {/* Render View Based on State */}
        {viewMode.type === 'dashboard' && (
          <DashboardView
            endpoints={endpoints}
            onAddNewApi={handleAddNewApi}
            onSelectEndpoint={handleSelectEndpoint}
            onNotification={(msg) => showNotification(msg)}
          />
        )}

        {viewMode.type === 'list' && (
          <ApisTableView
            endpoints={endpoints}
            onAddNewApi={handleAddNewApi}
            onSelectEndpoint={handleSelectEndpoint}
            onNotification={(msg) => showNotification(msg)}
          />
        )}

        {viewMode.type === 'detail' && (
          currentDetailEndpoint ? (
            <ApiDetailView
              endpoint={currentDetailEndpoint}
              onBack={() => setViewMode({ type: 'list' })}
              onEdit={() => handleEditEndpoint(currentDetailEndpoint!.id)}
              onDelete={handleDeleteEndpoint}
              onAddNewApi={handleAddNewApi}
              onNotification={(msg) => showNotification(msg)}
            />
          ) : (
            <div className="p-12 text-center text-xs text-[#78716C] space-y-3">
              <p className="text-sm font-semibold text-[#292524]">Endpoint not found</p>
              <button
                type="button"
                onClick={() => setViewMode({ type: 'list' })}
                className="px-4 py-2 rounded-lg bg-[#EFECE6] text-[#292524] font-medium"
              >
                Back to APIs list
              </button>
            </div>
          )
        )}

        {viewMode.type === 'create' && (
          <ApiFormView
            initialEndpoint={null}
            onSave={handleSaveEndpoint}
            onCancel={() => setViewMode({ type: 'list' })}
            onNotification={(msg) => showNotification(msg)}
          />
        )}

        {viewMode.type === 'edit' && (
          <ApiFormView
            initialEndpoint={currentEditEndpoint}
            onSave={handleSaveEndpoint}
            onCancel={() =>
              currentEditEndpoint
                ? setViewMode({ type: 'detail', endpointId: currentEditEndpoint.id })
                : setViewMode({ type: 'list' })
            }
            onNotification={(msg) => showNotification(msg)}
          />
        )}
      </main>
    </div>
  );
}
