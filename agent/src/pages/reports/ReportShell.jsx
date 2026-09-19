import React from 'react';
import { useAgent } from '../../context/AgentContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { FileSpreadsheet, Calendar, Search } from 'lucide-react';
import Swal from 'sweetalert2';

export const ReportShell = ({ title, subtitle, children, filters, totals }) => {
  const { dateRange, setDateRange } = useAgent();

  const handleExport = () => {
    Swal.fire({
      title: 'Generating Report',
      text: 'Creating CSV file layout. Download starting...',
      icon: 'info',
      toast: true,
      position: 'top-end',
      timer: 3000,
      showConfirmButton: false,
      background: '#1e293b',
      color: '#fff'
    });
  };

  return (
    <div className="p-6 space-y-6 text-left relative z-10">
      
      {/* Title & Date range filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="space-y-1">
          <h2 className="text-base font-black text-slate-100 uppercase tracking-widest font-head">{title}</h2>
          {subtitle && <p className="text-[10px] text-slate-500 font-medium">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Custom Date Filters */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="bg-transparent text-[11px] font-bold text-slate-300 focus:outline-none cursor-pointer"
            />
            <span className="text-slate-650 text-xs">-</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="bg-transparent text-[11px] font-bold text-slate-300 focus:outline-none cursor-pointer"
            />
          </div>

          {/* Dynamic page filters */}
          {filters}

          <button
            onClick={handleExport}
            className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] font-bold uppercase tracking-wider text-slate-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Grid Table Child Content */}
      <div className="space-y-4">
        {children}
        
        {/* Totals Summary Line */}
        {totals && (
          <Card className="bg-slate-950/60 border-slate-800/80">
            <CardContent className="py-2.5 flex flex-wrap justify-between items-center gap-4 text-xs font-bold font-mono">
              <span className="text-slate-400 font-sans uppercase text-[10px] tracking-wider">Report Grand Totals:</span>
              <div className="flex gap-6">
                {Object.entries(totals).map(([key, val]) => (
                  <div key={key} className="flex gap-1.5 items-baseline">
                    <span className="text-slate-500 font-sans text-[10px] font-normal uppercase">{key}:</span>
                    <span className={val < 0 ? 'text-red-400' : typeof val === 'string' ? 'text-slate-200' : 'text-emerald-400'}>
                      {typeof val === 'number' ? (val < 0 ? '-' : '+') + '₹' + Math.abs(val).toLocaleString(undefined, { minimumFractionDigits: 2 }) : val}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
};
