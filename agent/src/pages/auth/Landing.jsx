import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  HelpCircle, 
  TrendingUp, 
  CheckCircle2, 
  Zap, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  Lock,
  Menu,
  X
} from 'lucide-react';

export const Landing = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const benefits = [
    { 
      title: 'Real-Time Liability Tracker', 
      desc: 'Monitor stakes, active exposure thresholds, and fancy market wagers instantenously without delays.', 
      icon: TrendingUp, 
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' 
    },
    { 
      title: 'Flexible Credit Delegation', 
      desc: 'Allocate credits downstream to players and sub-agents while monitoring overall books with risk rules.', 
      icon: Award, 
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' 
    },
    { 
      title: 'Multi-Level Downlines', 
      desc: 'Control commissions and override limits across Super Agents, Masters, and direct agent accounts.', 
      icon: Users, 
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' 
    },
    { 
      title: 'Aggregated Book Analytics', 
      desc: 'Access complete revenue sheets comparing player deposits, withdrawals, and nominal wins under your scope.', 
      icon: ShieldCheck, 
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
    }
  ];

  const faqs = [
    {
      q: 'How does the Velplay Agent Panel work?',
      a: 'The Agent Panel is designed for bookmakers and master agents. You receive credit balances from your upline, which you can distribute downstream to your sub-agents and players. You hold custom partnership revenue shares of all net wagers.'
    },
    {
      q: 'What is the review time for agent applications?',
      a: 'All submitted applications are reviewed by our regional risk compliance team. Typically, reviews take between 12 to 24 hours, after which your account goes live immediately.'
    },
    {
      q: 'What are the credit reference guidelines?',
      a: 'Your credit reference determines the maximum downstream allocation limits. You can request balance increments from the financial support console at any time.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 relative overflow-x-hidden selection:bg-blue-500/30">
      {/* Lightweight hardware-accelerated radial gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_15%_15%,rgba(29,78,216,0.12),transparent_35%),radial-gradient(circle_at_85%_85%,rgba(34,211,238,0.08),transparent_35%)]" />

      {/* Floating Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 flex justify-center w-full">
        <header className="w-full max-w-7xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl py-3 px-6 shadow-lg flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <img src="/logo512.png" className="h-7 w-7 object-contain" alt="Velplay Logo" />
            <div className="flex flex-col">
              <span className="text-sm font-black bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 bg-clip-text text-transparent tracking-tight font-head">
                VELPLAY
              </span>
              <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-[0.25em] -mt-0.5">
                Agent Program
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <a href="#benefits" className="hover:text-white transition-colors">Features</a>
            <a href="#hierarchy" className="hover:text-white transition-colors">Hierarchy</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            <Link to="/login">
              <button className="text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider px-4 py-2 cursor-pointer">Sign In</button>
            </Link>
            <Link to="/apply">
              <button className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 hover:scale-[1.02] active:scale-[0.98] transition-transform text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md border-0 py-2.5 px-4 flex items-center gap-1.5 cursor-pointer">
                Apply for Account
              </button>
            </Link>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-400 hover:text-white">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left */}
          <div className="lg:col-span-7 space-y-6 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 shadow-sm mx-auto sm:mx-0">
              <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></span>
              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider">Verified Agent Console</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] text-white font-display">
              Run your book on the<br />
              same console{' '}
              <span className="bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                we do
              </span>.
            </h1>
            
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed font-normal">
              The Velplay agent console gives you a live view of every bet under you, a downline you control, dynamic turnover margins, and risk alerts. Apply now to secure your account.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
              <Link to="/apply" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 text-white hover:scale-[1.02] active:scale-[0.98] transition-transform text-xs uppercase tracking-wider font-bold shadow-lg shadow-blue-500/15 rounded-xl py-3 px-6 cursor-pointer">
                  Request Agent Access <ArrowRight className="h-3.5 w-3.5 ml-1.5 inline" />
                </button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto border border-slate-800 text-slate-300 bg-slate-900/50 hover:bg-slate-800/80 text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 py-3 px-6 font-bold cursor-pointer">
                  <Lock className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  Agent Sign In
                </button>
              </Link>
            </div>
          </div>

          {/* Hero Right Image (Uses the premium asset in the folder) */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 blur-2xl rounded-full animate-pulse-glow" />
            <div className="border border-slate-800 bg-slate-900 rounded-[2rem] p-2.5 shadow-2xl overflow-hidden relative">
              <img 
                src="/affiliate_hero_premium.jpg" 
                alt="Velplay Agent Suite" 
                className="w-full h-auto object-cover rounded-[1.7rem] relative z-10"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-lg z-20 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Agent Dashboard</span>
                  <span className="font-bold text-slate-200 text-[10px] block mt-0.5">Velplay Sports Liability Desk</span>
                </div>
                <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-extrabold text-[9px] px-2.5 py-1 rounded-xl flex items-center gap-1">
                  Active
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="benefits" className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-display">Console Features</span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">What You Get With Velplay</h2>
          <p className="text-slate-400 text-xs leading-relaxed">
            A comprehensive suite of tools built to secure and track wagers, margins, and settlements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((item, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl flex flex-col space-y-4 hover:border-slate-700 transition-colors group">
              <div className={`p-2.5 rounded-xl w-10 h-10 flex items-center justify-center shrink-0 border ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div className="space-y-1.5 text-left">
                <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wide">{item.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-normal">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hierarchy Tree */}
      <section id="hierarchy" className="max-w-4xl mx-auto px-6 py-12 relative z-10 border-t border-slate-900 text-center">
        <h3 className="text-lg font-black text-white uppercase tracking-widest font-head mb-8">Agent Hierarchy Tree</h3>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-bold font-mono">
          <span className="px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-300">Super Agent</span>
          <span className="text-cyan-400 font-sans">➔</span>
          <span className="px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-300">Master Agent</span>
          <span className="text-cyan-400 font-sans">➔</span>
          <span className="px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-300">Agent</span>
          <span className="text-cyan-400 font-sans">➔</span>
          <span className="px-3 py-2 rounded bg-blue-600/10 border border-blue-500/20 text-cyan-400">Players</span>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-20 relative z-10 border-t border-slate-900 text-left">
        <h3 className="text-xl font-black text-white text-center uppercase tracking-widest font-head mb-10">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                {faq.q}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-2.5 font-normal ml-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
