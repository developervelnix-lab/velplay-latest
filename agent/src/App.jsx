import { NetworkStatusToast } from './components/ui/NetworkStatusToast';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AgentProvider } from './context/AgentContext';

// Layout elements
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CreditSummary } from './components/layout/CreditSummary';

// Unauthenticated Pages
import { Landing } from './pages/auth/Landing';
import { Login } from './pages/auth/Login';
import { Apply } from './pages/auth/Apply';
import { ApplyStatus } from './pages/auth/ApplyStatus';

// Authenticated Pages
import { Dashboard } from './pages/dashboard/Dashboard';
import { ClientsManagement } from './pages/clients/ClientsManagement';
import { PlayersManagement } from './pages/players/PlayersManagement';
import { SportAnalysis } from './pages/analysis/SportAnalysis';
import { Security2FA } from './pages/settings/Security2FA';
import { ProfileSettings } from './pages/settings/ProfileSettings';
import { AgentApprovals } from './pages/approvals/AgentApprovals';

// Reports
import { PlMarket } from './pages/reports/PlMarket';
import { PlAgent } from './pages/reports/PlAgent';
import { PlEvent } from './pages/reports/PlEvent';
import { BetList } from './pages/reports/BetList';
import { TransferStatement } from './pages/reports/TransferStatement';
import { SettlementReport } from './pages/reports/SettlementReport';
import { TransactionsReport } from './pages/reports/TransactionsReport';
import { RealRevenue } from './pages/reports/RealRevenue';

// Main layout wrapper
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('agent_token');
    localStorage.removeItem('token');
    localStorage.removeItem('agent_user');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onLogout={handleLogout} 
      />

      {/* Main Content Area */}
            {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Fixed Header & Credit Summary Container */}
        <div className="fixed top-0 left-0 right-0 md:left-64 z-40 flex flex-col bg-slate-900 border-b border-slate-800 shadow-md">
          <Header 
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
          />
          <CreditSummary />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 pt-[95px] sm:pt-[110px]">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AgentProvider>
      <NetworkStatusToast />
      <BrowserRouter>
        <Routes>
          {/* Public Routing */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/apply/status" element={<ApplyStatus />} />

          {/* Console Routing */}
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/clients" element={<Layout><ClientsManagement /></Layout>} />
          <Route path="/players" element={<Layout><PlayersManagement /></Layout>} />
          <Route path="/approvals" element={<Layout><AgentApprovals /></Layout>} />
          <Route path="/sport-analysis" element={<Layout><SportAnalysis /></Layout>} />
          <Route path="/security" element={<Layout><Security2FA /></Layout>} />
          <Route path="/profile" element={<Layout><ProfileSettings /></Layout>} />
          <Route path="/settings" element={<Layout><ProfileSettings /></Layout>} />
          <Route path="/profile" element={<Layout><Security2FA /></Layout>} />

          {/* Reports */}
          <Route path="/reports/pl-market" element={<Layout><PlMarket /></Layout>} />
          <Route path="/reports/pl-agent" element={<Layout><PlAgent /></Layout>} />
          <Route path="/reports/event-pl" element={<Layout><PlEvent /></Layout>} />
          <Route path="/reports/bet-list" element={<Layout><BetList /></Layout>} />
          <Route path="/reports/transfer-statement" element={<Layout><TransferStatement /></Layout>} />
          <Route path="/reports/settlement" element={<Layout><SettlementReport /></Layout>} />
          <Route path="/reports/transactions" element={<Layout><TransactionsReport /></Layout>} />
          <Route path="/reports/real-revenue" element={<Layout><RealRevenue /></Layout>} />

          {/* Redirects fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AgentProvider>
  );
}

export default App;
