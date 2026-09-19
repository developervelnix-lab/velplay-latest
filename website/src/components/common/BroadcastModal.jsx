import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';
import { useColors } from '../../hooks/useColors';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaTimes, FaArrowRight } from 'react-icons/fa';

const BroadcastModal = () => {
    const navigate = useNavigate();
    const { notice, setNotice } = useSite();
    const COLORS = useColors();

    useEffect(() => {
        if (notice) {
            const timer = setTimeout(() => {
                dismissToast();
            }, 10000); // 10 seconds
            return () => clearTimeout(timer);
        }
    }, [notice?.id, notice?.message]);

    const dismissToast = async (e) => {
        if (e && e.stopPropagation) {
            e.stopPropagation();
        }
        if (!notice) return;
        
        const bId = notice.id;
        
        // Hide immediately to improve UX
        setNotice(null);

        if (!bId) {
            return;
        }
        
        // 1. Mark Locally
        const acknowledgedNotices = JSON.parse(localStorage.getItem("acknowledged_notices") || "[]");
        if (!acknowledgedNotices.includes(bId)) {
            acknowledgedNotices.push(bId);
            localStorage.setItem("acknowledged_notices", JSON.stringify(acknowledgedNotices));
        }

        // 2. Mark on Server
        try {
            const userId = localStorage.getItem("account_id");
            const authSecretKey = localStorage.getItem("auth_secret_key");
            const formData = new FormData();
            formData.append("broadcast_id", bId);
            formData.append("user_id", userId);

            const { API_URL } = await import('../../utils/constants');
            
            fetch(API_URL, {
                method: "POST",
                body: formData,
                headers: {
                    "AuthToken": authSecretKey,
                    "Route": "route-mark-broadcast-seen"
                }
            }).catch(e => console.error("Fetch error:", e));
        } catch (e) {
            console.error("Failed to mark broadcast as seen on server:", e);
        }
    };

    const handleToastClick = () => {
        dismissToast();
        navigate("/notifications");
    };

    const userId = localStorage.getItem("account_id");
    // Allow session_expired notices to show even after logout
    const isSessionExpired = notice?.id?.startsWith("session_expired_");
    if (!notice || (!isSessionExpired && (!userId || userId === "guest"))) return null;

    // Dynamic color coding based on title
    const nTitle = (notice.title || "").toLowerCase();
    const isError = nTitle.includes("rejected") || nTitle.includes("error") || nTitle.includes("failed") || nTitle.includes("limit") || nTitle.includes("expired") || nTitle.includes("session");
    const isSuccess = nTitle.includes("won") || nTitle.includes("bonus") || nTitle.includes("success") || nTitle.includes("congratulations");
    
    const statusColor = isError ? "#ff4d4d" : (isSuccess ? "#00ff88" : (COLORS.brand || "#fbbf24"));
    const StatusIcon = isError ? FaTimes : FaBell;

    return (
        <AnimatePresence>
            <div className="fixed top-20 right-4 z-[9999] w-full max-w-[350px]">
                <motion.div 
                    initial={{ opacity: 0, x: 100, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 100, scale: 0.8 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={handleToastClick}
                    className="overflow-hidden rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.65)] border-2 backdrop-blur-2xl cursor-pointer group transition-all"
                    style={{ 
                        backgroundColor: 'rgba(11, 16, 28, 0.96)',
                        borderColor: statusColor 
                    }}
                >
                    <div className="p-4 flex gap-3.5 relative">
                        {/* Status specific radial glow */}
                        <div 
                            className="absolute inset-0 opacity-25 pointer-events-none"
                            style={{ 
                                background: `radial-gradient(circle at 15% 50%, ${statusColor}55 0%, transparent 70%)` 
                            }}
                        ></div>

                        <div 
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 relative z-10 shadow-lg"
                            style={{ 
                                backgroundColor: statusColor, 
                                color: isError || isSuccess ? '#fff' : '#000',
                                boxShadow: `0 0 18px ${statusColor}44`
                            }}
                        >
                            <StatusIcon className={isError ? "animate-pulse" : "animate-bounce-subtle"} />
                        </div>
                        
                        <div className="flex-grow min-w-0 relative z-10 flex flex-col justify-center">
                            <div className="flex justify-between items-start mb-1">
                                <h3 
                                    className="text-[13px] font-black uppercase tracking-wider drop-shadow-sm truncate pr-6"
                                    style={{ color: statusColor }}
                                >
                                    {notice.title}
                                </h3>
                                <button 
                                    onClick={dismissToast}
                                    className="text-white/40 hover:text-white transition-colors absolute top-0 right-0 p-1"
                                    title="Close"
                                >
                                    <FaTimes size={13} />
                                </button>
                            </div>
                            <p className="text-[11.5px] text-white/90 leading-snug font-semibold drop-shadow-sm line-clamp-2">
                                {notice.message}
                            </p>
                            <div className="mt-1.5 flex items-center gap-1 text-[9.5px] font-black uppercase tracking-wider text-amber-400 group-hover:underline">
                                <span>Click to view details</span>
                                <FaArrowRight size={8} />
                            </div>
                        </div>
                    </div>
                    
                    {/* Dynamic Progress Bar */}
                    <div className="h-1 w-full bg-white/10">
                        <motion.div 
                            key={notice.id || notice.message}
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 10, ease: "linear" }}
                            className="h-full"
                            style={{ backgroundColor: statusColor }}
                        />
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BroadcastModal;
