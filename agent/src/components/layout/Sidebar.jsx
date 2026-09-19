import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAgent } from '../../context/AgentContext';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  UserCheck,
  TrendingUp,
  BarChart2,
  LogOut,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  MessagesSquare,
  Settings,
  Zap
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose, onLogout }) => {
  const { agentMe } = useAgent();
  const [reportsOpen, setReportsOpen] = useState(false);

  const isBottomTierAgent = (agentMe?.rank_level === 'agent') || ((agentMe?.role || '').toLowerCase() === 'agent');

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ...(!isBottomTierAgent ? [{ name: 'Clients Management', path: '/clients', icon: Users }] : []),
    { name: 'Players Management', path: '/players', icon: UserCheck },
    { name: 'Approvals & Requests', path: '/approvals', icon: CheckSquare },
    { name: 'Sport Analysis', path: '/sport-analysis', icon: TrendingUp },
    { name: '2FA Security', path: '/security', icon: ShieldCheck },
    { name: 'Profile Settings', path: '/profile', icon: Settings }
  ];

  const reportItems = [
    { name: 'P&L By Market', path: '/reports/pl-market' },
    { name: 'P&L By Agent', path: '/reports/pl-agent' },
    { name: 'P&L By Event', path: '/reports/event-pl' },
    { name: 'Bet List', path: '/reports/bet-list' },
    { name: 'Transfer Statement', path: '/reports/transfer-statement' },
    { name: 'Settlement Report', path: '/reports/settlement' },
    { name: 'Transactions', path: '/reports/transactions' },
    { name: 'Real Revenue', path: '/reports/real-revenue' }
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-[90] md:hidden animate-in fade-in duration-200" 
          onClick={onClose} 
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-[100] w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/80 flex flex-col transition-all duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl shadow-slate-950/50`}>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 bg-slate-950/60 gap-3">
          <div className="relative">
            <img src="/logo512.png" className="w-8 h-8 object-contain drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]" alt="Velplay Logo" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 bg-clip-text text-transparent tracking-tight font-head">
              VELPLAY
            </span>
            <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-[0.25em] -mt-0.5">
              Agent Console
            </span>
          </div>
        </div>
        
        {/* Nav Menu Items */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-cyan-400" /> Main Management
          </div>
          
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 relative overflow-hidden group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/20 to-cyan-500/10 text-cyan-300 border-l-2 border-cyan-400 shadow-md shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border-l-2 border-transparent'
                }`
              }
              onClick={onClose}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`h-4 w-4 mr-2.5 flex-shrink-0 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* Reports Expandable Category */}
          <div className="pt-2">
            <button
              onClick={() => setReportsOpen(!reportsOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 transition-all cursor-pointer"
            >
              <div className="flex items-center">
                <BarChart2 className="h-4 w-4 mr-2.5 text-slate-500" />
                <span>Advanced Reports</span>
              </div>
              {reportsOpen ? <ChevronUp className="h-3.5 w-3.5 text-slate-500" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-500" />}
            </button>

            {reportsOpen && (
              <div className="mt-1 ml-4 pl-3 border-l border-slate-800 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                {reportItems.map((rep) => (
                  <NavLink
                    key={rep.name}
                    to={rep.path}
                    className={({ isActive }) =>
                      `block px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        isActive
                          ? 'text-cyan-400 bg-blue-500/10 font-black'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                      }`
                    }
                    onClick={onClose}
                  >
                    {rep.name}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Agent Footer Profile Card */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center text-white font-black text-xs shadow-md shadow-cyan-500/20 border border-cyan-400/20">
              {(agentMe.fullName || agentMe.username || "AG").substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col truncate text-left">
              <span className="text-xs font-bold text-slate-200 truncate">{agentMe.fullName || agentMe.username || "Agent Account"}</span>
              <span className="text-[9px] font-bold text-cyan-400 flex items-center gap-1 mt-0.5">
                <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> {agentMe.role || "Agent"}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-500/15 border border-slate-750 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    </>
  );
};
