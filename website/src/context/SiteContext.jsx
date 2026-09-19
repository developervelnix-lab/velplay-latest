import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '@/utils/constants';
import { usePWAInstall } from '../hooks/usePWAInstall';

const SiteContext = createContext();

export const SiteProvider = ({ children }) => {
  // 1. Get initial auth tokens from storage immediately
  const initialUserId = (typeof window !== 'undefined' && localStorage.getItem("account_id")) || null;
  const initialAuthToken = (typeof window !== 'undefined' && localStorage.getItem("auth_secret_key")) || null;

  // 2. Build initial state from defaults + local session + cached data
  const INITIAL_ACCOUNT_INFO = {
    service_site_name: "velplay365",
    service_site_logo: "/image.png",
    service_tagline: "PLAY · WIN · REPEAT",
    service_marquee: "Welcome to velplay365! Experience world-class betting and gaming. Sign up now to get exclusive bonuses and daily rewards. Minimum deposit ₹100. Fast 24/7 withdrawals.",
    service_app_download_url: "https://velplay365.com/velplay365.apk",
    service_support_url: "https://t.me/velplay365_support",
    account_id: initialUserId || "",
    account_username: initialUserId === "guest" ? "Guest" : (initialUserId ? "User" : ""),
    account_balance: "0.00",
    account_exposure: "0.00",
  };

  const DEFAULT_HERO_BANNERS = [

  ];

  const DEFAULT_PROMO_BANNERS = [

  ];

  // Try to load from cache on initialization to prevent flicker
  const [accountInfo, setAccountInfo] = useState(() => {
    const cached = typeof window !== 'undefined' ? localStorage.getItem("cached_site_info") : null;
    if (cached) {
      try { return { ...INITIAL_ACCOUNT_INFO, ...JSON.parse(cached) }; } catch (e) { return INITIAL_ACCOUNT_INFO; }
    }
    return INITIAL_ACCOUNT_INFO;
  });

  const [promoBanners, setPromoBanners] = useState(() => {
    const cached = typeof window !== 'undefined' ? localStorage.getItem("cached_promo_banners") : null;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.length > 0 && parsed[0].image_path?.includes('unsplash.com')) {
          return DEFAULT_PROMO_BANNERS;
        }
        return parsed;
      } catch (e) { return DEFAULT_PROMO_BANNERS; }
    }
    return DEFAULT_PROMO_BANNERS;
  });

  const [navbarCategories, setNavbarCategories] = useState([]);
  const [heroBanners, setHeroBanners] = useState(() => {
    const cached = typeof window !== 'undefined' ? localStorage.getItem("cached_hero_banners") : null;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // If cache is old unsplash, use new defaults
        if (parsed.length > 0 && parsed[0].image_path?.includes('unsplash.com')) {
          return DEFAULT_HERO_BANNERS;
        }
        return parsed;
      } catch (e) { return DEFAULT_HERO_BANNERS; }
    }
    return DEFAULT_HERO_BANNERS;
  });

  const [showLogin, setShowLoginState] = useState(false);
  const [showAppInstallModal, setShowAppInstallModal] = useState(false);
  const { isInstallable, isInstalled, installApp, platform } = usePWAInstall();

  const openAppInstall = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();
    if (isInstallable) {
      const res = await installApp();
      if (res) return;
    }
    setShowAppInstallModal(true);
  };
  const [showRegister, setShowRegisterState] = useState(false);
  const [isDuplicateTab, setIsDuplicateTab] = useState(false);
  const [notice, setNotice] = useState(null);
  const [unreadCount, setUnreadCount] = useState(() => {
    try {
      const history = JSON.parse(localStorage.getItem("notifications_history") || "[]");
      const ack = JSON.parse(localStorage.getItem("acknowledged_notices") || "[]");
      return history.filter(n => !n.read && !ack.includes(n.id)).length;
    } catch (e) {
      return 0;
    }
  });

  const markAllNotificationsRead = () => {
    try {
      const history = JSON.parse(localStorage.getItem("notifications_history") || "[]");
      const updated = history.map(n => ({ ...n, read: true }));
      localStorage.setItem("notifications_history", JSON.stringify(updated));
      const ids = updated.map(n => n.id);
      localStorage.setItem("acknowledged_notices", JSON.stringify(ids));
      setUnreadCount(0);
    } catch (e) {}
  };
  const clearAllNotifications = () => {
    try {
      const history = JSON.parse(localStorage.getItem("notifications_history") || "[]");
      const deleted = JSON.parse(localStorage.getItem("deleted_notices") || "[]");
      const ack = JSON.parse(localStorage.getItem("acknowledged_notices") || "[]");

      history.forEach(item => {
        if (item.id && !deleted.includes(item.id)) deleted.push(item.id);
        if (item.id && !ack.includes(item.id)) ack.push(item.id);
      });

      localStorage.setItem("cleared_notices_time", String(Date.now()));
      localStorage.setItem("deleted_notices", JSON.stringify(deleted));
      localStorage.setItem("acknowledged_notices", JSON.stringify(ack));
      localStorage.setItem("notifications_history", "[]");
      setUnreadCount(0);
      setNotice(null);
    } catch (e) {}
  };

  const deleteSingleNotification = (id) => {
    try {
      const history = JSON.parse(localStorage.getItem("notifications_history") || "[]");
      const deleted = JSON.parse(localStorage.getItem("deleted_notices") || "[]");
      const ack = JSON.parse(localStorage.getItem("acknowledged_notices") || "[]");

      if (id && !deleted.includes(id)) deleted.push(id);
      if (id && !ack.includes(id)) ack.push(id);

      const filtered = history.filter(item => item.id !== id);
      localStorage.setItem("deleted_notices", JSON.stringify(deleted));
      localStorage.setItem("acknowledged_notices", JSON.stringify(ack));
      localStorage.setItem("notifications_history", JSON.stringify(filtered));
      setUnreadCount(filtered.filter(n => !n.read).length);
    } catch (e) {}
  };
  const [loading, setLoading] = useState(true);
  const [isWindowLoaded, setIsWindowLoaded] = useState(false);

  useEffect(() => {
    const handleLoad = () => {
      setTimeout(() => {
        setIsWindowLoaded(true);
      }, 500);
    };

    if (typeof document !== 'undefined' && document.readyState === 'complete') {
      handleLoad();
    } else if (typeof window !== 'undefined') {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  const isAppReady = !loading && isWindowLoaded;

  // Multi-Tab Session Guard Effect
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!sessionStorage.getItem('tab_session_id')) {
      sessionStorage.setItem('tab_session_id', 'tab_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now());
    }
    const currentTabId = sessionStorage.getItem('tab_session_id');

    let channel = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('velplay_tab_session_channel');
      }
    } catch (e) {}

    const checkTabStatus = () => {
      const loggedInUser = localStorage.getItem('account_id');
      const isGuest = !loggedInUser || loggedInUser === 'guest';

      if (isGuest) {
        setIsDuplicateTab(false);
        return;
      }

      const primaryTabId = localStorage.getItem('primary_active_tab_id');
      const primaryUser = localStorage.getItem('primary_active_user_id');

      if (!primaryTabId || primaryUser !== loggedInUser) {
        // First tab to check becomes primary
        localStorage.setItem('primary_active_tab_id', currentTabId);
        localStorage.setItem('primary_active_user_id', loggedInUser);
        setIsDuplicateTab(false);
      } else if (primaryTabId !== currentTabId) {
        // Another tab owns the active session!
        setIsDuplicateTab(true);
      } else {
        setIsDuplicateTab(false);
      }
    };

    checkTabStatus();

    const handleChannelMessage = (event) => {
      const { type, primaryTabId, accountId } = event.data || {};
      const currentAccountId = localStorage.getItem('account_id');

      if (type === 'CLAIM_PRIMARY_EVENT' || type === 'LOGIN_EVENT') {
        const loggedInUser = localStorage.getItem('account_id');
        if (loggedInUser && loggedInUser !== 'guest') {
          if (primaryTabId === currentTabId) {
            setIsDuplicateTab(false);
          } else {
            setIsDuplicateTab(true);
          }
        }
      } else if (type === 'LOGOUT_EVENT') {
        localStorage.removeItem('primary_active_tab_id');
        localStorage.removeItem('primary_active_user_id');
        setIsDuplicateTab(false);
      }
    };

    if (channel) {
      channel.onmessage = handleChannelMessage;
    }

    const handleStorageChange = (e) => {
      if (e.key === 'account_id' || e.key === 'primary_active_tab_id') {
        checkTabStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', checkTabStatus);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', checkTabStatus);
    };
  }, [accountInfo?.account_id]);

  const claimPrimaryTab = () => {
    if (typeof window === 'undefined') return;
    const currentTabId = sessionStorage.getItem('tab_session_id');
    const loggedInUser = localStorage.getItem('account_id');
    if (!loggedInUser || loggedInUser === 'guest') return;

    localStorage.setItem('primary_active_tab_id', currentTabId);
    localStorage.setItem('primary_active_user_id', loggedInUser);
    setIsDuplicateTab(false);

    try {
      const bc = new BroadcastChannel('velplay_tab_session_channel');
      bc.postMessage({ type: 'CLAIM_PRIMARY_EVENT', primaryTabId: currentTabId, accountId: loggedInUser });
      bc.close();
    } catch (e) {}
  };

  const setShowLogin = (value) => {
    setShowLoginState((current) => {
      const next = typeof value === "function" ? value(current) : value;
      if (next) setShowRegisterState(false);
      return next;
    });
  };

  const setShowRegister = (value) => {
    setShowRegisterState((current) => {
      const next = typeof value === "function" ? value(current) : value;
      if (next) setShowLoginState(false);
      return next;
    });
  };

  const activateDemoMode = () => {
    localStorage.setItem("auth_secret_key", "guest");
    localStorage.setItem("account_id", "guest");
    fetchSiteData();
    window.dispatchEvent(new Event('site-data-refresh'));
  };

  const logout = () => {
    console.warn("Logging out user...");
    localStorage.removeItem("auth_secret_key");
    localStorage.removeItem("account_id");
    localStorage.removeItem("cached_site_info");
    localStorage.removeItem("primary_active_tab_id");
    localStorage.removeItem("primary_active_user_id");
    try { const bc = new BroadcastChannel("velplay_tab_session_channel"); bc.postMessage({ type: "LOGOUT_EVENT" }); bc.close(); } catch(e){}
    setIsDuplicateTab(false);
    setAccountInfo(INITIAL_ACCOUNT_INFO);
    setShowLogin(true);
    window.dispatchEvent(new Event('site-data-refresh'));
  };

  const fetchSiteData = async () => {
    const userId = localStorage.getItem("account_id") || "guest";
    const authSecretKey = localStorage.getItem("auth_secret_key") || "guest";

    if (userId !== "guest" && authSecretKey === "guest") {
      // Don't re-trigger logout here (already handled by session_expired)
      return;
    }

    let fetchUrl = "";
    try {
      fetchUrl = `${API_URL}?Route=route-account-info&AuthToken=${encodeURIComponent(authSecretKey)}&USER_ID=${encodeURIComponent(userId)}&_t=${Date.now()}`;

      const response = await fetch(fetchUrl, {
        method: "GET",
        mode: "cors",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Route: "route-account-info",
          AuthToken: authSecretKey,
        },
      });

      const result = await response.json();
      console.log("✅ [SiteContext] API Response:", result);

      if (result.status_code === "session_expired") {
        // Set notice BEFORE logout so the modal can display it
        setNotice({ id: "session_expired_" + Date.now(), title: "Session Expired", message: result.message || "You have been logged in from another device. Your current session has been terminated." });
        logout();
        return;
      }

      if (result.status_code === "success" && result.data && result.data[0]) {
        const serverData = result.data[0];
        const isLoggedIn = userId !== "guest" && authSecretKey !== "guest";
        const serverReturnedGuest = !serverData.account_balance ||
          (serverData.account_username === "Guest" && parseFloat(serverData.account_balance) === 0);

        setAccountInfo(prev => {
          const cleanServerData = {};
          Object.keys(serverData).forEach(key => {
            // Allow empty strings for branding fields to enable clearing them via backend
            if (serverData[key] !== null && serverData[key] !== undefined) {
              cleanServerData[key] = serverData[key];
            }
          });

          const mergedInfo = {
            ...prev,
            ...cleanServerData,
          };

          let finalInfo = mergedInfo;
          if (isLoggedIn && serverReturnedGuest) {
            finalInfo = {
              ...mergedInfo,
              account_id: prev.account_id || userId,
              account_username: (prev.account_username && prev.account_username !== "Guest") ? prev.account_username : "User",
              account_balance: prev.account_balance || "0.00",
            };
          }

          localStorage.setItem("cached_site_info", JSON.stringify(finalInfo));
          return finalInfo;
        });

        // Merge Backend Banners with Frontend Defaults
        const BASE_URL = API_URL.replace("/api", "");

        // Process Hero Banners (slideShowList)
        const backendHero = Array.isArray(result.slideShowList) ? result.slideShowList.map(b => ({
          image_path: b.slider_img,
          action_url: b.slider_action || "#"
        })) : [];

        // Process Promo Banners (promo_banners)
        const backendPromo = Array.isArray(result.promo_banners) ? result.promo_banners.map(b => ({
          image_path: b.image,
          action_url: b.action || "#"
        })) : [];

        // Combine: Backend first, then Frontend defaults
        // This ensures admin-uploaded banners appear first
        const combinedHero = [...backendHero, ...DEFAULT_HERO_BANNERS].filter((v, i, a) => a.findIndex(t => t.image_path === v.image_path) === i);
        const combinedPromo = [...backendPromo, ...DEFAULT_PROMO_BANNERS].filter((v, i, a) => a.findIndex(t => t.image_path === v.image_path) === i);

        setHeroBanners(combinedHero);
        setPromoBanners(combinedPromo);

        localStorage.setItem("cached_hero_banners", JSON.stringify(combinedHero));
        localStorage.setItem("cached_promo_banners", JSON.stringify(combinedPromo));

        if (result.navbarCategories && Array.isArray(result.navbarCategories)) {
          setNavbarCategories(result.navbarCategories);
        }

        // Handle System Notices
                if (result.noticeArr && result.noticeArr.length >= 2) {
          let nTitle = result.noticeArr[0] || "";
          let nMsg = result.noticeArr[1] || "";
          
          const uInfo = (result.data && result.data[0]) ? result.data[0] : {};
          const replaceDynamicTags = (txt) => {
            if (!txt) return txt;
            return txt
              .replace(/@username/gi, uInfo.account_username || uInfo.account_full_name || 'Player')
              .replace(/@name/gi, uInfo.account_full_name || uInfo.account_username || 'Player')
              .replace(/@fullname/gi, uInfo.account_full_name || uInfo.account_username || 'Player')
              .replace(/@userid/gi, uInfo.account_id || userId || '')
              .replace(/@id/gi, uInfo.account_id || userId || '')
              .replace(/@uid/gi, uInfo.account_id || userId || '')
              .replace(/@balance/gi, '?' + (uInfo.account_balance || '0.00'))
              .replace(/@phone/gi, uInfo.account_mobile || uInfo.account_mobile_num || '')
              .replace(/@mobile/gi, uInfo.account_mobile || uInfo.account_mobile_num || '')
              .replace(/@mail/gi, uInfo.account_email || '')
              .replace(/@email/gi, uInfo.account_email || '')
              .replace(/@level/gi, uInfo.account_level || '1');
          };
          nTitle = replaceDynamicTags(nTitle);
          nMsg = replaceDynamicTags(nMsg);
                              const bcastId = result.noticeId || "";
          let nHash = bcastId ? ("bc_" + bcastId) : "";
          if (!nHash) {
            try {
              nHash = btoa(unescape(encodeURIComponent(nTitle + nMsg))).substring(0, 32);
            } catch (e) {
              nHash = "hash_" + String(nTitle + nMsg).length + "_" + Date.now();
            }
          }

          const deletedNotices = JSON.parse(localStorage.getItem("deleted_notices") || "[]");
          const isDeleted = deletedNotices.includes(nHash) || (bcastId && (deletedNotices.includes("server_bc_" + bcastId) || deletedNotices.includes("bc_" + bcastId)));

          if (!isDeleted) {
            // Sync with notification history
            try {
              const history = JSON.parse(localStorage.getItem("notifications_history") || "[]");
              const ack = JSON.parse(localStorage.getItem("acknowledged_notices") || "[]");
              const isRead = ack.includes(nHash);
              const exists = history.find(n => n.id === nHash);
              if (!exists) {
                history.unshift({
                  id: nHash,
                  title: nTitle,
                  message: nMsg,
                  time: new Date().toISOString(),
                  read: isRead
                });
                localStorage.setItem("notifications_history", JSON.stringify(history.slice(0, 50)));
              }
              const unread = history.filter(n => !n.read && !ack.includes(n.id)).length;
              setUnreadCount(unread);
            } catch (e) {}

            const acknowledgedNotices = JSON.parse(localStorage.getItem("acknowledged_notices") || "[]");
            const shownToasts = JSON.parse(localStorage.getItem("shown_toasts") || "[]");
            const isRejectionNotice = nTitle.toLowerCase().includes("bet rejected");
            if (isRejectionNotice || (!acknowledgedNotices.includes(nHash) && !shownToasts.includes(nHash))) {
              setNotice({ id: nHash, title: nTitle, message: nMsg });
            }
          }
        }
      }
    } catch (error) {
      console.error("❌ [SiteContext] API Fetch Failed for URL:", fetchUrl);
      console.error("Error details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteData();

    const interval = setInterval(() => {
      fetchSiteData();
    }, 5000);

    const handleStorageChange = (e) => {
      if (e.key === "auth_secret_key" || e.key === "account_id") {
        fetchSiteData();
      }
    };

    const handleCustomRefresh = () => {
      fetchSiteData();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("site-data-refresh", handleCustomRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("site-data-refresh", handleCustomRefresh);
    };
  }, []);

  return (
    <SiteContext.Provider value={{
      accountInfo,
      promoBanners,
      heroBanners,
      navbarCategories,
      loading,
      isAppReady,
      notice,
      setNotice,
      refreshSiteData: fetchSiteData,
      logout,
      activateDemoMode,
      showLogin,
      setShowLogin,
      showRegister,
      setShowRegister,
      isDuplicateTab,
      claimPrimaryTab,
      showAppInstallModal,
      setShowAppInstallModal,
      openAppInstall,
      isInstallable,
      isInstalled,
      installApp,
      platform
    }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error("useSite must be used within a SiteProvider");
  }
  return context;
};




