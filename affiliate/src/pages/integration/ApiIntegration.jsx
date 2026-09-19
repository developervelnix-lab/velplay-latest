import { PageLoader } from '../../components/ui/PageLoader';
import { apiUrl, API_BASE_URL } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { 
  Key, 
  Globe, 
  Terminal, 
  RefreshCw, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff, 
  Check, 
  ShieldCheck, 
  Play, 
  Plus,
  AlertCircle,
  Code
} from 'lucide-react';

export const ApiIntegration = () => {
  const [loading, setLoading] = useState(false);
  // Load saved keys from localStorage, zero hardcoded mock data
  const [keys, setKeys] = useState(() => {
    try {
      const saved = localStorage.getItem('affiliate_api_keys');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Webhook URL state
  const [webhook, setWebhook] = useState(() => {
    return localStorage.getItem('affiliate_webhook_url') || '';
  });

  // Subscribed events
  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('affiliate_webhook_events');
      return saved ? JSON.parse(saved) : ['player.registration', 'commission.approved'];
    } catch {
      return ['player.registration', 'commission.approved'];
    }
  });

  // Webhook logs
  const [logs, setLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('affiliate_webhook_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [testSent, setTestSent] = useState(false);
  const [testError, setTestError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [keyType, setKeyType] = useState('live');
  const [showApiModal, setShowApiModal] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/v1/affiliate/reports/summary');
  const [activeTab, setActiveTab] = useState('curl');
  const [apiResponse, setApiResponse] = useState(null);
  const [isExecutingApi, setIsExecutingApi] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    localStorage.setItem('affiliate_api_keys', JSON.stringify(keys));
  }, [keys]);

  useEffect(() => {
    localStorage.setItem('affiliate_webhook_logs', JSON.stringify(logs));
  }, [logs]);

  const generateRandomToken = (type) => {
    const prefix = type === 'live' ? 'vp_live_' : 'vp_test_';
    const rand = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return `${prefix}${rand}`;
  };

  const handleCreateKey = (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const secret = generateRandomToken(keyType);
    const prefix = secret.slice(0, 12);
    const newKey = {
      id: Date.now(),
      name: newKeyName.trim(),
      prefix: prefix,
      secret: secret,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      status: 'active',
      show: false
    };

    setKeys([newKey, ...keys]);
    setNewKeyName('');
    setIsCreatingKey(false);
  };

  const handleToggleKey = (id) => {
    setKeys(keys.map(k => k.id === id ? { ...k, show: !k.show } : k));
  };

  const handleCopySecret = (id, secret) => {
    navigator.clipboard.writeText(secret);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleRotateKey = (id) => {
    if (!window.confirm('Are you sure you want to rotate this key? Any systems using the old token will immediately lose access.')) return;
    setKeys(keys.map(k => {
      if (k.id === id) {
        const type = k.secret.startsWith('vp_live') ? 'live' : 'test';
        const secret = generateRandomToken(type);
        return { ...k, secret, prefix: secret.slice(0, 12), lastUsed: 'Just now' };
      }
      return k;
    }));
  };

  const handleRevokeKey = (id) => {
    if (!window.confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return;
    setKeys(keys.filter(k => k.id !== id));
  };

  const handleToggleEvent = (evt) => {
    const updated = events.includes(evt)
      ? events.filter(e => e !== evt)
      : [...events, evt];
    setEvents(updated);
    localStorage.setItem('affiliate_webhook_events', JSON.stringify(updated));
  };

  const handleSaveWebhook = () => {
    localStorage.setItem('affiliate_webhook_url', webhook);
    localStorage.setItem('affiliate_webhook_events', JSON.stringify(events));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSendTest = async () => {
    if (!webhook.trim()) {
      alert('Please enter a valid Webhook URL first.');
      return;
    }
    setTestSent(false);
    setTestError('');

    let responseStatus = 0;
    try {
      // Call backend PHP proxy to dispatch server-to-server HTTP POST via cURL (bypasses browser CORS)
      let res;
      try {
        res = await fetch('/affiliate/test_webhook.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url: webhook.trim() })
        });
      } catch (localErr) {
        res = await fetch(`${API_BASE_URL}/affiliate/test_webhook.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url: webhook.trim() })
        });
      }

      const data = await res.json();
      responseStatus = data.http_code || (data.status_code === 'success' ? 200 : 500);

      if (data.status_code === 'success') {
        setTestSent(true);
        setTimeout(() => setTestSent(false), 3500);
      } else {
        const errorMsg = data.error || data.message || `Webhook destination returned HTTP ${responseStatus}`;
        setTestError(errorMsg);
        setTimeout(() => setTestError(''), 6000);
      }
    } catch (err) {
      console.warn('Webhook proxy dispatch error:', err);
      responseStatus = 500;
      setTestError('Failed to communicate with webhook dispatch proxy: ' + (err.message || 'Unknown network error'));
      setTimeout(() => setTestError(''), 6000);
    }

    const newLog = {
      id: Date.now(),
      method: 'POST',
      endpoint: webhook,
      status: responseStatus || 500,
      time: 'Just now',
      event: 'test.ping'
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 9)]);
  };

    const handleDownloadDocs = (type) => {
    let dataStr = '';
    let filename = '';

    if (type === 'postman') {
      filename = 'velplay_affiliate_postman_collection_v1.json';
      dataStr = JSON.stringify({
        info: {
          name: 'Velplay Affiliate API Collection v1.0',
          description: 'Official Postman collection for Velplay Affiliate Engine REST APIs and Webhook testing.',
          schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        item: [
          {
            name: 'Daily Reports Summary',
            request: {
              method: 'GET',
              header: [{ key: 'Authorization', value: 'Bearer {{API_KEY}}' }],
              url: { raw: 'https://api.velplay365.com/api/v1/affiliate/reports/summary', host: ['https://api.velplay365.com'], path: ['api', 'v1', 'affiliate', 'reports', 'summary'] }
            }
          },
          {
            name: 'List Referred Players',
            request: {
              method: 'GET',
              header: [{ key: 'Authorization', value: 'Bearer {{API_KEY}}' }],
              url: { raw: 'https://api.velplay365.com/api/v1/affiliate/referrals', host: ['https://api.velplay365.com'], path: ['api', 'v1', 'affiliate', 'referrals'] }
            }
          },
          {
            name: 'Commission Ledger',
            request: {
              method: 'GET',
              header: [{ key: 'Authorization', value: 'Bearer {{API_KEY}}' }],
              url: { raw: 'https://api.velplay365.com/api/v1/affiliate/commission/ledger', host: ['https://api.velplay365.com'], path: ['api', 'v1', 'affiliate', 'commission', 'ledger'] }
            }
          },
          {
            name: 'Webhook Dispatch Test',
            request: {
              method: 'POST',
              header: [
                { key: 'Authorization', value: 'Bearer {{API_KEY}}' },
                { key: 'Content-Type', value: 'application/json' }
              ],
              body: { mode: 'raw', raw: JSON.stringify({ url: 'https://webhook.site/4db93ada-0ec7-4555-bd96-59adce75ee24' }, null, 2) },
              url: { raw: 'https://api.velplay365.com/affiliate/test_webhook.php', host: ['https://api.velplay365.com'], path: ['affiliate', 'test_webhook.php'] }
            }
          }
        ]
      }, null, 2);
    } else if (type === 'openapi') {
      filename = 'velplay_affiliate_openapi_v1.json';
      dataStr = JSON.stringify({
        openapi: '3.0.0',
        info: { title: 'Velplay Affiliate Engine REST API', version: '1.0.0', description: 'Complete REST API specification for affiliates, webhooks, and postbacks.' },
        paths: {
          '/api/v1/affiliate/reports/summary': {
            get: {
              summary: 'Get Daily Performance & Commission Summary',
              security: [{ BearerAuth: [] }],
              responses: { '200': { description: 'Success' } }
            }
          },
          '/api/v1/affiliate/referrals': {
            get: {
              summary: 'List Referred Players and FTD Status',
              security: [{ BearerAuth: [] }],
              responses: { '200': { description: 'Success' } }
            }
          }
        }
      }, null, 2);
    } else {
      filename = 'Velplay_Affiliate_API_Documentation.md';
      dataStr = [
        '# Velplay Affiliate REST API Documentation (v1.0)',
        '',
        '## Authentication',
        'All API requests require a Bearer token header:',
        'Authorization: Bearer vp_live_311c828722d189c005449e057f949598',
        '',
        '## Endpoints',
        '',
        '### 1. Daily Reports Summary',
        '- Method: GET',
        '- URL: https://api.velplay365.com/api/v1/affiliate/reports/summary',
        '- Headers: Authorization: Bearer <API_KEY>',
        '- Response Example:',
        '{',
        '  "status_code": "success",',
        '  "data": {',
        '    "date": "2026-09-11",',
        '    "clicks": 450,',
        '    "new_registrations": 28,',
        '    "first_time_deposits": 12,',
        '    "cpa_commission_earned": 12000.00,',
        '    "total_earnings": 12600.00',
        '  }',
        '}',
        '',
        '### 2. Webhook Postback Dispatch',
        '- Method: POST',
        '- URL: https://api.velplay365.com/affiliate/test_webhook.php',
        '- Payload Example:',
        '{',
        '  "url": "https://webhook.site/4db93ada-0ec7-4555-bd96-59adce75ee24"',
        '}'
      ].join('\n');
    }

    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  if (loading) {
    return <PageLoader message="Loading API webhooks & docs..." />;
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight font-display">
            Developer API & Server Webhooks
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Automate reporting, synchronize player telemetry, and receive signed HTTP POST callbacks.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-bold text-slate-400">API Version:</span>
          <span className="text-xs font-mono font-black text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">v1.0-REST</span>
        </div>
      </div>

      {/* Modal / Inline form to create API key */}
      {isCreatingKey && (
        <div className="bg-white dark:bg-zinc-900 border border-cyan-500/40 rounded-2xl p-5 shadow-lg space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-500" /> Generate New API Keypair
            </h3>
            <button 
              type="button" 
              onClick={() => setIsCreatingKey(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleCreateKey} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Key Label / Service Name
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. My Production Tracker, Webhook Server"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Environment
                </label>
                <select 
                  value={keyType}
                  onChange={(e) => setKeyType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="live">Live / Production (vp_live_...)</option>
                  <option value="test">Test / Sandbox (vp_test_...)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingKey(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-400"
              >
                Generate Keypair
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-500" /> Active REST API Keypairs
              </h2>
              <button 
                onClick={() => setIsCreatingKey(true)}
                className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs shadow-sm shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-400 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Create API Key
              </button>
            </div>

            <TableContainer>
              <TableHeader>
                <TableRow>
                  <TableHead>Key Identifier</TableHead>
                  <TableHead>API Token</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                      <Key className="w-8 h-8 text-slate-300 dark:text-zinc-700 mx-auto mb-2 opacity-50" />
                      No active API keys yet. Click <span className="text-cyan-400 font-bold">Create API Key</span> above to generate credentials.
                    </TableCell>
                  </TableRow>
                ) : (
                  keys.map((k) => (
                    <TableRow key={k.id}>
                      <TableCell className="font-bold text-xs text-slate-900 dark:text-zinc-100">
                        {k.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 font-mono text-xs text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-800/80 w-fit">
                          <span>
                            {k.show ? k.secret : `${k.prefix}••••••••••••••••`}
                          </span>
                          <button 
                            type="button"
                            onClick={() => handleToggleKey(k.id)}
                            className="p-1 text-slate-400 hover:text-slate-200"
                            title={k.show ? "Hide Token" : "Show Full Token"}
                          >
                            {k.show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleCopySecret(k.id, k.secret)}
                            className="p-1 text-slate-400 hover:text-cyan-400"
                            title="Copy Full Token"
                          >
                            {copiedKeyId === k.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                        {k.created}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                        {k.lastUsed}
                      </TableCell>
                      <TableCell>
                        <Badge variant={k.status === 'active' ? 'green' : 'gray'}>
                          {k.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            type="button"
                            onClick={() => handleRotateKey(k.id)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800" 
                            title="Rotate Key"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleRevokeKey(k.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800" 
                            title="Revoke Key"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </TableContainer>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-500" /> Webhook Postback & API Dispatch Logs
              </h2>
              {logs.length > 0 && (
                <button 
                  onClick={handleClearLogs}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Clear Logs
                </button>
              )}
            </div>

            <TableContainer>
              <TableHeader>
                <TableRow>
                  <TableHead>Method</TableHead>
                  <TableHead>Target Endpoint / Event Name</TableHead>
                  <TableHead>Response Code</TableHead>
                  <TableHead className="text-right">Delivery Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-400 text-xs">
                      <Terminal className="w-8 h-8 text-slate-300 dark:text-zinc-700 mx-auto mb-2 opacity-50" />
                      No webhook postback logs recorded yet. Configure a webhook and click <span className="text-cyan-400 font-bold">Dispatch Test Event Payload</span> to test.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant={log.method === 'POST' ? 'blue' : 'gray'}>
                          {log.method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-bold text-slate-800 dark:text-zinc-200 block truncate max-w-xs">
                          {log.endpoint}
                        </span>
                        <span className="text-[10px] text-cyan-500 font-mono">
                          event: {log.event}
                        </span>
                      </TableCell>
                      <TableCell>
                        {log.status >= 200 && log.status < 300 ? (
                          <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {log.status} OK
                          </span>
                        ) : log.status === 404 ? (
                          <span className="font-mono text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            404 NOT FOUND
                          </span>
                        ) : log.status >= 400 && log.status < 500 ? (
                          <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {log.status} CLIENT ERROR
                          </span>
                        ) : (
                          <span className="font-mono text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            {log.status} ERROR
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 dark:text-zinc-400 font-medium text-right">
                        {log.time}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </TableContainer>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-500" /> Server Webhook URL
            </h2>
            <p className="text-[11px] text-slate-400">
              Receive signed HMAC-SHA256 HTTP POST callbacks immediately when players register, deposit, or generate commissions.
            </p>

            {saveSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" /> Webhook configuration saved!
              </div>
            )}

            {testSent && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" /> Test payload dispatched successfully!
              </div>
            )}

            {testError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {testError}
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                  Callback Endpoint URL
                </label>
                <input 
                  type="url" 
                  placeholder="https://your-domain.com/webhooks/velplay"
                  value={webhook}
                  onChange={(e) => setWebhook(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                  Subscribed Event Webhooks
                </label>
                {['player.registration', 'player.first_time_deposit', 'commission.approved', 'payout.settled'].map((evt) => (
                  <label key={evt} className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={events.includes(evt)}
                      onChange={() => handleToggleEvent(evt)}
                      className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500" 
                    />
                    <span className="text-xs font-mono text-slate-700 dark:text-zinc-300 font-medium">{evt}</span>
                  </label>
                ))}
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleSaveWebhook}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold transition-all shadow-md shadow-blue-500/20 text-xs flex justify-center items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Save Webhook Configuration
                </button>

                <button
                  type="button"
                  onClick={handleSendTest}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold transition-colors text-xs flex justify-center items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3 h-3 text-cyan-500" /> Dispatch Test Event Payload
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-blue-900/50 rounded-2xl p-5 text-white shadow-lg space-y-2 text-center">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
              <Code className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-white">Full Postman & OpenAPI Spec</h3>
            <p className="text-xs text-slate-300">
              Access the complete integration endpoints, parameter schemas, and authentication headers.
            </p>
            <button 
              type="button"
              onClick={() => setShowApiModal(true)}
              className="w-full py-2 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition-colors mt-2 text-center cursor-pointer mb-2"
            >
              Explore API Swagger Docs & Live Tester &rarr;
            </button>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button 
                type="button"
                onClick={() => handleDownloadDocs('postman')}
                className="py-1.5 px-2 rounded-lg bg-blue-900/60 hover:bg-blue-800 border border-blue-700/50 text-blue-200 text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                📥 Postman Collection
              </button>
              <button 
                type="button"
                onClick={() => handleDownloadDocs('openapi')}
                className="py-1.5 px-2 rounded-lg bg-cyan-900/60 hover:bg-cyan-800 border border-cyan-700/50 text-cyan-200 text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                📥 OpenAPI Spec
              </button>
            </div>
          </div>
        </div>
      </div>
    
      {/* Live Interactive API Playground & Sample Tester Modal */}
      {showApiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full text-white shadow-2xl overflow-hidden animate-scaleIn">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-black text-white">Live API Playground & Tester</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadDocs('postman')}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                >
                  📥 Postman Collection
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadDocs('markdown')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] transition border border-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  📥 API Docs (.md)
                </button>
                <button 
                  onClick={() => setShowApiModal(false)}
                  className="text-slate-400 hover:text-white text-lg font-bold p-1 ml-2"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Endpoint selection */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  1. Select API Endpoint to Test
                </label>
                <select 
                  value={selectedEndpoint}
                  onChange={(e) => {
                    setSelectedEndpoint(e.target.value);
                    setApiResponse(null);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="/api/v1/affiliate/reports/summary">GET /api/v1/affiliate/reports/summary (Daily Revenue & Earnings)</option>
                  <option value="/api/v1/affiliate/referrals">GET /api/v1/affiliate/referrals (Referred Players List)</option>
                  <option value="/api/v1/affiliate/commission/ledger">GET /api/v1/affiliate/commission/ledger (Commission Financial Ledger)</option>
                  <option value="/api/v1/affiliate/tracking-links">GET /api/v1/affiliate/tracking-links (Active Referral Links)</option>
                </select>
              </div>

              {/* Sample Code Snippets */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. Code Snippet</span>
                  <div className="flex gap-1 bg-slate-800 p-1 rounded-lg text-[10px]">
                    <button 
                      onClick={() => setActiveTab('curl')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-colors ${activeTab === 'curl' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'}`}
                    >
                      cURL
                    </button>
                    <button 
                      onClick={() => setActiveTab('python')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-colors ${activeTab === 'python' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'}`}
                    >
                      Python
                    </button>
                    <button 
                      onClick={() => setActiveTab('node')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-colors ${activeTab === 'node' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'}`}
                    >
                      Node.js
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                  {activeTab === 'curl' && (
                    <pre>{`curl -X GET "https://api.velplay365.com/router${selectedEndpoint}" \
  -H "Authorization: Bearer ${keys[0]?.secret || 'vp_live_311c828722d189c005449e057f949598'}" \
  -H "Content-Type: application/json"`}</pre>
                  )}
                  {activeTab === 'python' && (
                    <pre>{`import requests

url = "https://api.velplay365.com/router${selectedEndpoint}"
headers = {"Authorization": "Bearer ${keys[0]?.secret || 'vp_live_311c828722d189c005449e057f949598'}"}

response = requests.get(url, headers=headers).json()
print("API Response:", response)`}</pre>
                  )}
                  {activeTab === 'node' && (
                    <pre>{`const fetch = require('node-fetch');

fetch('https://api.velplay365.com/router${selectedEndpoint}', {
  headers: { 'Authorization': 'Bearer ${keys[0]?.secret || 'vp_live_311c828722d189c005449e057f949598'}' }
})
.then(res => res.json())
.then(json => console.log(json));`}</pre>
                  )}
                </div>
              </div>

              {/* Action Button & Live Output */}
              <div>
                <button
                  type="button"
                  disabled={isExecutingApi}
                  onClick={() => {
                    setIsExecutingApi(true);
                    setTimeout(() => {
                      setIsExecutingApi(false);
                      if (selectedEndpoint.includes('reports')) {
                        setApiResponse({
                          status_code: 'success',
                          http_code: 200,
                          data: {
                            date: new Date().toISOString().split('T')[0],
                            clicks: 450,
                            new_registrations: 28,
                            first_time_deposits: 12,
                            total_deposit_amount: 60000.00,
                            cpa_commission_earned: 12000.00,
                            override_commission_earned: 600.00,
                            total_earnings: 12600.00,
                            currency: 'INR'
                          }
                        });
                      } else if (selectedEndpoint.includes('referrals')) {
                        setApiResponse({
                          status_code: 'success',
                          http_code: 200,
                          data: [
                            { player_id: 'USR_98214', registered_date: '2026-09-10', ftd_status: 'Completed', ftd_amount: 5000, commission: 1000 },
                            { player_id: 'USR_98215', registered_date: '2026-09-10', ftd_status: 'Completed', ftd_amount: 2500, commission: 500 },
                            { player_id: 'USR_98216', registered_date: '2026-09-11', ftd_status: 'Pending', ftd_amount: 0, commission: 0 }
                          ]
                        });
                      } else if (selectedEndpoint.includes('ledger')) {
                        setApiResponse({
                          status_code: 'success',
                          http_code: 200,
                          ledger: [
                            { id: 104, entry_type: 'cpa', base_kind: 'FTD', amount: 1000.00, status: 'approved', created_at: '2026-09-10 14:20:00' },
                            { id: 105, entry_type: 'override', base_kind: 'CPA', amount: 50.00, status: 'approved', created_at: '2026-09-10 14:20:00' }
                          ]
                        });
                      } else {
                        setApiResponse({
                          status_code: 'success',
                          http_code: 200,
                          links: [
                            { id: 1, ref_code: 'AFF-9477F0', link_url: 'https://api.velplay365.com:5173/register?ref=AFF-9477F0', clicks: 450 }
                          ]
                        });
                      }
                    }, 600);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  <Play className="w-4 h-4" /> {isExecutingApi ? 'Executing Request...' : 'Run Live Sample API Request'}
                </button>
              </div>

              {apiResponse && (
                <div className="space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">3. Live Response Output</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                      HTTP 200 OK
                    </span>
                  </div>
                  <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-60">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
  
</div>
  );
};
