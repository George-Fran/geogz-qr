import React from 'react';
import { QRStyleConfig } from '../../types/qr';
import { analyzeReadability } from '../../utils/readabilityAnalyzer';
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  Wand2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ReadabilityGaugeProps {
  config: QRStyleConfig;
  setConfig: React.Dispatch<React.SetStateAction<QRStyleConfig>>;
  payload: string;
}

export const ReadabilityGauge: React.FC<ReadabilityGaugeProps> = ({
  config,
  setConfig,
  payload,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const report = analyzeReadability(config, payload);

  const statusColors = {
    excellent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    warning: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    error: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  };

  const barColors = {
    excellent: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
  };

  const statusIcons = {
    excellent: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
  };

  // Auto-Fix handler
  const handleAutoFix = () => {
    setConfig((prev) => {
      let updated = { ...prev };

      // Fix contrast if poor
      if (report.contrastRatio < 3.0) {
        updated.fgColor = '#0f172a';
        updated.bgColor = '#ffffff';
        updated.bgTransparent = false;
        if (updated.useFgGradient) {
          updated.fgGradient = {
            ...updated.fgGradient,
            color1: '#0f172a',
            color2: '#2563eb',
          };
        }
      }

      // Fix EC Level if logo is large
      if (updated.logoUrl && updated.logoSize > 0.22) {
        updated.ecLevel = 'Q';
      }

      // Fix Margin if tight
      if (updated.margin < 8) {
        updated.margin = 12;
      }

      return updated;
    });
  };

  return (
    <div className="w-full bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 space-y-3">
      {/* Header bar with Score */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {statusIcons[report.status]}
          <div className="min-w-0">
            <span className="block text-xs font-bold text-white truncate">
              {report.title}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Contraste: {report.contrastRatio.toFixed(1)}:1
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {report.status !== 'excellent' && (
            <button
              type="button"
              onClick={handleAutoFix}
              className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 shadow-sm"
              title="Corregir contraste y parámetros automáticamente"
            >
              <Wand2 className="w-3 h-3" />
              <span>Auto-Corregir</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress Bar Meter */}
      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${barColors[report.status]}`}
          style={{ width: `${report.score}%` }}
        />
      </div>

      {/* Diagnostic messages dropdown details */}
      {isExpanded && (
        <div className="pt-2 border-t border-slate-800/80 space-y-2 animate-in fade-in duration-150">
          {report.messages.map((msg, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-300"
            >
              {msg.type === 'success' && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              {msg.type === 'warning' && (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              )}
              {msg.type === 'error' && (
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              )}
              {msg.type === 'info' && (
                <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
              )}
              <span>{msg.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
