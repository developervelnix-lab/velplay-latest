import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const TableContainer = ({ children, className, ...props }) => (
  <div className={twMerge('w-full overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900 shadow-xl shadow-slate-950/10 transition-colors', className)} {...props}>
    <table className="w-full text-left border-collapse">{children}</table>
  </div>
);

export const TableHeader = ({ children, className, ...props }) => (
  <thead className={twMerge('bg-slate-950/60 border-b border-slate-800 text-[9px] font-bold uppercase tracking-widest text-slate-400', className)} {...props}>
    {children}
  </thead>
);

export const TableBody = ({ children, className, ...props }) => (
  <tbody className={twMerge('divide-y divide-slate-800/60', className)} {...props}>{children}</tbody>
);

export const TableRow = ({ children, className, onClick, ...props }) => (
  <tr 
    onClick={onClick} 
    className={twMerge('hover:bg-slate-800/30 transition-colors duration-150 cursor-pointer', className)} 
    {...props}
  >
    {children}
  </tr>
);

export const TableHead = ({ children, className, ...props }) => (
  <th className={twMerge('px-4 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest', className)} {...props}>{children}</th>
);

export const TableCell = ({ children, className, onClick, ...props }) => (
  <td onClick={onClick} className={twMerge('px-4 py-3 text-xs text-slate-300 whitespace-nowrap', className)} {...props}>{children}</td>
);

export const Table = TableContainer;
