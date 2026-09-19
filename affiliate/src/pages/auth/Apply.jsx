import { apiUrl } from '../../utils/api';
import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ShieldCheck, 
  User,
  Building2,
  CreditCard,
  Sparkles
} from 'lucide-react';

export const Apply = () => {
  const [searchParams] = useSearchParams();

  // Robustly extract and persist referral sponsor code
  const [parentCode, setParentCode] = useState(() => {
    const urlRef = searchParams.get('ref') || searchParams.get('parent') || searchParams.get('referral_code') || searchParams.get('ref_code') || '';
    if (urlRef) {
      try { localStorage.setItem('affiliate_sponsor_code', urlRef); } catch (e) {}
      return urlRef.toUpperCase();
    }
    const saved = localStorage.getItem('affiliate_sponsor_code') || '';
    return saved.toUpperCase();
  });

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    company: '',
    trafficSource: 'SEO / Website',
    volume: '10 - 50 FTDs / month',
    additionalInfo: '',
    paymentPreference: 'Bank Wire Transfer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.fullName.trim() || !formData.email.trim() || !formData.password) {
        setError('Please fill in all required fields.');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }
    setError('');
    if (step < 3) setStep(step + 1);
  };

  const handlePrev = () => {
    setError('');
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanCode = parentCode.trim().toUpperCase();

    try {
      const response = await fetch(apiUrl('/api/v1/affiliate/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
          company_name: formData.company,
          phone: formData.phone,
          website: formData.additionalInfo,
          parent_code: cleanCode,
          referral_code: cleanCode
        })
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setLoading(false);
        try { localStorage.removeItem('affiliate_sponsor_code'); } catch (e) {}
        navigate('/apply/status?email=' + encodeURIComponent(formData.email));
      } else {
        setLoading(false);
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      navigate('/apply/status?email=' + encodeURIComponent(formData.email));
    }
  };

  const steps = [
    { num: 1, title: 'Account Details', icon: User },
    { num: 2, title: 'Personal Details', icon: Building2 },
    { num: 3, title: 'Payment Methods', icon: CreditCard }
  ];

  return (
    <AuthLayout 
      title="Apply Now" 
      subtitle="Join our certified affiliate network in 3 quick steps"
      maxWidth="max-w-xl"
    >
      {/* Referred Sponsor Banner */}
      {parentCode && (
        <div className="mb-5 p-3 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-transparent border border-cyan-500/30 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-slate-300 font-medium">Invited by Network Partner:</span>
          </div>
          <span className="font-mono font-bold text-cyan-400 bg-cyan-500/15 px-2.5 py-0.5 rounded border border-cyan-500/20">
            {parentCode}
          </span>
        </div>
      )}

      {/* 3 Steps Progress Bar */}
      <div className="mb-6 relative max-w-sm mx-auto">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-4 right-4 top-4 h-[2px] bg-slate-800 -z-0" />
          <div 
            className="absolute left-4 top-4 h-[2px] bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500 -z-0"
            style={{ width: `${((step - 1) / 2) * 80}%` }}
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
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white ring-3 ring-cyan-500/20 shadow-md shadow-cyan-500/20 scale-105'
                      : isCompleted
                      ? 'bg-blue-600 text-white cursor-pointer'
                      : 'bg-slate-800 border border-slate-700 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4 text-white" /> : s.num}
                </button>
                <span className={`text-[10px] font-bold mt-1.5 whitespace-nowrap ${
                  isCurrent ? 'text-cyan-400' : isCompleted ? 'text-slate-200' : 'text-slate-500'
                }`}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
        {/* Step 1: Account Details */}
        {step === 1 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-3 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input 
                label="FULL NAME *" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                placeholder="John Doe" 
                required 
              />
              <Input 
                label="PHONE NUMBER *" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="+91 98765 43210" 
                required 
              />
            </div>

            <Input 
              label="EMAIL ADDRESS *" 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="partner@example.com" 
              required 
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Input 
                  label="PASSWORD *" 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="At least 6 characters" 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-2.5 top-[24px] p-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <Input 
                label="CONFIRM PASSWORD *" 
                type={showPassword ? "text" : "password"} 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                placeholder="Re-enter password" 
                required 
              />
            </div>

            {/* Explicit Sponsor / Referral Code Field */}
            <div className="space-y-1 pt-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5 flex items-center justify-between">
                <span>Sponsor / Partner Referral Code</span>
                {parentCode && (
                  <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Sponsor Linked
                  </span>
                )}
              </label>
              <Input 
                name="parentCode" 
                value={parentCode} 
                onChange={(e) => setParentCode(e.target.value.toUpperCase())} 
                placeholder="Optional (e.g. AFF-CBBD70)" 
                className="font-mono tracking-wider font-bold"
              />
            </div>
          </div>
        )}

        {/* Step 2: Personal Details */}
        {step === 2 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-3 duration-200">
            <Input 
              label="COMPANY / MEDIA NAME" 
              name="company" 
              value={formData.company} 
              onChange={handleChange} 
              placeholder="e.g. Apex Marketing LLC" 
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                  PRIMARY TRAFFIC SOURCE *
                </label>
                <select 
                  name="trafficSource" 
                  value={formData.trafficSource} 
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-[11px] font-semibold text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all cursor-pointer"
                >
                  <option>SEO / Website</option>
                  <option>PPC / Search Ads</option>
                  <option>Social Media</option>
                  <option>Email Marketing</option>
                  <option>Telegram / Communities</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                  EXPECTED MONTHLY VOLUME (FTDS) *
                </label>
                <select 
                  name="volume" 
                  value={formData.volume} 
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-[11px] font-semibold text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all cursor-pointer"
                >
                  <option>0 - 10 FTDs / month</option>
                  <option>10 - 50 FTDs / month</option>
                  <option>50 - 200 FTDs / month</option>
                  <option>200+ FTDs / month</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                ADDITIONAL INFORMATION / WEBSITE URLS
              </label>
              <textarea 
                name="additionalInfo" 
                value={formData.additionalInfo} 
                onChange={handleChange}
                placeholder="Website links, promotional strategies..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-[11px] font-semibold text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all min-h-[70px] resize-y placeholder:text-slate-600"
              ></textarea>
            </div>
          </div>
        )}

        {/* Step 3: Payment Methods */}
        {step === 3 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-3 duration-200">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                PAYMENT PREFERENCE *
              </label>
              <select 
                name="paymentPreference" 
                value={formData.paymentPreference} 
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-[11px] font-semibold text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all cursor-pointer"
              >
                <option>Bank Wire Transfer (SWIFT / SEPA)</option>
                <option>Cryptocurrency (USDT TRC20 / ERC20 / BTC)</option>
                <option>Skrill / Neteller</option>
                <option>UPI / Local Bank</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-300 leading-relaxed">
                By submitting this application, you agree to the Velplay Affiliate terms. Your application will be reviewed within 24 hours.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-2.5 pt-2">
          {step > 1 && (
            <button 
              type="button" 
              onClick={handlePrev} 
              className="w-1/3 py-2 px-3 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 transition-colors text-xs flex justify-center items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
          )}
          
          {step < 3 ? (
            <button 
              type="submit" 
              className={`flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold transition-all shadow-md shadow-blue-500/20 text-xs flex justify-center items-center gap-1.5 cursor-pointer ${step === 1 ? 'w-full' : ''}`}
            >
              Next <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold transition-all shadow-md shadow-blue-500/25 text-xs flex justify-center items-center gap-1.5 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <><Send className="w-3 h-3" /> Submit Application</>
              )}
            </button>
          )}
        </div>

        <div className="text-center text-[11px] text-slate-400 pt-1">
          Already a registered partner?{' '}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
            Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
