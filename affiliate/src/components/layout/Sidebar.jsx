import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Link2,
  Users,
  Gamepad2,
  Network,
  DollarSign,
  HelpCircle,
  Settings,
  LogOut,
  BarChart2,
  Code,
  ShieldCheck,
  Award,
  Wallet,
  MessagesSquare,
  Sparkles,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose, onLogout }) => {
  const [user, setUser] = React.useState(() => {
    try {
      const stored = localStorage.getItem('affiliate_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  React.useEffect(() => {
    const updateUser = () => {
      try {
        const stored = localStorage.getItem('affiliate_user');
        if (stored) setUser(JSON.parse(stored));
      } catch (e) {}
    };
    window.addEventListener('storage', updateUser);
    return () => window.removeEventListener('storage', updateUser);
  }, []);

  const displayName = user?.name || user?.full_name || user?.affiliate_code || 'Partner';
  const displayTier = user?.tier ? (user.tier.charAt(0).toUpperCase() + user.tier.slice(1) + ' Partner') : 'Active Partner';
  const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AP';
  const sections = [
    {
      title: 'General Workspace',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Tracking Links', path: '/links', icon: Link2 },
        { name: 'Advanced Reports', path: '/reports', icon: BarChart2 }
      ]
    },
    {
      title: 'Player Network',
      items: [
        { name: 'My Referrals', path: '/referrals', icon: Users },
        { name: 'Player Bets & Activity', path: '/player-activity', icon: Gamepad2 },
        { name: 'Sub-Affiliates', path: '/network', icon: Network }
      ]
    },
    {
      title: 'Payouts Desk',
      items: [
        { name: 'Earnings Ledger', path: '/finance/earnings', icon: DollarSign },
        { name: 'Payout Requests', path: '/finance/payouts', icon: Wallet }
      ]
    },
    {
      title: 'Integrations & Help',
      items: [
        { name: 'API & Webhooks', path: '/integration', icon: Code },
        { name: 'VIP Support', path: '/support', icon: MessagesSquare },
        { name: 'Settings', path: '/settings', icon: Settings }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center justify-between px-5 sm:px-6 border-b border-slate-800 bg-slate-950/40 gap-2.5">
          <div className="flex items-center gap-2.5">
            <img src="/logo512.png" className="w-7 h-7 object-contain" alt="Velplay Logo" />
            <div className="flex flex-col">
              <span className="text-sm font-black bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 bg-clip-text text-transparent tracking-tight font-head">
                VELPLAY
              </span>
              <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-[0.25em] -mt-0.5">
                Partners Console
              </span>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      
      {/* Nav Menu Items */}
      <nav className="flex-1 px-4 py-5 space-y-4 overflow-y-auto custom-scrollbar">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
              {section.title}
            </h4>
            {section.items.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 relative overflow-hidden group ${
                    isActive
                      ? 'bg-blue-600/10 text-cyan-400 border border-blue-500/20 shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                  }`
                }
                onClick={onClose}
              >
                {({ isActive }) => (
                  <>
                    {/* Active Left Neon Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r bg-cyan-400" />
                    )}
                    <item.icon className={`h-4 w-4 mr-2.5 flex-shrink-0 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Partner Status Footer Card */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-xs shadow-md shadow-blue-500/25">
            {initials}
          </div>
          <div className="flex flex-col truncate">
            <span className="text-xs font-bold text-slate-200 truncate">{displayName}</span>
            <span className="text-[9px] font-bold text-cyan-400 flex items-center gap-0.5 mt-0.5">
              <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> {displayTier}
            </span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/15 border border-slate-700/80 hover:border-red-500/20 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  </>
);
};

