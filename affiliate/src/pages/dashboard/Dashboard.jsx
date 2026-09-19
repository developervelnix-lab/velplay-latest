import { PageLoader } from '../../components/ui/PageLoader';
import { apiUrl } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { 
  TrendingUp, 
  MousePointer, 
  UserPlus, 
  Award, 
  Calendar, 
  DollarSign, 
  ArrowUpRight, 
  Layers, 
  Activity, 
  Sparkles,
  Link2,
  Filter, 
  Info, 
  X, 
  ShieldCheck,
  BarChart3,
  Zap
} from 'lucide-react';

export const Dashboard = () => {
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [activeChartMetric, setActiveChartMetric] = useState('commission');
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredTrend, setHoveredTrend] = useState(null);
  const [showDealModal, setShowDealModal] = useState(false);

  useEffect(() => {
    const fetchDash = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('affiliate_token') || '';
        const res = await fetch(apiUrl(`/api/v1/affiliate/dashboard?date_range=${encodeURIComponent(dateRange)}`), {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (data.status !== 'success' || !data.data) {
          localStorage.removeItem('affiliate_token');
          localStorage.removeItem('affiliate_user');
          localStorage.removeItem('affiliate_onboarded');
          window.location.href = '/login';
          return;
        }
        if (data.status === 'success' && data.data) {
          setDashData(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDash();
  }, [dateRange]);

  const metrics = dashData?.metrics || {};
  const balances = dashData?.balances || {};
  const identity = dashData?.identity || {};
  const dailyTrends = dashData?.daily_trends || [];
  const liveStats = dashData?.live_stats || {};
  const liveRecentBets = dashData?.live_recent_bets || [];

  const kpis = [
    { 
      title: 'Total Clicks', 
      value: (metrics.total_clicks || 0).toLocaleString(), 
      change: 'Tracked', 
      isPositive: true,
      subtext: `Period: ${dateRange}`,
      icon: MousePointer, 
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' 
    },
    { 
      title: 'New Signups', 
      value: (metrics.total_referrals || 0).toLocaleString(), 
      change: 'Attributed', 
      isPositive: true,
      subtext: `Period: ${dateRange}`,
      icon: UserPlus, 
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' 
    },
    { 
      title: 'FTDs (Depositors)', 
      value: (metrics.total_ftds || 0).toLocaleString(), 
      change: 'Qualified FTDs', 
      isPositive: true,
      subtext: `Period: ${dateRange}`,
      icon: Award, 
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
    },
    { 
      title: 'Net Commission', 
      value: `\u20B9${(balances.lifetime_earnings || 0).toLocaleString('en-IN')}`, 
      change: 'Lifetime', 
      isPositive: true,
      subtext: `Period Comm: \u20B9${(metrics.period_commission || 0).toLocaleString('en-IN')}`,
      icon: DollarSign, 
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' 
    }
  ];

  const quickStats = [
    { label: 'Available Balance', value: `\u20B9${(balances.available_balance || 0).toLocaleString('en-IN')}` },
    { label: 'Pending Balance', value: `\u20B9${(balances.pending_balance || 0).toLocaleString('en-IN')}` },
    { label: 'Deal Model', value: (identity.deal_type || 'hybrid').toUpperCase() },
    { label: 'Tier Level', value: `${(identity.tier || 'Bronze').toUpperCase()} (${identity.revshare_pct || 30}%)` }
  ];

  const topLinks = [
    { id: 1, name: 'Main Tracking Link', clicks: metrics.total_clicks || 0, signups: metrics.total_referrals || 0, ftds: metrics.total_ftds || 0, conv: 'Live', earned: `\u20B9${(balances.lifetime_earnings || 0).toLocaleString('en-IN')}` }
  ];

  const recentActivity = [
    { id: 1, type: 'Account Overview', player: identity.email || 'Partner', details: `Status: ${identity.status || 'Active'}`, amount: `\u20B9${(balances.available_balance || 0).toLocaleString('en-IN')}`, time: 'Just now', status: 'approved' }
  ];

  const getMetricVal = (item) => {
    if (activeChartMetric === 'commission') return item.commission || 0;
    if (activeChartMetric === 'ftd') return item.ftds || 0;
    return item.clicks || 0;
  };

  const maxVal = Math.max(...dailyTrends.map(getMetricVal), 1);
  const totalMetricSum = dailyTrends.reduce((acc, curr) => acc + getMetricVal(curr), 0);

  if (loading) {
    return <PageLoader message="Fetching live dashboard stats..." />;
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight font-display">
              Dashboard Overview
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Stats
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Real-time tracking of clicks, conversions, player deposits, and affiliate commissions.
          </p>
        </div>
        
        {/* Date Filter Bar */}
        <div className="flex items-center bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-1 shadow-inner overflow-x-auto max-w-full self-start sm:self-auto">
          {['Today', 'Yesterday', 'Last 7 Days', 'This Month'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                dateRange === range 
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm shadow-blue-500/20' 
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Partner Profile Identity Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-base sm:text-lg shadow-md shadow-blue-500/20 shrink-0">
            {((identity.name || identity.company_name || 'AP').substring(0, 2)).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-zinc-100 tracking-tight truncate">
                {identity.name || 'Partner Account'}
              </h2>
              {identity.company_name ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20">
                  {identity.company_name}
                </span>
              ) : null}
              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">
                {(identity.tier || 'Bronze')} Partner
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 uppercase tracking-wider">
                {identity.deal_type ? `${identity.deal_type.toUpperCase()} DEAL` : 'HYBRID DEAL'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-0.5 text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-0.5 sm:mt-1">
              <span>Code: <strong className="text-blue-600 dark:text-cyan-400 font-mono">{identity.affiliate_code || '---'}</strong></span>
              <span>&bull;</span>
              <span className="truncate">Email: <strong className="text-slate-700 dark:text-zinc-300">{identity.email || '---'}</strong></span>
              <span>&bull;</span>
              <span>Deal Model: <strong className="text-purple-600 dark:text-purple-400 font-bold">{
                identity.deal_type === 'cpa' 
                  ? `CPA (\u20B9${identity.cpa_amount || 100}/FTD)` 
                  : (identity.deal_type === 'revshare' || identity.deal_type === 'revenue_share') 
                    ? `RevShare (${identity.revshare_pct || 30}%)` 
                    : `Hybrid (CPA \u20B9${identity.cpa_amount || 100} + ${identity.revshare_pct || 30}% RS)`
              }</strong></span>
              <button
                type="button"
                onClick={() => setShowDealModal(true)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 border border-purple-500/30 transition-all cursor-pointer ml-1"
              >
                <Info className="w-3 h-3" /> Deal Details
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <a 
            href="/settings" 
            className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 text-[11px] sm:text-xs font-bold transition-all text-center"
          >
            Manage Profile &rarr;
          </a>
        </div>
      </div>

      {/* KPI Cards Grid - 2x2 on mobile, 4-col on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={kpi.title} 
              className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-sm hover:border-blue-400/50 dark:hover:border-zinc-700 transition-all group relative overflow-hidden flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-1">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider line-clamp-1">
                  {kpi.title}
                </span>
                <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border ${kpi.color} shrink-0`}>
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="mt-1.5 sm:mt-2.5">
                <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-zinc-100 font-display tracking-tight">
                  {kpi.value}
                </div>
                <div className="flex items-center gap-1 mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] truncate">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center shrink-0">
                    <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {kpi.change}
                  </span>
                  <span className="text-slate-400 dark:text-zinc-500 font-medium truncate">
                    &bull; Period: {dateRange}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Summary Pill Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2.5">
        {quickStats.map((item, i) => (
          <div key={i} className="bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/60 rounded-lg sm:rounded-xl p-2 sm:p-2.5 px-2.5 sm:px-3.5 flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-zinc-400 truncate mr-1">{item.label}</span>
            <span className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-zinc-100 font-mono shrink-0">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Real-Time Live Gameplay & Estimated RevShare Banner (Today) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 border-b border-indigo-500/20 pb-3.5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight font-display text-white">
                  Current Settlement Cycle Activity & Estimated RevShare
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" /> Real-Time Feed
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Tracks live player wagers & estimated commission for your active settlement cycle (since last settlement).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-indigo-200 bg-indigo-900/50 border border-indigo-500/30 px-3 py-1 rounded-xl">
              Active Cycle Players: <strong className="text-white font-mono text-xs">{liveStats.active_players_cycle || liveStats.active_players_today || 0}</strong>
            </span>
          </div>
        </div>

        {/* 4 Live Metric Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 relative z-10">
          {/* Tile 1: Live Turnover */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 hover:border-blue-400/30 transition-all">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Current Cycle Turnover
            </span>
            <div className="text-lg sm:text-2xl font-black text-white font-mono mt-1">
              ₹{((liveStats.cycle_turnover ?? liveStats.today_turnover ?? 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <span>{(liveStats.total_rounds_cycle ?? liveStats.total_rounds_today ?? 0)} rounds played</span>
            </div>
          </div>

          {/* Tile 2: Player Winnings */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 hover:border-emerald-400/30 transition-all">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Player Winnings (Cycle)
            </span>
            <div className="text-lg sm:text-2xl font-black text-emerald-400 font-mono mt-1">
              ₹{((liveStats.cycle_player_wins ?? liveStats.today_player_wins ?? 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-1">
              Total paid out to players
            </div>
          </div>

          {/* Tile 3: Net Player Losses (GGR) */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 hover:border-rose-400/30 transition-all">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Net Player Losses (GGR)
            </span>
            <div className="text-lg sm:text-2xl font-black text-rose-400 font-mono mt-1">
              ₹{((liveStats.cycle_ggr ?? liveStats.today_ggr ?? 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Net platform profit today
            </div>
          </div>

          {/* Tile 4: Today's Estimated RevShare */}
          <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-purple-500/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 hover:border-purple-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider">
                Live Est. RevShare ({identity.revshare_pct || 30}%)
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Pending Settlement
              </span>
            </div>
            <div className="text-lg sm:text-2xl font-black text-amber-300 font-mono mt-1">
              +₹{((liveStats.cycle_estimated_revshare ?? liveStats.today_estimated_revshare ?? 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-purple-200 mt-1 flex items-center justify-between">
              <span>Settled: ₹{(liveStats.already_settled_today || 0).toLocaleString('en-IN')}</span>
              <span>Pending: ₹{(liveStats.unsettled_revshare || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart and Funnel Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Performance Chart Card */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-500" /> Revenue & Activity Trends
              </h2>
              <p className="text-[11px] text-slate-400">
                Daily timeline for <strong className="text-slate-700 dark:text-zinc-200">{dateRange}</strong>
              </p>
            </div>
            
            {/* Metric Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl border border-slate-200 dark:border-zinc-800">
              {[
                { id: 'commission', label: 'Commission (\u20B9)' },
                { id: 'ftd', label: 'FTDs' },
                { id: 'clicks', label: 'Clicks' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveChartMetric(m.id)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    activeChartMetric === m.id
                      ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-cyan-400 shadow-sm'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Sleek Bar Graph */}
          <div className="h-60 w-full relative pt-6 flex flex-col justify-end">
            {totalMetricSum === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center border-b border-slate-200 dark:border-zinc-800 text-slate-400 text-xs gap-2">
                <Info className="w-5 h-5 text-slate-400" />
                <span>No recorded {activeChartMetric === 'commission' ? 'commissions' : activeChartMetric === 'ftd' ? 'FTDs' : 'clicks'} for {dateRange}</span>
              </div>
            ) : (
              <div className="flex items-end justify-around gap-2 h-44 px-2 border-b border-slate-200 dark:border-zinc-800 pb-2">
                {dailyTrends.map((t, idx) => {
                  const val = getMetricVal(t);
                  const heightPct = maxVal > 0 ? Math.max((val / maxVal) * 85, val > 0 ? 12 : 0) : 0;
                  const isHovered = hoveredTrend === idx;

                  const formattedVal = activeChartMetric === 'commission' 
                    ? `\u20B9${val.toLocaleString()}` 
                    : `${val}`;

                  return (
                    <div 
                      key={idx}
                      className="flex-1 flex flex-col items-center justify-end h-full relative cursor-pointer group max-w-[48px]"
                      onMouseEnter={() => setHoveredTrend(idx)}
                      onMouseLeave={() => setHoveredTrend(null)}
                    >
                      {/* Floating Top Value Badge for Active Bar */}
                      {val > 0 && (
                        <div className={`mb-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-black font-mono transition-all duration-200 shadow-sm ${
                          isHovered 
                            ? 'bg-blue-600 text-white scale-110' 
                            : 'bg-slate-100 dark:bg-zinc-800 text-blue-600 dark:text-cyan-400 border border-slate-200 dark:border-zinc-700'
                        }`}>
                          {formattedVal}
                        </div>
                      )}

                      {/* Bar Column with Max 24px width */}
                      <div className="w-full flex justify-center items-end h-full">
                        <div 
                          style={{ height: `${heightPct}%` }}
                          className={`w-6 max-w-full rounded-t-lg transition-all duration-300 ${
                            val > 0 
                              ? 'bg-gradient-to-t from-blue-600 to-cyan-400 group-hover:from-blue-500 group-hover:to-cyan-300 shadow-sm shadow-cyan-500/20' 
                              : 'h-1 bg-slate-200 dark:bg-zinc-800 rounded-full'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* X-Axis Time / Day Labels */}
            <div className="flex justify-around text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest pt-2.5 px-2">
              {dailyTrends.map((t, idx) => (
                <span key={idx} className="flex-1 text-center truncate px-0.5 max-w-[48px]">{t.day}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Conversion Funnel Card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-zinc-100 tracking-tight flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-blue-500" /> Conversion Funnel
            </h2>
            <p className="text-[11px] text-slate-400 mb-5">Traffic conversion journey ({dateRange})</p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1.5">
                  <span className="text-slate-600 dark:text-zinc-300">1. Total Clicks</span>
                  <span className="text-slate-900 dark:text-zinc-100 font-mono">{(metrics.total_clicks || 0).toLocaleString()} (100%)</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 w-full rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1.5">
                  <span className="text-slate-600 dark:text-zinc-300">2. Registered Signups</span>
                  <span className="text-cyan-500 font-mono">{(metrics.total_referrals || 0).toLocaleString()}</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 w-[10%] rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1.5">
                  <span className="text-slate-600 dark:text-zinc-300">3. First Time Deposits (FTD)</span>
                  <span className="text-emerald-500 font-mono">{(metrics.total_ftds || 0).toLocaleString()}</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-[3%] rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-800/30 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-zinc-400 font-medium">Click-to-FTD Rate</span>
            <span className="font-black text-blue-600 dark:text-cyan-400 font-mono">
              {(metrics.total_clicks || 0) > 0 ? (((metrics.total_ftds || 0) / metrics.total_clicks) * 100).toFixed(1) + '%' : '0.0%'}
            </span>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Performing Links */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-cyan-500" /> Top Performing Campaigns
            </h2>
            <a href="/links" className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer">
              View All Links &rarr;
            </a>
          </div>

          <TableContainer>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">FTDs</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topLinks.map((link) => (
                <TableRow key={link.id}>
                  <TableCell className="font-bold text-xs text-slate-900 dark:text-zinc-100 max-w-[160px] truncate">
                    {link.name}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 dark:text-zinc-400 text-right font-medium">
                    {link.clicks.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs text-emerald-600 dark:text-emerald-400 font-bold text-right">
                    {link.ftds}
                  </TableCell>
                  <TableCell className="text-xs text-slate-900 dark:text-zinc-100 font-black text-right font-mono">
                    {link.earned}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableContainer>
        </div>

        {/* Real-Time Activity Feed */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> Recent Player Game Rounds (Live Feed)
            </h2>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live bets
            </span>
          </div>

          <TableContainer>
            <TableHeader>
              <TableRow>
                <TableHead>Game & Round</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Bet</TableHead>
                <TableHead className="text-right">Player Result</TableHead>
                <TableHead className="text-right">Est. RevShare</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {liveRecentBets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-xs text-slate-400">
                    No game rounds placed yet today. New player bets will appear here in real time!
                  </TableCell>
                </TableRow>
              ) : (
                liveRecentBets.map((bet) => (
                  <TableRow key={bet.id}>
                    <TableCell>
                      <span className="font-bold text-xs text-slate-900 dark:text-zinc-100 block">
                        {bet.game_name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {bet.round_id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-[11px] text-slate-600 dark:text-zinc-300 block font-medium">
                        {bet.player_name}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-slate-700 dark:text-zinc-300 text-right">
                      ₹{Number(bet.bet_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black font-mono ${
                        bet.is_loss 
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' 
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {bet.is_loss ? `-₹${Math.abs(bet.net_result || bet.bet_amount).toLocaleString('en-IN')}` : `+₹${Math.abs(bet.net_result || bet.win_amount).toLocaleString('en-IN')}`} {bet.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-black text-purple-600 dark:text-purple-400 text-right font-mono">
                      {bet.estimated_affiliate_share > 0 ? `+₹${Number(bet.estimated_affiliate_share).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00'}
                    </TableCell>
                    <TableCell className="text-[10px] text-slate-400 text-right whitespace-nowrap">
                      {bet.time}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </TableContainer>
        </div>
      </div>
    
      {/* Deal Details Modal Popup */}
      {showDealModal && (
        <>
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 transition-opacity"
            onClick={() => setShowDealModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 dark:text-zinc-100 font-display">
                      Commission Deal Terms & Rates
                    </h3>
                    <p className="text-xs text-slate-400">Official partner remuneration structure</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDealModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-zinc-100 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Deal Type Banner */}
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest block">Active Commission Deal</span>
                  <span className="text-base font-black text-purple-700 dark:text-purple-300 font-display">
                    {(identity.deal_type || 'hybrid').toUpperCase()} MODEL
                  </span>
                </div>
                <Badge variant="purple">ACTIVE & APPROVED</Badge>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CPA Bounty</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
                    \u20B9{(identity.cpa_amount || 100).toLocaleString()} / FTD
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Per qualified first deposit</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">RevShare Rate</span>
                  <span className="text-sm font-black text-blue-600 dark:text-cyan-400 font-mono mt-0.5 block">
                    {identity.revshare_pct || 30}% NGR
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Net Gaming Revenue Share</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sub-Partner Override</span>
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5 block">
                    {identity.sub_override_pct || 5}% Override
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">2nd Tier sub-affiliates</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Min FTD Deposit</span>
                  <span className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
                    \u20B9100.00
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Minimum qualifying deposit</span>
                </div>
              </div>

              {/* Settlement Info */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Partner Tier Level</span>
                  <span className="font-bold text-amber-500 uppercase font-mono">{(identity.tier || 'Bronze')} Tier</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Settlement Frequency</span>
                  <span className="font-bold text-slate-900 dark:text-zinc-100">Real-time / Instant Credit</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Min Payout Threshold</span>
                  <span className="font-bold text-slate-900 dark:text-zinc-100 font-mono">\u20B9{(balances.minimum_payout_threshold || 1000).toLocaleString()}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Verified under Partner Agreement
                </span>
                <button
                  onClick={() => setShowDealModal(false)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-400 transition-all cursor-pointer"
                >
                  Close Terms
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
