import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const TableContainer = ({ children, className }) => (
  <div className={twMerge('w-full overflow-x-auto border border-slate-200 dark:border-zinc-800/80 rounded-xl bg-white dark:bg-zinc-950/20 dark:backdrop-blur-sm shadow-sm dark:shadow-none transition-colors duration-300 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-zinc-700', className)}>
    <table className="w-full text-left border-collapse min-w-[540px] sm:min-w-full">{children}</table>
  </div>
);

export const TableHeader = ({ children, className }) => (
  <thead className={twMerge('bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 transition-colors duration-300', className)}>
    {children}
  </thead>
);

export const TableBody = ({ children, className }) => (
  <tbody className={twMerge('divide-y divide-slate-100 dark:divide-zinc-800/60 transition-colors duration-300', className)}>{children}</tbody>
);

export const TableRow = ({ children, className }) => (
  <tr className={twMerge('hover:bg-slate-50/80 dark:hover:bg-zinc-900/30 transition-colors duration-150', className)}>{children}</tr>
);

export const TableHead = ({ children, className }) => (
  <th className={twMerge('px-3.5 sm:px-4 py-3 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest whitespace-nowrap', className)}>{children}</th>
);

export const TableCell = ({ children, className }) => (
  <td className={twMerge('px-3.5 sm:px-4 py-3 text-xs text-slate-600 dark:text-zinc-400 whitespace-nowrap', className)}>{children}</td>
);
