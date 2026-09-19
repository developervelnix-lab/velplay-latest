import { RowDetailsModal } from '../../components/ui/RowDetailsModal';
import { DataTablePagination } from '../../components/ui/DataTablePagination';
import { PageLoader } from '../../components/ui/PageLoader';
import { apiUrl } from '../../utils/constants';
import React, { useState, useEffect } from 'react';
import { ReportShell } from './ReportShell';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';

export const BetList = () => {
  const [playerSearch, setPlayerSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const token = localStorage.getItem('agent_token') || localStorage.getItem('token') || '';
    fetch(apiUrl('/api/v1/agent/reports/bet-list'), {
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

  const filteredRows = rows.filter(r => (r.player || '').toLowerCase().includes(playerSearch.toLowerCase()));

  const totals = {
    'Total Stake': filteredRows.reduce((a, r) => a + (r.stake || 0), 0),
    'Total Liability': filteredRows.reduce((a, r) => a + (r.liability || 0), 0),
    'Settled Net P&L': filteredRows.reduce((a, r) => a + (r.pnl || 0), 0)
  };

  const filters = (
    <input
      type="text"
      placeholder="Search player username..."
      value={playerSearch}
      onChange={(e) => setPlayerSearch(e.target.value)}
      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-[11px] font-semibold text-slate-100 focus:outline-none w-44"
    />
  );

  if (loading) return <PageLoader message="Fetching live player bet transactions..." />;

  return (
    <ReportShell
      title="Bet List Report"
      subtitle="Audit raw betting slips, odds execution parameters, wagers and liability states"
      filters={filters}
      totals={totals}
    >
      <TableContainer>
        <TableHeader>
          <TableRow onClick={() => setSelectedRowIndex(realIdx)} className="cursor-pointer hover:bg-slate-800/60 transition-colors">
            <TableHead>Placed Time</TableHead>
            <TableHead>Player</TableHead>
            <TableHead>Event Fixture</TableHead>
            <TableHead>Market</TableHead>
            <TableHead>Selection</TableHead>
            <TableHead>Side</TableHead>
            <TableHead>Odds</TableHead>
            <TableHead>Stake</TableHead>
            <TableHead>Liability</TableHead>
            <TableHead>Settled P&L</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow onClick={() => setSelectedRowIndex(realIdx)} className="cursor-pointer hover:bg-slate-800/60 transition-colors">
              <TableCell colSpan={11} className="text-center text-slate-400 py-6">Loading bet slips...</TableCell>
            </TableRow>
          ) : filteredRows.length === 0 ? (
            <TableRow onClick={() => setSelectedRowIndex(realIdx)} className="cursor-pointer hover:bg-slate-800/60 transition-colors">
              <TableCell colSpan={11} className="text-center text-slate-400 py-6">No bet slips found.</TableCell>
            </TableRow>
          ) : (
            filteredRows.map((r, idx) => (
              <TableRow onClick={() => setSelectedRowIndex(realIdx)} className="cursor-pointer hover:bg-slate-800/60 transition-colors" key={idx}  className="cursor-pointer hover:bg-slate-800/60 transition-colors" onClick={() => setSelectedRowIndex(idx)} className="cursor-pointer hover:bg-slate-800/40 transition-colors">
                <TableCell className="font-mono text-slate-400">{r.placed}</TableCell>
                <TableCell className="font-bold text-slate-200">{r.player}</TableCell>
                <TableCell className="text-slate-300">{r.event}</TableCell>
                <TableCell className="text-slate-400">{r.market}</TableCell>
                <TableCell className="font-bold text-slate-200">{r.selection}</TableCell>
                <TableCell>
                  <span className={"px-2 py-0.5 rounded text-[10px] font-black uppercase " + (r.side === 'Back' ? 'bg-blue-600/10 text-cyan-400 border border-blue-500/20' : 'bg-pink-600/10 text-pink-400 border border-pink-500/20')}>
                    {r.side}
                  </span>
                </TableCell>
                <TableCell className="font-mono">{r.odds}</TableCell>
                <TableCell className="font-mono">₹{r.stake}</TableCell>
                <TableCell className="font-mono">₹{r.liability}</TableCell>
                <TableCell className={"font-mono font-bold " + (r.status === 'Open' ? 'text-slate-400' : r.pnl < 0 ? 'text-red-400' : 'text-emerald-400')}>
                  {r.status === 'Open' ? '--' : (r.pnl < 0 ? '-' : '+') + '₹' + Math.abs(r.pnl)}
                </TableCell>
                <TableCell>
                  <Badge variant={r.status === 'Settled' ? 'green' : 'blue'}>{r.status}</Badge>
                </TableCell>
              </TableRow>
            ))
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
        title="Player Bet Slip Record"
      />
    </ReportShell>
  );
};
