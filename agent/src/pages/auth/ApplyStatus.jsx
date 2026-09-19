import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { apiUrl } from '../../utils/constants';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Search, Clock, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

export const ApplyStatus = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [statusResult, setStatusResult] = useState(null);
  const [loading, setLoading] = useState(false);

    const checkStatus = async (e) => {
    if (e) e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const targetUrl = apiUrl('/api/v1/agent/auth/apply_status?email=' + encodeURIComponent(email));
      const res = await fetch(targetUrl);
      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch (parseErr) {
        throw new Error('Live server returned empty response. agent/auth/apply_status.php is missing on api.velplay365.com.');
      }

      setLoading(false);
      if (data.status === 'success' && data.found && data.data) {
        const app = data.data;
        setStatusResult({
          email: app.email,
          status: app.application_status,
          appliedAt: app.applied_at ? app.applied_at.split(' ')[0] : new Date().toLocaleDateString(),
          message: app.application_status === 'approved' 
            ? 'Congratulations! Your agent application has been approved. You can now sign in to your agent console.' 
            : (app.application_status === 'rejected' 
              ? 'Application rejected: ' + (app.rejection_reason || 'Compliance criteria not met')
              : 'Your agent console request is in compliance audit. Upline managers will evaluate expected region volume within 12 business hours.')
        });
      } else {
        setStatusResult({
          email,
          status: 'not_found',
          appliedAt: new Date().toLocaleDateString(),
          message: data.message || 'No application record found for this email on the live server.'
        });
      }
    } catch (err) {
      console.error('Check status error:', err);
      setLoading(false);
      setStatusResult({
        email,
        status: 'error',
        appliedAt: new Date().toLocaleDateString(),
        message: err.message || 'Unable to connect to live API.'
      });
    }
  };

  React.useEffect(() => {
    if (email) {
      checkStatus();
    }
  }, []);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <Badge variant="green">APPROVED</Badge>;
      case 'rejected':
        return <Badge variant="red">REJECTED</Badge>;
      default:
        return <Badge variant="yellow">PENDING REVIEW</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />;
      default:
        return <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <AuthLayout 
      title="Application Status" 
      subtitle="Track the audit review progress of your agent credentials"
      maxWidth="max-w-md"
    >
      <form onSubmit={checkStatus} className="space-y-4">
        <Input
          label="Registered Email Address"
          type="email"
          placeholder="vance@agency.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 text-white font-bold transition-all shadow-md text-xs flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <><Search className="w-3.5 h-3.5" /> Check Status</>
          )}
        </button>
      </form>

      {statusResult && (
        <div className="mt-6 pt-5 border-t border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Review Stage</span>
            {getStatusBadge(statusResult.status)}
          </div>
          
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-left">
            <p className="text-xs text-slate-350 leading-relaxed font-normal flex items-start gap-2">
              {getStatusIcon(statusResult.status)}
              <span>{statusResult.message}</span>
            </p>
            <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono">
              <span>Submitted: {statusResult.appliedAt}</span>
              <span>Ref: AG-APP-{Math.floor(1000 + Math.random() * 9000)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 pt-3 border-t border-slate-850 text-center text-xs text-slate-400 flex items-center justify-between">
        <span>{statusResult?.status === 'approved' ? 'Ready to sign in?' : 'Already approved?'}</span>
        <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors flex items-center gap-1">
          Sign In <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </AuthLayout>
  );
};
