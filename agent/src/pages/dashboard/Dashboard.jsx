import { PageLoader } from '../../components/ui/PageLoader';
import React, { useState, useEffect } from 'react';
import { useAgent } from '../../context/AgentContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  DollarSign, 
  ArrowRight, 
  Coins, 
  FileSpreadsheet, 
  Activity,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);
  const { agentMe, clients, players } = useAgent();

  const totalDownlineBalance = clients.reduce((acc, c) => acc + c.balance, 0);
  const totalPlayerBalances = players.reduce((acc, p) => acc + p.availableBal, 0);
  const totalExposure = agentMe.exposure;

  const todayPnl = agentMe.metrics?.today_pnl || 0;
  const todayCommission = agentMe.metrics?.today_commission || 0;

  const quickStats = [
    { name: 'Downline Credit Ref', value: `₹${totalDownlineBalance.toLocaleString('en-IN')}`, icon: Coins, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    { name: 'Player Risk Exposure', value: `₹${totalExposure.toLocaleString('en-IN')}`, icon: Activity, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
    { name: 'Direct Player Assets', value: `₹${totalPlayerBalances.toLocaleString('en-IN')}`, icon: UserCheck, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { name: 'Active Downline Rungs', value: clients.length + players.length, icon: Users, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' }
  ];

  const recentTransfers = (agentMe.recentTransfers && agentMe.recentTransfers.length > 0)
    ? agentMe.recentTransfers
    : (agentMe.recentTransactions || []);

  if (loading) return <PageLoader message="Loading agent dashboard & live metrics..." />;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 text-left relative z-10">
      
      {/* Premium Hero Banner with Image */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 p-3 sm:p-8 rounded-xl sm:rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] font-extrabold text-cyan-300 uppercase tracking-widest">Active Agent Node Console</span>
            </div>
            
            <h1 className="text-base sm:text-3xl font-black text-white font-display tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">{agentMe.fullName}</span> 👋
            </h1>
            
            <p className="text-slate-400 text-[10px] sm:text-xs leading-tight sm:leading-relaxed max-w-xl">
              Monitor active risk exposure, delegate downstream credit lines, and review sports & casino turnover sheets in real-time.
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 sm:pt-3">
              <Link to="/clients">
                <button className="px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98]">
                  Manage Downline Clients
                </button>
              </Link>
              <Link to="/sport-analysis">
                <button className="px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-[10px] sm:text-xs font-bold text-slate-200 transition-all cursor-pointer flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Live Risk Analysis
                </button>
              </Link>
            </div>
          </div>

          {/* Right Image Feature Card */}
          <div className="lg:col-span-4 hidden lg:block">
            <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative group">
              <img 
                src="/affiliate_analytics.jpg" 
                alt="Live Analytics Hub" 
                className="w-full h-36 object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-3 flex flex-col justify-end">
                <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest block">Live Analytics Engine</span>
                <span className="text-[11px] font-bold text-slate-200 block">Velplay Book Matrix</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {quickStats.map((stat, idx) => (
          <Card key={idx} className="hover:border-slate-700 transition-colors">
            <CardContent className="flex items-center gap-2 sm:gap-4 p-2 sm:p-4">
              <div className={`p-1.5 sm:p-3 rounded-lg sm:rounded-2xl border ${stat.color} shrink-0 shadow-md`}>
                <stat.icon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[7.5px] sm:text-[9px] font-black text-slate-400 uppercase tracking-tight sm:tracking-widest truncate">{stat.name}</span>
                <span className="text-[11px] sm:text-base font-black text-slate-100 font-mono mt-0.5 block truncate">{stat.value}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts / List layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Book Health and volume chart */}
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle>Book Turnover & Net Yield</CardTitle>
            <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider font-mono bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-lg">Period: Last 7 Days</span>
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl shadow-inner flex flex-col justify-between">
                <div>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Today Commission</span>
                  <span className="text-base font-black text-emerald-400 font-mono block mt-1">₹{todayCommission.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                  <span className="text-slate-400">Direct: <b className="text-slate-200">₹{(agentMe.metrics?.today_direct_commission || 0).toFixed(2)}</b></span>
                  <span className="text-slate-600">|</span>
                  <span className="text-cyan-400 font-bold" title="Downline Overriding Spread">Downline: +₹{(agentMe.metrics?.today_downline_commission || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl shadow-inner flex flex-col justify-between">
                <div>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Today Settled P&L</span>
                  <span className={`text-base font-black font-mono block mt-1 ${todayPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {todayPnl >= 0 ? '+' : ''}₹{todayPnl.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                  <span className="text-slate-400">Direct: <b className={(agentMe.metrics?.today_direct_pnl || 0) < 0 ? 'text-red-400' : 'text-slate-200'}>₹{(agentMe.metrics?.today_direct_pnl || 0).toFixed(2)}</b></span>
                  <span className="text-slate-600">|</span>
                  <span className={(agentMe.metrics?.today_downline_pnl || 0) < 0 ? 'text-red-400' : 'text-cyan-400'} title="Downline Overriding Spread">Downline: ₹{(agentMe.metrics?.today_downline_pnl || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl shadow-inner flex flex-col justify-between">
                <div>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Partnership Share</span>
                  <span className="text-base font-black text-cyan-400 font-mono block mt-1">{agentMe.partnership}%</span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 text-center">
                  <span>Turnover Comm Rate: <b className="text-slate-200">{(agentMe.metrics?.turnover_commission_pct || 0)}%</b></span>
                </div>
              </div>
            </div>

            {/* Visual breakdown simulation */}
            <div className="space-y-3 pt-2">
              {(() => {
                const sv = agentMe.metrics?.sports_volume || 0;
                const cv = agentMe.metrics?.casino_volume || 0;
                const tot = (sv + cv) || 1;
                const sPct = Math.round((sv / tot) * 100);
                const cPct = 100 - sPct;
                return (
                  <>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-300">
                        <span>Sportsbook Wagers (Cricket, Soccer, Tennis)</span>
                        <span className="font-mono text-cyan-400 font-extrabold">{sPct}% (₹{sv.toLocaleString('en-IN')})</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 border border-slate-800 rounded-full overflow-hidden p-0.5">
                        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 h-full rounded-full" style={{ width: `${sPct}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-300">
                        <span>Casino Aggregator Games</span>
                        <span className="font-mono text-indigo-400 font-extrabold">{cPct}% (₹{cv.toLocaleString('en-IN')})</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 border border-slate-800 rounded-full overflow-hidden p-0.5">
                        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full" style={{ width: `${cPct}%` }} />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Recent Downline Activity */}
        <Card className="lg:col-span-4 flex flex-col justify-between">
          <div>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Recent Downline Transfers</CardTitle>
              <span className="text-[9px] font-bold text-slate-500 font-mono">LIVE FEED</span>
            </CardHeader>
            <CardContent className="space-y-3.5 pt-2">
              {recentTransfers.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No recent downline transfers found.
                </div>
              ) : (
                recentTransfers.map((tx) => {
                  const isOut = tx.amount < 0 || tx.type === 'TRANSFER_OUT' || tx.type === 'CLAWBACK';
                  return (
                    <div key={tx.id} className="flex justify-between items-start text-xs border-b border-slate-800/80 pb-3">
                      <div className="space-y-0.5 max-w-[65%]">
                        <span className="font-bold text-slate-200 block truncate">{tx.target}</span>
                        <span className="text-[10px] text-slate-400 font-medium block truncate" title={tx.remark}>{tx.remark}</span>
                      </div>
                      <div className="text-right space-y-0.5 font-mono">
                        <span className={`font-black block ${isOut ? 'text-red-400' : 'text-emerald-400'}`}>
                          {isOut ? '-' : '+'}₹{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-sans">{tx.time}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </div>
          
          <div className="p-4 pt-0">
            <Link to="/reports/transfer-statement" className="w-full">
              <button className="w-full py-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-200 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" /> View Full Statement
              </button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
