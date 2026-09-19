import { NetworkStatusToast } from './components/ui/NetworkStatusToast';
import { apiUrl } from './utils/api';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Landing } from './pages/auth/Landing';
import { Login } from './pages/auth/Login';
import { Apply } from './pages/auth/Apply';
import { ApplyStatus } from './pages/auth/ApplyStatus';
import { OnboardingWizard } from './pages/onboarding/OnboardingWizard';
import { Dashboard } from './pages/dashboard/Dashboard';
import { LinksManagement } from './pages/links/LinksManagement';
import { ReferralsList } from './pages/referrals/ReferralsList';
import { PlayerActivity } from './pages/activity/PlayerActivity';
import { SubAffiliatesTree } from './pages/network/SubAffiliatesTree';
import { EarningsLedger } from './pages/finance/EarningsLedger';
import { PayoutRequests } from './pages/finance/PayoutRequests';
import { SupportTickets } from './pages/support/SupportTickets';
import { Settings } from './pages/settings/Settings';
import { ApiIntegration } from './pages/integration/ApiIntegration';
import { Reports } from './pages/reports/Reports';

// Global API response guard: immediately kicks out suspended accounts on any 403
if (typeof window !== 'undefined' && !window.__affiliate_fetch_interceptor__) {
  window.__affiliate_fetch_interceptor__ = true;
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    if (response.status === 403) {
      try {
        const clone = response.clone();
        const data = await clone.json();
        if (data.code === 'ACCOUNT_SUSPENDED' || (data.message && data.message.includes('suspended'))) {
          localStorage.removeItem('affiliate_token');
          localStorage.removeItem('affiliate_user');
          localStorage.removeItem('affiliate_onboarded');
          localStorage.removeItem('affiliate_kyc_documents');
          const email = data.email || '';
          window.location.href = `/apply/status?suspended=1${email ? `&email=${encodeURIComponent(email)}` : ''}`;
        }
      } catch (e) {}
    }
    return response;
  };
}

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('affiliate_token');
    localStorage.removeItem('affiliate_user');
    localStorage.removeItem('affiliate_onboarded');
    localStorage.removeItem('affiliate_kyc_documents');
    window.location.href = '/login';
  };

  const handleSuspendedLogout = (email = '') => {
    localStorage.removeItem('affiliate_token');
    localStorage.removeItem('affiliate_user');
    localStorage.removeItem('affiliate_onboarded');
    localStorage.removeItem('affiliate_kyc_documents');
    window.location.href = `/apply/status?suspended=1${email ? `&email=${encodeURIComponent(email)}` : ''}`;
  };

  // Live session & suspension heartbeat (polls every 3 seconds)
  useEffect(() => {
    const checkLiveStatus = async () => {
      const token = localStorage.getItem('affiliate_token');
      if (!token || token === 'mock_token') {
        handleLogout();
        return;
      }
      try {
        const res = await fetch(apiUrl('/api/v1/affiliate/dashboard'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        // 1. Check if suspended / forbidden
        if (res.status === 403 || data.code === 'ACCOUNT_SUSPENDED' || (data.data?.identity?.status && data.data.identity.status !== 'active' && data.data.identity.status !== 'approved')) {
          console.warn('Affiliate account has been suspended! Evicting immediately...');
          handleSuspendedLogout(data.email || data.data?.identity?.email);
          return;
        }

        // 2. Check if user was completely deleted or token invalid
        if (res.status === 401 || res.status === 404 || data.status !== 'success' || !data.data?.identity) {
          console.warn('Affiliate account not found or deleted from DB. Logging out...');
          handleLogout();
          return;
        }

        // 3. Keep cached user status fresh in localStorage
        localStorage.setItem('affiliate_user', JSON.stringify({
          ...data.data.identity,
          onboarding_completed: data.data.identity.onboarding_completed
        }));
      } catch (err) {}
    };

    checkLiveStatus();
    const interval = setInterval(checkLiveStatus, 3000);
    window.addEventListener('focus', checkLiveStatus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkLiveStatus);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex selection:bg-blue-500/30 transition-colors duration-300 overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col md:pl-64 min-w-0 max-w-full overflow-x-hidden">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-3 sm:p-4 md:p-6 min-w-0 max-w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('affiliate_token');
  const isAuthenticated = Boolean(token && token !== 'mock_token');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRaw = localStorage.getItem('affiliate_user');
  let user = null;
  try {
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch (e) {}

  // 1. If account is not active/approved, redirect to apply status
  if (user && user.status && user.status !== 'active' && user.status !== 'approved') {
    return <Navigate to={`/apply/status?email=${encodeURIComponent(user.email || '')}`} replace />;
  }

  // 2. ONE-TIME ONBOARDING CHECK:
  // Must complete onboarding after approval before accessing dashboard
  const isOnboarded = localStorage.getItem('affiliate_onboarded') === 'true' || Boolean(user?.onboarding_completed);
  if (!isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return children ? children : <Outlet />;
};

const OnboardingRoute = () => {
  const token = localStorage.getItem('affiliate_token');
  const userRaw = localStorage.getItem('affiliate_user');

  // 1. Must be logged in
  if (!token || token === 'mock_token') {
    return <Navigate to="/login" replace />;
  }

  // 2. Must be approved by admin
  let user = null;
  try {
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch (e) {}

  if (user && user.status && user.status !== 'active' && user.status !== 'approved') {
    return <Navigate to={`/apply/status?email=${encodeURIComponent(user.email || '')}`} replace />;
  }

  // 3. If already onboarded, go to dashboard
  const isOnboarded = localStorage.getItem('affiliate_onboarded') === 'true' || Boolean(user?.onboarding_completed);
  if (isOnboarded) {
    return <Navigate to="/dashboard" replace />;
  }

  return <OnboardingWizard />;
};

function App() {
  return (
    <BrowserRouter>
      <NetworkStatusToast />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<Navigate to="/login?mode=forgot" replace />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/apply/status" element={<ApplyStatus />} />
        <Route path="/onboarding" element={<OnboardingRoute />} />
        <Route path="/ONBOARDING" element={<Navigate to="/onboarding" replace />} />
        <Route path="/Onboarding" element={<Navigate to="/onboarding" replace />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/links" element={<LinksManagement />} />
          <Route path="/referrals" element={<ReferralsList />} />
          <Route path="/player-activity" element={<PlayerActivity />} />
          <Route path="/network" element={<SubAffiliatesTree />} />
          <Route path="/finance/earnings" element={<EarningsLedger />} />
          <Route path="/finance/payouts" element={<PayoutRequests />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/integration" element={<ApiIntegration />} />
          <Route path="/support" element={<SupportTickets />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
