import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Shield, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { apiPost } from '../../utils/api';

export const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 2FA state
  const [requires2Fa, setRequires2Fa] = useState(false);
  const [preAuthToken, setPreAuthToken] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const completeLogin = (token, affiliate) => {
    localStorage.setItem('affiliate_token', token);
    if (affiliate) {
      localStorage.setItem('affiliate_user', JSON.stringify(affiliate));
    }
    window.location.href = '/dashboard';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!requires2Fa) {
        // Step 1: Normal Login Credentials
        const res = await apiPost('/api/v1/affiliate/auth/login', form);
        
        if (res && res.status === '2fa_required') {
          // 2FA is enabled for this account!
          setRequires2Fa(true);
          setPreAuthToken(res.pre_auth_token);
        } else if (res && res.status === 'success' && res.token) {
          completeLogin(res.token, res.affiliate);
        } else {
          setError(res?.message || 'Invalid email or password.');
        }
      } else {
        // Step 2: Submit 6-digit Google Authenticator OTP Code
        if (!otpCode || otpCode.length < 6) {
          setError('Please enter a valid 6-digit Google Authenticator code.');
          setLoading(false);
          return;
        }

        const res2 = await apiPost('/api/v1/affiliate/auth/2fa/verify_login', {
          pre_auth_token: preAuthToken,
          code: otpCode
        });

        if (res2 && res2.status === 'success' && res2.token) {
          completeLogin(res2.token, res2.affiliate);
        } else {
          setError(res2?.message || 'Invalid 2FA code. Please try again.');
        }
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white mb-4 shadow-lg shadow-indigo-600/30">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Affiliate Partner Portal</h1>
          <p className="text-sm text-slate-400 mt-1">
            {requires2Fa ? 'Enter Google Authenticator OTP to complete login' : 'Sign in to access your affiliate dashboard'}
          </p>
        </div>

        <Card className="p-8 bg-slate-900/80 border-slate-800 backdrop-blur-xl shadow-2xl">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!requires2Fa ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email or Affiliate Code</label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="email@example.com or AFF-XXXXXX"
                      className="pl-10 bg-slate-950/60 border-slate-800 text-white placeholder-slate-500"
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <Input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      className="pl-10 bg-slate-950/60 border-slate-800 text-white placeholder-slate-500"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-center">
                  Google Authenticator 6-Digit Code
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="text-center font-mono text-2xl tracking-widest pl-10 bg-slate-950/60 border-slate-800 text-white placeholder-slate-600"
                    autoFocus
                    required
                  />
                  <KeyRound className="w-5 h-5 text-indigo-400 absolute left-3 top-3" />
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center space-x-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{requires2Fa ? 'Verify 2FA & Login' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {!requires2Fa ? (
            <div className="mt-6 text-center text-xs text-slate-400">
              Don't have an affiliate account?{' '}
              <Link to="/apply" className="text-indigo-400 hover:text-indigo-300 font-semibold">
                Apply as Partner
              </Link>
            </div>
          ) : (
            <div className="mt-6 text-center text-xs text-slate-400">
              <button onClick={() => { setRequires2Fa(false); setError(''); }} className="text-indigo-400 hover:text-indigo-300 font-semibold">
                ← Back to Password Login
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Login;
