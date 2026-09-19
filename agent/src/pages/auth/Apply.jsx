import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { apiUrl } from '../../utils/constants';
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
  TrendingUp
} from 'lucide-react';

export const Apply = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    company: '',
    email: '',
    phone: '',
    marketRegion: '',
    expectedPlayers: '10-50',
    experience: '1-3 years',
    uplineCode: '',
    notes: ''
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
      if (!formData.username.trim() || !formData.password || !formData.confirmPassword) {
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
    if (step === 2) {
      if (!formData.fullName.trim() || !formData.email.trim()) {
        setError('Full Name and Email Address are required.');
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
    try {
      const targetUrl = apiUrl('/api/v1/agent/auth/apply');
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch (parseErr) {
        throw new Error('Live API server returned empty response (0 bytes). The backend file agent/auth/apply.php is missing on api.velplay365.com.');
      }

      if (data.status === 'success') {
        setLoading(false);
        navigate('/apply/status?email=' + encodeURIComponent(formData.email));
      } else {
        setError(data.message || 'Failed to submit agent application');
        setLoading(false);
      }
    } catch (err) {
      console.error('Application submit error:', err);
      setLoading(false);
      setError(err.message || 'Network error submitting application');
    }
  };

  const stepsConfig = [
    { num: 1, title: 'Auth Credentials', icon: User },
    { num: 2, title: 'Personal Profile', icon: Building2 },
    { num: 3, title: 'Book Operations', icon: TrendingUp }
  ];

  return (
    <AuthLayout 
      title="Agent Application" 
      subtitle="Complete three simple steps to submit your agent network credentials"
      maxWidth="max-w-lg"
    >
      {/* 3 Step Connections Indicator */}
      <div className="mb-6 relative max-w-sm mx-auto">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-4 right-4 top-4 h-[2px] bg-slate-800 -z-0" />
          <div 
            className="absolute left-4 top-4 h-[2px] bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500 -z-0"
            style={{ width: `${((step - 1) / 2) * 85}%` }}
          />

          {stepsConfig.map((s) => {
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
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </button>
                <span className={`text-[9px] font-bold mt-1.5 transition-colors text-center whitespace-nowrap ${
                  isCurrent ? 'text-cyan-400' : isCompleted ? 'text-slate-200' : 'text-slate-500'
                }`}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Area */}
      <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
        
        {error && (
          <div className="flex items-center gap-2 p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[11px] font-bold animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Login Credentials */}
        {step === 1 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-3 duration-250">
            <Input 
              label="Agent ID / Username *" 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              placeholder="e.g. master_vance" 
              required 
            />
            
            <div className="relative">
              <Input 
                label="Console Password *" 
                type={showPassword ? "text" : "password"} 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="Minimum 6 characters" 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 top-[25px] text-slate-500 hover:text-slate-250 p-1"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <Input 
              label="Confirm Password *" 
              type={showPassword ? "text" : "password"} 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              placeholder="Re-enter password" 
              required 
            />
          </div>
        )}

        {/* Step 2: Personal Profile */}
        {step === 2 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-3 duration-250">
            <Input 
              label="Full Name *" 
              name="fullName" 
              value={formData.fullName} 
              onChange={handleChange} 
              placeholder="e.g. Alexander Vance" 
              required 
            />
            <Input 
              label="Email Address *" 
              type="email"
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="vance@agency.com" 
              required 
            />
            <Input 
              label="Phone Number / Telegram" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              placeholder="+1 (800) 555-0199" 
            />
            <Input 
              label="Company Name" 
              name="company" 
              value={formData.company} 
              onChange={handleChange} 
              placeholder="Optional: e.g. Vance Bookmakers Ltd" 
            />
          </div>
        )}

        {/* Step 3: Book Operation details */}
        {step === 3 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-3 duration-250 text-left">
            <Input 
              label="Primary Market / Region *" 
              name="marketRegion" 
              value={formData.marketRegion} 
              onChange={handleChange} 
              placeholder="e.g. India, South-East Asia" 
              required 
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                  Expected Players *
                </label>
                <select 
                  name="expectedPlayers" 
                  value={formData.expectedPlayers} 
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[11px] font-semibold text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all cursor-pointer"
                >
                  <option>Under 10</option>
                  <option>10-50</option>
                  <option>50-200</option>
                  <option>200-1000</option>
                  <option>1000+</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                  Bookie Experience *
                </label>
                <select 
                  name="experience" 
                  value={formData.experience} 
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[11px] font-semibold text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all cursor-pointer"
                >
                  <option>New to this</option>
                  <option>Under 1 year</option>
                  <option>1-3 years</option>
                  <option>3-5 years</option>
                  <option>5+ years</option>
                </select>
              </div>
            </div>

            <Input 
              label="Upline Code" 
              name="uplineCode" 
              value={formData.uplineCode} 
              onChange={handleChange} 
              placeholder="Optional referral upline code" 
            />

            <div className="p-3 rounded-2xl bg-blue-950/20 border border-blue-900/35 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 leading-relaxed">
                By submitting this application, you agree to the Velplay Agent Guidelines and book safety requirements.
              </p>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex gap-2.5 pt-2">
          {step > 1 && (
            <button 
              type="button" 
              onClick={handlePrev} 
              className="w-1/3 py-2 px-3 rounded-xl border border-slate-850 bg-slate-900 text-slate-200 font-bold hover:bg-slate-800 transition-colors text-xs flex justify-center items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
          )}
          
          {step < 3 ? (
            <button 
              type="submit" 
              className={`flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 text-white font-bold transition-all shadow-md text-xs flex justify-center items-center gap-1.5 cursor-pointer ${step === 1 ? 'w-full' : ''}`}
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 text-white font-bold transition-all shadow-md text-xs flex justify-center items-center gap-1.5 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <><Send className="w-3 h-3" /> Submit Application</>
              )}
            </button>
          )}
        </div>

        <div className="text-center text-xs text-slate-400 pt-2">
          Already registered?{' '}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
            Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
