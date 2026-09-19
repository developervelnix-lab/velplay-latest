import React from 'react';
import { ShieldCheck, Zap } from 'lucide-react';

export const PageLoader = ({ message = "Loading live data..." }) => {
  return (
    <div className="min-h-[450px] w-full flex flex-col items-center justify-center p-8 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xs rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs animate-in fade-in duration-200">
      <div className="relative flex items-center justify-center mb-4">
        {/* Pulsing Outer Glow */}
        <div className="absolute w-16 h-16 bg-cyan-500/20 dark:bg-cyan-500/30 rounded-full blur-xl animate-pulse" />
        {/* Spinning Ring */}
        <div className="w-12 h-12 rounded-full border-2 border-slate-200 dark:border-slate-800 border-t-cyan-500 border-r-blue-500 animate-spin" />
        <Zap className="w-5 h-5 text-cyan-400 absolute animate-pulse" />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight font-display">
          {message}
        </span>
      </div>

      <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" /> Fetching Real-Time Data Engine
      </p>

      {/* Shimmer skeleton bars below */}
      <div className="w-full max-w-md mt-6 space-y-2.5">
        <div className="h-2 w-full bg-slate-200/80 dark:bg-slate-800/80 rounded-full animate-pulse" />
        <div className="h-2 w-3/4 bg-slate-200/50 dark:bg-slate-800/50 rounded-full animate-pulse mx-auto" />
      </div>
    </div>
  );
};
