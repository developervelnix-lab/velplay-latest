import { PageLoader } from '../../components/ui/PageLoader';
import { exportToCSV } from '../../utils/csvExport';
import { apiUrl } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Download, DollarSign, Send, ArrowUpRight, ShieldCheck, Wallet, Clock, CheckCircle2, Copy, Check, Building2, Coins, Zap, AlertCircle } from 'lucide-react';

export const PayoutRequests = () => {
  const handleExportCSV = () => {
    const headers = ['Request ID', 'Requested Date', 'Payout Method', 'Amount', 'Transaction Ref', 'Status', 'Rejection Reason'];
    const rows = history.map(p => [
      `#${p.id}`,
      p.date,
      p.method,
      p.amount,
      p.ref,
      p.status,
      p.reason || 'N/A'
    ]);
    exportToCSV('affiliate_payout_history', headers, rows);
  };

  const [amount, setAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('crypto');
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [minPayout, setMinPayout] = useState(1000);
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

    const fetchPayoutHistory = async () => {
    setPageLoading(true);
    try {
      const token = localStorage.getItem('affiliate_token') || '';
      const headers = token ? { Authorization: 'Bearer ' + token } : {};
      
      const res = await fetch(apiUrl('/api/v1/affiliate/payouts/history'), { headers });
      const data = await res.json();
      if (data.status === 'success') {
        if (data.minimum_payout !== undefined && data.minimum_payout !== null) {
          setMinPayout(Number(data.minimum_payout));
        }
        if (Array.isArray(data.data)) {
          setHistory(data.data.map(p => ({
            id: p.id,
            amount: '₹' + Number(p.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            date: p.requested_at ? p.requested_at.split(' ')[0] : 'Today',
            method: p.payout_method_type || 'Bank Wire',
            status: p.status || 'requested',
            ref: p.transaction_reference || (p.status === 'rejected' ? 'REJECTED' : 'PENDING-APPROVAL'),
            reason: p.rejection_reason || ''
          })));
        }
      }

      // Get available balance from dashboard endpoint
      const dashRes = await fetch(apiUrl('/api/v1/affiliate/dashboard'), { headers });
      const dashData = await dashRes.json();
      if (dashData.status === 'success' && dashData.data?.balances) {
        setAvailableBalance(Number(dashData.data.balances.available_balance || 0));
      }
    } catch (err) {
      console.error("Failed to fetch payout history:", err);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchPayoutHistory();
  }, []);

  const handlePercentage = (pct) => {
    const calculated = (availableBalance * pct).toFixed(2);
    setAmount(calculated);
  };

  const handleCopyTxn = (id, ref) => {
    navigator.clipboard.writeText(ref);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    const reqAmt = parseFloat(amount);
    if (!reqAmt || reqAmt <= 0) return;
    setSubmitting(true);
    setFeedback({ type: '', msg: '' });

    try {
      const token = localStorage.getItem('affiliate_token') || '';
      const res = await fetch(apiUrl('/api/v1/affiliate/payouts/request'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {})
        },
        body: JSON.stringify({
          amount: reqAmt,
          payout_method_type: payoutMethod,
          method_type: payoutMethod
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setAmount('');
        setFeedback({ type: 'success', msg: data.message || 'Payout request submitted successfully! Pending admin approval.' });
        fetchPayoutHistory();
      } else {
        setFeedback({ type: 'error', msg: data.message || 'Failed to submit payout request.' });
      }
    } catch (err) {
      console.error("Failed to request payout:", err);
      setFeedback({ type: 'error', msg: 'Network error occurred while submitting payout request.' });
    } finally {
      setSubmitting(false);
    }
  };

  

  if (pageLoading) {
    return <PageLoader message="Loading available balance & payout history..." />;
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300 relative">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight font-display flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-emerald-500" />
            Payout Requests & Settlements
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Submit withdrawal requests, configure payout methods, and audit payment settlement history.
          </p>
        </div>

        <Button onClick={handleExportCSV} size="sm" variant="primary" className="flex items-center gap-1.5 self-start sm:self-auto h-9 cursor-pointer bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-0 shadow-sm shadow-blue-500/20">
          <Download className="w-3.5 h-3.5" /> Export Payouts CSV
        </Button>
      </div>

      {/* Main Grid: Request Form vs History Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Payout Request Card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Send className="w-4 h-4 text-cyan-500" /> Request New Withdrawal
            </h2>
            <Badge variant="blue">Instant Gateway</Badge>
          </div>

          {/* Feedback Banner */}
          {feedback.msg && (
            <div className={`p-3 rounded-xl text-xs font-bold border ${
              feedback.type === 'success' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30' 
                : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30'
            }`}>
              {feedback.msg}
            </div>
          )}

          {/* Balance Hero Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-950 text-white border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-cyan-400" /> Available Balance
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Active
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-black font-mono tracking-tight text-white">
                ₹{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-bold text-slate-400">INR</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
              <span>Min. Payout: ₹{minPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span>Fee: 0% Free</span>
            </div>
          </div>

          <form onSubmit={handleRequest} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                Payout Destination
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'crypto', name: 'USDT TRC20', icon: Coins },
                  { id: 'bank', name: 'Bank Wire', icon: Building2 },
                  { id: 'upi', name: 'UPI Local', icon: Zap }
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPayoutMethod(m.id)}
                      className={`py-2 px-2 rounded-lg border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                        payoutMethod === m.id
                          ? 'bg-blue-600/15 border-cyan-500/50 text-cyan-400 ring-1 ring-cyan-500/30 font-bold'
                          : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-cyan-400" />
                      <span className="text-[10px]">{m.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Input 
                label="Withdrawal Amount (₹)" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="0.00" 
                type="number" 
                min="10" 
                max={availableBalance} 
                required 
              />
              {/* Quick Percentage Buttons */}
              <div className="grid grid-cols-4 gap-1.5 -mt-1">
                {[
                  { label: '25%', val: 0.25 },
                  { label: '50%', val: 0.50 },
                  { label: '75%', val: 0.75 },
                  { label: '100%', val: 1.0 }
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handlePercentage(p.val)}
                    className="py-1 text-[10px] font-bold rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold transition-all shadow-md shadow-blue-500/20 text-xs flex justify-center items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <><Send className="w-3.5 h-3.5" /> Submit Withdrawal Request</>
              )}
            </button>
          </form>
        </div>

        {/* Payout History Table */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-500" /> Payout History & Settlements
              </h2>
              <span className="text-[10px] font-bold text-slate-400">Lifetime History</span>
            </div>

            <TableContainer>
              <TableHeader>
                <TableRow>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Reference / TXID</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-xs font-bold text-slate-400 dark:text-zinc-500">
                      No payout requests found. Submit your first withdrawal request on the left.
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                        {row.date}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-black text-slate-900 dark:text-zinc-100">
                        {row.amount}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-zinc-300 font-medium">
                        {row.method}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                            <span>{row.ref}</span>
                            {row.ref !== 'PENDING-APPROVAL' && row.ref !== 'REJECTED' && (
                              <button
                                type="button"
                                onClick={() => handleCopyTxn(row.id, row.ref)}
                                className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
                                title="Copy Hash"
                              >
                                {copiedId === row.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              </button>
                            )}
                          </div>
                          {row.reason && (
                            <span className="text-[10px] text-red-500 dark:text-red-400 font-bold block mt-0.5">
                              Reason: {row.reason}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={row.status === 'paid' ? 'green' : row.status === 'approved' ? 'blue' : row.status === 'rejected' ? 'red' : 'yellow'}>
                          {row.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </TableContainer>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 flex items-center justify-between text-xs mt-3">
            <span className="text-slate-500 dark:text-zinc-400">Questions regarding wire delays or rejected requests?</span>
            <a href="/support" className="text-blue-600 dark:text-cyan-400 font-bold hover:underline">
              Contact Finance Desk &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
