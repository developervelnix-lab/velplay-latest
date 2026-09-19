import { RowDetailsModal } from '../../components/ui/RowDetailsModal';
import { PageLoader } from '../../components/ui/PageLoader';
import { DataTablePagination } from '../../components/ui/DataTablePagination';
import { apiUrl } from '../../utils/constants';
import React, { useState, useEffect } from 'react';
import { ReportShell } from './ReportShell';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';

export const PlAgent = () => {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const token = localStorage.getItem('agent_token') || localStorage.getItem('token') || '';
    fetch(apiUrl('/api/v1/agent/reports/pl-agent'), {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success' && Array.isArray(res.data)) {
          setRows(res.data);
          if (res.meta) setMeta(res.meta);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalDownlinePnl = rows.reduce((a, r) => a + (r.downline_pnl !== undefined ? r.downline_pnl : (r.total_pnl || 0)), 0);
  const totalYourEarnings = rows.reduce((a, r) => a + (r.your_earnings || 0), 0);

  const totals = {
    'Downlines Total P&L': totalDownlinePnl,
    'Your Overriding Earnings': totalYourEarnings
  };

  if (loading) return <PageLoader message="Generating Downline Agent P&L report..." />;

  return (
    <ReportShell
      title="Downline Agent P&L Report"
      subtitle="Downline agent breakdown of P&L allocations, spread differentials, and your overriding earnings"
      totals={totals}
    >
      <TableContainer>
        <TableHeader>
          <TableRow>
            <TableHead>Downline Agent</TableHead>
            <TableHead>Rank Level</TableHead>
            <TableHead>Downline Share %</TableHead>
            <TableHead>Downline P&L</TableHead>
            <TableHead>Your Spread %</TableHead>
            <TableHead className="text-right">Your Overriding Earnings</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-slate-400 py-6">No downline agent data found.</TableCell>
            </TableRow>
          ) : (
            rows.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((r, idx) => {
              const realIdx = (currentPage - 1) * pageSize + idx;
              const dPnl = r.downline_pnl !== undefined ? r.downline_pnl : (r.total_pnl || 0);
              const yEarn = r.your_earnings !== undefined ? r.your_earnings : 0;
              const spread = r.spread_pct !== undefined ? r.spread_pct : 0;

              return (
                <TableRow key={idx} onClick={() => setSelectedRowIndex(realIdx)} className="cursor-pointer hover:bg-slate-800/60 transition-colors">
                  <TableCell className="font-bold text-slate-200">
                    <div>{r.agent}</div>
                    <div className="text-[10px] font-mono text-slate-500 font-normal">{r.username}</div>
                  </TableCell>
                  <TableCell><Badge variant="blue">{r.rank}</Badge></TableCell>
                  <TableCell className="font-mono text-slate-300 font-semibold">{r.partnership}%</TableCell>
                  <TableCell className={"font-mono font-semibold " + (dPnl < 0 ? 'text-red-400' : 'text-slate-300')}>
                    {dPnl < 0 ? '-' : '+'}₹{Math.abs(dPnl).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="font-mono text-cyan-400 font-bold">
                    +{spread}%
                  </TableCell>
                  <TableCell className={"font-mono font-black text-right text-sm " + (yEarn < 0 ? 'text-red-400' : 'text-emerald-400')}>
                    {yEarn < 0 ? '-' : '+'}₹{Math.abs(yEarn).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </TableContainer>
      <DataTablePagination
        currentPage={currentPage}
        totalPages={Math.ceil(rows.length / pageSize) || 1}
        pageSize={pageSize}
        totalItems={rows.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
      <RowDetailsModal
        isOpen={selectedRowIndex !== null}
        onClose={() => setSelectedRowIndex(null)}
        data={rows}
        currentIndex={selectedRowIndex ?? 0}
        onIndexChange={setSelectedRowIndex}
        title="Downline Agent P&L Record"
      />
    </ReportShell>
  );
};
