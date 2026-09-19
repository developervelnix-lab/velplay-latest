import { PageLoader } from '../../components/ui/PageLoader';
import { exportToCSV } from '../../utils/csvExport';
import { apiUrl } from '../../utils/api';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { 
  DollarSign, 
  Download, 
  Filter, 
  Search, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  FileSpreadsheet,
  ArrowUpRight
} from 'lucide-react';

export const EarningsLedger = () => {
  const handleExportCSV = () => {
    const headers = ['Txn ID', 'Posting Date', 'Commission Model', 'Attributed Entity', 'Calculated Base', 'Rate', 'Credit Amount', 'Status'];
    const rows = filteredLedger.map(r => [
      `#${r.id}`,
      r.date,
      r.type,
      r.player,
      r.base,
      r.rate,
      r.amount,
      r.status
    ]);
    exportToCSV('affiliate_earnings_statement', headers, rows);
  };

  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchLedger = async () => {
      try {
        const token = localStorage.getItem('affiliate_token') || '';
        const res = await fetch(apiUrl('/api/v1/affiliate/earnings'), {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (data.status === 'success' && Array.isArray(data.data)) {
          setLedger(data.data.map(l => ({
            id: l.id,
            date: l.created_at ? l.created_at.split(' ')[0] : 'N/A',
            type: l.entry_type === 'revshare' ? 'Rev-Share Commission' : l.entry_type === 'cpa' ? 'CPA Bounty' : 'Commission Ledger',
            player: 'Referral System',
            base: 'NGR Settlement',
            rate: 'Standard',
            amount: `+\u20B9${(l.gross_amount || 0).toLocaleString('en-IN')}`,
            status: l.status || 'approved'
          })));
        }
      } catch (err) {
        console.error("Failed to fetch earnings ledger:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLedger();
  }, []);

  const totalAmount = ledger.reduce((acc, curr) => acc + (parseFloat(curr.amount.replace(/[^0-9.]/g, '')) || 0), 0);

  const summaryStats = [
    { label: 'Total Lifetime Commissions', value: `\u20B9${totalAmount.toLocaleString('en-IN')}`, change: 'Live Ledger', icon: TrendingUp, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    { label: 'Available Balance', value: 'Live System', change: 'Ready for payout', icon: DollarSign, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Pending Approval', value: 'Live System', change: 'Next settlement', icon: Clock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { label: 'Total Recorded Entries', value: `${ledger.length} Entries`, change: 'Verified records', icon: CheckCircle2, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' }
  ];

  const filteredLedger = ledger.filter((item) => {
    const matchesFilter = filterType === 'all' || item.type.toLowerCase().includes(filterType.toLowerCase());
    const matchesSearch = item.player.toLowerCase().includes(searchTerm.toLowerCase()) || item.id.toString().includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return <PageLoader message="Loading commission ledger..." />;
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight font-display">
            Earnings & Commission Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Transparent transaction logs of all player net gaming revenue, CPA bounties, and override commissions.
          </p>
        </div>

        <Button onClick={handleExportCSV} size="sm" variant="primary" className="flex items-center gap-1.5 self-start sm:self-auto h-9 cursor-pointer bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-0 shadow-sm shadow-blue-500/20">
          <Download className="w-3.5 h-3.5" /> Export Statement (CSV)
        </Button>
      </div>

      {/* Summary KPI Cards - 2x2 on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {summaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between gap-1">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider line-clamp-1">
                  {stat.label}
                </span>
                <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border ${stat.color} shrink-0`}>
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="mt-1.5 sm:mt-2.5">
                <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-zinc-100 font-display tracking-tight font-mono">
                  {stat.value}
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5 truncate">
                  {stat.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ledger Table Container */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        {/* Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Filter Type Pills */}
          <div className="flex items-center bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl border border-slate-200 dark:border-zinc-800 self-start sm:self-auto">
            {[
              { id: 'all', label: 'All Transactions' },
              { id: 'rev-share', label: 'Rev-Share' },
              { id: 'cpa', label: 'CPA Bounties' },
              { id: 'override', label: 'Overrides' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filterType === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by player or ID..."
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <TableContainer>
          <TableHeader>
            <TableRow>
              <TableHead>Txn ID</TableHead>
              <TableHead>Posting Date</TableHead>
              <TableHead>Commission Model</TableHead>
              <TableHead>Attributed Entity</TableHead>
              <TableHead>Calculated Base (NGR / FTD)</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead className="text-right">Credit Amount</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLedger.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs font-bold text-slate-400 dark:text-zinc-500">
                  #{row.id}
                </TableCell>
                <TableCell className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  {row.date}
                </TableCell>
                <TableCell className="font-bold text-xs text-slate-900 dark:text-zinc-100">
                  {row.type}
                </TableCell>
                <TableCell className="font-mono text-xs text-blue-600 dark:text-cyan-400 font-medium">
                  {row.player}
                </TableCell>
                <TableCell className="text-xs text-slate-600 dark:text-zinc-300 font-mono font-medium">
                  {row.base}
                </TableCell>
                <TableCell className="text-xs text-slate-500 dark:text-zinc-400 font-bold">
                  {row.rate}
                </TableCell>
                <TableCell className="text-xs text-emerald-600 dark:text-emerald-400 font-black text-right font-mono">
                  {row.amount}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={row.status === 'paid' ? 'green' : 'yellow'}>
                    {row.status.toUpperCase()}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableContainer>
      </div>
    </div>
  );
};


