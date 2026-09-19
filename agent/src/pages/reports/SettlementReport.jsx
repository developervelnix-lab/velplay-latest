import { RowDetailsModal } from '../../components/ui/RowDetailsModal';
import { PageLoader } from '../../components/ui/PageLoader';
import { DataTablePagination } from '../../components/ui/DataTablePagination';
import { apiUrl } from '../../utils/constants';
import React, { useState, useEffect } from 'react';
import { ReportShell } from './ReportShell';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';

export const SettlementReport = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const token = localStorage.getItem('agent_token') || localStorage.getItem('token') || '';
    fetch(apiUrl('/api/v1/agent/reports/settlement'), {
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
    'Total Settled Volume': rows.reduce((a, r) => a + (r.settled_amount || 0), 0)
  };

  if (loading) return <PageLoader message="Fetching settlement history & watermarks..." />;

  return (
    <ReportShell
      title="Settlement History & Watermarks"
      subtitle="Complete ledger of historical affiliate & agent cycle settlements"
      totals={totals}
    >
      <TableContainer>
        <TableHeader>
          <TableRow>
            <TableHead>Settlement ID</TableHead>
            <TableHead>Settled Timestamp</TableHead>
            <TableHead>Affiliate / Agent</TableHead>
            <TableHead>Settled Amount</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-slate-400 py-6">No settlement history found.</TableCell>
            </TableRow>
          ) : (
            rows.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((r, idx) => {
              const realIdx = (currentPage - 1) * pageSize + idx;
              return (
                <TableRow key={idx} onClick={() => setSelectedRowIndex(realIdx)} className="cursor-pointer hover:bg-slate-800/60 transition-colors">
                  <TableCell className="font-mono text-slate-400 font-bold">#{r.id || idx + 1}</TableCell>
                  <TableCell className="font-mono text-slate-300">{r.settled_at || r.created_at}</TableCell>
                  <TableCell className="font-bold text-slate-200">{r.affiliate_code || r.username}</TableCell>
                  <TableCell className="font-mono text-emerald-400 font-bold">₹{(r.settled_amount || 0).toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="green">COMPLETED</Badge>
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
        title="Settlement History Record"
      />
    </ReportShell>
  );
};
