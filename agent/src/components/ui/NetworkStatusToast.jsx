import React, { useState, useEffect, useRef } from 'react';
import { WifiOff, AlertTriangle, Wifi, X, RefreshCw } from 'lucide-react';

export const NetworkStatusToast = () => {
  // status: 'online' | 'offline' | 'slow' | 'restored'
  const [status, setStatus] = useState('online');
  const [dismissed, setDismissed] = useState(false);
  const [checking, setChecking] = useState(false);
  const prevStatusRef = useRef('online');
  const restoredTimerRef = useRef(null);

  // Check connection status using navigator and optional ping
  const evaluateConnection = async (isManual = false) => {
    if (isManual) setChecking(true);

    // 1. Check browser navigator.onLine first
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      updateStatus('offline');
      if (isManual) setChecking(false);
      return;
    }

    // 2. Check Network Information API if available
    const conn = typeof navigator !== 'undefined' 
      ? (navigator.connection || navigator.mozConnection || navigator.webkitConnection) 
      : null;

    let isSlow = false;
    if (conn) {
      if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') {
        isSlow = true;
      }
      if (conn.rtt && conn.rtt > 1500) {
        isSlow = true;
      }
      if (conn.downlink && conn.downlink < 0.35) {
        isSlow = true;
      }
    }

    // 3. Perform a quick ping measurement to confirm actual connectivity & latency
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const startTime = Date.now();

      // Cache-busting tiny fetch to a reliable public/origin resource
      await fetch('/favicon.ico?_t=' + Date.now(), {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const elapsed = Date.now() - startTime;
      if (elapsed > 2000) {
        isSlow = true;
      }

      if (isSlow) {
        updateStatus('slow');
      } else {
        updateStatus('online');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // High latency / timeout
        updateStatus('slow');
      } else if (!navigator.onLine) {
        updateStatus('offline');
      }
    } finally {
      if (isManual) setChecking(false);
    }
  };

  const updateStatus = (newStatus) => {
    const prev = prevStatusRef.current;

    // If coming back online from offline, show brief 'restored' success
    if (newStatus === 'online' && prev === 'offline') {
      prevStatusRef.current = 'restored';
      setStatus('restored');
      setDismissed(false);

      if (restoredTimerRef.current) clearTimeout(restoredTimerRef.current);
      restoredTimerRef.current = setTimeout(() => {
        prevStatusRef.current = 'online';
        setStatus('online');
      }, 3500);
      return;
    }

    if (newStatus !== prev) {
      prevStatusRef.current = newStatus;
      setStatus(newStatus);
      // Reset dismissed state whenever status changes (e.g. from slow to offline or vice-versa)
      setDismissed(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      evaluateConnection();
    };

    const handleOffline = () => {
      updateStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const conn = typeof navigator !== 'undefined'
      ? (navigator.connection || navigator.mozConnection || navigator.webkitConnection)
      : null;

    if (conn && conn.addEventListener) {
      conn.addEventListener('change', handleOnline);
    }

    // Initial check
    evaluateConnection();

    // Periodic evaluation every 30 seconds
    const interval = setInterval(() => {
      evaluateConnection();
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (conn && conn.removeEventListener) {
        conn.removeEventListener('change', handleOnline);
      }
      clearInterval(interval);
      if (restoredTimerRef.current) clearTimeout(restoredTimerRef.current);
    };
  }, []);

  // Do not render anything if online and not in temporary restored banner, or if dismissed
  if (status === 'online' || dismissed) {
    return null;
  }

  const isOffline = status === 'offline';
  const isSlow = status === 'slow';
  const isRestored = status === 'restored';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[99999] max-w-sm w-[calc(100vw-2rem)] sm:w-96 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div
        className={`rounded-2xl p-4 shadow-2xl backdrop-blur-xl border transition-all duration-300 ${
          isOffline
            ? 'bg-slate-900/95 border-red-500/30 text-white shadow-red-950/50'
            : isSlow
            ? 'bg-slate-900/95 border-amber-500/30 text-white shadow-amber-950/50'
            : 'bg-slate-900/95 border-emerald-500/30 text-white shadow-emerald-950/50'
        }`}
      >
        <div className="flex items-start gap-3.5">
          
          {/* Status Icon Badge */}
          <div
            className={`p-2.5 rounded-xl shrink-0 border ${
              isOffline
                ? 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse'
                : isSlow
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}
          >
            {isOffline && <WifiOff className="w-5 h-5" />}
            {isSlow && <AlertTriangle className="w-5 h-5" />}
            {isRestored && <Wifi className="w-5 h-5" />}
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pr-1 text-left">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold tracking-tight">
                {isOffline && 'Network Unavailable'}
                {isSlow && 'Slow Connection Detected'}
                {isRestored && 'Back Online'}
              </h4>
              <span
                className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${
                  isOffline
                    ? 'bg-red-950/50 border-red-500/40 text-red-400'
                    : isSlow
                    ? 'bg-amber-950/50 border-amber-500/40 text-amber-400'
                    : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-400'
                }`}
              >
                {isOffline && 'Offline'}
                {isSlow && 'Unstable'}
                {isRestored && 'Connected'}
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {isOffline && 'You are currently disconnected from the internet. Please check your Wi-Fi or mobile data.'}
              {isSlow && 'Your connection appears slow or degraded. Live odds, games, and data streams may experience delays.'}
              {isRestored && 'Internet connection has been successfully restored.'}
            </p>

            {/* Quick Actions (for offline/slow) */}
            {(isOffline || isSlow) && (
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800">
                <button
                  onClick={() => evaluateConnection(true)}
                  disabled={checking}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin text-blue-400' : ''}`} />
                  <span>{checking ? 'Checking...' : 'Check Connection'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Dismiss / Close Button */}
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss notification"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>

        </div>
      </div>
    </div>
  );
};

export default NetworkStatusToast;
