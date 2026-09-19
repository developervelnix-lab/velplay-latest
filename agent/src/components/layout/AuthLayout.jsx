import React from 'react';
import { Link } from 'react-router-dom';

export const AuthLayout = ({ children, title, subtitle, maxWidth = 'max-w-md' }) => {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-x-hidden selection:bg-blue-500/30">
      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

      {/* Auth Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-3 flex justify-center w-full">
        <header className="w-full max-w-5xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl py-3 px-5 shadow-lg flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo512.png" className="h-6 w-6 object-contain" alt="Logo" />
            <span className="text-lg font-black bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 bg-clip-text text-transparent tracking-tight font-head">
              VELPLAY
            </span>
            <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-[0.2em] block border-l border-slate-800 pl-2">
              Agent Program
            </span>
          </Link>
          <Link to="/" className="text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-widest font-display transition-colors">
            Back to Home
          </Link>
        </header>
      </div>

      {/* Panel Form Wrapper */}
      <div className={`w-full ${maxWidth} bg-slate-900 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 mt-16`}>
        <div className="text-center mb-6 space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-white font-display leading-tight">{title}</h2>
          {subtitle && <p className="text-slate-400 text-xs font-normal max-w-sm mx-auto">{subtitle}</p>}
        </div>
        
        {children}
      </div>

      {/* Trust Footer */}
      <div className="mt-8 text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest relative z-10 flex items-center gap-1.5 justify-center">
        <span>256-bit SSL Certified Encryption</span>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span>Secure Identity Node</span>
      </div>
    </div>
  );
};
