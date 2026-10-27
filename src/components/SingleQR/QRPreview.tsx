import React, { useEffect, useRef, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { ExportExtension, QRStyleConfig } from '../../types/qr';
import { ReadabilityGauge } from './ReadabilityGauge';
import {
  Download,
  Copy,
  Bookmark,
  Sparkles,
  ExternalLink,
  Eye,
  Check,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface QRPreviewProps {
  payload: string;
  config: QRStyleConfig;
  setConfig: React.Dispatch<React.SetStateAction<QRStyleConfig>>;
  onSavePreset: () => void;
  onSaveHistory: (title: string) => void;
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const QRPreview: React.FC<QRPreviewProps> = ({
  payload,
  config,
  setConfig,
  onSavePreset,
  onSaveHistory,
  showToast,
}) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [payloadError, setPayloadError] = useState<string | null>(null);

  // Initialize or update QRCodeStyling instance safely
  useEffect(() => {
    if (!qrRef.current) return;

    const rawData = payload.trim() || 'https://qrstudio.app';

    // QR Code matrix limit check (~2500 characters max)
    if (rawData.length > 2500) {
      setPayloadError(
        'El tamaño del archivo o texto es demasiado grande para un código QR (~2000 caracteres máx). Por favor pega una dirección URL (ej. Google Drive, Dropbox, Imgur).'
      );
      return;
    }

    setPayloadError(null);

    const options: any = {
      width: 280,
      height: 280,
      type: 'canvas',
      data: rawData,
      margin: config.margin,
      qrOptions: {
        errorCorrectionLevel: config.ecLevel,
      },
      dotsOptions: {
        color: config.useFgGradient ? undefined : config.fgColor,
        type: config.dotType,
        gradient: config.useFgGradient && config.fgGradient.enabled
          ? {
              type: config.fgGradient.type,
              rotation: (config.fgGradient.rotation * Math.PI) / 180,
              colorStops: [
                { offset: 0, color: config.fgGradient.color1 },
                { offset: 1, color: config.fgGradient.color2 },
              ],
            }
          : undefined,
      },
      backgroundOptions: {
        color: config.bgTransparent ? 'transparent' : config.bgColor,
      },
      cornersSquareOptions: {
        type: config.cornersSquareType,
        color: config.useCustomCornersSquareColor ? config.cornersSquareColor : (config.useFgGradient ? config.fgGradient.color1 : config.fgColor),
      },
      cornersDotOptions: {
        type: config.cornersDotType,
        color: config.useCustomCornersDotColor ? config.cornersDotColor : (config.useFgGradient ? config.fgGradient.color2 : config.fgColor),
      },
      image: config.logoUrl || undefined,
      imageOptions: {
        hideBackgroundDots: config.hideBgDotsBehindLogo,
        imageSize: config.logoSize,
        margin: config.logoMargin,
        crossOrigin: 'anonymous',
      },
    };

    try {
      if (!qrCodeInstance.current) {
        qrCodeInstance.current = new QRCodeStyling(options);
        qrRef.current.innerHTML = '';
        qrCodeInstance.current.append(qrRef.current);
      } else {
        qrCodeInstance.current.update(options);
      }
    } catch (e: any) {
      console.error('Error rendering QR code:', e);
      setPayloadError('No se pudo generar el código QR con los datos especificados. Reduce la cantidad de texto o usa un enlace URL.');
    }
  }, [payload, config]);

  const handleDownload = async (ext: ExportExtension) => {
    if (!qrCodeInstance.current || payloadError) return;
    setDownloading(ext);

    try {
      const exportOptions: any = {
        width: config.width,
        height: config.height,
        type: ext === 'svg' ? 'svg' : 'canvas',
        data: payload.trim() || 'https://qrstudio.app',
        margin: Math.round((config.margin * config.width) / 280),
        qrOptions: { errorCorrectionLevel: config.ecLevel },
        dotsOptions: {
          color: config.useFgGradient ? undefined : config.fgColor,
          type: config.dotType,
          gradient: config.useFgGradient && config.fgGradient.enabled
            ? {
                type: config.fgGradient.type,
                rotation: (config.fgGradient.rotation * Math.PI) / 180,
                colorStops: [
                  { offset: 0, color: config.fgGradient.color1 },
                  { offset: 1, color: config.fgGradient.color2 },
                ],
              }
            : undefined,
        },
        backgroundOptions: {
          color: config.bgTransparent ? 'transparent' : config.bgColor,
        },
        cornersSquareOptions: {
          type: config.cornersSquareType,
          color: config.useCustomCornersSquareColor ? config.cornersSquareColor : (config.useFgGradient ? config.fgGradient.color1 : config.fgColor),
        },
        cornersDotOptions: {
          type: config.cornersDotType,
          color: config.useCustomCornersDotColor ? config.cornersDotColor : (config.useFgGradient ? config.fgGradient.color2 : config.fgColor),
        },
        image: config.logoUrl || undefined,
        imageOptions: {
          hideBackgroundDots: config.hideBgDotsBehindLogo,
          imageSize: config.logoSize,
          margin: Math.round((config.logoMargin * config.width) / 280),
          crossOrigin: 'anonymous',
        },
      };

      const exportInstance = new QRCodeStyling(exportOptions);
      const filename = `QR_${Date.now()}`;
      await exportInstance.download({ name: filename, extension: ext as any });

      onSaveHistory(`Descargado (${ext.toUpperCase()})`);
      showToast('success', `Código QR descargado exitosamente como ${ext.toUpperCase()}`);
    } catch (err) {
      console.error(err);
      showToast('error', 'Error al generar la descarga del código QR');
    } finally {
      setDownloading(null);
    }
  };

  const handleCopyImage = async () => {
    try {
      const canvas = qrRef.current?.querySelector('canvas');
      if (!canvas) {
        showToast('error', 'No se pudo capturar el gráfico del QR');
        return;
      }

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopied(true);
          showToast('success', 'Imagen del QR copiada al portapapeles');
          setTimeout(() => setCopied(false), 2000);
        } catch (e) {
          showToast('error', 'Tu navegador no permite copiar imágenes directamente');
        }
      }, 'image/png');
    } catch (e) {
      showToast('error', 'Error al copiar la imagen');
    }
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-6 flex flex-col items-center text-center sticky top-20">
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800/80">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-blue-400" />
          <span>Vista Previa en Tiempo Real</span>
        </span>
        <span className="text-[11px] font-mono text-slate-500">
          {config.width} × {config.height}px
        </span>
      </div>

      {/* QR Canvas Display or Error Fallback */}
      <div className="relative p-4 rounded-2xl bg-slate-950 border border-slate-800/90 shadow-2xl group transition-all duration-300 min-w-[280px] min-h-[280px] flex items-center justify-center">
        {payloadError ? (
          <div className="p-4 max-w-xs text-center space-y-2 text-rose-400">
            <AlertCircle className="w-8 h-8 mx-auto shrink-0" />
            <p className="text-xs font-semibold leading-relaxed">{payloadError}</p>
          </div>
        ) : (
          <div
            ref={qrRef}
            className="rounded-xl overflow-hidden flex items-center justify-center min-w-[280px] min-h-[280px]"
            style={{
              backgroundColor: config.bgTransparent ? '#00000000' : config.bgColor,
            }}
          />
        )}
        
        {config.bgTransparent && !payloadError && (
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:12px_12px] rounded-2xl" />
        )}
      </div>

      {/* Payload Preview text box */}
      <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-left">
        <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Contenido codificado (Payload):
        </span>
        <p className="text-xs font-mono text-slate-300 break-all line-clamp-2 selection:bg-blue-600 selection:text-white">
          {payload || 'https://qrstudio.app'}
        </p>
      </div>

      {/* Real-time Readability & Contrast Analyzer Gauge */}
      {!payloadError && (
        <ReadabilityGauge config={config} setConfig={setConfig} payload={payload} />
      )}

      {/* Export Action Buttons */}
      <div className="w-full space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleDownload('png')}
            disabled={downloading !== null || !!payloadError}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Descargar PNG</span>
          </button>

          <button
            onClick={() => handleDownload('svg')}
            disabled={downloading !== null || !!payloadError}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Vector SVG</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleDownload('jpeg')}
            disabled={downloading !== null || !!payloadError}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 rounded-xl text-xs font-medium transition-all disabled:opacity-50"
          >
            <span>JPG</span>
          </button>

          <button
            onClick={() => handleDownload('webp')}
            disabled={downloading !== null || !!payloadError}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 rounded-xl text-xs font-medium transition-all disabled:opacity-50"
          >
            <span>WEBP</span>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
          <button
            onClick={handleCopyImage}
            disabled={!!payloadError}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition-all disabled:opacity-50"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>{copied ? '¡Copiado!' : 'Copiar Imagen'}</span>
          </button>

          <button
            onClick={onSavePreset}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition-all"
            title="Guardar esta combinación de colores y formas como plantilla"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>Plantilla</span>
          </button>
        </div>
      </div>

    </div>
  );
};
