import React from 'react';
import { Link } from 'react-router-dom';

export const AuthLayout = ({ children, title, subtitle, maxWidth = 'max-w-md' }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-500/30 flex flex-col items-center justify-center relative overflow-hidden py-8 px-4">
      {/* Premium Background Effects from Home */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[50%] rounded-full bg-cyan-400/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px]" />
      </div>

      {/* Auth Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-3 flex justify-center w-full">
        <header className="w-full max-w-5xl bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-xl py-2.5 px-5 shadow-sm shadow-slate-100 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo512.png" className="h-6 w-6 object-contain" alt="Logo" />
            <span className="text-lg font-black bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 bg-clip-text text-transparent tracking-tight font-head">
              VELPLAY
            </span>
            <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-[0.2em] block border-l border-slate-200 pl-2">
              Partners
            </span>
          </Link>
          <Link to="/" className="text-[10px] font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest font-display transition-colors">
            Back to Home
          </Link>
        </header>
      </div>
      
      {/* Auth Card Container */}
      <div className={`w-full ${maxWidth} z-10 mt-14`}>
        {(title || subtitle) && (
          <div className="text-center mb-5">
            {title && <h2 className="text-2xl font-black text-slate-900 font-display tracking-tight">{title}</h2>}
            {subtitle && <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-sm mx-auto">{subtitle}</p>}
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl shadow-blue-900/10 relative overflow-hidden group text-left">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none" />
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};


