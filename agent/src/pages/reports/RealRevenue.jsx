import { RowDetailsModal } from '../../components/ui/RowDetailsModal';
import { PageLoader } from '../../components/ui/PageLoader';
import { DataTablePagination } from '../../components/ui/DataTablePagination';
import { apiUrl } from '../../utils/constants';
import React, { useState, useEffect } from 'react';
import { ReportShell } from './ReportShell';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';

export const RealRevenue = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const token = localStorage.getItem('agent_token') || localStorage.getItem('token') || '';
    fetch(apiUrl('/api/v1/agent/reports/real-revenue'), {
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
    'Direct Commission': rows.reduce((a, r) => a + (r.direct_commission || 0), 0),
    'Downline Override': rows.reduce((a, r) => a + (r.downline_commission || 0), 0),
    'Net Real Revenue': rows.reduce((a, r) => a + (r.total_revenue || 0), 0)
  };

  if (loading) return <PageLoader message="Calculating real revenue & net yield..." />;

  return (
    <ReportShell
      title="Real Revenue & Net Yield"
      subtitle="Comprehensive breakdown of direct commissions, downline overriding commission spreads, and net yield"
      totals={totals}
    >
      <TableContainer>
        <TableHeader>
          <TableRow>
            <TableHead>Date / Cycle</TableHead>
            <TableHead>Direct Commission</TableHead>
            <TableHead>Downline Override</TableHead>
            <TableHead>Direct P&L</TableHead>
            <TableHead>Downline P&L Spread</TableHead>
            <TableHead className="text-right">Net Real Revenue</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-slate-400 py-6">No revenue records found.</TableCell>
            </TableRow>
          ) : (
            rows.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((r, idx) => {
              const realIdx = (currentPage - 1) * pageSize + idx;
              return (
                <TableRow key={idx} onClick={() => setSelectedRowIndex(realIdx)} className="cursor-pointer hover:bg-slate-800/60 transition-colors">
                  <TableCell className="font-mono text-slate-400 font-bold">{r.date}</TableCell>
                  <TableCell className="font-mono text-emerald-400 font-medium">
                    ₹{(r.direct_commission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="font-mono text-cyan-400 font-bold">
                    +₹{(r.downline_commission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className={"font-mono font-medium " + (r.direct_pnl < 0 ? 'text-red-400' : 'text-slate-300')}>
                    {r.direct_pnl < 0 ? '-' : '+'}₹{Math.abs(r.direct_pnl || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className={"font-mono font-bold " + (r.downline_pnl < 0 ? 'text-red-400' : 'text-cyan-400')}>
                    {r.downline_pnl < 0 ? '-' : '+'}₹{Math.abs(r.downline_pnl || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className={"font-mono font-black text-right text-sm " + (r.total_revenue < 0 ? 'text-red-400' : 'text-emerald-400')}>
                    {r.total_revenue < 0 ? '-' : '+'}₹{Math.abs(r.total_revenue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
        title="Real Revenue Record"
      />
    </ReportShell>
  );
};
