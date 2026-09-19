import { RowDetailsModal } from '../../components/ui/RowDetailsModal';
import { PageLoader } from '../../components/ui/PageLoader';
import { DataTablePagination } from '../../components/ui/DataTablePagination';
import { apiUrl } from '../../utils/constants';
import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { RefreshCw, Search, ChevronRight, ChevronDown, Activity, AlertTriangle } from 'lucide-react';

export const SportAnalysis = () => {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedFixture, setExpandedFixture] = useState(null);
  const [selectedEvtIndex, setSelectedEvtIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const getAuthHeaders = (extraHeaders = {}, path = '') => {
    const token = localStorage.getItem('agent_token') || localStorage.getItem('token') || '';
    const headers = { Authorization: "Bearer " + token, ...extraHeaders };
    return headers;
  };

  const getSportBadgeStyle = (sport) => {
    switch (String(sport).toLowerCase()) {
      case 'cricket': return 'border-amber-500/30 text-amber-400 bg-amber-500/10';
      case 'soccer': return 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10';
      case 'tennis': return 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10';
      case 'horse racing': return 'border-purple-500/30 text-purple-400 bg-purple-500/10';
      default: return 'border-slate-700 text-slate-300 bg-slate-800';
    }
  };

  const fetchSportAnalysis = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      let combinedList = [];
      const res = await fetch(apiUrl('/api/v1/agent/analysis/sport-analysis'), {
        headers: getAuthHeaders({}, '/api/v1/agent/analysis/sport-analysis')
      });
      const text = await res.text();
      let json = null;
      try {
        json = JSON.parse(text);
      } catch (e) {
        json = null;
      }

      if (json && json.status === 'success' && json.data) {
        if (Array.isArray(json.data.allFixtures) && json.data.allFixtures.length > 0) {
          combinedList = json.data.allFixtures;
        } else if (json.data.fixturesData) {
          combinedList = Object.values(json.data.fixturesData).flat().filter(Boolean);
        }
      }

      setFixtures(combinedList);
    } catch (err) {
      console.error('SportAnalysis load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSportAnalysis();
  }, []);

  const filteredEvents = fixtures.filter(f =>
    f.event?.toLowerCase().includes(search.toLowerCase()) ||
    f.sport?.toLowerCase().includes(search.toLowerCase())
  );

  const totalExposureSum = fixtures.reduce((acc, f) => acc + (f.exposure || 0), 0);
  const totalStakesSum = fixtures.reduce((acc, f) => acc + (f.totalAmount || 0), 0);

  const handleToggleExpand = (id) => {
    setExpandedFixture(prev => prev === id ? null : id);
  };

  if (loading) return <PageLoader message="Aggregating live sports risk exposure & market liabilities..." />;

  return (
    <div className="p-6 space-y-6 text-left relative z-10">
      
      {/* Top Header & Search Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Filter matches or sports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => fetchSportAnalysis(true)}
            disabled={refreshing}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Exposure'}</span>
          </button>
        </div>
      </div>

      {/* Summary Risk Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-900 border-slate-800">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Book Turnover</div>
          <div className="text-xl font-black font-mono text-slate-100">₹{totalStakesSum.toLocaleString('en-IN')}</div>
        </Card>
        <Card className="p-4 bg-slate-900 border-slate-800">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Net Exposure Risk</div>
          <div className={`text-xl font-black font-mono ${totalExposureSum < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {totalExposureSum < 0 ? '-' : '+'}₹{Math.abs(totalExposureSum).toLocaleString('en-IN')}
          </div>
        </Card>
        <Card className="p-4 bg-slate-900 border-slate-800">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Active Fixtures</div>
          <div className="text-xl font-black font-mono text-cyan-400">{fixtures.length} Events</div>
        </Card>
      </div>

      {/* Sports Fixtures Data Grid */}
      <TableContainer>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Sport</TableHead>
            <TableHead>Fixture / League</TableHead>
            <TableHead>Event Status</TableHead>
            <TableHead>Slip Count</TableHead>
            <TableHead>Risk Exposure</TableHead>
            <TableHead>Total Stakes</TableHead>
            <TableHead>Max Book Profit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEvents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-slate-500 text-xs font-semibold">
                No active sports wagers found.
              </TableCell>
            </TableRow>
          ) : (
            filteredEvents.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((fix, idx) => {
              const realIdx = (currentPage - 1) * pageSize + idx;
              const isExpanded = expandedFixture === fix.id;
              return (
                <React.Fragment key={fix.id || idx}>
                  <TableRow onClick={() => setSelectedEvtIndex(realIdx)} className="cursor-pointer hover:bg-slate-800/60 transition-colors">
                    <TableCell onClick={(e) => { e.stopPropagation(); handleToggleExpand(fix.id); }}>
                      <button className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider ${getSportBadgeStyle(fix.sport)}`}>
                        {fix.sport}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-slate-200">{fix.event}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${String(fix.date).includes('Live') ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{fix.date}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-slate-300 font-semibold">{fix.totalBets}</TableCell>
                    <TableCell className={`font-mono font-bold ${fix.exposure < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {fix.exposure < 0 ? '-' : '+'}₹{Math.abs(fix.exposure || 0).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="font-mono text-slate-300 font-semibold">₹{(fix.totalAmount || 0).toLocaleString('en-IN')}</TableCell>
                    <TableCell className="font-mono text-emerald-400 font-bold">₹{(fix.maxProfit || 0).toLocaleString('en-IN')}</TableCell>
                  </TableRow>

                  {/* Expanded Market Breakdown */}
                  {isExpanded && (
                    <TableRow className="bg-slate-950/40">
                      <TableCell colSpan={8} className="px-8 py-4">
                        <div className="border border-slate-850 rounded-2xl overflow-hidden shadow-inner">
                          <TableContainer className="border-0 rounded-none shadow-none">
                            <TableHeader className="bg-slate-950/80">
                              <TableRow>
                                <TableHead className="py-2.5">Associated Markets</TableHead>
                                <TableHead className="py-2.5">Wagers Count</TableHead>
                                <TableHead className="py-2.5">Market Liability</TableHead>
                                <TableHead className="py-2.5">Max Profit Upside</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(fix.markets || []).map((m, mIdx) => (
                                <TableRow key={mIdx}>
                                  <TableCell className="py-2.5 font-bold text-slate-350">{m.name}</TableCell>
                                  <TableCell className="py-2.5 font-mono text-slate-400">{m.bets}</TableCell>
                                  <TableCell className={`py-2.5 font-mono font-bold ${m.exposure < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {m.exposure < 0 ? '-' : '+'}₹{Math.abs(m.exposure || 0).toLocaleString('en-IN')}
                                  </TableCell>
                                  <TableCell className="py-2.5 font-mono text-emerald-400 font-semibold">₹{(m.maxProfit || 0).toLocaleString('en-IN')}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </TableContainer>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })
          )}
        </TableBody>
      </TableContainer>

      <DataTablePagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredEvents.length / pageSize) || 1}
        pageSize={pageSize}
        totalItems={filteredEvents.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      <RowDetailsModal
        isOpen={selectedEvtIndex !== null}
        onClose={() => setSelectedEvtIndex(null)}
        data={filteredEvents}
        currentIndex={selectedEvtIndex ?? 0}
        onIndexChange={setSelectedEvtIndex}
        title="Event Risk Turnover"
      />
    </div>
  );
};
