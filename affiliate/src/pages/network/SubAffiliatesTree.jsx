import { PageLoader } from '../../components/ui/PageLoader';
import { exportToCSV } from '../../utils/csvExport';
import { apiUrl } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { 
  Users, 
  Share2, 
  TrendingUp, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink, 
  UserPlus, 
  Network, 
  RefreshCw, 
  Percent, 
  IndianRupee,
  ArrowRight,
  Calculator,
  HelpCircle,
  X,
  Send,
  MessageCircle,
  Search,
  BookOpen,
  CheckCircle2,
  Sliders,
  DollarSign,
  AlertCircle
} from 'lucide-react';

export const SubAffiliatesTree = () => {
  const handleExportCSV = () => {
    const headers = ['Sub-Affiliate Name', 'Affiliate Code', 'Status', 'Joined Date', 'Referred Players', 'Override Earnings'];
    const rows = subAffiliates.map(s => [
      s.name || s.username || 'Sub-Partner',
      s.code || s.affiliate_code,
      s.status || 'active',
      s.joined_date || s.created_at || 'N/A',
      s.referred_players || 0,
      `\u20B9${(s.override_earnings || 0).toLocaleString()}`
    ]);
    exportToCSV('affiliate_sub_partners_network', headers, rows);
  };

  const [copied, setCopied] = useState(false);
  const [subAffiliates, setSubAffiliates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [stats, setStats] = useState({
    total_sub_affiliates: 0,
    active_sub_affiliates: 0,
    total_network_players: 0,
    override_rate: '5.0%',
    total_override_earnings: 0
  });
  const [affiliateCode, setAffiliateCode] = useState('');
  const [loading, setLoading] = useState(true);

  // Interactive Calculator State
  const [calcPartners, setCalcPartners] = useState(5);
  const [calcVolume, setCalcVolume] = useState(150000);

  const fetchTreeData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('affiliate_token') || '';
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Fetch affiliate identity
      const dashRes = await fetch(apiUrl('/api/v1/affiliate/dashboard'), { headers });
      const dashData = await dashRes.json();
      if (dashData.status === 'success' && dashData.data) {
        setAffiliateCode(dashData.data.identity?.affiliate_code || '');
      }

      // Fetch real sub-affiliate network downlines
      const netRes = await fetch(apiUrl('/api/v1/affiliate/network'), { headers });
      const netData = await netRes.json();
      if (netData.status === 'success' && netData.data) {
        if (netData.data.affiliate_code) {
          setAffiliateCode(netData.data.affiliate_code);
        }
        if (netData.data.stats) {
          setStats(netData.data.stats);
        }
        if (Array.isArray(netData.data.sub_affiliates)) {
          setSubAffiliates(netData.data.sub_affiliates);
        }
      }
    } catch (err) {
      console.error('Failed to fetch sub-affiliates network:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreeData();
  }, []);

  // Correct sub-affiliate invite registration link pointing to /apply with ?ref=
  const inviteLink = `${window.location.origin}/apply?ref=${affiliateCode || 'MASTER'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = encodeURIComponent(
    `Join the Velplay Master Affiliate Network! Register with my partner link to start earning up to 45% revenue share:\n${inviteLink}`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?text=${shareText}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent('Join Velplay Partner Network')}`;

  // Interactive Calculator computations (5% override)
  const monthlyCalculatedOverride = calcPartners * calcVolume * 0.05;
  const annualCalculatedOverride = monthlyCalculatedOverride * 12;

  // Filter downline partners
  const filteredSubAffiliates = subAffiliates.filter(sub => {
    const matchesSearch = 
      (sub.name && sub.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sub.affiliate_code && sub.affiliate_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sub.email && sub.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && sub.status === statusFilter;
  });

  if (loading) {
    return <PageLoader message="Loading sub-affiliate network tree..." />;
  }

  return (
    <div className="space-y-5 pb-12">
      {/* 1. Header (Concise & Clean) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3 h-3" /> 2-Tier Partner Program
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
            Sub-Affiliate Network
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
            Recruit marketers into your downline and earn a <strong className="text-cyan-600 dark:text-cyan-400">5.0% lifetime override</strong> on their player volume.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* How to Learn / How It Works Button */}
          <button 
            onClick={() => setShowGuideModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-xs font-bold transition-all shadow-xs cursor-pointer"
            id="how-it-works-btn"
          >
            <HelpCircle className="w-4 h-4 text-cyan-500" />
            <span>How It Works & Guide</span>
          </button>

          <button 
            onClick={fetchTreeData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer"
            title="Refresh Network Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Compact Invite Link Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-500/20 rounded-2xl p-4 sm:p-5 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-400">
              <UserPlus className="w-4 h-4" /> Your Partner Recruitment Link
            </div>
            <p className="text-xs text-slate-300">
              Share with affiliate marketers or community leaders. Your code <span className="font-mono text-cyan-300 font-bold">{affiliateCode || 'MASTER'}</span> will be permanently locked as their sponsor.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 min-w-0">
            <div className="flex items-center bg-black/40 border border-blue-500/30 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 max-w-md overflow-hidden min-w-0 flex-1">
              <span className="truncate">{inviteLink}</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleCopy}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Link'}
              </button>

              <a
                href={inviteLink}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title="Open registration page in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-400 border border-emerald-500/40 transition-colors"
                title="Share via WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>

              <a
                href={telegramUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-sky-600/30 hover:bg-sky-600/50 text-sky-400 border border-sky-500/40 transition-colors"
                title="Share via Telegram"
              >
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 4 Compact KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5">
        <Card className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800/80 shadow-xs">
          <CardContent className="p-2.5 sm:p-4 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Partners</p>
              <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-zinc-100 mt-0.5 sm:mt-1">
                {stats.total_sub_affiliates}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-cyan-600 dark:text-cyan-400 font-medium mt-0.5 truncate">Tier-2 Network</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800/80 shadow-xs">
          <CardContent className="p-2.5 sm:p-4 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Active Downlines</p>
              <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-zinc-100 mt-0.5 sm:mt-1">
                {stats.active_sub_affiliates}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-emerald-500 font-medium mt-0.5 truncate">Generating volume</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800/80 shadow-xs">
          <CardContent className="p-2.5 sm:p-4 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Network Players</p>
              <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-zinc-100 mt-0.5 sm:mt-1">
                {stats.total_network_players}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-blue-500 font-medium mt-0.5 truncate">Across downlines</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 shrink-0">
              <Network className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800/80 shadow-xs">
          <CardContent className="p-2.5 sm:p-4 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Override ({stats.override_rate})</p>
              <h3 className="text-lg sm:text-2xl font-black text-emerald-500 mt-0.5 sm:mt-1 truncate">
                ₹{Number(stats.total_override_earnings || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5 truncate">Passive paid</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
              <Percent className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Compact 1-Line Earnings Calculator */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" /> Quick Override Calculator
            </span>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Estimate monthly passive earnings at the guaranteed <strong>5.0% override rate</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 whitespace-nowrap">Partners:</span>
              <input 
                type="range" 
                min="1" 
                max="30" 
                value={calcPartners}
                onChange={(e) => setCalcPartners(Number(e.target.value))}
                className="w-24 sm:w-28 accent-cyan-500 cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-zinc-200 w-8">{calcPartners}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 whitespace-nowrap">Avg Volume:</span>
              <input 
                type="range" 
                min="20000" 
                max="500000" 
                step="10000"
                value={calcVolume}
                onChange={(e) => setCalcVolume(Number(e.target.value))}
                className="w-24 sm:w-28 accent-emerald-500 cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-zinc-200 w-16">₹{(calcVolume / 1000)}k</span>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-right">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase block">Monthly Est.</span>
              <span className="text-sm sm:text-base font-black text-emerald-500 font-mono">
                ₹{monthlyCalculatedOverride.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Downline Partners Table */}
      <Card className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800/90 shadow-sm">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm sm:text-base font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-500" /> Recruited Partners ({filteredSubAffiliates.length})
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Affiliates registered under your partner code.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search partner or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-500" />
              <p className="text-xs font-semibold">Loading downline partners...</p>
            </div>
          ) : filteredSubAffiliates.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">No Sub-Affiliates Found</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                  {searchQuery ? 'No partners matched your filter.' : 'Share your invite link with other affiliates to start building your partner team.'}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Invite Link
              </button>
            </div>
          ) : (
            <TableContainer>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner</TableHead>
                  <TableHead>Affiliate Code</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Network Players</TableHead>
                  <TableHead>Sub Volume</TableHead>
                  <TableHead>5% Override</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubAffiliates.map((sub) => (
                  <TableRow key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-xs">
                          {sub.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-zinc-100">{sub.name}</div>
                          <div className="text-[10px] text-slate-400">{sub.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        {sub.affiliate_code}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 dark:text-zinc-400">
                      {sub.joined_date}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                        {sub.players_count} <span className="text-[10px] font-normal text-slate-400">players</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-mono font-medium text-slate-600 dark:text-zinc-400">
                      ₹{Number(sub.sub_volume || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono font-black text-emerald-500">
                        ₹{Number(sub.override_earnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sub.status === 'active' ? 'success' : 'warning'}>
                        {sub.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* 6. "How It Works & Guide" Interactive Modal Popup */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-cyan-500 flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-zinc-100">
                    Partner Network Guide & How to Earn
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Everything you need to know about building your sub-affiliate team.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Section 1: The 3-Step Flow */}
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-zinc-100 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-500" /> 3-Step Passive Income Flow
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-black text-xs mb-2">1</div>
                    <div className="font-bold text-xs text-slate-900 dark:text-zinc-100 mb-1">Share Partner Link</div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                      Invite digital marketers, webmasters, or influencers with your <code className="text-cyan-500">/apply?ref=...</code> link.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-black text-xs mb-2">2</div>
                    <div className="font-bold text-xs text-slate-900 dark:text-zinc-100 mb-1">They Onboard Players</div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                      They promote and bring players. They keep their full 35%-45% direct RevShare.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-emerald-500/30 bg-emerald-500/5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-black text-xs mb-2">3</div>
                    <div className="font-bold text-xs text-emerald-500 mb-1">You Get 5% Override</div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                      You receive a guaranteed 5% lifetime override commission from their player turnover, 100% passive!
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Difference between Player Link and Sub-Affiliate Link */}
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-zinc-100 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Player Links vs. Sub-Affiliate Links
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900 dark:text-zinc-100">Player Links (/links)</span>
                      <span className="text-[10px] font-bold text-cyan-500 bg-cyan-500/10 px-1.5 py-0.5 rounded">35% - 45%</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                      Share these links with <strong>casino and sports bettors</strong>. You earn direct revshare on their deposits and wagers.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-blue-600 dark:text-cyan-400">Partner Link (/network)</span>
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">5% Override</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-300 leading-relaxed">
                      Share this with <strong>other affiliates and marketers</strong>. They register under you and you earn 5% passive override on all their traffic.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: Recruitment Best Practices & FAQ */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2">
                <div className="font-bold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Best Channels to Recruit Partners
                </div>
                <ul className="text-[11px] text-slate-500 dark:text-zinc-400 space-y-1 list-disc list-inside">
                  <li><strong>Telegram Groups:</strong> Betting communities, casino discussions, affiliate masterminds.</li>
                  <li><strong>Digital Agencies & Media Buyers:</strong> Marketers running Facebook/Google ads looking for high-converting offers.</li>
                  <li><strong>Sports Tipsters & Influencers:</strong> Channels with large audiences that want to monetize.</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Link Copied!' : 'Copy My Partner Link'}
              </button>

              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
