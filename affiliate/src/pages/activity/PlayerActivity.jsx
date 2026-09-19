import { PageLoader } from '../../components/ui/PageLoader';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiUrl } from '../../utils/api';
import { exportToCSV } from '../../utils/csvExport';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { 
  Gamepad2, 
  Search, 
  Filter, 
  RotateCcw, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Clock, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ArrowUpDown,
  UserCheck
} from 'lucide-react';

export const PlayerActivity = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initial params from URL
  const initialUserId = searchParams.get('userId') || searchParams.get('user_id') || '';
  const initialPlayer = searchParams.get('player') || '';
  const initialDate = searchParams.get('date') || searchParams.get('date_range') || 'all';

  // State
  const [selectedPlayerId, setSelectedPlayerId] = useState(initialUserId);
  const [selectedPlayerName, setSelectedPlayerName] = useState(initialPlayer);
  const [dateRange, setDateRange] = useState(initialDate);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(25);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({
    total_turnover: 0,
    total_wins: 0,
    total_losses: 0,
    net_ggr: 0,
    net_ngr: 0,
    estimated_revshare: 0,
    total_rounds: 0,
    revshare_rate: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total_records: 0,
    total_pages: 1
  });
  const [referredPlayers, setReferredPlayers] = useState([]);

  // Fetch match bets from backend
  const fetchBets = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const token = localStorage.getItem('affiliate_token') || '';
      const params = new URLSearchParams();
      if (selectedPlayerId) params.set('user_id', selectedPlayerId);
      if (selectedPlayerName && !selectedPlayerId) params.set('player', selectedPlayerName);
      if (dateRange) params.set('date_range', dateRange);
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      if (searchTerm) params.set('search', searchTerm);
      params.set('page', page);
      params.set('limit', limit);

      const res = await fetch(apiUrl(`/api/v1/affiliate/player-bets?${params.toString()}`), {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const resData = await res.json();
      if (resData.status === 'success') {
        setData(resData.data || []);
        if (resData.summary) setSummary(resData.summary);
        if (resData.pagination) setPagination(resData.pagination);
        if (Array.isArray(resData.referred_players)) {
          setReferredPlayers(resData.referred_players);
        }
      } else {
        console.warn('Player bets returned non-success:', resData);
      }
    } catch (err) {
      console.error('Failed to fetch player bets:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPlayerId, selectedPlayerName, dateRange, statusFilter, searchTerm, page, limit]);

  // Trigger fetch when filters or page change
  useEffect(() => {
    fetchBets();
  }, [fetchBets]);

  // Synchronize when URL search parameters change externally
  useEffect(() => {
    const urlUser = searchParams.get('userId') || searchParams.get('user_id') || '';
    const urlPlayer = searchParams.get('player') || '';
    const urlDate = searchParams.get('date') || searchParams.get('date_range');
    
    if (urlUser !== selectedPlayerId) setSelectedPlayerId(urlUser);
    if (urlPlayer !== selectedPlayerName) setSelectedPlayerName(urlPlayer);
    if (urlDate && urlDate !== dateRange) setDateRange(urlDate);
  }, [searchParams]);

  // Handle Player filter change
  const handlePlayerChange = (e) => {
    const val = e.target.value;
    setSelectedPlayerId(val);
    setPage(1);
    
    const matched = referredPlayers.find(p => String(p.user_id) === String(val) || String(p.internal_id) === String(val));
    const name = matched ? (matched.username || matched.display_name) : '';
    setSelectedPlayerName(name);

    // Update URL query params
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set('userId', val);
      if (name) newParams.set('player', name);
    } else {
      newParams.delete('userId');
      newParams.delete('user_id');
      newParams.delete('player');
    }
    setSearchParams(newParams);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedPlayerId('');
    setSelectedPlayerName('');
    setDateRange('all');
    setStatusFilter('all');
    setSearchTerm('');
    setPage(1);
    setSearchParams({});
  };

  // CSV Export
  const handleExportCSV = () => {
    if (!data.length) return;
    const exportRows = data.map(r => ({
      'Round ID': r.id,
      'Period ID': r.period_id,
      'Player': r.player_name,
      'Player ID': r.player_id,
      'Game': r.game_name,
      'Provider': r.provider,
      'Bet Cost': r.bet_amount,
      'Win Amount': r.win_amount,
      'Net Player Profit': r.player_net,
      'House Margin': r.house_margin,
      'Result': r.status,
      'Timestamp': r.timestamp
    }));
    exportToCSV(exportRows, `player_match_activity_${new Date().toISOString().split('T')[0]}`);
  };

  // Active filter label
  const activePlayerLabel = useMemo(() => {
    if (!selectedPlayerId) return null;
    const matched = referredPlayers.find(p => String(p.user_id) === String(selectedPlayerId) || String(p.internal_id) === String(selectedPlayerId));
    return matched ? (matched.username || matched.display_name) : (selectedPlayerName || `Player #${selectedPlayerId}`);
  }, [selectedPlayerId, selectedPlayerName, referredPlayers]);

  const dateRangeOptions = [
    { label: '⚡ Since Settlement (Fresh)', value: 'current_cycle' },
    { label: 'All Time', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 Days', value: '7days' },
    { label: 'This Month', value: 'this_month' }
  ];

  if (loading) {
    return <PageLoader message="Loading live player bets & activity..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-zinc-500 mb-1">
            <Link to="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link>
            <span>/</span>
            <Link to="/referrals" className="hover:text-cyan-400 transition-colors">Referred Players</Link>
            <span>/</span>
            <span className="text-slate-700 dark:text-zinc-300 font-semibold">Match Bets & Activity</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight flex items-center gap-2.5 font-display">
            <Gamepad2 className="w-7 h-7 text-cyan-400" />
            Player Match Bets & Activity
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Real-time round-by-round wager history, game outcomes, and net revenue margins from your referred network.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchBets(true)}
            disabled={refreshing}
            className="text-xs font-bold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Live'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={data.length === 0}
            className="text-xs font-bold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Live Aggregated Hero Metric Banner */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Turnover */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Turnover</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-2">
            ₹{Number(summary.total_turnover || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
            {summary.total_rounds || 0} total rounds placed
          </span>
        </div>

        {/* Player Winnings */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Player Wins</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-2">
            ₹{Number(summary.total_wins || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
            Paid out to players
          </span>
        </div>

        {/* Player Losses */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Player Losses</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-2">
            ₹{Number(summary.total_losses || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
            House retention rounds
          </span>
        </div>

        {/* Net GGR (House Margin) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Platform GGR</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-xl font-black font-mono mt-2 ${Number(summary.net_ggr || 0) >= 0 ? 'text-cyan-600 dark:text-cyan-400' : 'text-red-500'}`}>
            ₹{Number(summary.net_ggr || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
            Turnover minus Wins
          </span>
        </div>

        {/* Estimated RevShare */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 dark:from-cyan-900/40 dark:via-cyan-900/20 dark:to-slate-900 border border-cyan-200 dark:border-cyan-500/30 shadow-sm relative overflow-hidden group col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-cyan-900 dark:text-cyan-300">
            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              Est. RevShare
            </span>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30">
              {summary.revshare_rate}% Rate
            </span>
          </div>
          <div className="text-xl font-black text-cyan-700 dark:text-cyan-400 font-mono mt-2 flex items-baseline gap-1">
            ₹{Number(summary.estimated_revshare || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-cyan-800/70 dark:text-cyan-300/70 mt-1 block font-medium">
            Pending daily settlement
          </span>
        </div>
      </div>

      {/* Active Filter Pill if Filtered by Player */}
      {activePlayerLabel && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span>Showing match bets specifically for <strong>{activePlayerLabel}</strong></span>
          </div>
          <button 
            onClick={handleResetFilters}
            className="text-xs font-bold text-cyan-400 hover:text-white underline cursor-pointer ml-3 flex items-center gap-1"
          >
            Clear Player Filter
          </button>
        </div>
      )}

      {dateRange === 'current_cycle' && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 animate-pulse" />
            <span>
              <strong>Fresh Settlement Cycle Active:</strong> Only viewing match bets recorded {summary.last_settled_at ? `since last settlement on ${summary.last_settled_at}` : 'in the current unsettled cycle'}. Previous cycles have been settled.
            </span>
          </div>
          <button 
            onClick={() => { setDateRange('all'); setPage(1); }}
            className="text-xs font-bold text-cyan-400 hover:text-white underline cursor-pointer ml-3 whitespace-nowrap"
          >
            View All Time
          </button>
        </div>
      )}

      {/* Main Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Player Dropdown & Date Range */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Player Selector */}
            <div className="relative min-w-[200px]">
              <select
                value={selectedPlayerId}
                onChange={handlePlayerChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              >
                <option value="">All Referred Players</option>
                {referredPlayers.map((p) => (
                  <option key={p.user_id || p.internal_id} value={p.user_id || p.internal_id}>
                    {p.username || p.display_name} (ID: {p.user_id || p.internal_id})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Selector Pills */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              {dateRangeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setDateRange(opt.value); setPage(1); }}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    dateRange === opt.value
                      ? 'bg-cyan-500 text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Status Selector Pills */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              {[
                { label: 'All', value: 'all' },
                { label: 'Wins Only', value: 'win' },
                { label: 'Losses Only', value: 'loss' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setStatusFilter(opt.value); setPage(1); }}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    statusFilter === opt.value
                      ? 'bg-slate-800 text-cyan-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Search Input & Reset Button */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                placeholder="Search game, round, player..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {(selectedPlayerId || dateRange !== 'all' || statusFilter !== 'all' || searchTerm) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs font-bold text-slate-400 hover:text-rose-400 border-slate-300 dark:border-slate-700"
                title="Reset All Filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Match Records Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <TableContainer>
          <TableHeader>
            <TableRow>
              <TableHead>Round / Period</TableHead>
              <TableHead>Referred Player</TableHead>
              <TableHead>Game & Provider</TableHead>
              <TableHead className="text-right">Bet Amount</TableHead>
              <TableHead className="text-right">Payout (Win)</TableHead>
              <TableHead className="text-right">House Margin</TableHead>
              <TableHead className="text-center">Outcome</TableHead>
              <TableHead className="text-right">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-xs font-bold text-slate-400 dark:text-zinc-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
                    <span>Loading match bets from live database...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-xs font-bold text-slate-400 dark:text-zinc-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Gamepad2 className="w-8 h-8 text-slate-400 dark:text-slate-600 mb-1" />
                    <span className="text-sm text-slate-700 dark:text-zinc-300 font-bold">No match records found</span>
                    <span className="text-xs text-slate-400 font-normal">
                      {selectedPlayerId 
                        ? 'This referred player has not placed any bets within the selected date range.'
                        : 'No matches found matching your current filter criteria.'}
                    </span>
                    {(selectedPlayerId || dateRange !== 'all' || statusFilter !== 'all' || searchTerm) && (
                      <button
                        onClick={handleResetFilters}
                        className="mt-2 text-xs text-cyan-400 hover:underline font-bold"
                      >
                        Reset filters to view all player bets
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const isWin = row.status === 'WIN';
                const isHouseProfit = Number(row.house_margin || 0) >= 0;

                return (
                  <TableRow key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Round / Period */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-zinc-100">
                          #{row.id}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                          {row.period_id}
                        </span>
                      </div>
                    </TableCell>

                    {/* Referred Player */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {row.player_name ? row.player_name.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div className="flex flex-col">
                          <button
                            onClick={() => {
                              setSelectedPlayerId(String(row.player_id));
                              setSelectedPlayerName(row.player_name);
                              setPage(1);
                              setSearchParams({ userId: String(row.player_id), player: row.player_name });
                            }}
                            className="text-xs font-bold text-slate-900 dark:text-zinc-100 hover:text-cyan-400 text-left transition-colors cursor-pointer"
                            title="Filter this player"
                          >
                            {row.player_name}
                          </button>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {row.player_id}
                            </span>
                            {row.is_sub_affiliate ? (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20" title={`Sub-Affiliate: ${row.sub_affiliate_name || ''}`}>
                                Sub: {row.sub_affiliate_name || 'Downline'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                Direct
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Game & Provider */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                          {row.game_name}
                        </span>
                        {row.provider && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            {row.provider}
                          </span>
                        )}
                        {row.match_details && row.match_details !== row.game_name && (
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                            {row.match_details}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Bet Cost */}
                    <TableCell className="text-right">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-zinc-100">
                        ₹{Number(row.bet_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </TableCell>

                    {/* Win Amount */}
                    <TableCell className="text-right">
                      <span className={`font-mono text-xs font-bold ${Number(row.win_amount || 0) > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                        ₹{Number(row.win_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </TableCell>

                    {/* House Margin */}
                    <TableCell className="text-right">
                      <span className={`font-mono text-xs font-bold ${isHouseProfit ? 'text-cyan-600 dark:text-cyan-400' : 'text-rose-500'}`}>
                        {isHouseProfit ? '+' : ''}₹{Number(row.house_margin || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </TableCell>

                    {/* Outcome Badge */}
                    <TableCell className="text-center">
                      <Badge variant={isWin ? 'green' : 'red'}>
                        {isWin ? 'PLAYER WON' : 'HOUSE WON'}
                      </Badge>
                    </TableCell>

                    {/* Timestamp */}
                    <TableCell className="text-right">
                      <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                        {row.timestamp || 'N/A'}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </TableContainer>

        {/* Pagination Footer */}
        {pagination.total_pages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Showing page <strong>{pagination.page}</strong> of <strong>{pagination.total_pages}</strong> ({pagination.total_records} total bets)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="text-xs font-bold"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                disabled={page >= pagination.total_pages}
                className="text-xs font-bold"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
