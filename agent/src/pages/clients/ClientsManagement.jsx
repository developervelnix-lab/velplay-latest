import { RowDetailsModal } from '../../components/ui/RowDetailsModal';
import { DataTablePagination } from '../../components/ui/DataTablePagination';
import { PageLoader } from '../../components/ui/PageLoader';
import React, { useState, useEffect } from 'react';
import { useAgent } from '../../context/AgentContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Search, Plus, ArrowRightLeft, Lock, Unlock, ShieldAlert, Check } from 'lucide-react';
import Swal from 'sweetalert2';

export const ClientsManagement = () => {
  const [loading, setLoading] = useState(true);
  const [selectedClientIndex, setSelectedClientIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const { clients, transferClientCredit, toggleClientBetting, createClient, agentMe } = useAgent();
  const isBottomTierAgent = (agentMe?.rank_level === 'agent') || ((agentMe?.role || '').toLowerCase() === 'agent');

  const getChildOptions = () => {
    const raw = (agentMe?.rank_level || agentMe?.role || '').toLowerCase().replace(/[s-]+/g, '_');
    if (raw.includes('senior_super')) {
      return [
        { label: 'Super Agent', value: 'Super Agent' },
        { label: 'Master Agent', value: 'Master Agent' },
        { label: 'Agent', value: 'Agent' }
      ];
    } else if (raw.includes('super')) {
      return [
        { label: 'Master Agent', value: 'Master Agent' },
        { label: 'Agent', value: 'Agent' }
      ];
    } else if (raw.includes('master')) {
      return [
        { label: 'Agent', value: 'Agent' }
      ];
    }
    return [{ label: 'Agent', value: 'Agent' }];
  };

  const childOptions = getChildOptions();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [transferModal, setTransferModal] = useState({ open: false, client: null, amount: '', direction: 'down' });
  const [createModal, setCreateModal] = useState({ open: false, username: '', password: '', name: '', level: 'Agent', partnership: '10', creditRef: '' });

  // Filtering
  const filteredClients = clients.filter(c => {
    const matchesSearch = c.username.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!transferModal.client || !transferModal.amount) return;
    
    const amt = parseFloat(transferModal.amount);
    if (isNaN(amt) || amt <= 0) {
      Swal.fire({ title: 'Invalid Amount', text: 'Please enter a valid credit amount', icon: 'error', background: '#1e293b', color: '#fff' });
      return;
    }

    transferClientCredit(transferModal.client.id, amt, transferModal.direction);
    
    Swal.fire({
      title: 'Credit Adjusted',
      text: `Successfully ${transferModal.direction === 'down' ? 'delegated' : 'recalled'} ₹${amt.toLocaleString()} for ${transferModal.client.username}.`,
      icon: 'success',
      toast: true,
      position: 'top-end',
      timer: 3000,
      showConfirmButton: false,
      background: '#1e293b',
      color: '#fff'
    });

    setTransferModal({ open: false, client: null, amount: '', direction: 'down' });
  };

  const handleToggleBlock = (client) => {
    const actionText = client.bettingBlocked ? 'Unlock betting' : 'Lock betting';
    Swal.fire({
      title: `${client.bettingBlocked ? 'Unlock' : 'Lock'} Betting?`,
      text: `Are you sure you want to ${actionText.toLowerCase()} for ${client.username}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: client.bettingBlocked ? '#10b981' : '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: `Yes, ${actionText}`,
      background: '#1e293b',
      color: '#fff'
    }).then((result) => {
      if (result.isConfirmed) {
        toggleClientBetting(client.id);
        Swal.fire({
          title: 'Status Updated',
          text: `Betting for ${client.username} is now ${client.bettingBlocked ? 'unlocked' : 'locked'}.`,
          icon: 'success',
          toast: true,
          position: 'top-end',
          timer: 3000,
          showConfirmButton: false,
          background: '#1e293b',
          color: '#fff'
        });
      }
    });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!createModal.username || !createModal.password) return;

    createClient({
      username: createModal.username,
      name: createModal.name || createModal.username,
      level: createModal.level,
      partnership: parseInt(createModal.partnership, 10),
      creditRef: parseFloat(createModal.creditRef) || 0
    });

    Swal.fire({
      title: 'Agent Account Created',
      text: `Downline account ${createModal.username} provisioned successfully.`,
      icon: 'success',
      toast: true,
      position: 'top-end',
      timer: 3000,
      showConfirmButton: false,
      background: '#1e293b',
      color: '#fff'
    });

    setCreateModal({ open: false, username: '', password: '', name: '', level: 'Agent', partnership: '10', creditRef: '' });
  };

  if (loading) return <PageLoader message="Loading downline agent roster & credit exposure..." />;

  return (
    <div className="p-6 space-y-6 text-left relative z-10">
      
      {/* Top Header & Search / Add Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by agent code or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {!isBottomTierAgent && (
          <button
            onClick={() => setCreateModal({ open: true, username: '', password: '', name: '', level: childOptions[0]?.value || 'Agent', partnership: '10', creditRef: '' })}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-cyan-500 hover:from-blue-600 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/10 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Downline Agent
          </button>
        )}
      </div>

      {/* Grid Table */}
      <TableContainer>
        <TableHeader>
          <TableRow>
            <TableHead>Agent / Code</TableHead>
            <TableHead>Hierarchy Level</TableHead>
            <TableHead>Credit Reference</TableHead>
            <TableHead>Current Balance</TableHead>
            <TableHead>Exposure Risk</TableHead>
            <TableHead>Available Limit</TableHead>
            <TableHead>Partnership %</TableHead>
            <TableHead>Sub-Players</TableHead>
            <TableHead>State</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-slate-500 text-xs font-semibold">
                No downline agent accounts matching the selected filter.
              </TableCell>
            </TableRow>
          ) : (
            filteredClients.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((client, idx) => {
              const realIdx = (currentPage - 1) * pageSize + idx;
              const avail = (client.balance || 0) - (client.exposure || 0);
              return (
                <TableRow key={client.id || idx} onClick={() => setSelectedClientIndex(realIdx)} className="cursor-pointer hover:bg-slate-800/60 transition-colors">
                  <TableCell className="font-bold text-slate-200">
                    <div className="flex flex-col">
                      <span>{client.username}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{client.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="blue">{client.level}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-slate-300 font-semibold">₹{(client.creditRef || 0).toLocaleString('en-IN')}</TableCell>
                  <TableCell className="font-mono text-slate-300 font-semibold">₹{(client.balance || 0).toLocaleString('en-IN')}</TableCell>
                  <TableCell className="font-mono text-red-400 font-bold">₹{(client.exposure || 0).toLocaleString('en-IN')}</TableCell>
                  <TableCell className="font-mono text-emerald-400 font-bold">₹{avail.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="font-mono text-slate-300">{client.partnership}%</TableCell>
                  <TableCell className="font-bold text-slate-200">{client.players}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Badge variant={client.status === 'active' ? 'green' : 'red'}>
                        {client.status}
                      </Badge>
                      {client.bettingBlocked && (
                        <Badge variant="red">Locked</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTransferModal({ open: true, client, amount: '', direction: 'down' });
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-750 transition-all cursor-pointer"
                      title="Transfer Credit"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleBlock(client);
                      }}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        client.bettingBlocked
                          ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-750'
                      }`}
                      title={client.bettingBlocked ? 'Unlock Betting' : 'Lock Betting'}
                    >
                      {client.bettingBlocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
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
        totalPages={Math.ceil(filteredClients.length / pageSize) || 1}
        pageSize={pageSize}
        totalItems={filteredClients.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {/* Credit Transfer Modal */}
      {transferModal.open && transferModal.client && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setTransferModal({ open: false, client: null, amount: '', direction: 'down' })}>
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-left" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest font-head mb-2 flex items-center gap-1.5">
              <ArrowRightLeft className="w-4 h-4 text-cyan-400" /> Downline Credit Transfer
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">Adjust credit limits for downline agent <span className="text-slate-200 font-bold">{transferModal.client.username}</span>.</p>
            
            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-850">
                <button
                  type="button"
                  onClick={() => setTransferModal(prev => ({ ...prev, direction: 'down' }))}
                  className={`py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                    transferModal.direction === 'down' ? 'bg-blue-600 text-white font-black' : 'text-slate-500'
                  }`}
                >
                  Delegate Down
                </button>
                <button
                  type="button"
                  onClick={() => setTransferModal(prev => ({ ...prev, direction: 'up' }))}
                  className={`py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                    transferModal.direction === 'up' ? 'bg-blue-600 text-white font-black' : 'text-slate-500'
                  }`}
                >
                  Recall Up
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
                  onClick={() => setTransferModal({ open: false, client: null, amount: '', direction: 'down' })}
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

      {/* Create Agent Modal */}
      {createModal.open && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setCreateModal({ open: false, username: '', password: '', name: '', level: 'Agent', partnership: '10', creditRef: '' })}>
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-left" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest font-head mb-4 flex items-center gap-1.5">
              <Plus className="w-4.5 h-4.5 text-cyan-400" /> Create Downline Agent Account
            </h3>
            
            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <Input 
                label="Agent Username *"
                placeholder="e.g. master_singh"
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
                label="Contact Full Name"
                placeholder="e.g. Karan Singh"
                value={createModal.name}
                onChange={(e) => setCreateModal(prev => ({ ...prev, name: e.target.value }))}
              />
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                    Hierarchy Level
                  </label>
                  <select 
                    value={createModal.level}
                    onChange={(e) => setCreateModal(prev => ({ ...prev, level: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[11px] font-semibold text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 cursor-pointer"
                  >
                    {childOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                    Partnership Share (%)
                  </label>
                  <select 
                    value={createModal.partnership}
                    onChange={(e) => setCreateModal(prev => ({ ...prev, partnership: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[11px] font-semibold text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 cursor-pointer"
                  >
                    <option>10</option>
                    <option>15</option>
                    <option>20</option>
                    <option>25</option>
                    <option>30</option>
                  </select>
                </div>
              </div>

              <Input 
                label="Credit Reference Value *"
                placeholder="e.g. 5000"
                type="number"
                value={createModal.creditRef}
                onChange={(e) => setCreateModal(prev => ({ ...prev, creditRef: e.target.value }))}
                required
              />

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateModal({ open: false, username: '', password: '', name: '', level: 'Agent', partnership: '10', creditRef: '' })}
                  className="w-1/2 py-2 px-4 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 px-4 rounded-xl bg-gradient-to-r from-blue-700 to-cyan-500 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Provision Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <RowDetailsModal
        isOpen={selectedClientIndex !== null}
        onClose={() => setSelectedClientIndex(null)}
        data={filteredClients}
        currentIndex={selectedClientIndex ?? 0}
        onIndexChange={setSelectedClientIndex}
        title="Downline Agent Details"
        renderActions={(client, closeModal) => (
          <>
            <button
              onClick={() => {
                closeModal();
                setTransferModal({ open: true, client, amount: '', direction: 'down' });
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-750 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" /> Transfer Credit
            </button>
            <button
              onClick={() => {
                closeModal();
                handleToggleBlock(client);
              }}
              className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 cursor-pointer ${
                client.bettingBlocked
                  ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-750'
              }`}
            >
              {client.bettingBlocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{client.bettingBlocked ? 'Unlock Betting' : 'Lock Betting'}</span>
            </button>
          </>
        )}
      />
    </div>
  );
};
