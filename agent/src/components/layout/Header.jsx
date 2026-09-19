import React, { useState, useRef, useEffect } from "react";
import { Menu, User, ChevronDown, Settings, ShieldCheck, LogOut } from "lucide-react";
import { useAgent } from "../../context/AgentContext";
import { Link } from "react-router-dom";

export const Header = ({ onMenuToggle }) => {
  const { agentMe } = useAgent();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const displayName = agentMe?.fullName || agentMe?.username || "Agent";

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('agent_token');
    localStorage.removeItem('token');
    localStorage.removeItem('agent_user');
    window.location.href = '/login';
  };

  return (
    <header className="h-11 sm:h-16 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-2.5 sm:px-6 shadow-md w-full relative z-50">
      <div className="flex items-center gap-2 md:hidden">
        <button onClick={onMenuToggle} className="text-slate-400 hover:text-slate-100 focus:outline-none mr-1">
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-1.5">
          <img src="/logo512.png" className="h-6 w-6 object-contain" alt="Logo" />
          <span className="text-xs font-black bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 bg-clip-text text-transparent tracking-tight font-head">
            VELPLAY
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3 ml-auto">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-2 text-slate-300 hover:text-white focus:outline-none bg-slate-950/40 border border-slate-800 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-md bg-slate-800 flex items-center justify-center border border-slate-750">
              <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-cyan-400" />
            </div>
            <span className="text-xs font-bold hidden sm:inline-block">{displayName}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-1 z-[100] animate-in fade-in slide-in-from-top-2 duration-100">
              <div className="px-4 py-2.5 border-b border-slate-800/80">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Logged in as</p>
                <p className="text-xs font-bold text-slate-200 truncate mt-0.5">{displayName}</p>
                <p className="text-[9px] font-extrabold text-cyan-400 uppercase tracking-wider mt-0.5">{agentMe?.role || "Agent"}</p>
              </div>

              <div className="p-1.5 space-y-0.5 text-left">
                <Link 
                  to="/profile" 
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 rounded-xl transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Account Settings</span>
                </Link>

                <Link 
                  to="/security" 
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 rounded-xl transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>2FA Security</span>
                </Link>

                <div className="border-t border-slate-800/80 my-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
