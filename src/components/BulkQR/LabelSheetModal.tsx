import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import { BulkItem } from '../../types/qr';
import { generateLabelSheetPDF, LabelSheetOptions } from '../../utils/pdfGenerator';
import {
  FileCheck,
  X,
  Printer,
  Download,
  Grid,
  Sparkles,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

interface LabelSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: BulkItem[];
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const LabelSheetModal: React.FC<LabelSheetModalProps> = ({
  isOpen,
  onClose,
  items,
  showToast,
}) => {
  const [options, setOptions] = useState<LabelSheetOptions>({
    paperSize: 'a4',
    grid: '3x4',
    showLabel: true,
    customSubtitle: 'Escanea con la cámara de tu teléfono',
    showCutLines: true,
  });

  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const readyItems = items.filter((i) => i.status === 'ready' && i.dataUrl);

  let cols = 3;
  let rows = 4;
  if (options.grid === '2x3') { cols = 2; rows = 3; }
  else if (options.grid === '3x4') { cols = 3; rows = 4; }
  else if (options.grid === '4x5') { cols = 4; rows = 5; }
  else if (options.grid === '5x6') { cols = 5; rows = 6; }

  const itemsPerPage = cols * rows;
  const totalPages = Math.ceil(readyItems.length / itemsPerPage) || 1;

  const handleExportPDF = async () => {
    if (readyItems.length === 0) {
      showToast('error', 'Genera primero los códigos QR del lote antes de exportar la planilla.');
      return;
    }

    setIsExporting(true);
    try {
      const pdfBlob = await generateLabelSheetPDF(items, options);
      saveAs(pdfBlob, `Planilla_Etiquetas_QR_${Date.now()}.pdf`);
      showToast('success', 'Planilla PDF generada y descargada exitosamente.');
      onClose();
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Error al generar el documento PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintSheet = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 no-print">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            <span>Diseñador de Planilla de Etiquetas (PDF / Stickers)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Exporta tus códigos QR organizados en un documento PDF listo para imprimir en papel adhesivo o cartulina.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          
          {/* Options Column */}
          <div className="space-y-4">
            
            {/* Grid Layout Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Distribución por Página (Grid)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: '2x3', name: '2 × 3 (6 Grandes)', desc: 'Para mesas o pósters' },
                  { id: '3x4', name: '3 × 4 (12 Medianos)', desc: 'Para empaques y envases' },
                  { id: '4x5', name: '4 × 5 (20 Stickers)', desc: 'Etiquetas estándar' },
                  { id: '5x6', name: '5 × 6 (30 Mini)', desc: 'Etiquetas de inventario' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setOptions({ ...options, grid: g.id as any })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      options.grid === g.id
                        ? 'bg-blue-600/15 border-blue-500 text-blue-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/80'
                    }`}
                  >
                    <span className="block text-xs font-bold">{g.name}</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">{g.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Paper Format */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tamaño del Papel
              </label>
              <select
                value={options.paperSize}
                onChange={(e) => setOptions({ ...options, paperSize: e.target.value as any })}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
              >
                <option value="a4">A4 (210 × 297 mm)</option>
                <option value="letter">Carta / Letter (216 × 279 mm)</option>
              </select>
            </div>

            {/* Custom Subtitle Banner */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Pie de Etiqueta (Llamada a la Acción)
              </label>
              <input
                type="text"
                value={options.customSubtitle}
                onChange={(e) => setOptions({ ...options, customSubtitle: e.target.value })}
                placeholder="Escanea con la cámara de tu teléfono"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={options.showLabel}
                  onChange={(e) => setOptions({ ...options, showLabel: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                />
                <span>Incluir título / nombre del elemento</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={options.showCutLines}
                  onChange={(e) => setOptions({ ...options, showCutLines: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                />
                <span>Mostrar líneas punteadas de corte (Guillotina / Tijera)</span>
              </label>
            </div>

          </div>

          {/* Live Sheet Summary / Preview Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-4">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Resumen del Documento
              </span>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Códigos QR listos:</span>
                  <span className="font-mono font-bold text-emerald-400">{readyItems.length}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Etiquetas por página:</span>
                  <span className="font-mono font-bold text-blue-400">{itemsPerPage}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Páginas totales calculadas:</span>
                  <span className="font-mono font-bold text-white">{totalPages} pág.</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Formato de hoja:</span>
                  <span className="font-mono text-slate-300 uppercase">{options.paperSize}</span>
                </div>
              </div>
            </div>

            {/* Visual Mini Mockup of Sheet */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 aspect-[1/1.3] flex flex-col items-center justify-center space-y-1">
              <div
                className="w-full h-full bg-white rounded p-1.5 grid gap-1 border border-slate-300"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: itemsPerPage }).map((_, i) => (
                  <div
                    key={i}
                    className={`border border-dashed border-slate-300 rounded flex flex-col items-center justify-center p-0.5 ${
                      i < readyItems.length ? 'bg-blue-50' : 'bg-slate-50 opacity-40'
                    }`}
                  >
                    <div className="w-2.5 h-2.5 bg-slate-800 rounded-sm" />
                    {options.showLabel && <div className="w-3 h-0.5 bg-slate-400 rounded mt-0.5" />}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl transition-all"
          >
            Cancelar
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting || readyItems.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generando PDF...' : 'Descargar PDF de Planilla'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
