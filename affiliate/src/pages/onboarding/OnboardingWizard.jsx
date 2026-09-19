import { apiUrl } from '../../utils/api';
﻿import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { 
  Clock, AlertCircle, CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  UploadCloud, 
  FileText, 
  Copy, 
  Check, 
  Sparkles,
  ShieldCheck,
  CreditCard,
  Link2,
  FileCheck2,
  X,
  FileCheck,
  Building2,
  Coins,
  Zap
} from 'lucide-react';

export const OnboardingWizard = () => {
  const [step, setStep] = useState(1);
  const [payoutMethod, setPayoutMethod] = useState('bank');
  const [payoutDetails, setPayoutDetails] = useState({
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    crypto_address: '',
    crypto_network: 'TRC-20',
    upi_id: ''
  });
  const [copied, setCopied] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [kycType, setKycType] = useState('passport');
  const [trackingUrl, setTrackingUrl] = useState('https://velplay365.com/register?ref=VP_AFF_9921');
  const [verifying, setVerifying] = useState(true);
  const [approvalError, setApprovalError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const verifyAndLoad = async () => {
      const token = localStorage.getItem('affiliate_token');
      const isOnboarded = localStorage.getItem('affiliate_onboarded') === 'true';

      // 1. If not logged in, redirect to login
      if (!token || token === 'mock_token') {
        navigate('/login', { replace: true });
        return;
      }

      // 2. If already completed onboarding, redirect to dashboard
      if (isOnboarded) {
        navigate('/dashboard', { replace: true });
        return;
      }

      // 3. Verify real admin approval status with backend
      try {
        const res = await fetch(apiUrl('/api/v1/affiliate/dashboard'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.status === 401) {
          localStorage.removeItem('affiliate_token');
          navigate('/login', { replace: true });
          return;
        }

        if (data.status === 'success' && data.data?.identity) {
          const st = (data.data.identity.status || '').toLowerCase();
          if (st !== 'active' && st !== 'approved') {
            setApprovalError('Your affiliate account is currently in review and pending admin approval. You will gain access to onboarding as soon as your application is approved.');
            setVerifying(false);
            return;
          }

          if (data.data.identity.onboarding_completed) {
            localStorage.setItem('affiliate_onboarded', 'true');
            navigate('/dashboard', { replace: true });
            return;
          }

          // Fetch real tracking link
          const linkRes = await fetch(apiUrl('/api/v1/affiliate/links'), {
            headers: { Authorization: `Bearer ${token}` }
          });
          const linkData = await linkRes.json();
          if (linkData.status === 'success' && Array.isArray(linkData.data) && linkData.data[0]?.tracking_url) {
            setTrackingUrl(linkData.data[0].tracking_url);
          }
        }
      } catch (e) {
        console.error("Verification error:", e);
      } finally {
        setVerifying(false);
      }
    };

    verifyAndLoad();
  }, [navigate]);

  const handleNext = async () => {
    if (step === 3 && uploadedFile) {
      const token = localStorage.getItem('affiliate_token');
      if (token) {
        const formData = new FormData();
        if (uploadedFile.raw) {
          formData.append('file', uploadedFile.raw);
        } else {
          formData.append('fileName', uploadedFile.name);
        }
        formData.append('title', uploadedFile.name);
        try {
          await fetch(apiUrl('/api/v1/affiliate/kyc/upload'), {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
          });
        } catch (e) {
          console.error('KYC onboarding upload error:', e);
        }
      }
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      const token = localStorage.getItem('affiliate_token');
      try {
        if (token) {
          const methodType = payoutMethod === 'bank' ? 'bank_transfer' : payoutMethod === 'upi' ? 'UPI' : 'crypto';
          await fetch(apiUrl('/api/v1/affiliate/onboarding/complete'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              method_type: methodType,
              account_details: payoutDetails
            })
          });
        }
      } catch (err) {
        console.error('Failed to complete onboarding on backend:', err);
      }

      localStorage.setItem('affiliate_onboarded', 'true');
      const userRaw = localStorage.getItem('affiliate_user');
      if (userRaw) {
        try {
          const user = JSON.parse(userRaw);
          user.onboarding_completed = true;
          localStorage.setItem('affiliate_user', JSON.stringify(user));
        } catch (e) {}
      }
      navigate('/dashboard', { replace: true });
    }
  };

  const updatePayoutDetail = (field, value) => {
    setPayoutDetails((current) => ({ ...current, [field]: value }));
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        size: formatFileSize(file.size),
        raw: file
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        size: formatFileSize(file.size),
        raw: file
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const steps = [
    { num: 1, title: 'Agreement', icon: FileCheck2 },
    { num: 2, title: 'Payout Method', icon: CreditCard },
    { num: 3, title: 'KYC Upload', icon: FileText },
    { num: 4, title: 'Tracking Link', icon: Link2 }
  ];

  if (verifying) {
    return (
      <AuthLayout title="Verifying Status" subtitle="Checking affiliate access permissions...">
        <div className="flex flex-col items-center justify-center py-10">
          <div className="w-9 h-9 border-3 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-3"></div>
          <p className="text-xs text-slate-400 font-medium">Validating admin approval...</p>
        </div>
      </AuthLayout>
    );
  }

  if (approvalError) {
    return (
      <AuthLayout title="Approval Required" subtitle="Admin verification pending">
        <div className="space-y-4 text-center py-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
            <Clock className="w-7 h-7" />
          </div>
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-left">
            <p className="text-xs text-slate-200 font-medium leading-relaxed">
              {approvalError}
            </p>
            <p className="text-[11px] text-slate-400">
              Only verified partners approved by an administrator can complete onboarding.
            </p>
          </div>
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => navigate('/apply/status')}
              className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              Check Status
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Partner Onboarding" 
      subtitle="Complete these quick steps to activate your tracking links and commission payouts"
      maxWidth="max-w-xl"
    >
      {/* Steps Indicator */}
      <div className="mb-6 relative max-w-md mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Progress Track */}
          <div className="absolute left-4 right-4 top-4 h-[2px] bg-slate-800 -z-0" />
          <div 
            className="absolute left-4 top-4 h-[2px] bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500 -z-0"
            style={{ width: `${((step - 1) / 3) * 85}%` }}
          />

          {steps.map((s) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;

            return (
              <div key={s.num} className="flex flex-col items-center relative z-10">
                <button
                  type="button"
                  onClick={() => { if (s.num < step) setStep(s.num); }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[11px] transition-all duration-300 ${
                    isCurrent
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white ring-3 ring-cyan-500/20 shadow-md shadow-cyan-500/25 scale-105'
                      : isCompleted
                      ? 'bg-blue-600 text-white cursor-pointer'
                      : 'bg-slate-800 border border-slate-700 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </button>
                <span className={`text-[10px] font-bold mt-1.5 transition-colors text-center whitespace-nowrap ${
                  isCurrent ? 'text-cyan-400' : isCompleted ? 'text-slate-200' : 'text-slate-500'
                }`}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wizard Content */}
      <div className="space-y-4">
        {/* Step 1: Accept Terms */}
        {step === 1 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-3 duration-200">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 max-h-48 overflow-y-auto custom-scrollbar">
              <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" /> Affiliate Partner Operating Agreement
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                By participating in the Velplay Affiliate Network, you agree to adhere to standard compliance policies including zero-tolerance for spamming, unauthorized brand bidding on search engines, and self-referrals.
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Commissions are calculated daily on a Net Gaming Revenue (NGR) or verified First Time Deposit (FTD) basis and disbursed according to your chosen payout cycle.
              </p>
            </div>

            <label className="flex items-center gap-2.5 p-3 rounded-lg bg-blue-950/20 border border-blue-800/40 cursor-pointer hover:bg-blue-950/30 transition-colors">
              <input 
                type="checkbox" 
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-950 cursor-pointer"
              />
              <span className="text-[11px] font-bold text-slate-200">
                I have read and agree to the Terms & Operating Conditions
              </span>
            </label>
          </div>
        )}

        {/* Step 2: Payout Method Setup */}
        {step === 2 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-3 duration-200">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block ml-0.5">
              Select Payout Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'bank', name: 'Bank Wire', icon: Building2 },
                { id: 'crypto', name: 'Crypto USDT', icon: Coins },
                { id: 'upi', name: 'UPI / Local', icon: Zap }
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPayoutMethod(m.id)}
                    className={`py-2 px-2 rounded-lg border text-center transition-all flex flex-col items-center gap-1.5 ${
                      payoutMethod === m.id
                        ? 'bg-blue-600/15 border-cyan-500/50 text-cyan-400 ring-1 ring-cyan-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span className="text-[10px] font-bold">{m.name}</span>
                  </button>
                );
              })}
            </div>

            {payoutMethod === 'bank' && (
              <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                <Input label="BANK NAME" value={payoutDetails.bank_name} onChange={(e) => updatePayoutDetail('bank_name', e.target.value)} placeholder="e.g. JPMorgan Chase / Standard Chartered" />
                <div className="grid grid-cols-2 gap-2">
                  <Input label="ACCOUNT NUMBER / IBAN" value={payoutDetails.account_number} onChange={(e) => updatePayoutDetail('account_number', e.target.value)} placeholder="1234567890" />
                  <Input label="SWIFT / IFSC CODE" value={payoutDetails.ifsc_code} onChange={(e) => updatePayoutDetail('ifsc_code', e.target.value)} placeholder="CHASUS33" />
                </div>
              </div>
            )}

            {payoutMethod === 'crypto' && (
              <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                <Input label="USDT WALLET ADDRESS (TRC-20 / ERC-20)" value={payoutDetails.crypto_address} onChange={(e) => updatePayoutDetail('crypto_address', e.target.value)} placeholder="T..." />
                <Input label="NETWORK" value={payoutDetails.crypto_network} onChange={(e) => updatePayoutDetail('crypto_network', e.target.value)} placeholder="TRC-20" />
                <p className="text-[10px] text-slate-400 -mt-1 ml-0.5">
                  Ensure the network matches TRC-20 or ERC-20. Payouts are instant once approved.
                </p>
              </div>
            )}

            {payoutMethod === 'upi' && (
              <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                <Input label="UPI ID / VIRTUAL PAYMENT ADDRESS" value={payoutDetails.upi_id} onChange={(e) => updatePayoutDetail('upi_id', e.target.value)} placeholder="username@bank" />
              </div>
            )}
          </div>
        )}

        {/* Step 3: KYC Document Upload */}
        {step === 3 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-3 duration-200">
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'passport', name: 'Passport' },
                { id: 'id_card', name: 'National ID' },
                { id: 'company', name: 'Business Reg' }
              ].map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => {
                    setKycType(k.id);
                  }}
                  className={`py-1.5 px-2 rounded-lg border text-center text-[10px] font-bold transition-all ${
                    kycType === k.id
                      ? 'bg-blue-600/15 border-cyan-500/50 text-cyan-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  {k.name}
                </button>
              ))}
            </div>

            {/* Real File Input */}
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
            />

            <div 
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center transition-all cursor-pointer group ${
                isDragging 
                  ? 'border-cyan-400 bg-cyan-950/20' 
                  : uploadedFile 
                  ? 'border-emerald-500/50 bg-emerald-950/10' 
                  : 'border-slate-800 hover:border-cyan-500/50 bg-slate-950/60 hover:bg-slate-950'
              }`}
            >
              {uploadedFile ? (
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-100 max-w-[240px] truncate">
                      {uploadedFile.name}
                    </p>
                    <button 
                      type="button" 
                      onClick={handleRemoveFile}
                      className="p-1 text-slate-400 hover:text-red-400 rounded-full hover:bg-slate-800 transition-colors"
                      title="Remove file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" /> File uploaded successfully ({uploadedFile.size})
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">
                    Click to change file
                  </span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform mb-2">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-200">
                    Click to browse or drop file here
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Supports PDF, PNG, JPG up to 10MB
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 4: First Tracking Link */}
        {step === 4 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-3 duration-200">
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-900/20 via-cyan-900/20 to-transparent border border-cyan-500/30 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-white">Your Affiliate Account is Ready!</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Your primary tracking link has been provisioned and is active.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block ml-0.5">
                Default Direct Referral Link
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={trackingUrl} 
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-400 focus:outline-none"
                />
                <button 
                  type="button" 
                  onClick={handleCopyLink}
                  className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-3">
          {step > 1 && (
            <button 
              type="button" 
              onClick={handlePrev} 
              className="w-1/3 py-2 px-3 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 transition-colors text-xs flex justify-center items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
          )}
          
          <button 
            type="button" 
            disabled={step === 1 && !acceptedTerms}
            onClick={handleNext}
            className={`flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold transition-all shadow-md shadow-blue-500/20 text-xs flex justify-center items-center gap-1.5 disabled:opacity-50 cursor-pointer ${step === 1 ? 'w-full' : ''}`}
          >
            {step === 4 ? (
              <>Go to Dashboard <ArrowRight className="w-3.5 h-3.5" /></>
            ) : (
              <>Next Step <ArrowRight className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>

        {/* Skip to Dashboard Option */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => {
              localStorage.setItem('affiliate_onboarded', 'true');
              navigate('/dashboard');
            }}
            className="text-[11px] font-semibold text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Skip setup and go directly to Dashboard &rarr;
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};





