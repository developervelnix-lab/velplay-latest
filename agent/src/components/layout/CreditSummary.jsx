import React from 'react';
import { useAgent } from '../../context/AgentContext';
import { Wallet, ShieldAlert, Award, Zap } from 'lucide-react';

export const CreditSummary = () => {
  const { agentMe } = useAgent();

  const balance = agentMe.balance;
  const exposure = agentMe.exposure;
  const available = balance - exposure;

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-2 sm:px-6 py-1 sm:py-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 sm:gap-4">
      {/* Scope Info Badge */}
      <div className="flex items-center gap-1.5 sm:gap-2 justify-between sm:justify-start">
        <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider font-mono flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-cyan-400 shrink-0" /> Node: <span className="truncate max-w-[100px] sm:max-w-none">{agentMe.role}</span>
        </div>
        <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-gradient-to-r from-blue-600/20 to-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider font-mono shrink-0">
          Rev-Share: {agentMe.partnership}%
        </div>
      </div>

      {/* Credit Metric Cards */}
      <div className="grid grid-cols-3 sm:flex items-center gap-1.5 sm:gap-4 text-left w-full sm:w-auto">
        {/* Total Credit */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 bg-slate-950/60 border border-slate-800/90 px-1.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl shadow-inner min-w-0">
          <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-tight sm:tracking-widest leading-none truncate">Credit Limit</span>
            <span className="text-[10px] sm:text-xs font-black text-slate-100 font-mono mt-0.5 block truncate">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Risk Exposure */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 bg-slate-950/60 border border-slate-800/90 px-1.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl shadow-inner min-w-0">
          <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <ShieldAlert className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-tight sm:tracking-widest leading-none truncate">Risk Exposure</span>
            <span className="text-[10px] sm:text-xs font-black text-red-400 font-mono mt-0.5 block truncate">₹{exposure.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Available Margin */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/30 px-1.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl shadow-sm min-w-0">
          <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-[7px] sm:text-[8px] font-black text-emerald-400 uppercase tracking-tight sm:tracking-widest leading-none truncate">Available Margin</span>
            <span className="text-[10px] sm:text-xs font-black text-emerald-300 font-mono mt-0.5 block truncate">₹{available.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
