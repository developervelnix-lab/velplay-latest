import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white dark:bg-zinc-900/50 border border-slate-200/60 dark:border-zinc-800 rounded-xl p-5 shadow-sm dark:shadow-none transition-colors duration-300',
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
  <div className={twMerge(clsx('flex items-center justify-between mb-3', className))} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className, ...props }) => (
  <h3 className={twMerge(clsx('text-sm font-bold text-slate-900 dark:text-zinc-100 tracking-tight', className))} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ children, className, ...props }) => (
  <div className={twMerge(clsx('', className))} {...props}>
    {children}
  </div>
);
