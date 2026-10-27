import React from 'react';
import { QrCode, Layers, Scan, Bookmark, Sparkles } from 'lucide-react';

export type ActiveTab = 'single' | 'bulk' | 'scanner' | 'presets';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onQuickPreset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onQuickPreset,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onTabChange('single')}
          className="flex items-center gap-2.5 group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0">
              QR Studio
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Single-line controls) */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          <button
            onClick={() => onTabChange('single')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'single'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Generador Único</span>
          </button>

          <button
            onClick={() => onTabChange('bulk')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'bulk'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Generación Masiva</span>
          </button>

          <button
            onClick={() => onTabChange('scanner')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'scanner'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Escanear QR</span>
          </button>

          <button
            onClick={() => onTabChange('presets')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'presets'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Plantillas y Guardados</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onQuickPreset}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700/80 rounded-xl hover:bg-slate-800 hover:border-slate-600 transition-all whitespace-nowrap shrink-0 shadow-sm active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Estilos Rápidos</span>
          </button>
        </div>

      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-900/90 border-t border-slate-800 px-2 py-1.5 text-xs font-medium">
        <button
          onClick={() => onTabChange('single')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
            activeTab === 'single' ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Único</span>
        </button>
        <button
          onClick={() => onTabChange('bulk')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
            activeTab === 'bulk' ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Masivo</span>
        </button>
        <button
          onClick={() => onTabChange('scanner')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
            activeTab === 'scanner' ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <Scan className="w-4 h-4" />
          <span>Escanear</span>
        </button>
        <button
          onClick={() => onTabChange('presets')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
            activeTab === 'presets' ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Plantillas</span>
        </button>
      </div>
    </header>
  );
};
