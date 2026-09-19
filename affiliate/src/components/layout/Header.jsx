import { apiUrl } from '../../utils/api';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  Bell, 
  User, 
  ChevronDown, 
  Moon, 
  Sun, 
  Check, 
  CheckCheck, 
  AlertCircle, 
  MessageSquare, 
  CreditCard, 
  ShieldCheck, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

export const Header = ({ onMenuToggle }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [username, setUsername] = useState('Affiliate Partner');
  
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Header Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('affiliate_token') || '';
        const res = await fetch(apiUrl('/api/v1/affiliate/dashboard'), {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (data.status === 'success' && data.data?.identity) {
          setUsername(data.data.identity.full_name || data.data.identity.affiliate_code || 'Affiliate Partner');
        }
      } catch (e) {
        console.error('Failed to fetch affiliate header profile:', e);
      }
    };
    fetchProfile();
  }, []);

  // Fetch Notifications
  const fetchNotifications = async () => {
    const token = localStorage.getItem('affiliate_token') || '';
    if (!token) return;
    try {
      const res = await fetch(apiUrl('/api/v1/affiliate/notifications'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setNotifications(data.notifications || []);
        setUnreadCount(Number(data.unread_count) || 0);
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Live polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Mark single as read and navigate
  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      const token = localStorage.getItem('affiliate_token') || '';
      try {
        fetch(apiUrl('/api/v1/affiliate/notifications'), {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ action: 'mark_read', notification_id: notif.id })
        });
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (e) {
        console.error('Error marking read:', e);
      }
    }

    setNotifOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    const token = localStorage.getItem('affiliate_token') || '';
    if (!token) return;
    try {
      await fetch(apiUrl('/api/v1/affiliate/notifications'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'mark_all_read' })
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Error marking all read:', e);
    }
  };

  // Format relative timestamp
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr.replace(' ', 'T'));
    const seconds = Math.floor((now - date) / 1000);
    if (isNaN(seconds) || seconds < 30) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Render color & icon based on notification type
  const getNotifMeta = (notif) => {
    const type = notif.type;
    const titleLower = (notif.title || '').toLowerCase();
    
    if (type === 'kyc') {
      if (titleLower.includes('approved') || titleLower.includes('verified')) {
        return {
          icon: <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
          badgeClass: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
        };
      }
      return {
        icon: <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
        badgeClass: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300'
      };
    }

    if (type === 'ticket') {
      return {
        icon: <MessageSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
        badgeClass: 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20 text-cyan-700 dark:text-cyan-300'
      };
    }

    if (type === 'payout') {
      return {
        icon: <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        badgeClass: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300'
      };
    }

    if (type === 'account') {
      return {
        icon: <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
        badgeClass: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-300'
      };
    }

    return {
      icon: <Bell className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
      badgeClass: 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
    };
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/90 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-3.5 sm:px-6 shadow-xs dark:shadow-none transition-colors duration-300">
      <div className="flex items-center gap-2 md:hidden">
        <button onClick={onMenuToggle} className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 focus:outline-none mr-1 cursor-pointer">
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-1.5">
          <img src="/logo512.png" className="h-6 w-6 object-contain" alt="Logo" />
          <span className="text-xs font-black bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 bg-clip-text text-transparent tracking-tight font-head">
            VELPLAY
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2.5 sm:space-x-3 ml-auto">
        {/* Notification Bell Center */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-cyan-400 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors border border-slate-200/80 dark:border-zinc-800/80 cursor-pointer shadow-2xs"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white ring-2 ring-white dark:ring-zinc-950 shadow-xs animate-in zoom-in-50 duration-200">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Flyout */}
          {notifOpen && (
            <div className="absolute right-0 mt-2.5 w-[calc(100vw-1.5rem)] max-w-sm sm:w-96 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Dropdown Header */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/60 dark:bg-zinc-950/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 dark:text-zinc-100">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/80">
                {notifications.length === 0 ? (
                  <div className="py-10 px-4 text-center space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-slate-400">
                      <Bell className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">No notifications yet</p>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 max-w-xs mx-auto">
                      Updates on KYC verification, support ticket replies, and payouts will show here.
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const meta = getNotifMeta(n);
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3.5 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer flex items-start gap-3 relative ${
                          !n.is_read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        {/* Type Icon Badge */}
                        <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${meta.badgeClass}`}>
                          {meta.icon}
                        </div>

                        {/* Text Details */}
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h4 className={`text-xs font-bold truncate ${
                              !n.is_read 
                                ? 'text-slate-900 dark:text-white font-black' 
                                : 'text-slate-700 dark:text-zinc-300'
                            }`}>
                              {n.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 shrink-0 font-medium">
                              {formatTimeAgo(n.created_at)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                          {n.link && (
                            <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-cyan-400">
                              <span>View details</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>

                        {/* Unread indicator dot */}
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400 shrink-0 mt-2" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Dropdown Footer */}
              <div className="px-4 py-2 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/60 flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-500" /> Live alerts enabled
                </span>
                <span className="font-mono">Auto-sync: 30s</span>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme} 
          className="relative p-2 text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-cyan-400 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors border border-slate-200/80 dark:border-zinc-800/80 cursor-pointer shadow-2xs"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-2 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-zinc-100 focus:outline-none bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 px-3 py-1.5 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <div className="h-6 w-6 rounded-md bg-blue-50 dark:bg-zinc-900 flex items-center justify-center border border-blue-100 dark:border-zinc-800">
              <User className="h-3.5 w-3.5 text-blue-600 dark:text-zinc-400" />
            </div>
            <span className="text-xs font-bold hidden sm:inline-block">{username}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2.5 w-56 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-100">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800">
                <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Logged in as</p>
                <p className="text-xs font-bold text-slate-900 dark:text-zinc-300 truncate mt-0.5">{username}</p>
              </div>
              <div className="p-1">
                <a href="/settings" className="block px-3 py-2 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-blue-50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors">Account Settings</a>
                <a href="/support" className="block px-3 py-2 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-blue-50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors">Support Tickets</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
