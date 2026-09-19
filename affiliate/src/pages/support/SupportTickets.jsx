import { PageLoader } from '../../components/ui/PageLoader';
import { apiUrl } from '../../utils/api';
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { 
  HelpCircle, 
  Send, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  UserCheck, 
  AlertCircle,
  Sparkles,
  X,
  ShieldCheck,
  RefreshCw,
  User,
  Lock
} from 'lucide-react';

export const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Commercial');
  const [priority, setPriority] = useState('Normal');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Active full chat modal ticket conversation
  const [activeTicket, setActiveTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const chatBottomRef = useRef(null);

  const getStatusBadgeVariant = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'resolved': return 'green';
      case 'in_progress': return 'yellow';
      case 'open': return 'blue';
      case 'closed': return 'gray';
      default: return 'gray';
    }
  };

  const formatStatus = (status) => {
    return (status || 'open').toUpperCase().replace('_', ' ');
  };

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('affiliate_token') || '';
      if (!token) return;
      const res = await fetch(apiUrl('/api/v1/affiliate/support'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        setTickets(data.data.tickets || []);
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const openConversation = async (t) => {
    setActiveTicket(t);
    setMessages([]);
    setChatLoading(true);
    try {
      const token = localStorage.getItem('affiliate_token') || '';
      const res = await fetch(apiUrl(`/api/v1/affiliate/support?ticket_id=${t.id}`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        setMessages(data.data.messages || []);
        if (data.data.ticket) {
          setActiveTicket(data.data.ticket);
        }
      }
    } catch (err) {
      console.error('Failed to load conversation:', err);
    } finally {
      setChatLoading(false);
    }
  };

  // Live auto-polling for new replies and admin status updates while modal is open
  useEffect(() => {
    if (!activeTicket?.id) return;
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('affiliate_token') || '';
        const res = await fetch(apiUrl(`/api/v1/affiliate/support?ticket_id=${activeTicket.id}`), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success' && data.data) {
          if (data.data.messages) {
            setMessages(data.data.messages);
          }
          if (data.data.ticket) {
            setActiveTicket((prev) => {
              if (!prev || prev.status !== data.data.ticket.status) {
                fetchTickets();
              }
              return data.data.ticket;
            });
          }
        }
      } catch (err) {
        // silent polling
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeTicket?.id]);

  // Auto-scroll to bottom of chat on new messages or ticket opened
  useEffect(() => {
    if (activeTicket) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTicket]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;
    setSendingReply(true);

    try {
      const token = localStorage.getItem('affiliate_token') || '';
      const res = await fetch(apiUrl('/api/v1/affiliate/support'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'reply',
          ticket_id: activeTicket.id,
          message: replyText.trim()
        })
      });
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        setMessages((prev) => [...prev, data.data]);
        setActiveTicket((prev) => ({ ...prev, status: data.data.ticket_status || prev.status || 'open' }));
        setReplyText('');
        fetchTickets();
      } else {
        alert(data.message || 'Failed to send reply');
      }
    } catch (err) {
      console.error('Send reply error:', err);
      alert('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply(e);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('affiliate_token') || '';
      const res = await fetch(apiUrl('/api/v1/affiliate/support'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          subject,
          category,
          priority,
          message
        })
      });
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        setTickets((prev) => [data.data, ...prev]);
        setSubject('');
        setMessage('');
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
      } else {
        alert(data.message || 'Failed to submit ticket');
      }
    } catch (err) {
      console.error('Submit ticket error:', err);
      alert('Network error submitting ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const openCount = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;

  const stats = [
    { label: 'Assigned Account Manager', value: 'VIP Desk Manager', sub: '24/7 Dedicated Support', icon: UserCheck, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    { label: 'Average Response Time', value: '< 15 Minutes', sub: 'Guaranteed Priority SLA', icon: Clock, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Active Inquiries', value: `${openCount} Active`, sub: `${tickets.length} total tickets`, icon: MessageSquare, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' }
  ];

  if (loading) {
    return <PageLoader message="Loading support tickets..." />;
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight font-display">
            Partner Support & VIP Desk
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Direct communication line with your dedicated affiliate manager and technical integration team. Click any ticket to open the full chat.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> VIP Support SLA
          </span>
        </div>
      </div>

      {/* Support SLA KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3.5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between gap-1">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider line-clamp-1">
                  {stat.label}
                </span>
                <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border ${stat.color} shrink-0`}>
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="mt-1 sm:mt-2.5">
                <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-zinc-100 font-display tracking-tight">
                  {stat.value}
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5 truncate">
                  {stat.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Tickets History List */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-500" /> Support Inquiry History
            </h2>
            <span className="text-[11px] font-bold text-slate-400">{tickets.length} Total Tickets &bull; Click to chat</span>
          </div>

          <TableContainer>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Subject & Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                    {loading ? 'Loading support inquiries...' : 'No support tickets found. Submit your first inquiry using the form.'}
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((t) => (
                  <TableRow 
                    key={t.id} 
                    onClick={() => openConversation(t)}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors group"
                  >
                    <TableCell className="font-mono text-xs font-bold text-cyan-500 group-hover:underline">
                      #AFF-{t.id}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-xs text-slate-900 dark:text-zinc-100 block group-hover:text-cyan-500 transition-colors">
                        {t.subject}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        Category: {t.category} • {t.replies || 0} replies
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        t.priority === 'Urgent' 
                          ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                          : t.priority === 'High' 
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                      }`}>
                        {t.priority}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 dark:text-zinc-400 font-medium whitespace-nowrap">
                      {t.date}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(t.status)}>
                        {formatStatus(t.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="primary" 
                        onClick={(e) => { e.stopPropagation(); openConversation(t); }}
                        className="text-[11px] py-1 px-2.5 font-bold shadow-xs flex items-center gap-1.5 ml-auto"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Full Chat
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </TableContainer>
        </div>

        {/* Create Support Ticket Box */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-500" /> Open New Support Ticket
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Direct ticket sent directly to Admin Console.</p>
          </div>

          {submitted && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Ticket submitted! Your manager has been notified in Admin.
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                  Category
                </label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="Commercial">Commercial</option>
                  <option value="Payouts">Payouts</option>
                  <option value="Tracking & Links">Tracking & Links</option>
                  <option value="API / Technical">API / Technical</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                  Priority
                </label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="Normal">Normal</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <Input 
              label="Subject" 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
              placeholder="Brief summary of inquiry" 
              required 
            />

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                Detailed Message
              </label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain the issue or requirement in detail..."
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 min-h-[85px] resize-y placeholder:text-slate-500"
                required
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold transition-all shadow-md shadow-blue-500/20 text-xs flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" /> {submitting ? 'Submitting...' : 'Submit Support Ticket'}
            </button>
          </form>
        </div>
      </div>

      {/* FULL CHAT CONVERSATION MODAL POPUP */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl w-full max-w-5xl h-[94vh] sm:h-[90vh] shadow-2xl overflow-hidden flex flex-col">
            
            {/* Full Chat Header */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/90 dark:bg-zinc-900/90 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                      #AFF-{activeTicket.id}
                    </span>
                    <Badge variant={getStatusBadgeVariant(activeTicket.status)}>
                      {formatStatus(activeTicket.status)}
                    </Badge>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      activeTicket.priority === 'Urgent' 
                        ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                        : activeTicket.priority === 'High' 
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                    }`}>
                      {activeTicket.priority || 'Normal'} Priority
                    </span>
                    <span className="text-xs text-slate-400 font-medium hidden sm:inline">&bull;</span>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium hidden sm:inline">
                      Category: <strong className="text-slate-700 dark:text-zinc-200">{activeTicket.category}</strong>
                    </span>
                  </div>
                  <h2 className="font-black text-sm sm:text-base text-slate-900 dark:text-zinc-100 truncate mt-0.5">
                    {activeTicket.subject}
                  </h2>
                </div>
              </div>

              {/* Status Display Badge (Admin Managed Only) & Window Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                  <Badge variant={getStatusBadgeVariant(activeTicket.status)}>
                    {formatStatus(activeTicket.status)}
                  </Badge>
                </div>

                <button 
                  onClick={() => openConversation(activeTicket)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Refresh Conversation"
                >
                  <RefreshCw className={`w-4 h-4 ${chatLoading ? 'animate-spin' : ''}`} />
                </button>

                <button 
                  onClick={() => setActiveTicket(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Close Full Chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conversation Subheader Bar */}
            <div className="px-4 py-2 sm:px-6 bg-slate-100/70 dark:bg-zinc-950/60 border-b border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-slate-700 dark:text-zinc-300">VIP Support Desk:</span>
                <span>Active 24/7 SLA &bull; Live sync enabled</span>
              </div>
              <div className="flex items-center gap-3">
                <span>{messages.length} message{messages.length === 1 ? '' : 's'}</span>
                <span>&bull;</span>
                <span className="font-mono">#AFF-{activeTicket.id}</span>
              </div>
            </div>

            {/* Full Chat Messages Feed */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-zinc-950/40">
              {chatLoading && messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-cyan-500" />
                  <p className="text-xs">Loading full conversation thread...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-300 dark:text-zinc-700" />
                  <p className="text-xs">No messages found in this ticket yet.</p>
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isAdmin = m.sender_type === 'admin';
                  return (
                    <div 
                      key={m.id || idx} 
                      className={`flex gap-3 max-w-[85%] sm:max-w-[78%] ${isAdmin ? 'mr-auto items-start' : 'ml-auto flex-row-reverse items-start'}`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white shadow-xs ${
                        isAdmin 
                          ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 ring-2 ring-cyan-500/20' 
                          : 'bg-gradient-to-tr from-slate-700 to-zinc-800 ring-2 ring-slate-400/20'
                      }`}>
                        {isAdmin ? <ShieldCheck className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                      </div>

                      {/* Bubble & Metadata */}
                      <div className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}>
                        <div className="flex items-center gap-2 mb-1 text-[11px] font-medium text-slate-400">
                          <span className={isAdmin ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-700 dark:text-zinc-300 font-bold'}>
                            {isAdmin ? 'VIP Support Desk (Admin)' : 'You (Partner)'}
                          </span>
                          <span>&bull;</span>
                          <span>{m.created_at}</span>
                        </div>

                        <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm break-words whitespace-pre-wrap ${
                          isAdmin 
                            ? 'bg-blue-600 text-white rounded-tl-xs shadow-blue-500/10' 
                            : 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 border border-slate-200 dark:border-zinc-700 rounded-tr-xs'
                        }`}>
                          {m.message}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Read-only status info banner when Closed or Resolved */}
            {(activeTicket.status === 'closed' || activeTicket.status === 'resolved') && (
              <div className="px-4 py-2 bg-slate-100 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 text-xs flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>This ticket is currently marked as <strong>{formatStatus(activeTicket.status)}</strong> by Admin Support. You can submit a follow-up reply below to contact support.</span>
              </div>
            )}

            {/* Full Chat Reply Input Bar */}
            <form onSubmit={handleSendReply} className="p-2.5 sm:p-4 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
                <textarea 
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your response to the support desk (Press Enter to send, Shift+Enter for new line)..."
                  className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none placeholder:text-slate-400"
                  required
                />
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={sendingReply || !replyText.trim()}
                  className="py-2.5 sm:py-3 px-4 font-bold shadow-md shadow-blue-500/20 text-xs sm:text-sm flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Send className="w-4 h-4" /> {sendingReply ? 'Sending...' : 'Send Reply'}
                </Button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>Press <strong>Enter</strong> to send &bull; Shift + Enter for new line</span>
                <span className="text-[10px] text-slate-400">Admin managed status</span>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
