import React from 'react';
import { HistoryItem, QRPreset, QRStyleConfig } from '../../types/qr';
import {
  Bookmark,
  History,
  Trash2,
  ArrowRight,
  Clock,
  Sparkles,
  Check,
  Palette,
} from 'lucide-react';

interface PresetsViewProps {
  presets: QRPreset[];
  history: HistoryItem[];
  onApplyPreset: (config: QRStyleConfig) => void;
  onDeletePreset: (id: string) => void;
  onClearHistory: () => void;
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const PresetsView: React.FC<PresetsViewProps> = ({
  presets,
  history,
  onApplyPreset,
  onDeletePreset,
  onClearHistory,
  showToast,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Bookmark className="w-8 h-8 text-amber-400" />
          <span>Plantillas de Estilo e Historial</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Guarda tus combinaciones favoritas de marcas, colores y patrones para reutilizarlas en 1 clic.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Saved Presets Section (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Plantillas de Estilo Guardadas ({presets.length})</span>
            </h2>

            {presets.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl">
                <Bookmark className="w-8 h-8 text-slate-600" />
                <p className="text-xs text-slate-400 max-w-xs">
                  Aún no has guardado ninguna plantilla. En el generador único, presiona "Plantilla" para guardar tu estilo actual.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-4 bg-slate-950 border border-slate-800/90 rounded-xl hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xs font-bold text-white truncate">{preset.name}</h3>
                        <button
                          onClick={() => {
                            onDeletePreset(preset.id);
                            showToast('info', 'Plantilla eliminada');
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Visual swatch indicator */}
                      <div className="flex items-center gap-2 pt-2">
                        <div
                          className="w-5 h-5 rounded-full border border-slate-700 shadow-inner"
                          style={{
                            backgroundColor: preset.config.useFgGradient
                              ? preset.config.fgGradient.color1
                              : preset.config.fgColor,
                          }}
                          title="Color principal"
                        />
                        <div
                          className="w-5 h-5 rounded-full border border-slate-700 shadow-inner"
                          style={{
                            backgroundColor: preset.config.bgTransparent
                              ? '#00000000'
                              : preset.config.bgColor,
                          }}
                          title="Fondo"
                        />
                        <span className="text-[10px] text-slate-400 capitalize">
                          {preset.config.dotType}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onApplyPreset(preset.config);
                        showToast('success', `Plantilla "${preset.name}" aplicada`);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-blue-400 hover:text-blue-300 border border-slate-800 rounded-lg text-xs font-semibold transition-all"
                    >
                      <span>Aplicar Estilo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* History Log Section (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Historial Reciente ({history.length})</span>
              </h2>

              {history.length > 0 && (
                <button
                  onClick={() => {
                    onClearHistory();
                    showToast('info', 'Historial borrado');
                  }}
                  className="text-xs font-medium text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Borrar Historial</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl">
                <History className="w-8 h-8 text-slate-600" />
                <p className="text-xs text-slate-400 max-w-xs">
                  Aún no has generado ningún código QR. Los códigos que descargues se registrarán automáticamente aquí.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{item.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 truncate max-w-sm mt-0.5">
                        {item.value}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onApplyPreset(item.config);
                        showToast('success', 'Configuración de estilo restaurada');
                      }}
                      className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-medium text-slate-300 rounded-lg transition-colors shrink-0"
                    >
                      Re-usar Estilo
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
