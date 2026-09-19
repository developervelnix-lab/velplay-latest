import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

export const RowDetailsModal = ({
  isOpen,
  onClose,
  data = [],
  currentIndex = 0,
  onIndexChange,
  title = "Record Details",
  fieldLabels = {},
  renderActions
}) => {
  if (!isOpen || !data || data.length === 0) return null;

  const currentItem = data[currentIndex] || data[0];
  const totalItems = data.length;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onIndexChange(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < totalItems - 1) {
        onIndexChange(currentIndex + 1);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, totalItems, onIndexChange, onClose]);

  const handlePrev = () => {
    if (currentIndex > 0) onIndexChange(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < totalItems - 1) onIndexChange(currentIndex + 1);
  };

  const formatLabel = (key) => {
    if (fieldLabels[key]) return fieldLabels[key];
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const entries = Object.entries(currentItem).filter(([k, v]) => {
    if (k === 'id' || k === 'key') return false;
    if (typeof v === 'object' && v !== null && !React.isValidElement(v)) return false;
    return true;
  });

  const modalJSX = (
    <div 
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[99999] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200" 
      onClick={onClose}
      style={{ zIndex: 99999 }}
    >
      <div 
        className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150 relative z-[100000]" 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-head uppercase tracking-wider">{title}</h3>
              <p className="text-[10px] text-slate-400 font-mono">Row details preview</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {currentIndex + 1} of {totalItems}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content - Field List Cards */}
        <div className="p-4 overflow-y-auto space-y-2.5 custom-scrollbar flex-1 text-left">
          {entries.map(([key, val]) => {
            const labelStr = formatLabel(key);
            let displayVal = val;
            
            if (typeof val === 'boolean') {
              displayVal = val ? 'Yes' : 'No';
            } else if (val === null || val === undefined || val === '') {
              displayVal = '-';
            }

            const isPnlField = key.toLowerCase().includes('pnl') || key.toLowerCase().includes('earnings') || key.toLowerCase().includes('gain');
            const isLoss = typeof val === 'number' && val < 0;

            return (
              <div key={key} className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-400 font-sans tracking-wide uppercase text-[10px]">{labelStr}</span>
                <span className={`text-xs font-bold font-mono text-right truncate max-w-[60%] ${
                  isPnlField 
                    ? (isLoss ? 'text-red-400 font-extrabold' : 'text-emerald-400 font-extrabold')
                    : 'text-slate-200'
                }`}>
                  {typeof val === 'number' && !key.toLowerCase().includes('count') && !key.toLowerCase().includes('pct') && !key.toLowerCase().includes('id')
                    ? (val < 0 ? '-' : '+') + '₹' + Math.abs(val).toLocaleString('en-IN')
                    : String(displayVal)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Modal Custom Action Buttons */}
        {renderActions && (
          <div className="px-4 py-3 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-end gap-2.5">
            {renderActions(currentItem, onClose)}
          </div>
        )}

        {/* Modal Footer Slide Controls */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-xs font-bold text-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4 text-cyan-400" />
            <span>Previous Slide</span>
          </button>

          <span className="text-xs font-mono font-black text-slate-400 px-2">
            {currentIndex + 1} / {totalItems}
          </span>

          <button
            onClick={handleNext}
            disabled={currentIndex === totalItems - 1}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-30 disabled:hover:from-blue-600 disabled:hover:to-cyan-600 text-xs font-bold text-white shadow-md shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Next Slide</span>
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalJSX, document.body);
};
