import { RowDetailsModal } from '../../components/ui/RowDetailsModal';
import { PageLoader } from '../../components/ui/PageLoader';
import { DataTablePagination } from '../../components/ui/DataTablePagination';
import { apiUrl } from '../../utils/constants';
import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Plus, Search, UserCheck, UserX, ArrowRightLeft, Lock, Unlock } from 'lucide-react';
import Swal from 'sweetalert2';

export const PlayersManagement = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createModal, setCreateModal] = useState({ open: false, username: '', password: '', fullName: '', phone: '', creditRef: '' });
  const [transferModal, setTransferModal] = useState({ open: false, player: null, amount: '', direction: 'down' });
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchPlayers = async () => {
    try {
      const token = localStorage.getItem('agent_token') || localStorage.getItem('token') || '';
      const res = await fetch(apiUrl('/api/v1/agent/players'), {
        headers: { Authorization: "Bearer " + token }
      });
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.data)) {
        setPlayers(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch players:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const filteredPlayers = players.filter(p =>
    p.username?.toLowerCase().includes(search.toLowerCase()) ||
    p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('agent_token') || localStorage.getItem('token') || '';
      const res = await fetch(apiUrl('/api/v1/agent/players'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(createModal)
      });
      const data = await res.json();
      if (data.status === 'success') {
        Swal.fire({
          title: 'Player Account Created',
          text: `Player ${createModal.username} has been provisioned successfully.`,
          icon: 'success',
          toast: true,
          position: 'top-end',
          timer: 3000,
          showConfirmButton: false,
          background: '#1e293b',
          color: '#fff'
        });
        setCreateModal({ open: false, username: '', password: '', fullName: '', phone: '', creditRef: '' });
        fetchPlayers();
      } else {
        Swal.fire({ title: 'Creation Failed', text: data.message || 'Unable to create player account', icon: 'error', background: '#1e293b', color: '#fff' });
      }
    } catch (err) {
      Swal.fire({ title: 'Error', text: 'Server connection failed', icon: 'error', background: '#1e293b', color: '#fff' });
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!transferModal.player || !transferModal.amount) return;
    try {
      const token = localStorage.getItem('agent_token') || localStorage.getItem('token') || '';
      const res = await fetch(apiUrl('/api/v1/agent/players/transfer'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          playerId: transferModal.player.id,
          amount: parseFloat(transferModal.amount),
          direction: transferModal.direction
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        Swal.fire({
          title: 'Credit Adjusted',
          text: `Successfully ${transferModal.direction === 'down' ? 'allocated' : 'recalled'} ₹${transferModal.amount}.`,
          icon: 'success',
          toast: true,
          position: 'top-end',
          timer: 3000,
          showConfirmButton: false,
          background: '#1e293b',
          color: '#fff'
        });
        setTransferModal({ open: false, player: null, amount: '', direction: 'down' });
        fetchPlayers();
      } else {
        Swal.fire({ title: 'Transfer Failed', text: data.message || 'Unable to adjust credit', icon: 'error', background: '#1e293b', color: '#fff' });
      }
    } catch (err) {
      Swal.fire({ title: 'Error', text: 'Server connection failed', icon: 'error', background: '#1e293b', color: '#fff' });
    }
  };

  const handleToggleBlock = (player) => {
    const isBlocked = player.status === 'blocked';
    Swal.fire({
      title: isBlocked ? 'Unblock Player Account?' : 'Block Player Account?',
      text: `Are you sure you want to ${isBlocked ? 'unblock' : 'block'} ${player.username}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: isBlocked ? '#10b981' : '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: isBlocked ? 'Yes, Unblock' : 'Yes, Block',
      background: '#1e293b',
      color: '#fff'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('agent_token') || localStorage.getItem('token') || '';
        await fetch(apiUrl('/api/v1/agent/players/toggle-status'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: "Bearer " + token
          },
          body: JSON.stringify({ playerId: player.id, status: isBlocked ? 'active' : 'blocked' })
        });
        fetchPlayers();
      }
    });
  };

  if (loading) return <PageLoader message="Loading player roster & balances..." />;

  return (
    <div className="p-6 space-y-6 text-left relative z-10">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search players by username or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
          />
        </div>

        <button
          onClick={() => setCreateModal({ open: true, username: '', password: '', fullName: '', phone: '', creditRef: '' })}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-cyan-500 hover:from-blue-600 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Player Account
        </button>
      </div>

      {/* Players Data Grid */}
      <TableContainer>
        <TableHeader>
          <TableRow>
            <TableHead>Player Account</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Available Balance</TableHead>
            <TableHead>Current P&L</TableHead>
            <TableHead>Exposure Risk</TableHead>
            <TableHead>Roster Type</TableHead>
            <TableHead>State</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPlayers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-slate-500 text-xs font-semibold">
                No direct players registered under this account yet.
              </TableCell>
            </TableRow>
          ) : (
            filteredPlayers.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((player, idx) => {
              const realIdx = (currentPage - 1) * pageSize + idx;
              return (
                <TableRow key={player.id || idx} onClick={() => setSelectedPlayerIndex(realIdx)} className="cursor-pointer hover:bg-slate-800/60 transition-colors">
                  <TableCell className="font-bold text-slate-200">
                    <div className="flex flex-col">
                      <span>{player.username}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{player.fullName || player.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-slate-400 text-xs">{player.phone || '-'}</TableCell>
                  <TableCell className="font-mono text-emerald-400 font-bold">₹{(player.balance || 0).toLocaleString('en-IN')}</TableCell>
                  <TableCell className={`font-mono font-bold ${(player.pnl || 0) < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                    {(player.pnl || 0) < 0 ? '-' : '+'}₹{Math.abs(player.pnl || 0).toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="font-mono text-red-400 font-semibold">₹{(player.exposure || 0).toLocaleString('en-IN')}</TableCell>
                  <TableCell><Badge variant="outline">DIRECT</Badge></TableCell>
                  <TableCell>
                    <Badge variant={player.status === 'blocked' ? 'red' : 'green'}>
                      {player.status || 'active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setTransferModal({ open: true, player, amount: '', direction: 'down' })}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-750 transition-all cursor-pointer"
                      title="Credit Adjustment"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleBlock(player)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        player.status === 'blocked'
                          ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-750'
                      }`}
                      title={player.status === 'blocked' ? 'Unblock Player' : 'Block Player'}
                    >
                      {player.status === 'blocked' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                    </button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </TableContainer>
      <DataTablePagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredPlayers.length / pageSize) || 1}
        pageSize={pageSize}
        totalItems={filteredPlayers.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {/* Credit Transfer Modal */}
      {transferModal.open && transferModal.player && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setTransferModal({ open: false, player: null, amount: '', direction: 'down' })}>
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest font-head mb-2 flex items-center gap-1.5">
              <ArrowRightLeft className="w-4 h-4 text-cyan-400" /> Player Credit Adjustment
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">Adjust balance for player <span className="text-slate-200 font-bold">{transferModal.player.username}</span>.</p>
            
            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-850">
                <button
                  type="button"
                  onClick={() => setTransferModal(prev => ({ ...prev, direction: 'down' }))}
                  className={`py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                    transferModal.direction === 'down' ? 'bg-blue-600 text-white font-black' : 'text-slate-500'
                  }`}
                >
                  Deposit Credit
                </button>
                <button
                  type="button"
                  onClick={() => setTransferModal(prev => ({ ...prev, direction: 'up' }))}
                  className={`py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                    transferModal.direction === 'up' ? 'bg-blue-600 text-white font-black' : 'text-slate-500'
                  }`}
                >
                  Withdraw Credit
                </button>
              </div>

              <Input 
                label="Transaction Value (₹)"
                placeholder="e.g. 500"
                type="number"
                value={transferModal.amount}
                onChange={(e) => setTransferModal(prev => ({ ...prev, amount: e.target.value }))}
                required
              />

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setTransferModal({ open: false, player: null, amount: '', direction: 'down' })}
                  className="w-1/2 py-2 px-4 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 px-4 rounded-xl bg-gradient-to-r from-blue-700 to-cyan-500 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Player Modal */}
      {createModal.open && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setCreateModal({ open: false, username: '', password: '', fullName: '', phone: '', creditRef: '' })}>
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-left" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest font-head mb-4 flex items-center gap-1.5">
              <Plus className="w-4.5 h-4.5 text-cyan-400" /> Create Direct Player Account
            </h3>
            
            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <Input 
                label="Player Username *"
                placeholder="e.g. player_rahul"
                value={createModal.username}
                onChange={(e) => setCreateModal(prev => ({ ...prev, username: e.target.value }))}
                required
              />
              <Input 
                label="Password *"
                placeholder="Min 6 characters"
                type="password"
                value={createModal.password}
                onChange={(e) => setCreateModal(prev => ({ ...prev, password: e.target.value }))}
                required
              />
              <Input 
                label="Full Name"
                placeholder="e.g. Rahul Sharma"
                value={createModal.fullName}
                onChange={(e) => setCreateModal(prev => ({ ...prev, fullName: e.target.value }))}
              />
              <Input 
                label="Phone Number"
                placeholder="e.g. 9876543210"
                value={createModal.phone}
                onChange={(e) => setCreateModal(prev => ({ ...prev, phone: e.target.value }))}
              />
              <Input 
                label="Initial Credit Balance (₹) *"
                placeholder="e.g. 1000"
                type="number"
                value={createModal.creditRef}
                onChange={(e) => setCreateModal(prev => ({ ...prev, creditRef: e.target.value }))}
                required
              />

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateModal({ open: false, username: '', password: '', fullName: '', phone: '', creditRef: '' })}
                  className="w-1/2 py-2 px-4 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 px-4 rounded-xl bg-gradient-to-r from-blue-700 to-cyan-500 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <RowDetailsModal
        isOpen={selectedPlayerIndex !== null}
        onClose={() => setSelectedPlayerIndex(null)}
        data={filteredPlayers}
        currentIndex={selectedPlayerIndex ?? 0}
        onIndexChange={setSelectedPlayerIndex}
        title="Player Account Details"
        renderActions={(player, closeModal) => (
          <>
            <button
              onClick={() => {
                closeModal();
                setTransferModal({ open: true, player, amount: '', direction: 'down' });
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-750 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" /> Credit Adjustment
            </button>
            <button
              onClick={() => {
                closeModal();
                handleToggleBlock(player);
              }}
              className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 cursor-pointer ${
                player.status === 'blocked'
                  ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-750'
              }`}
            >
              {player.status === 'blocked' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
              <span>{player.status === 'blocked' ? 'Unblock Player' : 'Block Player'}</span>
            </button>
          </>
        )}
      />
    </div>
  );
};
