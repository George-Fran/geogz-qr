import React, { useRef } from 'react';
import {
  CornerDotType,
  CornerSquareType,
  DotType,
  ErrorCorrectionLevel,
  QRStyleConfig,
} from '../../types/qr';
import { PRESET_LOGOS } from '../../utils/qrUtils';
import {
  Palette,
  Shapes,
  Image as ImageIcon,
  Upload,
  Sliders,
  Sparkles,
  Info,
  ShieldCheck,
} from 'lucide-react';

interface QRStylingPanelProps {
  config: QRStyleConfig;
  setConfig: React.Dispatch<React.SetStateAction<QRStyleConfig>>;
  onPresetApply?: (config: QRStyleConfig) => void;
}

const DOT_TYPES: { id: DotType; name: string }[] = [
  { id: 'rounded', name: 'Redondeado' },
  { id: 'dots', name: 'Puntos' },
  { id: 'classy', name: 'Elegante' },
  { id: 'classy-rounded', name: 'Elegante Suave' },
  { id: 'extra-rounded', name: 'Cápsula' },
  { id: 'square', name: 'Cuadrado' },
];

const CORNER_SQUARE_TYPES: { id: CornerSquareType; name: string }[] = [
  { id: 'extra-rounded', name: 'Curvo' },
  { id: 'dot', name: 'Circular' },
  { id: 'square', name: 'Recto' },
];

const CORNER_DOT_TYPES: { id: CornerDotType; name: string }[] = [
  { id: 'dot', name: 'Punto' },
  { id: 'square', name: 'Cuadro' },
];

