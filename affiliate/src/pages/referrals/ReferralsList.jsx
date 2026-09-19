import { PageLoader } from '../../components/ui/PageLoader';
import { Link } from 'react-router-dom';
import { exportToCSV } from '../../utils/csvExport';
import { apiUrl } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { 
  Users,
  Gamepad2, 
  Search, 
  Filter, 
  DollarSign, 
  Activity, 
  X, 
  Award, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ExternalLink,
  Download,
  Zap,
  History,
  GitFork,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

export const ReferralsList = () => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all', 'direct', 'sub'
  const [cycleFilter, setCycleFilter] = useState('current'); // 'current' (fresh) vs 'all' (history)
  const [searchTerm, setSearchTerm] = useState('');
  const [referrals, setReferrals] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [summaryData, setSummaryData] = useState({
    total_players: 0,
    total_deposits: 0,
    total_withdrawals: 0,
    total_turnover: 0,
    total_wins: 0,
    total_losses: 0,
    total_commission: 0
  });
  const [lastSettledAt, setLastSettledAt] = useState(null);
  const [settlementCycle, setSettlementCycle] = useState('weekly_monday');
  const [loading, setLoading] = useState(true);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('affiliate_token') || '';
      const params = new URLSearchParams();
      params.set('cycle', cycleFilter);
      if (sourceFilter !== 'all') params.set('source', sourceFilter);
      if (searchTerm) params.set('search', searchTerm);

      const res = await fetch(apiUrl('/api/v1/affiliate/referrals?' + params.toString()), {
        headers: token ? { Authorization: 'Bearer ' + token } : {}
      });
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.data)) {
        setTotalCount(data.pagination?.total_records || data.data.length);
        if (data.summary) setSummaryData(data.summary);
        if (data.last_settled_at) setLastSettledAt(data.last_settled_at);
        if (data.settlement_cycle) setSettlementCycle(data.settlement_cycle);

        setReferrals(data.data.map(r => {
          const hasFtd = Boolean(r.is_ftd || r.first_deposit_at || (r.first_deposit_amount && r.first_deposit_amount > 0));
          const days = Number(r.days_since_signup || 0);
          
          let playerStatus = 'signup';
          if (hasFtd) {
            playerStatus = 'ftd';
          } else if (days > 14) {
            playerStatus = 'dormant';
          }

          const commVal = Number(r.player_commission || 0);
          const balanceVal = Number(r.current_balance || 0);
          const depVal = Number(r.total_deposits || 0);
          const witVal = Number(r.total_withdrawals || 0);
          const betVal = Number(r.total_bets || 0);
          const winVal = Number(r.total_wins || 0);
          const lossVal = Number(r.total_losses || 0);

          return {
            id: r.id,
            user_id: r.user_id,
            uniq_id: r.uniq_id || r.user_id,
            username: r.username || r.user_name || ('Player #' + r.id),
            full_name: r.full_name || '',
            email: r.user_email || '',
            mobile: r.mobile || '',
            date: r.attributed_at ? r.attributed_at.split(' ')[0] : 'N/A',
            kyc: 'verified',
            link: r.campaign_name || 'Direct Referral',
            code: r.tracking_code || '',
            status: playerStatus,
            is_ftd: hasFtd,
            ftdDate: r.first_deposit_at ? r.first_deposit_at.split(' ')[0] : '-',
            ftdAmount: hasFtd ? ('₹' + Number(r.first_deposit_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : '-',
            is_sub_affiliate: Boolean(r.is_sub_affiliate),
            sub_affiliate: r.sub_affiliate || null,
            current_balance: balanceVal,
            total_deposits: depVal,
            total_withdrawals: witVal,
            total_bets: betVal,
            total_wins: winVal,
            total_losses: lossVal,
            player_commission: commVal,
            days: days
          };
        }));
      }
    } catch (err) {
      console.error("Failed to fetch referrals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [cycleFilter, sourceFilter]);

  const filteredReferrals = referrals.filter((item) => {
    let matchesStatus = true;
    if (statusFilter === 'ftd') {
      matchesStatus = item.is_ftd || item.status === 'ftd';
    } else if (statusFilter === 'active') {
      matchesStatus = item.is_ftd || item.status === 'ftd' || item.status === 'active';
    } else if (statusFilter === 'signup') {
      matchesStatus = !item.is_ftd && item.status === 'signup';
    } else if (statusFilter === 'dormant') {
      matchesStatus = !item.is_ftd && (item.status === 'dormant' || item.days > 14);
    }

    const query = searchTerm.toLowerCase().trim();
    const matchesSearch = !query || 
      item.username.toLowerCase().includes(query) || 
      item.link.toLowerCase().includes(query) || 
      String(item.user_id).toLowerCase().includes(query) ||
      String(item.uniq_id).toLowerCase().includes(query) ||
      (item.sub_affiliate && item.sub_affiliate.name.toLowerCase().includes(query)) ||
      (item.sub_affiliate && item.sub_affiliate.code.toLowerCase().includes(query));

    return matchesStatus && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = [
      'Player ID', 
      'Username', 
      'Affiliate Source', 
      'Current Balance', 
      'Deposits', 
      'Withdrawals', 
      'Turnover (Bets)', 
      'Winning', 
      'Loss', 
      'Commission Earned', 
      'Status', 
      'FTD Date'
    ];
    const rows = filteredReferrals.map(r => [
      r.uniq_id,
      r.username,
      r.is_sub_affiliate ? ('Sub: ' + r.sub_affiliate.name + ' (' + r.sub_affiliate.code + ')') : 'Direct',
      '₹' + r.current_balance.toFixed(2),
      '₹' + r.total_deposits.toFixed(2),
      '₹' + r.total_withdrawals.toFixed(2),
      '₹' + r.total_bets.toFixed(2),
      '₹' + r.total_wins.toFixed(2),
      '₹' + r.total_losses.toFixed(2),
      '₹' + r.player_commission.toFixed(2),
      r.status,
      r.ftdDate
    ]);
    exportToCSV('affiliate_referred_players_' + cycleFilter, headers, rows);
  };

  const stats = [
    { 
      label: 'Attributed Players', 
      value: String(totalCount), 
      sub: sourceFilter === 'all' ? 'Direct + Sub-Affiliate' : sourceFilter === 'sub' ? 'Sub-Affiliate downline' : 'Direct link referrals', 
      icon: Users, 
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' 
    },
    { 
      label: cycleFilter === 'current' ? 'Cycle Turnover (Bets)' : 'Total Bets (Turnover)', 
      value: '₹' + Number(summaryData.total_turnover || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 
      sub: cycleFilter === 'current' ? 'Since last settlement' : 'All-time volume', 
      icon: Gamepad2, 
      color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' 
    },
    { 
      label: cycleFilter === 'current' ? 'Cycle P&L (Win / Loss)' : 'All-Time Win / Loss', 
      value: '₹' + Number(summaryData.total_wins || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 
      sub: 'Loss: ₹' + Number(summaryData.total_losses || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 
      icon: TrendingUp, 
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' 
    },
    { 
      label: cycleFilter === 'current' ? 'Cycle Commission' : 'All-Time Earnings', 
      value: '₹' + Number(summaryData.total_commission || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 
      sub: cycleFilter === 'current' ? 'Fresh unsettled earnings' : 'Cumulative commissions', 
      icon: DollarSign, 
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' 
    }
  ];

  if (loading) {
    return <PageLoader message="Loading referred players..." />;
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300 relative">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight font-display">
              Attributed Referred Players
            </h1>
            <Badge variant="blue" className="text-[10px] font-mono">
              ₹ INR
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Real-time player tracking with live balance, turnover, deposits, withdrawals, winning, losses, and affiliate earnings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={fetchReferrals} size="sm" variant="outline" className="h-9 gap-1.5 cursor-pointer text-xs">
            <RotateCcw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Button onClick={handleExportCSV} size="sm" variant="primary" className="flex items-center gap-1.5 h-9 cursor-pointer bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-0 shadow-sm shadow-blue-500/20 text-xs">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Settlement Cycle Switcher & Watermark Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-zinc-900 to-slate-900 border border-cyan-500/30 rounded-2xl p-4 text-white shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                Settlement Watermark Engine
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {lastSettledAt ? (
                <>
                  Last Settlement Completed on: <strong className="text-cyan-400 font-mono">{new Date(lastSettledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</strong>.
                  Fresh calculations compute right from that cutoff point.
                </>
              ) : (
                <>Active calculations computing from account inception. When settlement is done, a fresh cycle will automatically start.</>
              )}
            </p>
          </div>

          {/* Cycle Switcher Toggle */}
          <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 shrink-0">
            <button
              onClick={() => setCycleFilter('current')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                cycleFilter === 'current'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-300" />
              <span>Current Cycle (Fresh)</span>
            </button>
            <button
              onClick={() => setCycleFilter('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                cycleFilter === 'all'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>All-Time History</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between gap-1">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider line-clamp-1">
                  {stat.label}
                </span>
                <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border ${stat.color} shrink-0`}>
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-base sm:text-xl font-black text-slate-900 dark:text-zinc-100 font-display tracking-tight font-mono">
                  {stat.value}
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5 truncate">
                  {stat.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Referrals Table Container */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        {/* Filters Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-x-auto max-w-full">
              {[
                { id: 'all', label: 'All Players' },
                { id: 'ftd', label: 'FTD Depositors' },
                { id: 'active', label: 'Active Betters' },
                { id: 'signup', label: 'Signups' },
                { id: 'dormant', label: 'Dormant' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Source Filter (Direct vs Sub-Affiliate) */}
            <div className="flex items-center bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl border border-slate-200 dark:border-zinc-800">
              <button
                onClick={() => setSourceFilter('all')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  sourceFilter === 'all'
                    ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900'
                }`}
              >
                All Sources
              </button>
              <button
                onClick={() => setSourceFilter('direct')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  sourceFilter === 'direct'
                    ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900'
                }`}
              >
                Direct Only
              </button>
              <button
                onClick={() => setSourceFilter('sub')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  sourceFilter === 'sub'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900'
                }`}
              >
                Sub-Affiliates
              </button>
            </div>
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search player, ID, or sub-affiliate..."
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Players Table */}
        <TableContainer>
          <TableHeader>
            <TableRow>
              <TableHead>Player Account</TableHead>
              <TableHead>Affiliate / Source</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-right">Deposits</TableHead>
              <TableHead className="text-right">Withdrawals</TableHead>
              <TableHead className="text-right">Total Bets</TableHead>
              <TableHead className="text-right">Winning</TableHead>
              <TableHead className="text-right">Loss</TableHead>
              <TableHead className="text-right">My Earning</TableHead>
              <TableHead className="text-center">Lifecycle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-xs font-bold text-slate-400 dark:text-zinc-500">
                  Loading referred players...
                </TableCell>
              </TableRow>
            ) : filteredReferrals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-xs font-bold text-slate-400 dark:text-zinc-500">
                  No players found matching current filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredReferrals.map((ref) => (
                <TableRow 
                  key={ref.id} 
                  className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors"
                  onClick={() => setSelectedPlayer(ref)}
                >
                  {/* Player Account */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {ref.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-zinc-100">{ref.username}</p>
                        <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">ID: {ref.uniq_id}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Affiliate / Source */}
                  <TableCell>
                    {ref.is_sub_affiliate && ref.sub_affiliate ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400">
                          <GitFork className="w-3 h-3" /> {ref.sub_affiliate.name}
                        </span>
                        <span className="text-[9.5px] text-slate-400 font-mono">({ref.sub_affiliate.code})</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Direct Link</span>
                        <span className="text-[9.5px] text-slate-400">{ref.link}</span>
                      </div>
                    )}
                  </TableCell>

                  {/* Current Balance */}
                  <TableCell className="text-right font-mono text-xs font-bold text-slate-900 dark:text-zinc-100">
                    ₹{ref.current_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>

                  {/* Deposits */}
                  <TableCell className="text-right font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹{ref.total_deposits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>

                  {/* Withdrawals */}
                  <TableCell className="text-right font-mono text-xs font-semibold text-rose-500 dark:text-rose-400">
                    ₹{ref.total_withdrawals.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>

                  {/* Total Bets (Turnover) */}
                  <TableCell className="text-right font-mono text-xs font-bold text-slate-800 dark:text-zinc-200">
                    ₹{ref.total_bets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>

                  {/* Winning */}
                  <TableCell className="text-right font-mono text-xs font-semibold text-emerald-500 dark:text-emerald-400">
                    ₹{ref.total_wins.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>

                  {/* Loss */}
                  <TableCell className="text-right font-mono text-xs font-semibold text-rose-500 dark:text-rose-400">
                    ₹{ref.total_losses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>

                  {/* My Earning */}
                  <TableCell className="text-right font-mono text-xs font-black text-cyan-600 dark:text-cyan-400">
                    ₹{ref.player_commission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>

                  {/* Lifecycle */}
                  <TableCell className="text-center">
                    <Badge variant={ref.status === 'ftd' || ref.status === 'active' ? 'blue' : ref.status === 'dormant' ? 'yellow' : 'gray'} className="text-[10px]">
                      {ref.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </TableContainer>
      </div>

      {/* Slide-over Drawer for Player Inspection */}
      {selectedPlayer && (
        <>
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 transition-opacity" 
            onClick={() => setSelectedPlayer(null)} 
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-zinc-800 shadow-2xl animate-in slide-in-from-right duration-200 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="h-14 flex items-center justify-between px-5 border-b border-slate-100 dark:border-zinc-800 sticky top-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md z-10">
                <h2 className="text-sm font-black text-slate-900 dark:text-zinc-100 tracking-tight font-display flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-cyan-500" />
                  <span>Player Performance Profile</span>
                </h2>
                <button 
                  onClick={() => setSelectedPlayer(null)} 
                  className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-zinc-100 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Header User Card */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-base shadow-md shadow-blue-500/20">
                    {selectedPlayer.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100 truncate">{selectedPlayer.username}</h3>
                    <p className="text-xs text-cyan-600 dark:text-cyan-400 font-mono">UID: {selectedPlayer.uniq_id}</p>
                    <div className="flex gap-1.5 mt-1.5">
                      <Badge variant={selectedPlayer.status === 'active' || selectedPlayer.status === 'ftd' ? 'blue' : 'gray'}>
                        {selectedPlayer.status.toUpperCase()}
                      </Badge>
                      {selectedPlayer.is_sub_affiliate && (
                        <Badge variant="purple" className="text-[10px]">
                          SUB-AFFILIATE
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Key Financial Metrics */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Live Balance</span>
                    <span className="text-base font-black text-slate-900 dark:text-zinc-100 font-mono mt-0.5 block">
                      ₹{selectedPlayer.current_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">My Earning</span>
                    <span className="text-base font-black text-cyan-600 dark:text-cyan-400 font-mono mt-0.5 block">
                      ₹{selectedPlayer.player_commission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Total Deposits</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
                      ₹{selectedPlayer.total_deposits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Total Withdrawals</span>
                    <span className="text-base font-black text-rose-500 dark:text-rose-400 font-mono mt-0.5 block">
                      ₹{selectedPlayer.total_withdrawals.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Detail Information */}
                <div className="space-y-2 text-xs bg-slate-50/50 dark:bg-zinc-900/50 p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                  <div className="flex justify-between py-1.5 border-b border-slate-200/50 dark:border-zinc-800/50">
                    <span className="text-slate-500 dark:text-zinc-400">Sponsor / Source</span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100">
                      {selectedPlayer.is_sub_affiliate && selectedPlayer.sub_affiliate ? (
                        <span className="text-purple-600 dark:text-purple-400 font-semibold">
                          Sub: {selectedPlayer.sub_affiliate.name} ({selectedPlayer.sub_affiliate.code})
                        </span>
                      ) : (
                        selectedPlayer.link
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200/50 dark:border-zinc-800/50">
                    <span className="text-slate-500 dark:text-zinc-400">Total Turnover (Bets)</span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100 font-mono">
                      ₹{selectedPlayer.total_bets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200/50 dark:border-zinc-800/50">
                    <span className="text-slate-500 dark:text-zinc-400">Player Returns (Wins)</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      ₹{selectedPlayer.total_wins.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200/50 dark:border-zinc-800/50">
                    <span className="text-slate-500 dark:text-zinc-400">Player Net Losses</span>
                    <span className="font-bold text-rose-500 dark:text-rose-400 font-mono">
                      ₹{selectedPlayer.total_losses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200/50 dark:border-zinc-800/50">
                    <span className="text-slate-500 dark:text-zinc-400">FTD Initial Deposit</span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100 font-mono">{selectedPlayer.ftdAmount}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500 dark:text-zinc-400">Attributed Since</span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100">{selectedPlayer.date}</span>
                  </div>
                </div>

                {/* View Bets CTA Button */}
                <div className="pt-2">
                  <Link
                    to={`/player-activity?userId=${encodeURIComponent(selectedPlayer.uniq_id || selectedPlayer.user_id)}&player=${encodeURIComponent(selectedPlayer.username)}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span>View All Match Bets & Activity</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-zinc-900 text-center">
              <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Protected under Privacy & Player Data Protection Act.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
