import { apiUrl } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Badge } from '../../components/ui/Badge';
import { 
  ShieldCheck, 
  Clock, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Sparkles,
  UserCheck
} from 'lucide-react';

export const ApplyStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [statusResult, setStatusResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchStatus = async (queryEmail) => {
    if (!queryEmail || !queryEmail.trim()) return;
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch(apiUrl(`/api/v1/affiliate/auth/status?email=${encodeURIComponent(queryEmail.trim())}`));
      const json = await res.json();

      if (res.ok && json.status === 'success' && json.data) {
        setStatusResult(json.data);
      } else {
        setStatusResult(null);
        setErrorMessage(json.message || 'No affiliate application found with this email address.');
      }
    } catch (err) {
      console.error('Failed to query status:', err);
      setStatusResult(null);
      setErrorMessage('Could not connect to the authentication server. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-check on mount if email parameter is present in URL
  useEffect(() => {
    const urlEmail = searchParams.get('email');
    if (urlEmail) {
      setEmail(urlEmail);
      fetchStatus(urlEmail);
    }
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchStatus(email);
  };

  const isApproved = statusResult && (statusResult.status === 'active' || statusResult.status === 'approved');
  const isPending = statusResult && statusResult.status === 'pending';
  const isSuspended = statusResult && (statusResult.status === 'suspended' || statusResult.status === 'rejected');

  return (
    <AuthLayout 
      title="Application Status" 
      subtitle="Audit and track your partner recruitment application status in real-time"
      maxWidth="max-w-md"
    >
      {searchParams.get('suspended') === '1' && (
        <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 text-red-400 text-xs animate-in fade-in">
          <XCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
          <div>
            <span className="font-bold block text-red-300">Account Access Revoked</span>
            <span>Your affiliate account has been suspended by administration. Dashboard access has been terminated.</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Registered Partner Email or Code
          </label>
          <input
            type="text"
            placeholder="e.g. partner@velplay365.com or AFF-XXXXXX"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold transition-all shadow-md shadow-blue-500/20 text-xs flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <><Search className="w-3.5 h-3.5" /> Check Application Status</>
          )}
        </button>
      </form>

      {/* Error state */}
      {errorMessage && (
        <div className="mt-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-2.5 text-red-400 text-xs animate-in fade-in">
          <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Live Result State */}
      {statusResult && (
        <div className="mt-6 pt-5 border-t border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Current Status
            </span>
            {isApproved && <Badge variant="green">APPROVED & ACTIVE</Badge>}
            {isPending && <Badge variant="yellow">PENDING REVIEW</Badge>}
            {isSuspended && <Badge variant="red">SUSPENDED</Badge>}
          </div>
          
          {/* Card body */}
          <div className={`p-4 rounded-2xl border space-y-3.5 ${
            isApproved 
              ? 'bg-emerald-950/20 border-emerald-500/30' 
              : isPending 
                ? 'bg-slate-950 border-slate-800' 
                : 'bg-red-950/20 border-red-500/30'
          }`}>
            <div className="flex items-start gap-2.5">
              {isApproved && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
              {isPending && <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
              {isSuspended && <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
              
              <div>
                <h4 className={`text-xs font-bold ${
                  isApproved ? 'text-emerald-300' : isPending ? 'text-zinc-200' : 'text-red-300'
                }`}>
                  {isApproved && "Congratulations! Your partner account is approved."}
                  {isPending && "Your application is currently under review."}
                  {isSuspended && "Account currently suspended."}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {isApproved && "Admin has reviewed and approved your application. You have full access to create referral tracking links, monitor player telemetry, and earn commissions."}
                  {isPending && "Our compliance managers are reviewing your submitted traffic sources and details. You will receive an update once reviewed."}
                  {isSuspended && "This partner account has been suspended or denied. Please contact support@velplay365.com for further inquiries."}
                </p>
              </div>
            </div>

            {/* Detail Grid */}
            <div className="text-[11px] pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2.5 font-mono">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/50">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Affiliate Code</span>
                <span className="font-bold text-cyan-400">{statusResult.affiliate_code}</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/50">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Commission Tier</span>
                <span className="font-bold text-amber-400 uppercase">
                  {statusResult.tier} ({statusResult.revshare_pct}% Rev Share)
                </span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/50">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Partner Name</span>
                <span className="font-bold text-slate-200 truncate block">{statusResult.full_name}</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/50">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Joined Date</span>
                <span className="text-slate-400 truncate block">{statusResult.created_at?.split(' ')[0] || 'Today'}</span>
              </div>
            </div>

            {/* Approved Action Button */}
            {isApproved && (
              <div className="pt-2">
                <Link
                  to={`/login?email=${encodeURIComponent(statusResult.email)}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-bold transition-all shadow-md shadow-emerald-500/20 text-xs flex justify-center items-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" /> Sign In to Partner Portal <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-5 pt-3 border-t border-slate-800/80 text-center text-xs text-slate-400 flex items-center justify-between">
        <span>Already have an active account?</span>
        <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors flex items-center gap-1">
          Sign In <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </AuthLayout>
  );
};
