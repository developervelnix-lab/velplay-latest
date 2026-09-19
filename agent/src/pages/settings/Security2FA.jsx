import { PageLoader } from '../../components/ui/PageLoader';
import { apiUrl } from '../../utils/constants';
import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Smartphone, Key, Check, Copy } from 'lucide-react';
import Swal from 'sweetalert2';

export const Security2FA = () => {
  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchSetup = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('agent_token') || localStorage.getItem('token');
      const res = await fetch(apiUrl('/api/v1/agent/auth/2fa/setup'), {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setSetupData(data.data);
      }
    } catch (err) {
      console.error("Failed to load 2FA setup data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSetup();
  }, []);

  const handleToggle2FA = async (action) => {
    if (!otpCode || otpCode.length < 6) {
      Swal.fire({
        title: '6-Digit Code Required',
        text: 'Please enter the 6-digit code from your Google Authenticator app.',
        icon: 'warning',
        background: '#1e293b',
        color: '#fff'
      });
      return;
    }

    setVerifying(true);
    try {
      const token = localStorage.getItem('agent_token') || localStorage.getItem('token');
      const res = await fetch(apiUrl('/api/v1/agent/auth/2fa/enable'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          code: otpCode,
          action: action
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        Swal.fire({
          title: action === 'enable' ? '2FA Enabled!' : '2FA Disabled',
          text: data.message || 'Google Authenticator settings updated successfully.',
          icon: 'success',
          background: '#1e293b',
          color: '#fff'
        });
        setOtpCode('');
        fetchSetup();
      } else {
        Swal.fire({
          title: 'Verification Failed',
          text: data.message || 'Invalid 6-digit code. Please try again.',
          icon: 'error',
          background: '#1e293b',
          color: '#fff'
        });
      }
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: 'Network error communicating with authentication server.',
        icon: 'error',
        background: '#1e293b',
        color: '#fff'
      });
    } finally {
      setVerifying(false);
    }
  };

  const copySecret = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    if (loading) return <PageLoader message="Loading 2FA security configuration..." />;

  return (
      <div className="p-8 text-center text-slate-400">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        Loading 2-Factor Security parameters...
      </div>
    );
  }

  const isEnabled = setupData?.enabled;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 text-left">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${isEnabled ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'}`}>
            {isEnabled ? <ShieldCheck className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              Google Authenticator (2FA)
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                isEnabled 
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
              }`}>
                {isEnabled ? 'Protection Active' : 'Disabled'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Secure your agent console with Google Authenticator time-based one-time passwords (TOTP).
            </p>
          </div>
        </div>
      </div>

      {/* Main 2FA Setup Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: QR Code & Key */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-cyan-400" /> Step 1: Scan QR Code
          </h3>
          <p className="text-xs text-slate-400">
            Open <strong>Google Authenticator</strong> on your phone (iOS/Android) and scan this QR code:
          </p>

          <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex flex-col items-center justify-center">
            {setupData?.qr_code_url ? (
              <img 
                src={setupData.qr_code_url} 
                alt="2FA QR Code" 
                className="w-48 h-48 rounded-xl border border-slate-700 bg-white p-2 shadow-lg" 
              />
            ) : (
              <div className="w-48 h-48 bg-slate-900 rounded-xl flex items-center justify-center text-xs text-slate-500">QR Code Error</div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Key className="w-3 h-3 text-cyan-400" /> Manual Secret Key
            </label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2.5 rounded-xl font-mono text-cyan-300 font-bold text-xs">
              <span className="flex-1 tracking-widest">{setupData?.secret}</span>
              <button 
                onClick={copySecret}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Copy Secret"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Code Verification */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> Step 2: Verify & Confirm
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Enter the current 6-digit verification code generated in your Google Authenticator app to confirm setup.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                6-Digit Authenticator Code
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="000 000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-center tracking-[0.5em] font-mono text-xl font-bold text-cyan-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800">
            {!isEnabled ? (
              <button
                onClick={() => handleToggle2FA('enable')}
                disabled={verifying || otpCode.length < 6}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg disabled:opacity-50 transition-all cursor-pointer flex justify-center items-center gap-2"
              >
                {verifying ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Enable 2FA Security'}
              </button>
            ) : (
              <button
                onClick={() => handleToggle2FA('disable')}
                disabled={verifying || otpCode.length < 6}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg disabled:opacity-50 transition-all cursor-pointer flex justify-center items-center gap-2"
              >
                {verifying ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Disable 2FA Protection'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
