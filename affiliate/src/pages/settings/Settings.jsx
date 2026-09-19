import { PageLoader } from '../../components/ui/PageLoader';
import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Building, Globe, Shield, Lock, Smartphone, 
  CheckCircle, AlertCircle, Clock, FileText, Copy, Check, Edit2, X, RefreshCw, Key, QrCode
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { apiGet, apiPost } from '../../utils/api';

export const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    website: '',
    affiliate_code: '',
    status: 'approved'
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ ...profile });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [copiedCode, setCopiedCode] = useState(false);

  // Preferences state
  const [preferences, setPreferences] = useState({
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    language: 'en',
    email_notifications: true,
    sms_notifications: true,
    marketing_updates: false
  });
  const [savingPref, setSavingPref] = useState(false);
  const [prefMsg, setPrefMsg] = useState({ type: '', text: '' });

  // 2FA Security state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FaModal, setShow2FaModal] = useState(false);
  const [showDisable2FaModal, setShowDisable2FaModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [twoFaMsg, setTwoFaMsg] = useState({ type: '', text: '' });

  // KYC state
  const [kycStatus, setKycStatus] = useState('pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [kycDocs, setKycDocs] = useState([]);
  const [kycLoading, setKycLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    fetchProfile();
    fetchPreferences();
    fetch2FaStatus();
    fetchKycData();
  return () => clearTimeout(timer);
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiGet('/api/v1/affiliate/settings');
      if (res && res.status === 'success' && res.data) {
        const d = res.data;
        const pData = {
          name: d.name || d.full_name || '',
          email: d.email || '',
          phone: d.phone || '',
          company: d.company || d.company_name || '',
          website: d.website || '',
          affiliate_code: d.affiliate_code || '',
          status: d.status || 'approved'
        };
        setProfile(pData);
        setProfileForm(pData);
      }
    } catch (e) {
      console.error('Failed to load profile settings', e);
    }
  };

  const fetchPreferences = async () => {
    try {
      const res = await apiGet('/api/v1/affiliate/preferences');
      if (res && res.status === 'success' && res.data) {
        setPreferences(res.data);
      }
    } catch (e) {
      console.error('Failed to load preferences', e);
    }
  };

  const fetch2FaStatus = async () => {
    try {
      const res = await apiGet('/api/v1/affiliate/auth/2fa/setup');
      if (res && res.status === 'success' && res.data) {
        setTwoFactorEnabled(!!res.data.enabled);
        setSecretKey(res.data.secret || '');
        setQrCodeUrl(res.data.qr_code_url || '');
      }
    } catch (e) {
      console.error('Failed to load 2FA status', e);
    }
  };

  const fetchKycData = async () => {
    setKycLoading(true);
    try {
      const res = await apiGet('/api/v1/affiliate/kyc');
      if (res && res.status === 'success' && res.data) {
        setKycStatus(res.data.kyc_status || 'pending');
        setRejectionReason(res.data.rejection_reason || '');
        setKycDocs(res.data.documents || []);
      }
    } catch (e) {
      console.error('Failed to load KYC status', e);
    } finally {
      setKycLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (profile.affiliate_code) {
      navigator.clipboard.writeText(profile.affiliate_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopySecret = () => {
    if (secretKey) {
      navigator.clipboard.writeText(secretKey);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ type: '', text: '' });
    try {
      const res = await apiPost('/api/v1/affiliate/settings', profileForm);
      if (res && res.status === 'success') {
        setProfile({ ...profileForm });
        setEditingProfile(false);
        setProfileMsg({ type: 'success', text: 'Profile details updated successfully.' });
      } else {
        setProfileMsg({ type: 'error', text: res?.message || 'Failed to update profile.' });
      }
    } catch (e) {
      setProfileMsg({ type: 'error', text: 'Network error updating profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSavingPref(true);
    setPrefMsg({ type: '', text: '' });
    try {
      const res = await apiPost('/api/v1/affiliate/preferences', preferences);
      if (res && res.status === 'success') {
        setPrefMsg({ type: 'success', text: 'Preferences saved successfully.' });
      } else {
        setPrefMsg({ type: 'error', text: res?.message || 'Failed to save preferences.' });
      }
    } catch (e) {
      setPrefMsg({ type: 'error', text: 'Network error saving preferences.' });
    } finally {
      setSavingPref(false);
    }
  };

  const handleOpen2FaModal = async () => {
    setTwoFaMsg({ type: '', text: '' });
    setOtpCode('');
    try {
      const res = await apiGet('/api/v1/affiliate/auth/2fa/setup');
      if (res && res.status === 'success' && res.data) {
        setSecretKey(res.data.secret);
        setQrCodeUrl(res.data.qr_code_url);
        setShow2FaModal(true);
      }
    } catch (e) {
      alert('Failed to initialize 2FA setup.');
    }
  };

  const handleEnable2Fa = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setTwoFaMsg({ type: 'error', text: 'Please enter a valid 6-digit Google Authenticator code.' });
      return;
    }
    setTwoFaLoading(true);
    setTwoFaMsg({ type: '', text: '' });
    try {
      const res = await apiPost('/api/v1/affiliate/auth/2fa/enable', { code: otpCode });
      if (res && res.status === 'success') {
        setTwoFactorEnabled(true);
        setShow2FaModal(false);
        alert('Google Authenticator 2FA enabled successfully!');
      } else {
        setTwoFaMsg({ type: 'error', text: res?.message || 'Invalid verification code.' });
      }
    } catch (e) {
      setTwoFaMsg({ type: 'error', text: 'Failed to verify 2FA code.' });
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handleDisable2Fa = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setTwoFaMsg({ type: 'error', text: 'Please enter a 6-digit code from Google Authenticator.' });
      return;
    }
    setTwoFaLoading(true);
    setTwoFaMsg({ type: '', text: '' });
    try {
      const res = await apiPost('/api/v1/affiliate/auth/2fa/disable', { code: otpCode });
      if (res && res.status === 'success') {
        setTwoFactorEnabled(false);
        setShowDisable2FaModal(false);
        alert('Google Authenticator 2FA disabled successfully.');
      } else {
        setTwoFaMsg({ type: 'error', text: res?.message || 'Invalid code.' });
      }
    } catch (e) {
      setTwoFaMsg({ type: 'error', text: 'Failed to disable 2FA.' });
    } finally {
      setTwoFaLoading(false);
    }
  };

  if (loading) {
    return <PageLoader message="Loading account settings..." />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Manage your affiliate profile, preferences, 2FA security, and KYC verification.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800 flex space-x-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Info</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'preferences'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Preferences</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Security & 2FA</span>
        </button>

        <button
          onClick={() => setActiveTab('kyc')}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'kyc'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>KYC Verification</span>
          {kycStatus === 'verified' && <Badge variant="success" className="ml-1 text-xs">Verified</Badge>}
          {kycStatus === 'rejected' && <Badge variant="danger" className="ml-1 text-xs">Rejected</Badge>}
        </button>
      </div>

      {/* TAB 1: PROFILE INFO */}
      {activeTab === 'profile' && (
        <Card className="p-6">
          <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Profile Details</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">View and update your personal and contact details.</p>
            </div>
            {!editingProfile ? (
              <Button onClick={() => setEditingProfile(true)} variant="outline" className="flex items-center space-x-2">
                <Edit2 className="w-4 h-4" />
                <span>Edit Details</span>
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button 
                  onClick={() => { setEditingProfile(false); setProfileForm({ ...profile }); }} 
                  variant="secondary" 
                  className="flex items-center space-x-1"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </Button>
              </div>
            )}
          </div>

          {profileMsg.text && (
            <div className={`mt-4 p-3 rounded-lg text-sm flex items-center space-x-2 ${
              profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300'
            }`}>
              {profileMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          {/* READ ONLY AFFILIATE CODE WITH COPY BUTTON */}
          <div className="mt-6 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Your Permanent Affiliate Code</span>
              <div className="flex items-center space-x-2 mt-1">
                <span className="font-mono text-xl font-bold text-indigo-950 dark:text-indigo-200">{profile.affiliate_code || 'N/A'}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">(Cannot be modified)</span>
              </div>
            </div>
            <Button onClick={handleCopyCode} variant="outline" size="sm" className="flex items-center space-x-2 bg-white dark:bg-gray-900">
              {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-indigo-600" />}
              <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
            </Button>
          </div>

          {/* READ-ONLY VIEW OR EDIT FORM */}
          {!editingProfile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <span className="text-xs text-gray-400 block font-medium">Full Name</span>
                <span className="text-base font-semibold text-gray-900 dark:text-white mt-1 block">{profile.name || 'Not provided'}</span>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <span className="text-xs text-gray-400 block font-medium">Email Address</span>
                <span className="text-base font-semibold text-gray-900 dark:text-white mt-1 block">{profile.email || 'Not provided'}</span>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <span className="text-xs text-gray-400 block font-medium">Phone Number</span>
                <span className="text-base font-semibold text-gray-900 dark:text-white mt-1 block">{profile.phone || 'Not provided'}</span>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <span className="text-xs text-gray-400 block font-medium">Company Name</span>
                <span className="text-base font-semibold text-gray-900 dark:text-white mt-1 block">{profile.company || 'Not provided'}</span>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 md:col-span-2">
                <span className="text-xs text-gray-400 block font-medium">Website / Channel</span>
                <span className="text-base font-semibold text-gray-900 dark:text-white mt-1 block">{profile.website || 'Not provided'}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <Input 
                    type="text" 
                    value={profileForm.name} 
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} 
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                  <Input 
                    type="email" 
                    value={profileForm.email} 
                    disabled 
                    className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-75"
                  />
                  <span className="text-[10px] text-gray-400">Email is linked to your login account</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                  <Input 
                    type="text" 
                    value={profileForm.phone} 
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} 
                    placeholder="+91 9999999999"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Company / Organization</label>
                  <Input 
                    type="text" 
                    value={profileForm.company} 
                    onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })} 
                    placeholder="Company name"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Website URL / Traffic Source</label>
                  <Input 
                    type="text" 
                    value={profileForm.website} 
                    onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })} 
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100 dark:border-gray-800">
                <Button 
                  type="button" 
                  onClick={() => { setEditingProfile(false); setProfileForm({ ...profile }); }} 
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={savingProfile} className="flex items-center space-x-2">
                  {savingProfile && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                </Button>
              </div>
            </form>
          )}
        </Card>
      )}

      {/* TAB 2: PREFERENCES */}
      {activeTab === 'preferences' && (
        <Card className="p-6">
          <div className="pb-6 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Portal & Communication Preferences</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Configure regional display formats and alert channels.</p>
          </div>

          {prefMsg.text && (
            <div className={`mt-4 p-3 rounded-lg text-sm flex items-center space-x-2 ${
              prefMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300'
            }`}>
              {prefMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{prefMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSavePreferences} className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Display Currency</label>
                <select 
                  value={preferences.currency} 
                  onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Timezone</label>
                <select 
                  value={preferences.timezone} 
                  onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                  <option value="UTC">UTC (GMT +0:00)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST +4:00)</option>
                  <option value="America/New_York">America/New_York (EST -5:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Portal Language</label>
                <select 
                  value={preferences.language} 
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Notification Channels</h3>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white block">Email Notifications</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Receive payout updates and daily performance summaries via email</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.email_notifications} 
                  onChange={(e) => setPreferences({ ...preferences, email_notifications: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white block">SMS Notifications</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Receive SMS alerts for payout approvals and account status updates</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.sms_notifications} 
                  onChange={(e) => setPreferences({ ...preferences, sms_notifications: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white block">Promotions & Marketing Updates</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Receive news about new commission campaigns and promotional materials</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.marketing_updates} 
                  onChange={(e) => setPreferences({ ...preferences, marketing_updates: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button type="submit" disabled={savingPref} className="flex items-center space-x-2">
                {savingPref && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>{savingPref ? 'Saving...' : 'Save Preferences'}</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 3: SECURITY & 2FA */}
      {activeTab === 'security' && (
        <Card className="p-6">
          <div className="pb-6 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Security & Google Authenticator (2FA)</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Protect your account with Google Authenticator Two-Factor Authentication.</p>
          </div>

          <div className="mt-6 p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-xl ${twoFactorEnabled ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'}`}>
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Google Authenticator (TOTP)</h3>
                  {twoFactorEnabled ? (
                    <Badge variant="success" className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Enabled</span>
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Disabled</span>
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
                  {twoFactorEnabled 
                    ? 'Your account is secured with Google Authenticator. You will be prompted to enter a 6-digit TOTP verification code whenever logging into your affiliate portal.'
                    : 'Add an extra layer of security to your affiliate account. When enabled, logging in will require a 6-digit code from your Google Authenticator app.'}
                </p>
              </div>
            </div>

            <div>
              {!twoFactorEnabled ? (
                <Button onClick={handleOpen2FaModal} className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                  <QrCode className="w-4 h-4" />
                  <span>Enable 2FA</span>
                </Button>
              ) : (
                <Button onClick={() => { setOtpCode(''); setTwoFaMsg({ type: '', text: '' }); setShowDisable2FaModal(true); }} variant="danger" className="flex items-center space-x-2">
                  <Lock className="w-4 h-4" />
                  <span>Disable 2FA</span>
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* TAB 4: KYC VERIFICATION */}
      {activeTab === 'kyc' && (
        <Card className="p-6">
          <div className="pb-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">KYC Verification Status</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Identity and compliance document verification.</p>
            </div>
            {kycStatus === 'verified' && (
              <Badge variant="success" className="px-3 py-1.5 text-xs font-semibold flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>KYC Approved & Verified</span>
              </Badge>
            )}
          </div>

          {/* APPROVED READ ONLY BANNER */}
          {kycStatus === 'verified' && (
            <div className="mt-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Your KYC Identity is Fully Verified</h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Your identity documents have been audited and verified by our compliance team. Once approved, KYC details cannot be modified. If you need to update legal documents, please contact partner support.
                </p>
              </div>
            </div>
          )}

          {/* REJECTED ALERT WITH ADMIN REJECTION LOGS */}
          {kycStatus === 'rejected' && (
            <div className="mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-red-900 dark:text-red-200">KYC Verification Rejected by Admin</h3>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  <strong>Rejection Reason / Reviewer Note:</strong> {rejectionReason || 'Uploaded documents were unclear or invalid. Please re-upload valid government ID and proof of address.'}
                </p>
              </div>
            </div>
          )}

          {/* DOCUMENTS LIST */}
          <div className="mt-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Submitted Documents</h3>
            {kycDocs.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">No KYC documents submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {kycDocs.map((doc) => (
                  <div key={doc.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/40">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white block">{doc.title}</span>
                        <span className="text-xs text-gray-400">{doc.fileName} • Submitted: {new Date(doc.created_at).toLocaleDateString()}</span>
                        {doc.reviewer_note && (
                          <span className="text-xs text-red-500 block mt-0.5">Admin Note: {doc.reviewer_note}</span>
                        )}
                      </div>
                    </div>
                    <Badge variant={doc.status === 'approved' ? 'success' : (doc.status === 'rejected' ? 'danger' : 'warning')}>
                      {doc.label || doc.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ENABLE 2FA MODAL */}
      {show2FaModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-indigo-600" />
                <span>Setup Google Authenticator</span>
              </h3>
              <button onClick={() => setShow2FaModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {twoFaMsg.text && (
              <div className={`p-3 rounded-lg text-xs flex items-center space-x-2 ${
                twoFaMsg.type === 'error' ? 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300' : 'bg-emerald-50 text-emerald-800'
              }`}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{twoFaMsg.text}</span>
              </div>
            )}

            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
              <p>1. Open <strong>Google Authenticator</strong> app on your mobile phone.</p>
              <p>2. Scan this QR Code or manually enter the secret key below:</p>
            </div>

            {/* QR Code Image */}
            <div className="flex justify-center p-4 bg-white rounded-xl border border-gray-200 my-2">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="2FA QR Code" className="w-44 h-44 object-contain" />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-gray-400">Loading QR...</div>
              )}
            </div>

            {/* Secret Key with Copy Button */}
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Secret Key</span>
                <span className="font-mono text-sm font-bold text-gray-900 dark:text-white tracking-widest">{secretKey}</span>
              </div>
              <button onClick={handleCopySecret} className="text-indigo-600 hover:text-indigo-700 p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                {copiedSecret ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <form onSubmit={handleEnable2Fa} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  3. Enter 6-Digit Code from Authenticator App
                </label>
                <Input 
                  type="text" 
                  maxLength={6} 
                  value={otpCode} 
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} 
                  placeholder="e.g. 123456" 
                  className="text-center font-mono text-lg tracking-widest"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <Button type="button" onClick={() => setShow2FaModal(false)} variant="secondary" className="w-1/2">
                  Cancel
                </Button>
                <Button type="submit" disabled={twoFaLoading} className="w-1/2 flex items-center justify-center space-x-1">
                  {twoFaLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{twoFaLoading ? 'Verifying...' : 'Verify & Enable'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISABLE 2FA MODAL */}
      {showDisable2FaModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <Lock className="w-5 h-5 text-red-500" />
                <span>Disable Google Authenticator</span>
              </h3>
              <button onClick={() => setShowDisable2FaModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {twoFaMsg.text && (
              <div className="p-3 rounded-lg text-xs bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{twoFaMsg.text}</span>
              </div>
            )}

            <p className="text-xs text-gray-600 dark:text-gray-400">
              Please enter your current 6-digit code from Google Authenticator to confirm turning off 2FA.
            </p>

            <form onSubmit={handleDisable2Fa} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">6-Digit Code</label>
                <Input 
                  type="text" 
                  maxLength={6} 
                  value={otpCode} 
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} 
                  placeholder="123456" 
                  className="text-center font-mono text-lg tracking-widest"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <Button type="button" onClick={() => setShowDisable2FaModal(false)} variant="secondary" className="w-1/2">
                  Cancel
                </Button>
                <Button type="submit" disabled={twoFaLoading} variant="danger" className="w-1/2 flex items-center justify-center space-x-1">
                  {twoFaLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{twoFaLoading ? 'Disabling...' : 'Confirm Disable'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
