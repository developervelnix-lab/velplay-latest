import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Button = ({ children, className, variant = 'primary', size = 'md', isLoading, ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 text-white hover:from-blue-800 hover:via-blue-700 hover:to-cyan-600 focus:ring-blue-500 shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 border-0',
    secondary: 'bg-slate-800 dark:bg-zinc-800 text-slate-100 dark:text-zinc-100 hover:bg-slate-700 dark:hover:bg-zinc-700 focus:ring-slate-700 dark:focus:ring-zinc-700 border border-slate-700 dark:border-zinc-700',
    outline: 'border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 focus:ring-slate-200 dark:focus:ring-zinc-800 bg-white dark:bg-transparent shadow-sm dark:shadow-none',
    danger: 'bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700 focus:ring-red-500 shadow-md shadow-red-500/20',
    ghost: 'text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white focus:ring-slate-200 dark:focus:ring-zinc-800'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold',
    md: 'px-4 py-2 text-xs font-bold',
    lg: 'px-6 py-3 text-sm font-bold uppercase tracking-wider'
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
};
