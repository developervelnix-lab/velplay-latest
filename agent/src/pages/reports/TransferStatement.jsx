import { RowDetailsModal } from '../../components/ui/RowDetailsModal';
import { PageLoader } from '../../components/ui/PageLoader';
import { DataTablePagination } from '../../components/ui/DataTablePagination';
import { apiUrl } from '../../utils/constants';
import React, { useState, useEffect } from 'react';
import { ReportShell } from './ReportShell';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';

export const TransferStatement = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const token = localStorage.getItem('agent_token') || localStorage.getItem('token') || '';
    fetch(apiUrl('/api/v1/agent/reports/transfer-statement'), {
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
    'Total Transfers': rows.reduce((a, r) => a + (r.amount || 0), 0)
  };

  if (loading) return <PageLoader message="Fetching downline credit transfer statement..." />;

  return (
    <ReportShell
      title="Credit Transfer Statement"
      subtitle="Audit record of all downline credit allocations and recalls"
      totals={totals}
    >
      <TableContainer>
        <TableHeader>
          <TableRow>
            <TableHead>Transfer Ref</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>Sender / Target</TableHead>
            <TableHead>Transfer Type</TableHead>
            <TableHead className="text-right">Amount (₹)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-slate-400 py-6">No transfer records found.</TableCell>
            </TableRow>
          ) : (
            rows.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((r, idx) => {
              const realIdx = (currentPage - 1) * pageSize + idx;
              return (
                <TableRow key={idx} onClick={() => setSelectedRowIndex(realIdx)} className="cursor-pointer hover:bg-slate-800/60 transition-colors">
                  <TableCell className="font-mono text-slate-400 font-bold">#{r.id || idx + 1}</TableCell>
                  <TableCell className="font-mono text-slate-300">{r.created_at || r.date}</TableCell>
                  <TableCell className="font-bold text-slate-200">{r.username}</TableCell>
                  <TableCell><Badge variant={r.direction === 'up' ? 'red' : 'green'}>{r.type || 'DEPOSIT'}</Badge></TableCell>
                  <TableCell className="font-mono font-bold text-right text-cyan-400">₹{(r.amount || 0).toLocaleString('en-IN')}</TableCell>
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
        title="Credit Transfer Record"
      />
    </ReportShell>
  );
};
