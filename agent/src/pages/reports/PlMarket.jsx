import { RowDetailsModal } from '../../components/ui/RowDetailsModal';
import { PageLoader } from '../../components/ui/PageLoader';
import { DataTablePagination } from '../../components/ui/DataTablePagination';
import { apiUrl } from '../../utils/constants';
import React, { useState, useEffect } from 'react';
import { ReportShell } from './ReportShell';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';

export const PlMarket = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const token = localStorage.getItem('agent_token') || localStorage.getItem('token') || '';
    fetch(apiUrl('/api/v1/agent/reports/pl-market'), {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success' && Array.isArray(res.data)) {
          setRows(res.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totals = {
    'Total Market Stake': rows.reduce((a, r) => a + (r.total_stake || 0), 0),
    'Total Market P&L': rows.reduce((a, r) => a + (r.total_pnl || 0), 0)
  };

  if (loading) return <PageLoader message="Generating Market P&L report..." />;

  return (
    <ReportShell
      title="Market P&L Report"
      subtitle="Performance breakdown by market category (Match Winner, Fancy, Over/Under)"
      totals={totals}
    >
      <TableContainer>
        <TableHeader>
          <TableRow>
            <TableHead>Market Type</TableHead>
            <TableHead>Total Slips</TableHead>
            <TableHead>Total Stake</TableHead>
            <TableHead>Net Market P&L</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-slate-400 py-6">No market records found.</TableCell>
            </TableRow>
          ) : (
            rows.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((r, idx) => {
              const realIdx = (currentPage - 1) * pageSize + idx;
              return (
                <TableRow key={idx} onClick={() => setSelectedRowIndex(realIdx)} className="cursor-pointer hover:bg-slate-800/60 transition-colors">
                  <TableCell className="font-bold text-slate-200">{r.market}</TableCell>
                  <TableCell className="font-mono text-slate-400">{r.total_bets}</TableCell>
                  <TableCell className="font-mono text-slate-300">₹{(r.total_stake || 0).toLocaleString('en-IN')}</TableCell>
                  <TableCell className={"font-mono font-bold " + (r.total_pnl < 0 ? 'text-red-400' : 'text-emerald-400')}>
                    {r.total_pnl < 0 ? '-' : '+'}₹{Math.abs(r.total_pnl || 0).toLocaleString('en-IN')}
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
        title="Market P&L Record"
      />
    </ReportShell>
  );
};
