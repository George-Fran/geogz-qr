import React, { useState, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { BulkItem, QRStyleConfig } from '../../types/qr';
import { parseCSVInput } from '../../utils/qrUtils';
import { LabelSheetModal } from './LabelSheetModal';
import {
  Layers,
  Upload,
  FileText,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Play,
  Grid,
  List,
  ListFilter,
  RefreshCw,
  Copy,
  Maximize2,
  Printer,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  FileSpreadsheet,
} from 'lucide-react';

interface BulkQRViewProps {
  config: QRStyleConfig;
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const BulkQRView: React.FC<BulkQRViewProps> = ({ config, showToast }) => {
  const [inputMode, setInputMode] = useState<'lines' | 'csv' | 'sequence'>('lines');
  const [displayView, setDisplayView] = useState<'large-grid' | 'compact'>('large-grid');
  
  const [rawLines, setRawLines] = useState(
    'Mesa 01, https://menu.app/mesa/01\nMesa 02, https://menu.app/mesa/02\nMesa 03, https://menu.app/mesa/03\nMesa 04, https://menu.app/mesa/04\nMesa 05, https://menu.app/mesa/05\nMesa 06, https://menu.app/mesa/06'
  );

  // Sequence generator state
  const [seqPrefix, setSeqPrefix] = useState('https://mi-tienda.com/producto/');
  const [seqLabelPrefix, setSeqLabelPrefix] = useState('Producto #');
  const [seqStart, setSeqStart] = useState(1);
  const [seqCount, setSeqCount] = useState(12);

  const [items, setItems] = useState<BulkItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportingZip, setExportingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  // Modal inspection state
  const [selectedModalIndex, setSelectedModalIndex] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLabelSheetOpen, setIsLabelSheetOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse lines into bulk items
  const handleParseInput = () => {
    let parsed: { label: string; value: string }[] = [];

    if (inputMode === 'lines' || inputMode === 'csv') {
      parsed = parseCSVInput(rawLines);
    } else if (inputMode === 'sequence') {
      const startNum = Number(seqStart) || 1;
      const total = Math.min(Math.max(Number(seqCount) || 1, 1), 500);
      for (let i = 0; i < total; i++) {
        const num = startNum + i;
        const padded = String(num).padStart(2, '0');
        parsed.push({
          label: `${seqLabelPrefix}${padded}`,
          value: `${seqPrefix}${padded}`,
        });
      }
    }

    if (parsed.length === 0) {
      showToast('error', 'No se encontraron datos válidos para generar códigos QR.');
      return;
    }

    const newItems: BulkItem[] = parsed.map((item, idx) => ({
      id: `bulk_${Date.now()}_${idx}`,
      label: item.label,
      value: item.value,
      status: 'pending',
    }));

    setItems(newItems);
    showToast('info', `Se prepararon ${newItems.length} elementos. Presiona "Generar Todos los QR" para crear las imágenes.`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawLines(content);
        setInputMode('csv');
        showToast('success', `Archivo "${file.name}" cargado exitosamente.`);
      }
    };
    reader.readAsText(file);
  };

  // Generate QR Canvas Blobs for all items
  const handleGenerateBatch = async () => {
    if (items.length === 0) return;
    setIsGenerating(true);

    const updated = [...items];

    for (let i = 0; i < updated.length; i++) {
      try {
        const item = updated[i];
        const qr = new QRCodeStyling({
          width: 500,
          height: 500,
          type: 'canvas',
          data: item.value,
          margin: config.margin,
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
            margin: config.logoMargin,
            crossOrigin: 'anonymous',
          },
        });

        // Get blob data
        const rawBlob = await qr.getRawData('png');
        if (rawBlob) {
          const blobUrl = URL.createObjectURL(rawBlob as Blob);
          updated[i] = {
            ...item,
            status: 'ready',
            dataUrl: blobUrl,
          };
        }
      } catch (e) {
        updated[i] = {
          ...updated[i],
          status: 'error',
          error: 'Error al generar',
        };
      }
    }

    setItems(updated);
    setIsGenerating(false);
    showToast('success', `¡Generación completada! ${updated.length} códigos QR listos en vista previa grande.`);
  };

  // Export ZIP package
  const handleDownloadZip = async () => {
    const readyItems = items.filter((i) => i.status === 'ready' && i.dataUrl);
    if (readyItems.length === 0) {
      showToast('error', 'Genera los códigos QR antes de descargar el paquete ZIP.');
      return;
    }

    setExportingZip(true);
    setZipProgress(0);

    try {
      const zip = new JSZip();
      const folder = zip.folder('codigos_qr');

      for (let i = 0; i < readyItems.length; i++) {
        const item = readyItems[i];
        if (item.dataUrl) {
          const response = await fetch(item.dataUrl);
          const blob = await response.blob();
          const sanitizeLabel = item.label.replace(/[^a-zA-Z0-9_-]/g, '_');
          folder?.file(`${String(i + 1).padStart(2, '0')}_${sanitizeLabel}.png`, blob);
        }
        setZipProgress(Math.round(((i + 1) / readyItems.length) * 100));
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `QR_Lote_Masivo_${Date.now()}.zip`);
      showToast('success', 'Paquete ZIP descargado exitosamente.');
    } catch (e) {
      console.error(e);
      showToast('error', 'Error al comprimir el paquete ZIP.');
    } finally {
      setExportingZip(false);
      setZipProgress(0);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('success', 'Enlace/texto copiado');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrintSheet = () => {
    window.print();
  };

  const selectedItem = selectedModalIndex !== null ? items[selectedModalIndex] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0 print:m-0">
      
      {/* Printable CSS Rules */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          header, footer, .no-print { display: none !important; }
          .print-container { display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 20px !important; }
          .print-card { border: 1px solid #ccc !important; padding: 16px !important; text-align: center !important; page-break-inside: avoid !important; }
        }
      `}</style>

      {/* Header (Hidden in Print) */}
      <div className="no-print flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Layers className="w-8 h-8 text-blue-500" />
            <span>Generador de Códigos QR Masivo</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Genera lotes de códigos QR con tus marcas y colores en vista previa grande y descárgalos en paquete ZIP.
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsLabelSheetOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/20"
              title="Diseñar e imprimir planilla de etiquetas PDF"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Planilla Etiquetas PDF</span>
            </button>

            <button
              onClick={handlePrintSheet}
              className="px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition-all flex items-center gap-1.5"
              title="Imprimir hoja de trabajo"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={() => setItems([])}
              className="px-3.5 py-2 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 rounded-xl transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          </div>
        )}
      </div>

      <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input sources (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>1. Configurar Datos del Lote</span>
            </h2>

            {/* Selector mode tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
              <button
                onClick={() => setInputMode('lines')}
                className={`py-2 px-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                  inputMode === 'lines'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Lista / Texto
              </button>
              <button
                onClick={() => setInputMode('csv')}
                className={`py-2 px-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                  inputMode === 'csv'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Archivo CSV
              </button>
              <button
                onClick={() => setInputMode('sequence')}
                className={`py-2 px-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                  inputMode === 'sequence'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Secuencial
              </button>
            </div>

            {/* Input by Text lines */}
            {(inputMode === 'lines' || inputMode === 'csv') && (
              <div className="space-y-3">
                {inputMode === 'csv' && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-950 border border-dashed border-slate-700 hover:border-blue-500 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all group"
                    >
                      <Upload className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
                      <span>Cargar Archivo CSV o TXT</span>
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Formato: <span className="font-mono text-blue-400">Etiqueta, Enlace o Texto</span> (Uno por línea)
                  </label>
                  <textarea
                    rows={8}
                    value={rawLines}
                    onChange={(e) => setRawLines(e.target.value)}
                    placeholder="Mesa 1, https://mi-restaurante.com/m1&#10;Mesa 2, https://mi-restaurante.com/m2"
                    className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Soporta copiar directamente desde Excel o Google Sheets.
                  </p>
                </div>
              </div>
            )}

            {/* Input by Sequence Builder */}
            {inputMode === 'sequence' && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Prefijo de Enlace (URL Base)
                  </label>
                  <input
                    type="text"
                    value={seqPrefix}
                    onChange={(e) => setSeqPrefix(e.target.value)}
                    placeholder="https://menu.app/mesa/"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nombre Etiqueta
                    </label>
                    <input
                      type="text"
                      value={seqLabelPrefix}
                      onChange={(e) => setSeqLabelPrefix(e.target.value)}
                      placeholder="Mesa #"
                      className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Cantidad Total
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={seqCount}
                      onChange={(e) => setSeqCount(Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleParseInput}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700"
            >
              <ListFilter className="w-4 h-4 text-blue-400" />
              <span>Cargar y Procesar Lote</span>
            </button>
          </div>
        </div>

        {/* Right Column: Preview Grid & Large Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-6">
            
            {/* Action Bar & Display Switcher */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>2. Vista Previa de Lote ({items.length})</span>
                </h2>

                {/* Display Toggle Buttons */}
                {items.length > 0 && (
                  <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-lg">
                    <button
                      onClick={() => setDisplayView('large-grid')}
                      className={`p-1.5 rounded-md text-xs transition-colors flex items-center gap-1 ${
                        displayView === 'large-grid'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="Vista de Cuadrícula Grande"
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-semibold hidden sm:inline">Tarjetas Grandes</span>
                    </button>
                    <button
                      onClick={() => setDisplayView('compact')}
                      className={`p-1.5 rounded-md text-xs transition-colors flex items-center gap-1 ${
                        displayView === 'compact'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="Vista Lista Compacta"
                    >
                      <List className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-semibold hidden sm:inline">Lista</span>
                    </button>
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={handleGenerateBatch}
                    disabled={isGenerating}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 fill-white" />
                    )}
                    <span>{isGenerating ? 'Generando...' : 'Generar Todos los QR'}</span>
                  </button>

                  <button
                    onClick={handleDownloadZip}
                    disabled={exportingZip || items.filter((i) => i.status === 'ready').length === 0}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar ZIP</span>
                  </button>
                </div>
              )}
            </div>

            {/* ZIP Export progress bar */}
            {exportingZip && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-2">
                <div className="flex justify-between text-xs font-semibold text-emerald-300">
                  <span>Comprimiendo archivo ZIP...</span>
                  <span className="font-mono">{zipProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-200"
                    style={{ width: `${zipProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Items Grid / Empty State */}
            {items.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                  <Grid className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-300">Ningún lote cargado</h3>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Procesa tus elementos en el panel izquierdo y presiona "Generar Todos los QR" para ver la vista previa grande.
                  </p>
                </div>
              </div>
            ) : displayView === 'large-grid' ? (
              /* LARGE PREVIEW GRID MODE (VISTA PREVIA GRANDE) */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[680px] overflow-y-auto pr-1 custom-scrollbar">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-slate-950 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between space-y-4 group transition-all duration-200 shadow-lg hover:shadow-xl relative"
                  >
                    {/* Header bar of Card */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                          #{String(idx + 1).padStart(2, '0')}
                        </span>
                        <h3 className="text-xs font-bold text-white truncate">{item.label}</h3>
                      </div>

                      {item.status === 'ready' ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="Código Generado" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-600" title="Pendiente" />
                      )}
                    </div>

                    {/* Prominent Large QR Frame */}
                    <div
                      onClick={() => setSelectedModalIndex(idx)}
                      className="relative cursor-pointer aspect-square bg-white rounded-xl p-3 flex items-center justify-center shadow-inner group-hover:scale-[1.02] transition-transform overflow-hidden"
                      style={{
                        backgroundColor: config.bgTransparent ? '#ffffff' : config.bgColor,
                      }}
                    >
                      {item.dataUrl ? (
                        <img
                          src={item.dataUrl}
                          alt={item.label}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-2 text-slate-400 p-4 text-center">
                          <RefreshCw className="w-6 h-6 animate-spin text-slate-500" />
                          <span className="text-[11px] font-medium text-slate-500">
                            Presiona "Generar QR"
                          </span>
                        </div>
                      )}

                      {/* Zoom Overlay on hover */}
                      {item.dataUrl && (
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-opacity flex items-center justify-center text-white gap-2 font-semibold text-xs">
                          <Maximize2 className="w-4 h-4 text-blue-400" />
                          <span>Ampliar</span>
                        </div>
                      )}
                    </div>

                    {/* Payload Details */}
                    <div className="space-y-2">
                      <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2 flex items-center justify-between gap-2">
                        <p className="text-[10px] font-mono text-slate-300 truncate" title={item.value}>
                          {item.value}
                        </p>
                        <button
                          onClick={() => handleCopyText(item.id, item.value)}
                          className="p-1 text-slate-400 hover:text-white rounded transition-colors shrink-0"
                          title="Copiar texto / enlace"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {item.dataUrl ? (
                          <a
                            href={item.dataUrl}
                            download={`${item.label.replace(/\s+/g, '_')}.png`}
                            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600/15 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 rounded-xl text-xs font-semibold transition-all"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Descargar PNG</span>
                          </a>
                        ) : (
                          <button
                            disabled
                            className="w-full py-2 px-3 bg-slate-900 text-slate-600 rounded-xl text-xs font-medium border border-slate-800 cursor-not-allowed"
                          >
                            Pendiente
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              /* COMPACT LIST VIEW MODE */
              <div className="max-h-[520px] overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Thumbnail */}
                      <div
                        onClick={() => setSelectedModalIndex(idx)}
                        className="w-14 h-14 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden border border-slate-700 cursor-pointer"
                      >
                        {item.dataUrl ? (
                          <img src={item.dataUrl} alt={item.label} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full bg-slate-200 rounded animate-pulse" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">{item.label}</span>
                          <span className="text-[10px] font-mono text-slate-500">#{idx + 1}</span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-400 truncate max-w-xs mt-0.5">
                          {item.value}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.status === 'ready' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Listo</span>
                        </span>
                      )}

                      {item.dataUrl && (
                        <a
                          href={item.dataUrl}
                          download={`${item.label.replace(/\s+/g, '_')}.png`}
                          className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Descargar imagen PNG individual"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* FULLSCREEN MODAL INSPECTOR FOR LARGE PREVIEW */}
      {selectedItem && selectedModalIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 no-print">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            
            {/* Close button */}
            <button
              onClick={() => setSelectedModalIndex(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg">
                #{String(selectedModalIndex + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">{selectedItem.label}</h3>
                <p className="text-[11px] font-mono text-slate-400 truncate max-w-xs">
                  {selectedItem.value}
                </p>
              </div>
            </div>

            {/* Large High-Res Canvas Image Box */}
            <div className="relative aspect-square bg-white rounded-2xl p-6 flex items-center justify-center shadow-inner border border-slate-700">
              {selectedItem.dataUrl ? (
                <img
                  src={selectedItem.dataUrl}
                  alt={selectedItem.label}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-slate-400 text-xs">Sin imagen generada</div>
              )}
            </div>

            {/* Modal Controls & Downloads */}
            <div className="space-y-3">
              {selectedItem.dataUrl && (
                <a
                  href={selectedItem.dataUrl}
                  download={`${selectedItem.label.replace(/\s+/g, '_')}.png`}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar esta Imagen PNG</span>
                </a>
              )}

              {/* Prev / Next Navigation */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  onClick={() => setSelectedModalIndex(Math.max(0, selectedModalIndex - 1))}
                  disabled={selectedModalIndex === 0}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                <span className="text-[11px] font-mono text-slate-500">
                  {selectedModalIndex + 1} de {items.length}
                </span>

                <button
                  onClick={() => setSelectedModalIndex(Math.min(items.length - 1, selectedModalIndex + 1))}
                  disabled={selectedModalIndex === items.length - 1}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* PRINT SHEET VIEW (Only visible when printing Ctrl+P) */}
      <div className="hidden print:block print-container">
        {items.map((item, idx) => (
          <div key={item.id} className="print-card">
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
              {item.label} #{idx + 1}
            </h3>
            {item.dataUrl ? (
              <img src={item.dataUrl} alt={item.label} style={{ width: '180px', height: '180px', margin: '0 auto' }} />
            ) : (
              <div>[QR]</div>
            )}
            <p style={{ fontSize: '10px', fontFamily: 'monospace', marginTop: '8px', wordBreak: 'break-all' }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Label Sheet PDF Modal */}
      <LabelSheetModal
        isOpen={isLabelSheetOpen}
        onClose={() => setIsLabelSheetOpen(false)}
        items={items}
        showToast={showToast}
      />

    </div>
  );
};
