import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl shadow-slate-950/10 transition-all duration-300 relative overflow-hidden',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, ...props }) => (
  <div className={twMerge(clsx('flex items-center justify-between mb-4 border-b border-slate-800/80 pb-2.5', className))} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className, ...props }) => (
  <h3 className={twMerge(clsx('text-xs font-black text-slate-100 uppercase tracking-widest font-head', className))} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ children, className, ...props }) => (
  <div className={twMerge(clsx('', className))} {...props}>
    {children}
  </div>
);
