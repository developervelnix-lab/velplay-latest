import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Input = React.forwardRef(({ className, label, error, type = 'text', ...props }, ref) => {
  return (
    <div className="w-full mb-3 text-left">
      {label && <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1 ml-0.5">{label}</label>}
      <input
        ref={ref}
        type={type}
        className={twMerge(
          clsx(
            'w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-inner',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )
        )}
        {...props}
      />
      {error && <span className="block mt-0.5 text-[10px] text-red-400 font-medium">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
