import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Badge = ({ children, className, variant = 'gray' }) => {
  const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border';
  
  const variants = {
    gray: 'bg-slate-800 text-slate-400 border-slate-700/80',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    yellow: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    blue: 'bg-blue-500/10 text-cyan-400 border-blue-500/20',
    gold: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], className))}>
      {children}
    </span>
  );
};
