import { PageLoader } from '../../components/ui/PageLoader';
import { exportToCSV } from '../../utils/csvExport';
import { apiUrl } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { 
  Download, 
  Calendar, 
  Filter, 
  PieChart, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export const Reports = () => {
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [groupBy, setGroupBy] = useState('campaign');
  const [reportData, setReportData] = useState([]);
  const [stats, setStats] = useState({ clicks: 0, ftds: 0, ngr: 0, commission: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('affiliate_token') || '';
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const url = apiUrl(`/api/v1/affiliate/reports?date_range=${encodeURIComponent(dateRange)}&group_by=${encodeURIComponent(groupBy)}`);

        const res = await fetch(url, { headers });
        const json = await res.json();
        
        if (json.status === 'success') {
          if (json.stats) {
            setStats({
              clicks: Number(json.stats.clicks || 0),
              ftds: Number(json.stats.ftds || 0),
              ngr: Number(json.stats.ngr || 0),
              commission: Number(json.stats.commission || 0)
            });
          }

          if (Array.isArray(json.data)) {
            setReportData(json.data.map((r) => {
              const clicks = Number(r.clicks || 0);
              const signups = Number(r.signups || 0);
              const ftds = Number(r.ftds || 0);
              const ngrVal = Number(r.ngr_volume || 0);
              const cpaVal = Number(r.cpa_bounties || 0);
              const commVal = Number(r.total_commission || 0);
              const convRatio = clicks > 0 ? ((ftds / clicks) * 100).toFixed(1) + '%' : '0.0%';

              return {
                id: r.id,
                group: r.group,
                clicks,
                signups,
                ftds,
                conversion: convRatio,
                ngr: `₹${ngrVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                cpa: `₹${cpaVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                commission: `₹${commVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              };
            }));
          }
        }
      } catch (err) {
        console.error('Report fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [dateRange, groupBy]);

  const handleExportCSV = () => {
    const headers = [
      groupBy === 'campaign' ? 'Campaign Name' : groupBy === 'subid' ? 'Sub-ID' : groupBy === 'date' ? 'Date' : 'Country',
      'Clicks',
      'Signups',
      'FTDs',
      'Click-to-FTD',
      'Total NGR Volume',
      'CPA Bounties',
      'Net Commission'
    ];
    const rows = reportData.map(r => [
      r.group,
      r.clicks,
      r.signups,
      r.ftds,
      r.conversion,
      r.ngr,
      r.cpa,
      r.commission
    ]);
    exportToCSV('affiliate_analytics_reports', headers, rows);
  };

  const summaryStats = [
    { title: 'Total Tracked Clicks', val: stats.clicks.toLocaleString(), sub: `Period: ${dateRange}`, icon: PieChart, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    { title: 'Total FTD Depositors', val: stats.ftds.toLocaleString(), sub: `Period: ${dateRange}`, icon: TrendingUp, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { title: 'Total Net Gaming Rev (NGR)', val: `₹${stats.ngr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: `Period: ${dateRange}`, icon: BarChart3, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    { title: 'Total Earned Commission', val: `₹${stats.commission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: `Period: ${dateRange}`, icon: DollarSign, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' }
  ];

  if (loading) {
    return <PageLoader message="Generating performance reports..." />;
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight font-display">
            Multi-Dimensional Analytics & Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Deep-dive into click funnels, player acquisition costs, NGR breakdown, and commission yields.
          </p>
        </div>
        
        <div className="flex gap-2 self-start sm:self-auto">
          <Button onClick={handleExportCSV} size="sm" variant="primary" className="h-9 flex items-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-0 shadow-sm shadow-blue-500/20 cursor-pointer">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards - 2x2 on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {summaryStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between gap-1">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider line-clamp-1">{stat.title}</span>
                <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border ${stat.color} shrink-0`}>
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </div>
              <div className="mt-1.5 sm:mt-2.5">
                <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-zinc-100 font-display tracking-tight font-mono">
                  {stat.val}
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5 truncate">
                  {stat.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Control Panel Toolbar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl border border-slate-200 dark:border-zinc-800 w-full md:w-auto overflow-x-auto">
            {['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'All Time'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  dateRange === range 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm shadow-blue-500/20' 
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          
          <div className="w-full md:w-auto flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Group By:</span>
            <select 
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
            >
              <option value="campaign">Campaign Name</option>
              <option value="subid">Sub-Affiliate / Sub-ID</option>
              <option value="date">Date (Daily Timeline)</option>
              <option value="country">Country / Geo</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <TableContainer>
          <TableHeader>
            <TableRow>
              <TableHead>{groupBy === 'campaign' ? 'Campaign Name' : groupBy === 'subid' ? 'Sub-ID' : groupBy === 'date' ? 'Date' : 'Country'}</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">Signups</TableHead>
              <TableHead className="text-right">FTDs</TableHead>
              <TableHead className="text-right">Click-to-FTD</TableHead>
              <TableHead className="text-right">Total NGR Volume</TableHead>
              <TableHead className="text-right">CPA Bounties</TableHead>
              <TableHead className="text-right">Net Commission</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-xs font-bold text-slate-400 dark:text-zinc-500">
                  Loading report data...
                </TableCell>
              </TableRow>
            ) : reportData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-xs font-bold text-slate-400 dark:text-zinc-500">
                  No records found for {dateRange} grouped by {groupBy}.
                </TableCell>
              </TableRow>
            ) : (
              reportData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-bold text-xs text-slate-900 dark:text-zinc-100">{row.group}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-600 dark:text-zinc-300 text-right">{row.clicks.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-600 dark:text-zinc-300 text-right">{row.signups.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 text-right">{row.ftds.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-600 dark:text-zinc-300 text-right">{row.conversion}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-700 dark:text-zinc-300 text-right font-medium">{row.ngr}</TableCell>
                  <TableCell className="font-mono text-xs text-blue-600 dark:text-cyan-400 text-right font-medium">{row.cpa}</TableCell>
                  <TableCell className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400 text-right">{row.commission}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </TableContainer>
      </div>
    </div>
  );
};
