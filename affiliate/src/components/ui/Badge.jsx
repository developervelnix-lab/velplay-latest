import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Badge = ({ children, className, variant = 'gray' }) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border';
  
  const variants = {
    gray: 'bg-slate-100 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700',
    green: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20',
    red: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20',
    yellow: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20',
    blue: 'bg-blue-50 dark:bg-sky-500/10 text-blue-600 dark:text-sky-400 border-blue-100 dark:border-sky-500/20'
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], className))}>
      {children}
    </span>
  );
};