export const QRStylingPanel: React.FC<QRStylingPanelProps> = ({
  config,
  setConfig,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = React.useState<'colors' | 'shapes' | 'logo' | 'precision'>('colors');

  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen del logo no debe superar los 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setConfig((prev) => ({
          ...prev,
          logoUrl: result,
          ecLevel: prev.ecLevel === 'L' || prev.ecLevel === 'M' ? 'Q' : prev.ecLevel,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden">
      
      {/* Sub-tabs for customization */}
      <div className="flex border-b border-slate-800/80 bg-slate-950/40 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('colors')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'colors'
              ? 'border-blue-500 text-blue-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Colores y Degradados</span>
        </button>

        <button
          onClick={() => setActiveTab('shapes')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'shapes'
              ? 'border-blue-500 text-blue-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shapes className="w-4 h-4" />
          <span>Formas y Patrón</span>
        </button>

        <button
          onClick={() => setActiveTab('logo')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'logo'
              ? 'border-blue-500 text-blue-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Logo Central</span>
          {config.logoUrl && (
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('precision')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'precision'
              ? 'border-blue-500 text-blue-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Calidad y Tamaño</span>
        </button>
      </div>

      <div className="p-5 space-y-6">

        {/* COLORES & DEGRADADOS */}
        {activeTab === 'colors' && (
          <div className="space-y-5">
            {/* Main Foreground Color */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Color Principal del Código QR
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={config.useFgGradient}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        useFgGradient: e.target.checked,
                        fgGradient: {
                          ...prev.fgGradient,
                          enabled: e.target.checked,
                        },
                      }))
                    }
                    className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Usar Degradado</span>
                </label>
              </div>

              {!config.useFgGradient ? (
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.fgColor}
                    onChange={(e) => setConfig((prev) => ({ ...prev, fgColor: e.target.value }))}
                    className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    value={config.fgColor}
                    onChange={(e) => setConfig((prev) => ({ ...prev, fgColor: e.target.value }))}
                    className="px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono w-32 focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-1.5 ml-auto">
                    {['#0f172a', '#2563eb', '#7c3aed', '#059669', '#dc2626', '#d97706'].map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setConfig((prev) => ({ ...prev, fgColor: hex }))}
                        className="w-6 h-6 rounded-full border border-slate-700/60 shadow-inner"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="block text-[11px] text-slate-400 mb-1">Color Inicial</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.fgGradient.color1}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              fgGradient: { ...prev.fgGradient, color1: e.target.value },
                            }))
                          }
                          className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={config.fgGradient.color1}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              fgGradient: { ...prev.fgGradient, color1: e.target.value },
                            }))
                          }
                          className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white font-mono w-full"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="block text-[11px] text-slate-400 mb-1">Color Final</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.fgGradient.color2}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              fgGradient: { ...prev.fgGradient, color2: e.target.value },
                            }))
                          }
                          className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={config.fgGradient.color2}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              fgGradient: { ...prev.fgGradient, color2: e.target.value },
                            }))
                          }
                          className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white font-mono w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="block text-[11px] text-slate-400 mb-1">Tipo de Degradado</span>
                      <select
                        value={config.fgGradient.type}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            fgGradient: { ...prev.fgGradient, type: e.target.value as any },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white"
                      >
                        <option value="linear">Lineal</option>
                        <option value="radial">Radial / Centro</option>
                      </select>
                    </div>
                    {config.fgGradient.type === 'linear' && (
                      <div>
                        <span className="block text-[11px] text-slate-400 mb-1">
                          Ángulo: {config.fgGradient.rotation}°
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={360}
                          value={config.fgGradient.rotation}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              fgGradient: { ...prev.fgGradient, rotation: Number(e.target.value) },
                            }))
                          }
                          className="w-full accent-blue-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Background Color */}
            <div className="pt-3 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Fondo del Lienzo
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={config.bgTransparent}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, bgTransparent: e.target.checked }))
                    }
                    className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Fondo Transparente (PNG/SVG)</span>
                </label>
              </div>

              {!config.bgTransparent && (
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.bgColor}
                    onChange={(e) => setConfig((prev) => ({ ...prev, bgColor: e.target.value }))}
                    className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    value={config.bgColor}
                    onChange={(e) => setConfig((prev) => ({ ...prev, bgColor: e.target.value }))}
                    className="px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono w-32 focus:outline-none"
                  />
                  <div className="flex gap-1.5 ml-auto">
                    {['#ffffff', '#f8fafc', '#0f172a', '#020617', '#18181b', '#09090b'].map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setConfig((prev) => ({ ...prev, bgColor: hex }))}
                        className="w-6 h-6 rounded-full border border-slate-700/60 shadow-inner"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Customized Eye / Frame Colors */}
            <div className="pt-3 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Colores de Ojos / Esquinas (Avanzado)
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Custom Corner Frame Color */}
                <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-2">
                  <label className="flex items-center justify-between cursor-pointer text-xs text-slate-300">
                    <span>Marco Exterior</span>
                    <input
                      type="checkbox"
                      checked={config.useCustomCornersSquareColor}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          useCustomCornersSquareColor: e.target.checked,
                        }))
                      }
                      className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-blue-600"
                    />
                  </label>

                  {config.useCustomCornersSquareColor && (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="color"
                        value={config.cornersSquareColor}
                        onChange={(e) =>
                          setConfig((prev) => ({ ...prev, cornersSquareColor: e.target.value }))
                        }
                        className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={config.cornersSquareColor}
                        onChange={(e) =>
                          setConfig((prev) => ({ ...prev, cornersSquareColor: e.target.value }))
                        }
                        className="px-2 py-1 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white font-mono w-full"
                      />
                    </div>
                  )}
                </div>

                {/* Custom Corner Dot Color */}
                <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-2">
                  <label className="flex items-center justify-between cursor-pointer text-xs text-slate-300">
                    <span>Centro del Ojo</span>
                    <input
                      type="checkbox"
                      checked={config.useCustomCornersDotColor}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          useCustomCornersDotColor: e.target.checked,
                        }))
                      }
                      className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-blue-600"
                    />
                  </label>

                  {config.useCustomCornersDotColor && (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="color"
                        value={config.cornersDotColor}
                        onChange={(e) =>
                          setConfig((prev) => ({ ...prev, cornersDotColor: e.target.value }))
                        }
                        className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={config.cornersDotColor}
                        onChange={(e) =>
                          setConfig((prev) => ({ ...prev, cornersDotColor: e.target.value }))
                        }
                        className="px-2 py-1 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white font-mono w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FORMAS Y PATRÓN */}
        {activeTab === 'shapes' && (
          <div className="space-y-5">
            {/* Dots Pattern */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2.5">
                Patrón del Cuerpo (Puntos del QR)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DOT_TYPES.map((dt) => (
                  <button
                    key={dt.id}
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, dotType: dt.id }))}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all text-center ${
                      config.dotType === dt.id
                        ? 'bg-blue-600/15 border-blue-500 text-blue-300 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    {dt.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Corner Frame Shape */}
            <div className="pt-3 border-t border-slate-800/80">
              <label className="block text-xs font-semibold text-slate-300 mb-2.5">
                Forma del Marco de las Esquinas (Ojos)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CORNER_SQUARE_TYPES.map((cst) => (
                  <button
                    key={cst.id}
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, cornersSquareType: cst.id }))}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all text-center ${
                      config.cornersSquareType === cst.id
                        ? 'bg-blue-600/15 border-blue-500 text-blue-300 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    {cst.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Corner Dot Shape */}
            <div className="pt-3 border-t border-slate-800/80">
              <label className="block text-xs font-semibold text-slate-300 mb-2.5">
                Forma del Punto Interior de la Esquina
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CORNER_DOT_TYPES.map((cdt) => (
                  <button
                    key={cdt.id}
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, cornersDotType: cdt.id }))}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all text-center ${
                      config.cornersDotType === cdt.id
                        ? 'bg-blue-600/15 border-blue-500 text-blue-300 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    {cdt.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LOGO CENTRAL */}
        {activeTab === 'logo' && (
          <div className="space-y-5">
            {/* Custom Logo Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Subir tu propio Logotipo (PNG, SVG, JPG)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCustomLogoUpload}
                className="hidden"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-950 border border-dashed border-slate-700 hover:border-blue-500 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all group"
                >
                  <Upload className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
                  <span>Cargar Imagen de Marca</span>
                </button>
                {config.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, logoUrl: '' }))}
                    className="px-3 py-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-all"
                  >
                    Quitar Logo
                  </button>
                )}
              </div>
            </div>

            {/* Vector Icon Presets */}
            <div className="pt-3 border-t border-slate-800/80">
              <label className="block text-xs font-semibold text-slate-300 mb-2.5">
                O selecciona un Icono Vectorial Integrado
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {PRESET_LOGOS.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        logoUrl: item.url,
                        ecLevel: item.url && (prev.ecLevel === 'L' || prev.ecLevel === 'M') ? 'Q' : prev.ecLevel,
                      }))
                    }
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all gap-1.5 ${
                      config.logoUrl === item.url
                        ? 'bg-blue-600/15 border-blue-500 text-blue-300 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/80'
                    }`}
                  >
                    {item.url ? (
                      <img src={item.url} alt={item.name} className="w-6 h-6 object-contain" />
                    ) : (
                      <span className="text-xs text-slate-500 font-medium">Ninguno</span>
                    )}
                    <span className="text-[10px] truncate max-w-full font-medium">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Logo Size and Margin Adjustments */}
            {config.logoUrl && (
              <div className="pt-3 border-t border-slate-800/80 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                    <span>Tamaño Relativo del Logo</span>
                    <span className="font-mono text-blue-400">{Math.round(config.logoSize * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={0.35}
                    step={0.01}
                    value={config.logoSize}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, logoSize: Number(e.target.value) }))
                    }
                    className="w-full accent-blue-500"
                  />
                  {config.logoSize > 0.28 && (
                    <p className="flex items-center gap-1.5 text-[11px] text-amber-400 mt-1">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>Logos grandes requieren mayor corrección de errores (Q o H).</span>
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                    <span>Margen Alrededor del Logo</span>
                    <span className="font-mono text-slate-400">{config.logoMargin}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={16}
                    step={1}
                    value={config.logoMargin}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, logoMargin: Number(e.target.value) }))
                    }
                    className="w-full accent-blue-500"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 pt-1">
                  <input
                    type="checkbox"
                    checked={config.hideBgDotsBehindLogo}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, hideBgDotsBehindLogo: e.target.checked }))
                    }
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Limpiar espacio detrás del logo (Recomendado)</span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* CALIDAD Y TAMAÑO */}
        {activeTab === 'precision' && (
          <div className="space-y-5">
            {/* Error Correction Level */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Nivel de Corrección de Errores (EC)</span>
                </label>
                <span className="text-[11px] font-mono text-blue-400">
                  {config.ecLevel === 'L' && 'L (7% de daño)'}
                  {config.ecLevel === 'M' && 'M (15% de daño)'}
                  {config.ecLevel === 'Q' && 'Q (25% de daño)'}
                  {config.ecLevel === 'H' && 'H (30% de daño)'}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {(['L', 'M', 'Q', 'H'] as ErrorCorrectionLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, ecLevel: level }))}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                      config.ecLevel === level
                        ? 'bg-blue-600/15 border-blue-500 text-blue-300 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/80'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
                Niveles superiores (Q y H) permiten escanear el QR incluso si está impreso sobre texturas o tiene un logo central grande.
              </p>
            </div>

            {/* Quiet Zone / Margin */}
            <div className="pt-3 border-t border-slate-800/80">
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>Margen Exterior (Zona Silenciosa)</span>
                <span className="font-mono text-slate-400">{config.margin}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                step={2}
                value={config.margin}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, margin: Number(e.target.value) }))
                }
                className="w-full accent-blue-500"
              />
            </div>

            {/* Export Resolution */}
            <div className="pt-3 border-t border-slate-800/80">
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>Resolución de Exportación PNG / JPG</span>
                <span className="font-mono text-blue-400">{config.width} × {config.height} px</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[300, 600, 1000, 2000].map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() =>
                      setConfig((prev) => ({ ...prev, width: res, height: res }))
                    }
                    className={`px-2 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                      config.width === res
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {res}px
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
