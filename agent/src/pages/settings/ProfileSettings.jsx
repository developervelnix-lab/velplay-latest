import { PageLoader } from '../../components/ui/PageLoader';
import { apiUrl } from '../../utils/constants';
import React, { useState, useEffect } from 'react';
import { useAgent } from '../../context/AgentContext';
import { 
  User, 
  Shield, 
  KeyRound, 
  CreditCard, 
  Copy, 
  Check, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Users, 
  Activity, 
  Clock, 
  DollarSign, 
  Percent, 
  BadgeCheck 
} from 'lucide-react';
import Swal from 'sweetalert2';

export const ProfileSettings = () => {
  const { agentMe } = useAgent();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  // Password state
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [updatingPass, setUpdatingPass] = useState(false);

  const token = localStorage.getItem('agent_token') || localStorage.getItem('token') || '';

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : '';
      const res = await fetch(apiUrl(`/agent/profile/index.php${tokenQuery}`), { headers });
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        setProfileData(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passForm.currentPassword) {
      Swal.fire({ title: 'Current Password Required', text: 'Please enter your current password.', icon: 'warning', background: '#1e293b', color: '#fff' });
      return;
    }
    if (!passForm.newPassword || passForm.newPassword.length < 6) {
      Swal.fire({ title: 'Invalid New Password', text: 'New password must be at least 6 characters.', icon: 'warning', background: '#1e293b', color: '#fff' });
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      Swal.fire({ title: 'Password Mismatch', text: 'New password and confirm password do not match.', icon: 'error', background: '#1e293b', color: '#fff' });
      return;
    }

    setUpdatingPass(true);
    try {
      const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : '';
      const res = await fetch(apiUrl(`/agent/profile/index.php${tokenQuery}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          current_password: passForm.currentPassword,
          new_password: passForm.newPassword
        })
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        Swal.fire({
          title: 'Password Updated!',
          text: 'Your account password has been changed successfully.',
          icon: 'success',
          background: '#1e293b',
          color: '#fff',
          confirmButtonColor: '#10b981'
        });
      } else {
        Swal.fire({
          title: 'Update Failed',
          text: data.message || 'Failed to update password. Please check your current password.',
          icon: 'error',
          background: '#1e293b',
          color: '#fff'
        });
      }
    } catch (err) {
      Swal.fire({ title: 'Error', text: 'Connection failed updating password.', icon: 'error', background: '#1e293b', color: '#fff' });
    } finally {
      setUpdatingPass(false);
    }
  };

  const info = profileData || {
    username: agentMe.username || 'agent',
    name: agentMe.fullName || agentMe.username || 'Agent Account',
    agent_code: '338H4V5R',
    rank_level: agentMe.rank_level || 'agent',
    email: agentMe.email || 'agent@velplay.com',
    currency: 'INR',
    last_login: 'Recently active',
    partnership_pct: agentMe.partnership || 25.0,
    turnover_commission_pct: 2.0,
    downline_agents_count: 0,
    downline_players_count: 1,
    credit_reference: agentMe.balance || 0,
    current_credit: agentMe.balance || 0,
    exposed_credit: agentMe.exposure || 0,
    available_credit: Math.max(0, (agentMe.balance || 0) - (agentMe.exposure || 0)),
    settled_pnl: 0,
    unsettled_pnl: 0,
    status: 'active'
  };

  const rankFormatted = (info.rank_level || agentMe.role || 'Agent').replace(/_/g, ' ').toUpperCase();

  if (loading) return <PageLoader message="Loading agent profile settings..." />;

  return (
    <div className="p-6 space-y-6 text-left relative z-10 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 p-6 rounded-2xl shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-400 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-cyan-500/20 border border-cyan-300/30">
              {(info.name || info.username || 'AG').substring(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-white tracking-tight">{info.name}</h1>
                <span className="bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" /> {rankFormatted}
                </span>
                <span className="bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3 text-emerald-400" /> {(info.status || 'Active').toUpperCase()}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-400 font-mono">
                @{info.username} • {info.email || 'agent@velplay.com'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Account Code</span>
              <span className="text-sm font-black font-mono text-cyan-400">{info.agent_code}</span>
            </div>
            <button 
              onClick={() => handleCopyCode(info.agent_code)}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
              title="Copy Code"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARD 1: Account Information */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white tracking-wide">Account Details</h2>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">ID #{info.id || '--'}</span>
          </div>

          <div className="divide-y divide-slate-800/50">
            <div className="py-2.5 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Username</span>
              <span className="text-slate-100 font-mono font-bold">@{info.username}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Full Name</span>
              <span className="text-slate-100 font-bold">{info.name}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Account Code</span>
              <span className="text-cyan-400 font-mono font-bold">{info.agent_code}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Hierarchy Level</span>
              <span className="bg-slate-800 text-slate-200 font-bold px-2.5 py-0.5 rounded-md border border-slate-700 text-[11px]">{rankFormatted}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Currency</span>
              <span className="text-slate-100 font-bold font-mono">{info.currency || 'INR'}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Last Activity / Login</span>
              <span className="text-slate-300 font-mono">{info.last_login}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Partnership Share</span>
              <span className="text-emerald-400 font-bold font-mono">{info.partnership_pct}%</span>
            </div>
            <div className="py-2.5 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Commission Rate</span>
              <span className="text-cyan-400 font-bold font-mono">{info.turnover_commission_pct}%</span>
            </div>
            <div className="py-2.5 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Downline Network</span>
              <span className="text-slate-200 font-bold font-mono">
                {info.downline_agents_count} agents • {info.downline_players_count} players
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: Position & Financial Balances */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white tracking-wide">Position & Exposure</h2>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono uppercase">Live Financials</span>
          </div>

          <div className="divide-y divide-slate-800/50">
            <div className="py-2.5 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Credit Reference</span>
              <span className="text-slate-100 font-mono font-bold">₹{info.credit_reference.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Current Balance</span>
              <span className="text-white font-mono font-bold text-sm">₹{info.current_credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Risk Exposure</span>
              <span className="text-rose-400 font-mono font-bold">₹{info.exposed_credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Available Credit Margin</span>
              <span className="text-emerald-400 font-mono font-bold text-sm">₹{info.available_credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Settled P&L</span>
              <span className="text-slate-300 font-mono font-bold">₹{info.settled_pnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Unsettled P&L</span>
              <span className="text-amber-400 font-mono font-bold">₹{info.unsettled_pnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Account State</span>
              <span className="text-emerald-400 font-bold capitalize flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {info.status || 'Active'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* CARD 3: Change Password Section */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">Security & Password</h2>
            <p className="text-slate-400 text-xs mt-0.5">Update your agent account security password</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Current Password */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Current Password *</label>
              <div className="relative">
                <input 
                  type={showPass.current ? "text" : "password"}
                  value={passForm.currentPassword}
                  onChange={(e) => setPassForm(p => ({ ...p, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-all pr-10"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(s => ({ ...s, current: !s.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPass.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">New Password *</label>
              <div className="relative">
                <input 
                  type={showPass.new ? "text" : "password"}
                  value={passForm.newPassword}
                  onChange={(e) => setPassForm(p => ({ ...p, newPassword: e.target.value }))}
                  placeholder="Min 6 characters"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-all pr-10"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(s => ({ ...s, new: !s.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPass.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Confirm New Password *</label>
              <div className="relative">
                <input 
                  type={showPass.confirm ? "text" : "password"}
                  value={passForm.confirmPassword}
                  onChange={(e) => setPassForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Re-enter new password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-all pr-10"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(s => ({ ...s, confirm: !s.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPass.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>

          <div className="pt-2 flex items-center gap-3">
            <button 
              type="submit" 
              disabled={updatingPass}
              className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-lg shadow-purple-500/20 cursor-pointer flex items-center gap-2 disabled:opacity-50 transition-all"
            >
              {updatingPass ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  Updating Password...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Change Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};