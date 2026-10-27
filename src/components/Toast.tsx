import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-slate-900/95 text-slate-100',
    error: 'border-rose-500/30 bg-slate-900/95 text-slate-100',
    info: 'border-blue-500/30 bg-slate-900/95 text-slate-100',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200 ${borders[toast.type]}`}
      >
        {icons[toast.type]}
        <p className="text-xs font-medium pr-2 leading-relaxed">{toast.text}</p>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors ml-auto"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
