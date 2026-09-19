import { RowDetailsModal } from '../../components/ui/RowDetailsModal';
import { PageLoader } from '../../components/ui/PageLoader';
import { DataTablePagination } from '../../components/ui/DataTablePagination';
import { apiUrl } from '../../utils/constants';
import React, { useState, useEffect } from 'react';
import { ReportShell } from './ReportShell';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';

export const TransactionsReport = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const token = localStorage.getItem('agent_token') || localStorage.getItem('token') || '';
    fetch(apiUrl('/api/v1/agent/reports/transactions'), {
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
    'Total Transaction Volume': rows.reduce((a, r) => a + (r.amount || 0), 0)
  };

  if (loading) return <PageLoader message="Fetching transaction logs..." />;

  return (
    <ReportShell
      title="Transaction Audit Logs"
      subtitle="Audit trail of all financial movements, credit adjustments, and commissions"
      totals={totals}
    >
      <TableContainer>
        <TableHeader>
          <TableRow>
            <TableHead>Txn ID</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>User / Account</TableHead>
            <TableHead className="text-right">Value (₹)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-slate-400 py-6">No transaction logs found.</TableCell>
            </TableRow>
          ) : (
            rows.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((r, idx) => {
              const realIdx = (currentPage - 1) * pageSize + idx;
              return (
                <TableRow key={idx} onClick={() => setSelectedRowIndex(realIdx)} className="cursor-pointer hover:bg-slate-800/60 transition-colors">
                  <TableCell className="font-mono text-slate-400 font-bold">#{r.id || idx + 1}</TableCell>
                  <TableCell className="font-mono text-slate-300">{r.created_at || r.date}</TableCell>
                  <TableCell><Badge variant="blue">{r.type || 'CREDIT'}</Badge></TableCell>
                  <TableCell className="font-bold text-slate-200">{r.username}</TableCell>
                  <TableCell className="font-mono font-bold text-right text-emerald-400">₹{(r.amount || 0).toLocaleString('en-IN')}</TableCell>
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
        title="Transaction Log Record"
      />
    </ReportShell>
  );
};
