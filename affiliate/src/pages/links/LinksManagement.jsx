import { PageLoader } from '../../components/ui/PageLoader';
import { exportToCSV } from '../../utils/csvExport';
import { apiUrl, getAuthHeaders } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { 
  Link2, 
  Copy, 
  Check, 
  Plus, 
  ExternalLink, 
  MousePointerClick,
  Download,
  QrCode,
  X,
  Sparkles,
  Layers,
  Globe,
  Sliders
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export const LinksManagement = () => {
  const handleExportCSV = () => {
    const headers = [
      'Campaign Name',
      'Tracking Code',
      'Sub-ID',
      'Target Path',
      'Full Tracking URL',
      'Clicks',
      'Signups',
      'FTDs',
      'NGR Volume',
      'CPA Bounties',
      'Net Commission'
    ];
    const rows = links.map(l => [
      l.name,
      l.code,
      l.sub_id || 'N/A',
      l.target,
      l.url,
      l.clicks,
      l.signups,
      l.ftds,
      `₹${(l.ngr_volume || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `₹${(l.cpa_bounties || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `₹${(l.total_commission || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ]);
    exportToCSV('affiliate_tracking_links', headers, rows);
  };

  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('/register');
  const [subId, setSubId] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  
  // Custom Localhost / Environment Port Setup
  const [envMode, setEnvMode] = useState(() => localStorage.getItem('affiliate_env_mode') || 'local');
  const [websitePort, setWebsitePort] = useState(() => localStorage.getItem('affiliate_website_port') || '5173');
  const [customUrl, setCustomUrl] = useState(() => localStorage.getItem('affiliate_custom_url') || '');

  // Deep link builder state
  const [deepLinkCampaignName, setDeepLinkCampaignName] = useState('');
  const [deepLinkTarget, setDeepLinkTarget] = useState('/casino/game/sweet-bonanza');
  const [deepLinkSubId, setDeepLinkSubId] = useState('');
  const [deepLinkCopied, setDeepLinkCopied] = useState(false);
  const [lastCreatedDeepLink, setLastCreatedDeepLink] = useState(null);
  const [savingDeepLink, setSavingDeepLink] = useState(false);
  const [deepLinkSaveMsg, setDeepLinkSaveMsg] = useState('');

  // QR Code Modal State
  const [activeQrLink, setActiveQrLink] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Compute Base URL dynamically based on testing environment
  const getBaseUrl = () => {
    if (envMode === 'production') return 'https://velplay365.com';
    if (envMode === 'custom' && customUrl.trim()) return customUrl.trim().replace(/\/+$/, '');
    const cleanPort = (websitePort || '5173').trim().replace(/[^0-9]/g, '') || '5173';
    return `http://localhost:${cleanPort}`;
  };

  const currentBaseUrl = getBaseUrl();

  useEffect(() => {
    let cancelled = false;
    if (!activeQrLink?.url) {
      setQrDataUrl('');
      return;
    }
    QRCode.toDataURL(activeQrLink.url, { width: 300, margin: 1 })
      .then(url => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(err => {
        console.error('QR code generation error:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [activeQrLink]);

  // Helper to format full URL
  const formatTrackingUrl = (targetPath, code, sub) => {
    const base = getBaseUrl();
    let path = (targetPath || '/').trim();
    if (path === '' || path === '/') {
      path = '/register';
    } else if (!path.startsWith('/')) {
      path = '/' + path;
    }
    const sep = path.includes('?') ? '&' : '?';
    let url = `${base}${path}${sep}ref=${encodeURIComponent(code || '')}`;
    if (sub) url += `&sub=${encodeURIComponent(sub)}`;
    return url;
  };

  const handlePortChange = (val) => {
    setWebsitePort(val);
    localStorage.setItem('affiliate_website_port', val);
  };

  const handleEnvModeChange = (mode) => {
    setEnvMode(mode);
    localStorage.setItem('affiliate_env_mode', mode);
  };

  const handleCustomUrlChange = (val) => {
    setCustomUrl(val);
    localStorage.setItem('affiliate_custom_url', val);
  };

  const fetchLinks = async () => {
    try {
      const token = localStorage.getItem('affiliate_token') || '';
      const port = (websitePort || '5173').trim().replace(/[^0-9]/g, '') || '5173';
      const baseUrlParam = encodeURIComponent(getBaseUrl());
      const res = await fetch(apiUrl(`/api/v1/affiliate/links?website_port=${port}&website_base_url=${baseUrlParam}`), {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.data)) {
        setLinks(data.data.map(l => ({
          id: l.id,
          name: l.name,
          code: l.code,
          sub_id: l.sub_id || '',
          target: l.target_path || '/register',
          clicks: l.clicks_count || 0,
          signups: l.signups_count || 0,
          ftds: l.ftds_count || 0,
          ngr_volume: l.ngr_volume || 0,
          cpa_bounties: l.cpa_bounties || 0,
          total_commission: l.total_commission || 0,
          url: formatTrackingUrl(l.target_path, l.code, l.sub_id)
        })));
      }
    } catch (err) {
      console.error("Failed to fetch links:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
    const onFocus = () => fetchLinks();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [envMode, websitePort, customUrl]);

  // Handle click tracking without double-counting when opening target URL
  const handleTrackClick = async (code, url = null) => {
    if (url) {
      // Opening website directly - SiteContext.jsx on destination site will automatically track the click once
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => fetchLinks(), 1200);
      return;
    }

    try {
      const res = await fetch(apiUrl(`/api/v1/affiliate/track?ref=${encodeURIComponent(code)}`));
      const data = await res.json();
      if (data.status === 'success') {
        setLinks(prev => prev.map(l => l.code === code ? { ...l, clicks: (data.data?.clicks_count ?? (l.clicks + 1)) } : l));
      }
    } catch (e) {
      console.error('Failed to track click:', e);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const token = localStorage.getItem('affiliate_token') || '';
      const port = (websitePort || '5173').trim().replace(/[^0-9]/g, '') || '5173';
      const res = await fetch(apiUrl('/api/v1/affiliate/links'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          campaign_name: name,
          target_path: target,
          sub_id: subId,
          website_port: port,
          website_base_url: getBaseUrl()
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setName('');
        setTarget('/register');
        setSubId('');
        fetchLinks();
      }
    } catch (err) {
      console.error("Failed to create link:", err);
    }
  };

  // Dedicated Deep-Link Creation & Saving
  const handleCreateDeepLink = async (e) => {
    if (e) e.preventDefault();
    const cleanTarget = (deepLinkTarget || '/casino').trim();
    const cName = deepLinkCampaignName.trim() || ('Deep Link: ' + cleanTarget);
    setSavingDeepLink(true);

    try {
      const token = localStorage.getItem('affiliate_token') || '';
      const port = (websitePort || '5173').trim().replace(/[^0-9]/g, '') || '5173';
      const res = await fetch(apiUrl('/api/v1/affiliate/links'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          campaign_name: cName,
          target_path: cleanTarget,
          sub_id: deepLinkSubId,
          website_port: port,
          website_base_url: getBaseUrl()
        })
      });
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        setLastCreatedDeepLink(data.data);
        setDeepLinkSaveMsg('Saved to Active Campaigns!');
        setTimeout(() => setDeepLinkSaveMsg(''), 3000);
        await fetchLinks();
        return data.data;
      }
    } catch (err) {
      console.error("Failed to create deep link campaign:", err);
    } finally {
      setSavingDeepLink(false);
    }
  };

  const handleCopyLink = (id, url) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getActiveDeepLinkCode = () => {
    if (lastCreatedDeepLink?.code) return lastCreatedDeepLink.code;
    return links[0]?.code || 'AFF-DEMO';
  };

  const previewDeepLink = () => {
    const code = getActiveDeepLinkCode();
    const sub = deepLinkSubId ? ('&sub=' + encodeURIComponent(deepLinkSubId)) : '';
    const cleanTarget = deepLinkTarget.startsWith('/') ? deepLinkTarget : ('/' + deepLinkTarget);
    const sep = cleanTarget.includes('?') ? '&' : '?';
    return currentBaseUrl + (cleanTarget || '/') + sep + 'ref=' + encodeURIComponent(code) + sub;
  };

  const handleCopyDeepLink = async () => {
    let code = lastCreatedDeepLink?.code;
    if (!code && links.length > 0) {
      const created = await handleCreateDeepLink();
      if (created?.code) code = created.code;
    }
    const generated = previewDeepLink();
    navigator.clipboard.writeText(generated);
    setDeepLinkCopied(true);
    setTimeout(() => setDeepLinkCopied(false), 2000);
  };

  const handleTestDeepLink = async () => {
    let code = lastCreatedDeepLink?.code;
    if (!code) {
      const created = await handleCreateDeepLink();
      if (created?.code) code = created.code;
    }
    const url = previewDeepLink();
    handleTrackClick(code, url);
  };

  if (loading) {
    return <PageLoader message="Loading tracking links..." />;
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300 relative">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight font-display flex items-center gap-2.5">
            <Link2 className="w-6 h-6 text-blue-500" />
            Tracking Links & Creative Banners
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Generate customized marketing URLs, test links on localhost, download official creative assets, and build deep links.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExportCSV} size="sm" variant="primary" className="h-9 flex items-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-0 shadow-sm shadow-blue-500/20 cursor-pointer">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export Links (CSV)
          </Button>
          <button
            type="button"
            onClick={fetchLinks}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            Refresh Links
          </button>
        </div>
      </div>

      {/* Testing Environment & Website Host Port Setup Card */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-blue-500/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-cyan-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Testing Environment & Website Host Port</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-cyan-500/20 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/30">
                  Affiliate Testing
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Choose where your tracking links point during testing (e.g. Player Website on port 5173).
              </p>
            </div>
          </div>

          {/* Active Target URL Badge */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-xs">
            <Globe className="w-4 h-4 text-cyan-500 animate-pulse" />
            <div className="text-left">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none">Active Target Base URL</span>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-cyan-300">{currentBaseUrl}</span>
            </div>
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Option 1: Localhost Dev */}
          <div 
            onClick={() => handleEnvModeChange('local')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              envMode === 'local' 
                ? 'bg-blue-50/70 dark:bg-cyan-500/10 border-blue-400 dark:border-cyan-500/50 ring-1 ring-blue-400 dark:ring-cyan-500/30' 
                : 'bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${envMode === 'local' ? 'bg-cyan-400' : 'bg-slate-400'}`}></span>
                Local Development
              </span>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">localhost</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Runs links against your local website dev server port.
            </p>
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <span className="text-xs font-mono text-slate-600 dark:text-slate-300 font-semibold">http://localhost:</span>
              <input
                type="text"
                value={websitePort}
                onChange={(e) => handlePortChange(e.target.value)}
                placeholder="5173"
                className="w-20 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Option 2: Live Production */}
          <div 
            onClick={() => handleEnvModeChange('production')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              envMode === 'production' 
                ? 'bg-blue-50/70 dark:bg-cyan-500/10 border-blue-400 dark:border-cyan-500/50 ring-1 ring-blue-400 dark:ring-cyan-500/30' 
                : 'bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${envMode === 'production' ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
                Live Production Host
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">HTTPS</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Generates production URLs pointing directly to live site:
            </p>
            <div className="mt-2 text-xs font-mono font-bold text-slate-700 dark:text-cyan-300 truncate bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1">
              https://velplay365.com
            </div>
          </div>

          {/* Option 3: Custom Host URL */}
          <div 
            onClick={() => handleEnvModeChange('custom')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              envMode === 'custom' 
                ? 'bg-blue-50/70 dark:bg-cyan-500/10 border-blue-400 dark:border-cyan-500/50 ring-1 ring-blue-400 dark:ring-cyan-500/30' 
                : 'bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${envMode === 'custom' ? 'bg-indigo-400' : 'bg-slate-400'}`}></span>
                Custom Staging URL
              </span>
              <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">Custom</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Specify custom staging domain or LAN IP address:
            </p>
            <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={customUrl}
                onChange={(e) => handleCustomUrlChange(e.target.value)}
                placeholder="http://192.168.1.50:5173"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout: Active Tracking Campaigns vs Generate New Link */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Active Campaigns Table */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-500" />
                  Active Tracking Campaigns ({links.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Click stats, player conversions, and commissions per marketing campaign.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs font-bold text-slate-400 dark:text-zinc-500">
                Loading tracking links...
              </div>
            ) : links.length === 0 ? (
              <div className="py-12 text-center text-xs font-bold text-slate-400 dark:text-zinc-500">
                No tracking links found. Generate your first campaign link on the right.
              </div>
            ) : (
              <TableContainer>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign Name</TableHead>
                    <TableHead>Code & Target</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">Signups</TableHead>
                    <TableHead className="text-right">FTDs</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.map((link) => {
                    const activeUrl = formatTrackingUrl(link.target, link.code, link.sub_id);
                    return (
                      <TableRow key={link.id}>
                        <TableCell>
                          <div className="font-bold text-xs text-slate-900 dark:text-zinc-100">
                            {link.name}
                          </div>
                          {link.sub_id && (
                            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-semibold block">
                              Sub-ID: {link.sub_id}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-mono text-[11px] font-bold inline-block mb-1">
                            {link.code}
                          </span>
                          <span className="text-[11px] text-slate-400 dark:text-zinc-500 block font-mono truncate max-w-[160px]">
                            {link.target}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-slate-900 dark:text-zinc-100 text-right">
                          {link.clicks.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-600 dark:text-zinc-400 text-right">
                          {link.signups.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 text-right">
                          {link.ftds.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Copy URL */}
                            <button
                              onClick={() => handleCopyLink(link.id, activeUrl)}
                              className="p-1.5 text-slate-400 hover:text-cyan-500 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                              title="Copy URL"
                            >
                              {copiedId === link.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>

                            {/* Open in New Tab for Testing (Destination site automatically tracks click once) */}
                            <button 
                              onClick={() => handleTrackClick(link.code, activeUrl)}
                              className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors" 
                              title="Test & Open Link"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleTrackClick(link.code)}
                              className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors" 
                              title="Simulate Click (+1)"
                            >
                              <MousePointerClick className="w-3.5 h-3.5" />
                            </button>

                            {/* View QR Code */}
                            <button 
                              onClick={() => setActiveQrLink({ ...link, url: activeUrl })}
                              className="p-1.5 text-slate-400 hover:text-cyan-500 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors" 
                              title="View QR Code"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </TableContainer>
            )}
          </div>

          {/* Creatives Gallery */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Download className="w-4 h-4 text-cyan-500" /> Official High-Converting Creatives
              </h2>
              <span className="text-[10px] font-bold text-slate-400">High-Res PNG / GIF</span>
            </div>

            <div className="p-6 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl text-center space-y-2">
              <Sparkles className="w-6 h-6 text-cyan-500 mx-auto" />
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">Creative Media Assets Ready</p>
              <p className="text-[11px] text-slate-400">
                Official banners and creatives are auto-linked with your referral tag on download.
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Create Link + Deep Link Builder */}
        <div className="space-y-5">
          {/* Create Tracking Link Form */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-500" /> Generate New Campaign Link
            </h2>

            <form onSubmit={handleCreate} className="space-y-3">
              <Input 
                label="Campaign Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Facebook Ads Promo" 
                required 
              />
              
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                  Target Landing Page
                </label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="/register">Direct Registration (/register) [Recommended]</option>
                  <option value="/">Home Page (/)</option>
                  <option value="/sports">Sportsbook Lobby (/sports)</option>
                  <option value="/casino">Casino Reels & Slots (/casino)</option>
                  <option value="/vip">VIP Rewards (/vip)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                  Sub-ID / Campaign Tag (Optional)
                </label>
                <input
                  type="text"
                  value={subId}
                  onChange={(e) => setSubId(e.target.value)}
                  placeholder="e.g. promo_banner_top"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Link will be generated with:
                </span>
                <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold block truncate mt-0.5">
                  {currentBaseUrl}{target}?ref=LNK-AUTO
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold transition-all shadow-md shadow-blue-500/20 text-xs flex justify-center items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Generate Link
              </button>
            </form>
          </div>

          {/* Deep-Link & Sub-ID Builder */}
          <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 border border-slate-200/90 dark:border-blue-900/50 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-blue-500 dark:text-cyan-400" /> Deep-Link & Sub-ID Builder
              </h2>
              <span className="text-[10px] font-mono text-blue-600 dark:text-cyan-400 font-bold bg-blue-50 dark:bg-transparent px-1.5 py-0.5 rounded">
                {currentBaseUrl}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-300">
              Direct traffic to a specific game, tournament, or add affiliate sub-IDs for granular tracking.
            </p>

            <form onSubmit={handleCreateDeepLink} className="space-y-2.5">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-0.5">
                  Deep Link Campaign Name (Optional)
                </label>
                <input 
                  type="text" 
                  value={deepLinkCampaignName} 
                  onChange={(e) => setDeepLinkCampaignName(e.target.value)}
                  placeholder="e.g. Sweet Bonanza Promo"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-cyan-400 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-950"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-0.5">
                  Target Path
                </label>
                <input 
                  type="text" 
                  value={deepLinkTarget} 
                  onChange={(e) => setDeepLinkTarget(e.target.value)}
                  placeholder="/casino/game/sweet-bonanza"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-cyan-400 font-mono placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-950"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-0.5">
                  Sub-ID / Source Tag
                </label>
                <input 
                  type="text" 
                  value={deepLinkSubId} 
                  onChange={(e) => setDeepLinkSubId(e.target.value)}
                  placeholder="e.g. telegram_channel_2"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-cyan-400 font-mono placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-950"
                />
              </div>

              {/* Live Preview Box */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-0.5 flex justify-between">
                  <span>Generated Deep Link Preview:</span>
                  {deepLinkSaveMsg && <span className="text-emerald-400 font-bold">{deepLinkSaveMsg}</span>}
                </label>
                <div className="p-2.5 rounded-lg bg-blue-50/70 dark:bg-slate-950/80 border border-blue-200 dark:border-cyan-500/30 font-mono text-[11px] text-blue-700 dark:text-cyan-300 break-all select-all font-semibold">
                  {previewDeepLink()}
                </div>
              </div>

              <button
                type="submit"
                disabled={savingDeepLink}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold transition-all shadow-md shadow-blue-500/20 text-xs flex justify-center items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {savingDeepLink ? 'Saving to Campaigns...' : 'Generate & Save Deep Link'}
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyDeepLink}
                  className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold transition-colors text-xs flex justify-center items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {deepLinkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {deepLinkCopied ? 'Copied!' : 'Copy Deep Link'}
                </button>

                <button
                  type="button"
                  onClick={handleTestDeepLink}
                  className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-blue-600 dark:hover:bg-blue-500 text-slate-800 dark:text-white font-bold transition-colors text-xs flex justify-center items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-transparent"
                  title="Test link directly in browser and record click"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Test Link
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* QR Code Modal Preview */}
      {activeQrLink && (
        <>
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 transition-opacity" 
            onClick={() => setActiveQrLink(null)} 
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 dark:text-zinc-100">Campaign QR Code</span>
              <button onClick={() => setActiveQrLink(null)} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-zinc-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-inner flex justify-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${activeQrLink.name}`}
                  className="w-44 h-44 rounded-xl"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-xs font-bold text-slate-500">
                  Creating QR code...
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">{activeQrLink.name}</p>
              <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono break-all mt-0.5 select-all">
                {activeQrLink.url}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleCopyLink(activeQrLink.id, activeQrLink.url)}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" /> Copy URL
              </button>
              <button
                type="button"
                onClick={() => handleTrackClick(activeQrLink.code, activeQrLink.url)}
                className="w-full py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-100 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Test Link
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
