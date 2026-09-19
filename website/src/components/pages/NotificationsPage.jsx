import React, { useState, useEffect, useMemo } from 'react';
import RanaHeader from '../home/velplay365/RanaHeader';
import AuthModalHost from '../common/AuthModalHost';
import '../../assets/css/velplay365.css';
import '../../assets/css/ranamatch.css';
import { useSite } from '../../context/SiteContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaBell, FaTrash, FaInbox, FaBullhorn, FaArrowLeft, 
    FaTrophy, FaCoins, FaCrown, FaGamepad, FaClock, 
    FaSearch, FaTimes, FaArrowRight
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../utils/constants';

const NotificationsPage = () => {
    const navigate = useNavigate();
    const { accountInfo, markAllNotificationsRead, clearAllNotifications, deleteSingleNotification } = useSite();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const userId = localStorage.getItem("account_id");
    const authSecretKey = localStorage.getItem("auth_secret_key");

    const replaceDynamicTags = (txt) => {
        if (!txt) return txt;
        const uInfo = accountInfo || {};
        return txt
            .replace(/@username/gi, uInfo.account_username || uInfo.account_full_name || 'Player')
            .replace(/@name/gi, uInfo.account_full_name || uInfo.account_username || 'Player')
            .replace(/@fullname/gi, uInfo.account_full_name || uInfo.account_username || 'Player')
            .replace(/@userid/gi, uInfo.account_id || userId || '')
            .replace(/@id/gi, uInfo.account_id || userId || '')
            .replace(/@uid/gi, uInfo.account_id || userId || '')
            .replace(/@balance/gi, '\u20B9' + (uInfo.account_balance || '0.00'))
            .replace(/@phone/gi, uInfo.account_mobile || uInfo.account_mobile_num || '')
            .replace(/@mobile/gi, uInfo.account_mobile || uInfo.account_mobile_num || '')
            .replace(/@mail/gi, uInfo.account_email || '')
            .replace(/@email/gi, uInfo.account_email || '')
            .replace(/@level/gi, uInfo.account_level || '1');
    };

    const detectCategory = (title = '', message = '') => {
        const text = (title + ' ' + message).toLowerCase();
        if (text.includes('win') || text.includes('jackpot') || text.includes('trophy') || text.includes('leaderboard')) {
            return { id: 'rewards', label: 'Reward & Wins', icon: FaTrophy, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.35)' };
        }
        if (text.includes('balance') || text.includes('deposit') || text.includes('recharge') || text.includes('\u20B9') || text.includes('cash')) {
            return { id: 'finance', label: 'Wallet & Bonus', icon: FaCoins, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.35)' };
        }
        if (text.includes('vip') || text.includes('welcome') || text.includes('member') || text.includes('loyalty')) {
            return { id: 'vip', label: 'VIP Status', icon: FaCrown, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.35)' };
        }
        if (text.includes('game') || text.includes('play') || text.includes('spin') || text.includes('aviator') || text.includes('casino')) {
            return { id: 'games', label: 'Game Alert', icon: FaGamepad, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.35)' };
        }
        return { id: 'system', label: 'System Notice', icon: FaBullhorn, color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.35)' };
    };

    const loadNotifications = async () => {
        setLoading(true);
        const localHistory = JSON.parse(localStorage.getItem("notifications_history") || "[]");
        const deletedNotices = JSON.parse(localStorage.getItem("deleted_notices") || "[]");
        let serverList = [];

        if (userId && userId !== "guest" && authSecretKey && authSecretKey !== "guest") {
            try {
                const res = await fetch(`${API_URL}?Route=route-get-broadcasts&USER_ID=${encodeURIComponent(userId)}&AuthToken=${encodeURIComponent(authSecretKey)}&_t=${Date.now()}`, {
                    headers: {
                        "Route": "route-get-broadcasts",
                        "AuthToken": authSecretKey
                    }
                });
                const data = await res.json();
                if (data && data.status_code === "success" && Array.isArray(data.data)) {
                    serverList = data.data
                        .filter(b => {
                            const sId = 'server_bc_' + b.id;
                            const bcId = 'bc_' + b.id;
                            const rawId = String(b.id);
                            return !deletedNotices.includes(sId) && !deletedNotices.includes(bcId) && !deletedNotices.includes(rawId);
                        })
                        .map(b => ({
                            id: 'server_bc_' + b.id,
                            title: replaceDynamicTags(b.title),
                            message: replaceDynamicTags(b.message),
                            time: new Date().toISOString(),
                            read: true,
                            isBroadcast: true
                        }));
                }
            } catch (e) {
                console.error("Failed to load server broadcasts:", e);
            }
        }

        const combined = [...serverList];
        localHistory.forEach(localItem => {
            if (deletedNotices.includes(localItem.id)) return;
            const exists = combined.some(item => 
                item.id === localItem.id || 
                (item.title === localItem.title && item.message === localItem.message)
            );
            if (!exists) {
                combined.push({
                    ...localItem,
                    title: replaceDynamicTags(localItem.title),
                    message: replaceDynamicTags(localItem.message)
                });
            }
        });

        setNotifications(combined);
        setLoading(false);

        if (markAllNotificationsRead) {
            markAllNotificationsRead();
        }
    };

    useEffect(() => {
        loadNotifications();
    }, [userId]);

    const clearAll = () => {
        const deleted = JSON.parse(localStorage.getItem("deleted_notices") || "[]");
        const ack = JSON.parse(localStorage.getItem("acknowledged_notices") || "[]");

        notifications.forEach(item => {
            if (item.id && !deleted.includes(item.id)) deleted.push(item.id);
            if (item.id && !ack.includes(item.id)) ack.push(item.id);
        });

        localStorage.setItem("deleted_notices", JSON.stringify(deleted));
        localStorage.setItem("acknowledged_notices", JSON.stringify(ack));
        localStorage.setItem("cleared_notices_time", String(Date.now()));
        localStorage.setItem("notifications_history", "[]");
        setNotifications([]);

        if (clearAllNotifications) {
            clearAllNotifications();
        } else if (markAllNotificationsRead) {
            markAllNotificationsRead();
        }
    };

    const deleteOne = (id) => {
        const deleted = JSON.parse(localStorage.getItem("deleted_notices") || "[]");
        const ack = JSON.parse(localStorage.getItem("acknowledged_notices") || "[]");

        if (id && !deleted.includes(id)) deleted.push(id);
        if (id && !ack.includes(id)) ack.push(id);

        localStorage.setItem("deleted_notices", JSON.stringify(deleted));
        localStorage.setItem("acknowledged_notices", JSON.stringify(ack));

        const filtered = notifications.filter(n => n.id !== id);
        setNotifications(filtered);
        localStorage.setItem("notifications_history", JSON.stringify(filtered));

        if (deleteSingleNotification) {
            deleteSingleNotification(id);
        }
    };

    const formatDate = (dateStr) => {
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return "Recently";
            return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return "Recently";
        }
    };

    const filteredNotifications = useMemo(() => {
        return notifications.filter(item => {
            const cat = detectCategory(item.title, item.message);
            const matchesTab = activeTab === 'all' || cat.id === activeTab;
            const matchesQuery = !searchQuery.trim() || 
                (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (item.message && item.message.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesTab && matchesQuery;
        });
    }, [notifications, activeTab, searchQuery]);

    const formatMessageText = (msg = '') => {
        const parts = msg.split(/(\u20B9[\d,.]+|@\w+)/g);
        return parts.map((part, i) => {
            if (part.startsWith('\u20B9')) {
                return (
                    <span key={i} className="notif-highlight-amt">
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    return (
        <div className="rana-layout promo-route min-h-screen flex flex-col">
            <AuthModalHost />
            <RanaHeader />

            {/* Scrollable Container with Platform Layout */}
            <main className="promo-route-main flex-1 overflow-y-auto w-full custom-scrollbar py-6 px-3 sm:px-6 md:px-8">
                <div className="notif-hub-shell">

                    {/* Top Hero Banner */}
                    <div className="notif-hero-card">
                        <div className="notif-hero-top">
                            <div className="notif-hero-left">
                                <button 
                                    onClick={() => navigate(-1)}
                                    className="notif-back-btn"
                                    title="Back"
                                >
                                    <FaArrowLeft size={13} />
                                </button>
                                
                                <div className="notif-bell-avatar">
                                    <FaBell />
                                    <span className="notif-bell-ping"></span>
                                </div>

                                <div className="notif-title-wrap">
                                    <h1>
                                        Notification <span>Hub</span>
                                        <span className="notif-count-chip">{notifications.length} Total</span>
                                    </h1>
                                    <p>Official updates, VIP rewards, and announcements stream</p>
                                </div>
                            </div>

                            {notifications.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="notif-purge-btn"
                                    title="Clear All Notifications"
                                >
                                    <FaTrash size={11} /> Clear All
                                </button>
                            )}
                        </div>

                        {/* Filter Tabs & Search Bar */}
                        <div className="notif-nav-row">
                            <div className="notif-tabs-group custom-scrollbar">
                                {[
                                    { id: 'all', label: 'All', icon: FaInbox },
                                    { id: 'rewards', label: 'Wins & Rewards', icon: FaTrophy },
                                    { id: 'finance', label: 'Wallet & Bonus', icon: FaCoins },
                                    { id: 'vip', label: 'VIP Status', icon: FaCrown },
                                    { id: 'system', label: 'System', icon: FaBullhorn }
                                ].map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`notif-tab-pill ${isActive ? 'is-active' : ''}`}
                                        >
                                            <Icon size={11} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Search Box */}
                            <div className="notif-search-wrap">
                                <FaSearch className="search-ico" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search notices..."
                                />
                                {searchQuery && (
                                    <button 
                                        onClick={() => setSearchQuery('')}
                                        className="search-clear"
                                    >
                                        <FaTimes size={10} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="notif-cards-stack">
                        {loading ? (
                            <div className="notif-empty-panel">
                                <div className="notif-empty-icon animate-bounce text-amber-400">
                                    <FaBell />
                                </div>
                                <h3>Loading Notifications</h3>
                                <p>Syncing announcements with server stream...</p>
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {filteredNotifications.length > 0 ? (
                                    filteredNotifications.map((n, idx) => {
                                        const cat = detectCategory(n.title, n.message);
                                        const Icon = cat.icon;

                                        return (
                                            <motion.div
                                                key={n.id || idx}
                                                layout
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.22, delay: idx * 0.03 }}
                                                className="notif-card-v2"
                                            >
                                                {/* Left Gradient Accent Stripe */}
                                                <div 
                                                    className="notif-card-stripe"
                                                    style={{ backgroundColor: cat.color }}
                                                ></div>

                                                <div className="notif-card-inner">
                                                    {/* Category Avatar */}
                                                    <div 
                                                        className="notif-cat-avatar"
                                                        style={{ 
                                                            backgroundColor: cat.bg, 
                                                            color: cat.color,
                                                            borderColor: cat.border
                                                        }}
                                                    >
                                                        <Icon />
                                                    </div>

                                                    {/* Card Content */}
                                                    <div className="notif-card-content">
                                                        <div className="notif-card-head">
                                                            <h2>{n.title}</h2>
                                                            <span 
                                                                className="notif-cat-badge"
                                                                style={{ 
                                                                    backgroundColor: cat.bg, 
                                                                    color: cat.color,
                                                                    borderColor: cat.border
                                                                }}
                                                            >
                                                                {cat.label}
                                                            </span>
                                                        </div>

                                                        {/* Message Paragraph */}
                                                        <p className="notif-card-body">
                                                            {formatMessageText(n.message)}
                                                        </p>

                                                        {/* Footer (Time & Quick Action) */}
                                                        <div className="notif-card-foot">
                                                            <div className="notif-time-tag">
                                                                <FaClock size={11} />
                                                                <span>{formatDate(n.time)}</span>
                                                            </div>

                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                {cat.id === 'games' && (
                                                                    <button 
                                                                        onClick={() => navigate('/casino')}
                                                                        className="notif-action-btn game-action"
                                                                    >
                                                                        Play Game <FaArrowRight size={8} />
                                                                    </button>
                                                                )}
                                                                {cat.id === 'finance' && (
                                                                    <button 
                                                                        onClick={() => navigate('/deposit')}
                                                                        className="notif-action-btn deposit-action"
                                                                    >
                                                                        Deposit <FaArrowRight size={8} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Delete Single Notice */}
                                                    <button
                                                        onClick={() => deleteOne(n.id)}
                                                        className="notif-del-btn"
                                                        title="Delete Notice"
                                                    >
                                                        <FaTrash size={11} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="notif-empty-panel"
                                    >
                                        <div className="notif-empty-icon">
                                            <FaInbox />
                                        </div>
                                        <h3>No Notifications Found</h3>
                                        <p>
                                            {searchQuery ? `No notices matching "${searchQuery}".` : "You're all caught up! When you receive rewards or announcements, they will appear here."}
                                        </p>
                                        <button
                                            onClick={() => navigate('/')}
                                            className="notif-empty-cta"
                                        >
                                            Return to Games
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NotificationsPage;
