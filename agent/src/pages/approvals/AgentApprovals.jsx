import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { apiUrl } from '../../utils/constants';
import { useAgent } from '../../context/AgentContext';
import { PageLoader } from '../../components/ui/PageLoader';
import { Card } from '../../components/ui/Card';
import { TableContainer as Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw, 
  ArrowUpRight, 
  UserPlus, 
  DollarSign, 
  FileText 
} from 'lucide-react';

export const AgentApprovals = () => {
  const { agentMe } = useAgent();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [approvals, setApprovals] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchApprovals = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const token = localStorage.getItem('agent_token') || localStorage.getItem('token') || '';
      const approverId = agentMe?.id || agentMe?.agent_id || 16;
      const res = await fetch(apiUrl(`/api/v1/agent/approvals?approver_id=${approverId}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.data)) {
        setApprovals(data.data);
      } else {
        setApprovals([]);
      }
    } catch (err) {
      console.error("Failed to load approval requests:", err);
      setApprovals([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [agentMe?.id]);

  const handleDecision = async (approvalId, requestCode, decision) => {
    const approverId = agentMe?.id || agentMe?.agent_id || 16;
    let rejectionReason = '';

    if (decision === 'rejected') {
      const { value: reason, isConfirmed } = await Swal.fire({
        title: 'Reject Request',
        text: `Please enter a rejection reason for request ${requestCode}:`,
        input: 'text',
        inputPlaceholder: 'e.g. Invalid document or insufficient float',
        showCancelButton: true,
        confirmButtonText: 'Reject Request',
        confirmButtonColor: '#ef4444',
        background: '#1e293b',
        color: '#fff',
        inputValidator: (val) => !val && 'Rejection reason is required!'
      });
      if (!isConfirmed) return;
      rejectionReason = reason;
    } else {
      const result = await Swal.fire({
        title: 'Approve Request?',
        text: `Are you sure you want to ACCEPT and APPROVE request ${requestCode}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Approve',
        confirmButtonColor: '#10b981',
        background: '#1e293b',
        color: '#fff'
      });
      if (!result.isConfirmed) return;
    }

    try {
      const token = localStorage.getItem('agent_token') || localStorage.getItem('token') || '';
      const res = await fetch(apiUrl('/api/v1/agent/approvals/action'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          approval_id: approvalId,
          approver_id: approverId,
          decision: decision,
          rejection_reason: rejectionReason
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        Swal.fire({
          title: decision === 'approved' ? 'Request Approved!' : 'Request Rejected',
          text: data.message || `Request ${requestCode} processed successfully.`,
          icon: decision === 'approved' ? 'success' : 'info',
          background: '#1e293b',
          color: '#fff'
        });
        fetchApprovals();
      } else {
        Swal.fire({
          title: 'Action Failed',
          text: data.message || data.error || 'Failed to process approval decision.',
          icon: 'error',
          background: '#1e293b',
          color: '#fff'
        });
      }
    } catch (err) {
      Swal.fire({
        title: 'Server Error',
        text: 'Network or server error while executing approval action.',
        icon: 'error',
        background: '#1e293b',
        color: '#fff'
      });
    }
  };

  const filteredApprovals = approvals.filter(item => {
    if (typeFilter === 'all') return true;
    if (typeFilter === 'payout_withdrawal') {
      return item.approval_type === 'payout_withdrawal' || item.approval_type === 'withdrawal';
    }
    if (typeFilter === 'credit_recharge') {
      return item.approval_type === 'credit_recharge' || item.approval_type === 'deposit';
    }
    return item.approval_type === typeFilter;
  });

  const renderPaymentDetails = (req) => {
    const details = req.details || {};
    const type = req.approval_type;

    if (type === 'withdrawal' || type === 'payout_withdrawal') {
      const rawDetails = details.withdraw_details || details.payout_details || details.bank_details || '';
      if (!rawDetails) {
        if (details.bank_name || details.account_no || details.upi_id) {
          return (
            <div className="flex flex-col text-[11px] space-y-0.5">
              {details.beneficiary_name && <span className="font-semibold text-slate-200">A/C: {details.beneficiary_name}</span>}
              {details.bank_name && <span className="text-cyan-300 font-bold">{details.bank_name}</span>}
              {details.account_no && <span className="font-mono text-cyan-400">A/C: {details.account_no}</span>}
              {details.ifsc && <span className="text-[10px] text-slate-400 font-mono">IFSC: {details.ifsc}</span>}
              {details.upi_id && <span className="font-mono text-emerald-400">UPI: {details.upi_id}</span>}
            </div>
          );
        }
        return <span className="text-[11px] text-slate-500 italic">No payout method info</span>;
      }

      if (typeof rawDetails === 'string' && rawDetails.includes(',')) {
        const parts = rawDetails.split(',');
        const name = parts[0]?.trim();
        const account = parts[1]?.trim();
        const ifsc = parts[2]?.trim();
        const bank = parts[3]?.trim();

        return (
          <div className="flex flex-col text-[11px] space-y-0.5">
            {name && <span className="font-semibold text-slate-200">{name}</span>}
            <span className="font-mono text-cyan-300">
              {bank && bank !== 'null' ? bank + ': ' : ''}{account}
            </span>
            {ifsc && ifsc !== 'null' && <span className="text-[10px] text-slate-400 font-mono">IFSC: {ifsc}</span>}
          </div>
        );
      }

      return <span className="text-[11px] text-cyan-300 font-mono">{rawDetails}</span>;
    }

    if (type === 'deposit' || type === 'credit_recharge') {
      const mode = details.recharge_mode || details.payment_mode || 'Online Transfer';
      const ref = details.recharge_details || details.ref_no || details.transaction_id || '';

      return (
        <div className="flex flex-col text-[11px] space-y-0.5">
          <span className="font-semibold text-slate-300">{mode}</span>
          {ref && <span className="font-mono text-[10px] text-cyan-400">Ref: {ref}</span>}
        </div>
      );
    }

    if (type === 'downline_registration') {
      return (
        <div className="flex flex-col text-[11px]">
          <span className="text-slate-300 font-semibold">New Agent Account</span>
          <span className="text-[10px] text-slate-500">Parent Downline Reg.</span>
        </div>
      );
    }

    return <span className="text-[11px] text-slate-500">-</span>;
  };

  const getApprovalTypeBadge = (type) => {
    switch (type) {
      case 'credit_recharge':
        return <Badge variant="blue"><DollarSign className="w-3 h-3 mr-1 inline" /> Credit Recharge</Badge>;
      case 'deposit':
        return <Badge variant="blue"><DollarSign className="w-3 h-3 mr-1 inline" /> Deposit Request</Badge>;
      case 'payout_withdrawal':
        return <Badge variant="gold"><ArrowUpRight className="w-3 h-3 mr-1 inline" /> Payout Withdrawal</Badge>;
      case 'withdrawal':
        return <Badge variant="gold"><ArrowUpRight className="w-3 h-3 mr-1 inline" /> Withdrawal Request</Badge>;
      case 'downline_registration':
        return <Badge variant="purple"><UserPlus className="w-3 h-3 mr-1 inline" /> Agent Registration</Badge>;
      default:
        return <Badge variant="gray"><FileText className="w-3 h-3 mr-1 inline" /> {type}</Badge>;
    }
  };

  if (loading) return <PageLoader message="Loading downline pending approvals queue..." />;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-100 font-head tracking-tight uppercase">
              Deposit & Withdrawal Approvals
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              {filteredApprovals.length} Pending
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review, accept, or reject downline agent & player deposit/recharge requests and withdrawal approvals.
          </p>
        </div>

        <button
          onClick={() => fetchApprovals(true)}
          disabled={refreshing}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-400 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {[
          { id: 'all', label: 'All Requests' },
          { id: 'credit_recharge', label: 'Deposit / Credit Recharges' },
          { id: 'payout_withdrawal', label: 'Withdrawal Approvals' },
          { id: 'downline_registration', label: 'Agent Registrations' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setTypeFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              typeFilter === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20 font-black'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Approvals Table */}
      <Card className="p-0 overflow-hidden border-slate-800 bg-slate-900/90 shadow-2xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-800 bg-slate-950/60">
                <TableHead>Request Code</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Request Type</TableHead>
                <TableHead>Bank / Payment Method</TableHead>
                <TableHead>Amount (₹)</TableHead>
                <TableHead>Requested Time</TableHead>
                <TableHead className="text-right">Action (Accept / Reject)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApprovals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                    <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-pulse" />
                    <p className="text-sm font-bold text-slate-300">No Pending Approval Requests</p>
                    <p className="text-xs text-slate-500 mt-1">All downline deposits, withdrawals, and registration requests have been processed.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredApprovals.map((req) => (
                  <TableRow key={req.id} className="hover:bg-slate-850/50 border-b border-slate-800/50">
                    <TableCell className="font-mono text-cyan-400 font-bold text-xs">
                      {req.request_code}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-200">{req.requester_name || 'Agent #' + req.requester_id}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">{req.requester_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getApprovalTypeBadge(req.approval_type)}
                    </TableCell>
                    <TableCell>
                      {renderPaymentDetails(req)}
                    </TableCell>
                    <TableCell className="font-mono text-emerald-400 font-bold text-xs">
                      ₹{parseFloat(req.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">
                      {req.created_at || 'Just now'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* ACCEPT BUTTON */}
                        <button
                          onClick={() => handleDecision(req.id, req.request_code, 'approved')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-emerald-500/10"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Accept / Approve</span>
                        </button>

                        {/* REJECT BUTTON */}
                        <button
                          onClick={() => handleDecision(req.id, req.request_code, 'rejected')}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-red-500/10"
                        >
                          <XCircle className="w-3.5 h-3.5 text-red-400" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
