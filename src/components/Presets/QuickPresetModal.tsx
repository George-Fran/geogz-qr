import React from 'react';
import { QRStyleConfig } from '../../types/qr';
import { Sparkles, X, Check } from 'lucide-react';

interface QuickPresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (config: QRStyleConfig) => void;
}

export const CURATED_STYLES: { name: string; description: string; config: QRStyleConfig }[] = [
  {
    name: 'Minimalista Clásico',
    description: 'Diseño limpio, contraste elevado sobre fondo blanco puro.',
    config: {
      width: 400,
      height: 400,
      margin: 12,
      ecLevel: 'M',
      dotType: 'rounded',
      fgColor: '#0f172a',
      useFgGradient: false,
      fgGradient: { enabled: false, type: 'linear', color1: '#0f172a', color2: '#0f172a', rotation: 0 },
      bgColor: '#ffffff',
      bgTransparent: false,
      cornersSquareType: 'extra-rounded',
      cornersSquareColor: '#0f172a',
      useCustomCornersSquareColor: false,
      cornersDotType: 'dot',
      cornersDotColor: '#2563eb',
      useCustomCornersDotColor: true,
      logoUrl: '',
      logoSize: 0.2,
      logoMargin: 6,
      hideBgDotsBehindLogo: true,
    },
  },
  {
    name: 'Azul Eléctrico Neón',
    description: 'Degradado azul brillante para marcas tecnológicas y startups.',
    config: {
      width: 400,
      height: 400,
      margin: 12,
      ecLevel: 'Q',
      dotType: 'dots',
      fgColor: '#2563eb',
      useFgGradient: true,
      fgGradient: { enabled: true, type: 'linear', color1: '#3b82f6', color2: '#1d4ed8', rotation: 45 },
      bgColor: '#090d16',
      bgTransparent: false,
      cornersSquareType: 'extra-rounded',
      cornersSquareColor: '#60a5fa',
      useCustomCornersSquareColor: true,
      cornersDotType: 'dot',
      cornersDotColor: '#93c5fd',
      useCustomCornersDotColor: true,
      logoUrl: '',
      logoSize: 0.22,
      logoMargin: 6,
      hideBgDotsBehindLogo: true,
    },
  },
  {
    name: 'Verde Esmeralda Pro',
    description: 'Estilo fresco ideal para restaurantes, Wi-Fi o tiendas en línea.',
    config: {
      width: 400,
      height: 400,
      margin: 12,
      ecLevel: 'M',
      dotType: 'classy-rounded',
      fgColor: '#059669',
      useFgGradient: false,
      fgGradient: { enabled: false, type: 'linear', color1: '#059669', color2: '#047857', rotation: 0 },
      bgColor: '#ffffff',
      bgTransparent: false,
      cornersSquareType: 'extra-rounded',
      cornersSquareColor: '#065f46',
      useCustomCornersSquareColor: true,
      cornersDotType: 'dot',
      cornersDotColor: '#10b981',
      useCustomCornersDotColor: true,
      logoUrl: '',
      logoSize: 0.22,
      logoMargin: 6,
      hideBgDotsBehindLogo: true,
    },
  },
  {
    name: 'Violeta & Magenta Moderno',
    description: 'Degradado violeta vibrante para eventos y redes sociales.',
    config: {
      width: 400,
      height: 400,
      margin: 12,
      ecLevel: 'Q',
      dotType: 'dots',
      fgColor: '#7c3aed',
      useFgGradient: true,
      fgGradient: { enabled: true, type: 'linear', color1: '#8b5cf6', color2: '#ec4899', rotation: 135 },
      bgColor: '#ffffff',
      bgTransparent: false,
      cornersSquareType: 'dot',
      cornersSquareColor: '#7c3aed',
      useCustomCornersSquareColor: true,
      cornersDotType: 'dot',
      cornersDotColor: '#ec4899',
      useCustomCornersDotColor: true,
      logoUrl: '',
      logoSize: 0.22,
      logoMargin: 6,
      hideBgDotsBehindLogo: true,
    },
  },
  {
    name: 'Dorado Elegante Premium',
    description: 'Tonalidad champagne luxury para hoteles y joyería.',
    config: {
      width: 400,
      height: 400,
      margin: 12,
      ecLevel: 'M',
      dotType: 'classy',
      fgColor: '#b45309',
      useFgGradient: true,
      fgGradient: { enabled: true, type: 'linear', color1: '#d97706', color2: '#78350f', rotation: 30 },
      bgColor: '#0f172a',
      bgTransparent: false,
      cornersSquareType: 'extra-rounded',
      cornersSquareColor: '#f59e0b',
      useCustomCornersSquareColor: true,
      cornersDotType: 'square',
      cornersDotColor: '#fbbf24',
      useCustomCornersDotColor: true,
      logoUrl: '',
      logoSize: 0.22,
      logoMargin: 6,
      hideBgDotsBehindLogo: true,
    },
  },
  {
    name: 'Vector Transparente SVG',
    description: 'Fondo 100% transparente para ser montado sobre cualquier diseño o folleto.',
    config: {
      width: 400,
      height: 400,
      margin: 10,
      ecLevel: 'M',
      dotType: 'rounded',
      fgColor: '#000000',
      useFgGradient: false,
      fgGradient: { enabled: false, type: 'linear', color1: '#000000', color2: '#000000', rotation: 0 },
      bgColor: '#ffffff',
      bgTransparent: true,
      cornersSquareType: 'extra-rounded',
      cornersSquareColor: '#000000',
      useCustomCornersSquareColor: false,
      cornersDotType: 'dot',
      cornersDotColor: '#000000',
      useCustomCornersDotColor: false,
      logoUrl: '',
      logoSize: 0.2,
      logoMargin: 6,
      hideBgDotsBehindLogo: true,
    },
  },
];

export const QuickPresetModal: React.FC<QuickPresetModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span>Colección de Estilos Rápidos</span>
          </h2>
          <p className="text-xs text-slate-400">
            Selecciona una paleta diseñada por expertos para aplicarla de inmediato a tu código QR.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
          {CURATED_STYLES.map((style) => (
            <div
              key={style.name}
              onClick={() => {
                onSelectPreset(style.config);
                onClose();
              }}
              className="p-4 bg-slate-950 border border-slate-800 hover:border-blue-500 rounded-xl cursor-pointer transition-all hover:scale-[1.01] space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                  {style.name}
                </h3>
                <div
                  className="w-4 h-4 rounded-full border border-slate-700"
                  style={{
                    backgroundColor: style.config.useFgGradient
                      ? style.config.fgGradient.color1
                      : style.config.fgColor,
                  }}
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {style.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
