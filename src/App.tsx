import React, { useState, useEffect } from 'react';
import { ActiveTab, Navbar } from './components/Navbar';
import { Toast, ToastMessage } from './components/Toast';
import { SingleQRView } from './components/SingleQR/SingleQRView';
import { BulkQRView } from './components/BulkQR/BulkQRView';
import { QRScannerView } from './components/Scanner/QRScannerView';
import { PresetsView } from './components/Presets/PresetsView';
import { QuickPresetModal } from './components/Presets/QuickPresetModal';
import { HistoryItem, QRPreset, QRStyleConfig, QRType } from './types/qr';
import { DEFAULT_STYLE_CONFIG } from './utils/qrUtils';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('single');
  const [config, setConfig] = useState<QRStyleConfig>(DEFAULT_STYLE_CONFIG);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isQuickPresetOpen, setIsQuickPresetOpen] = useState(false);

  // LocalStorage state for Presets & History
  const [presets, setPresets] = useState<QRPreset[]>(() => {
    try {
      const saved = localStorage.getItem('qr_studio_presets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('qr_studio_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('qr_studio_presets', JSON.stringify(presets));
  }, [presets]);

  useEffect(() => {
    localStorage.setItem('qr_studio_history', JSON.stringify(history));
  }, [history]);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToast({ id: String(Date.now()), type, text });
  };

  const handleSavePreset = (presetConfig: QRStyleConfig) => {
    const name = prompt('Ingresa un nombre para guardar este estilo:', 'Mi Estilo Personal');
    if (!name) return;

    const newPreset: QRPreset = {
      id: `preset_${Date.now()}`,
      name: name.trim(),
      config: presetConfig,
      createdAt: Date.now(),
    };

    setPresets((prev) => [newPreset, ...prev]);
    showToast('success', `Plantilla "${name}" guardada en tus favoritos.`);
  };

  const handleDeletePreset = (id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSaveHistory = (
    title: string,
    type: QRType = 'url',
    value: string = '',
    itemConfig: QRStyleConfig = config
  ) => {
    const newItem: HistoryItem = {
      id: `hist_${Date.now()}`,
      title,
      type,
      value,
      config: itemConfig,
      createdAt: Date.now(),
    };

    setHistory((prev) => [newItem, ...prev.slice(0, 24)]);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleApplyPreset = (appliedConfig: QRStyleConfig) => {
    setConfig(appliedConfig);
    setActiveTab('single');
  };

  const handleLoadScanIntoGenerator = (scannedText: string) => {
    setActiveTab('single');
    showToast('info', 'Texto cargado en el generador. Ahora puedes personalizar el diseño.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onQuickPreset={() => setIsQuickPresetOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'single' && (
          <SingleQRView
            config={config}
            setConfig={setConfig}
            showToast={showToast}
            onSavePreset={handleSavePreset}
            onSaveHistory={handleSaveHistory}
          />
        )}

        {activeTab === 'bulk' && (
          <BulkQRView config={config} showToast={showToast} />
        )}

        {activeTab === 'scanner' && (
          <QRScannerView
            showToast={showToast}
            onLoadIntoGenerator={handleLoadScanIntoGenerator}
          />
        )}

        {activeTab === 'presets' && (
          <PresetsView
            presets={presets}
            history={history}
            onApplyPreset={handleApplyPreset}
            onDeletePreset={handleDeletePreset}
            onClearHistory={handleClearHistory}
            showToast={showToast}
          />
        )}
      </main>

      {/* Quick Preset Modal */}
      <QuickPresetModal
        isOpen={isQuickPresetOpen}
        onClose={() => setIsQuickPresetOpen(false)}
        onSelectPreset={handleApplyPreset}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Footer (Clean & Minimalist) */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-6 px-4 sm:px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} QR Studio · By GeogZ.</p>
          <div className="flex items-center gap-4">
            <span>Privacidad local · Todo el procesamiento ocurre en tu navegador</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
