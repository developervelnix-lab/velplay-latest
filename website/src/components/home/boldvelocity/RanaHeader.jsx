import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSite } from "../../../context/SiteContext";
import { URL as BASE_URL } from "../../../utils/constants";
import { FaBars, FaPlus, FaArrowUp, FaDownload, FaBell, FaGem, FaGift, FaHeadset, FaHome, FaMoon, FaSun, FaTimes, FaUserCircle, FaSearch } from "react-icons/fa";
import sportImage from "../../navbar/images/sport.webp";
import cusinoImage from "../../navbar/images/cusino.webp";
import { useTheme } from "../../../context/ThemeContext";
import { usePWAInstall } from "../../../hooks/usePWAInstall";

const CATEGORY_ICONS = {
  'lottery': '🎟️',
  'crash games': '🚀',
  'crash-games': '🚀',
  'roulette': '🎡',
  'blackjack': '🃏',
  'baccarat': '💎',
  'dragon tiger': '🐯',
  'dragon-tiger': '🐯',
  'teen patti': '🎴',
  'teen-patti': '🎴',
  'poker': '♠️',
  'game shows': '📺',
  'game-shows': '📺',
  'andar bahar': '🎴',
  'andar-bahar': '🎴',
  'cockfight': '🐓',
  'cock fight': '🐓',
  'slots': '🎰',
  'casino': '🎲',
  'fishing': '🎣',
  'turbo': '⚡',
  'live': '🔴',
  'table': '♠️'
};

const getCategoryIcon = (catName) => {
  const clean = (catName || '').toLowerCase().trim();
  return CATEGORY_ICONS[clean] || CATEGORY_ICONS[clean.replace(/\s+/g, '-')] || '🎮';
};
const RanaHeader = () => {
  const { accountInfo, activateDemoMode, setShowLogin, setShowRegister, openAppInstall, isAppReady, navbarCategories, unreadCount, markAllNotificationsRead } = useSite();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isInstalled, isInstallable, installApp, platform } = usePWAInstall();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobilePanel, setMobilePanel] = useState(null);
  const isLoggedIn = !!(accountInfo?.account_id && accountInfo.account_id !== "guest" && localStorage.getItem("auth_secret_key") && localStorage.getItem("auth_secret_key") !== "guest");
  const toNumber = (value) => Number.parseFloat(value || 0) || 0;
  const remainingWager = toNumber(accountInfo?.tbl_requiredplay_balance);
  const casinoBonus = Math.max(toNumber(accountInfo?.tbl_bonus_balance), toNumber(accountInfo?.account_casino_bonus));
  const sportsBonus = Math.max(toNumber(accountInfo?.tbl_sports_bonus), toNumber(accountInfo?.account_sports_bonus));
  const activeBonus = casinoBonus + sportsBonus;
  const isWagering = isLoggedIn && (remainingWager > 0.1 || activeBonus > 0.1);
  const wagerRequired = toNumber(accountInfo?.wagering_required);
  const wagerCompleted = toNumber(accountInfo?.wagering_completed);
  const wagerPct = isWagering && wagerRequired > 0
    ? Math.min(100, Math.round((wagerCompleted / wagerRequired) * 100))
    : 0;
  const wagerStatusText = wagerRequired > 0
    ? `₹${wagerCompleted.toLocaleString("en-IN")} / ₹${wagerRequired.toLocaleString("en-IN")}`
    : `₹${remainingWager.toLocaleString("en-IN")} left`;
  const getAccountValue = (...keys) => {
    for (const key of keys) {
      const value = accountInfo?.[key];
      if (value !== undefined && value !== null && String(value).trim() !== "") return value;
    }
    return "Not added";
  };
  const openProfileLink = (path) => {
    setProfileOpen(false);
    navigate(path);
  };
  const handleGetApp = (event) => { openAppInstall(event); };
  const profileDetails = [
    { label: "User ID", value: accountInfo?.account_id || localStorage.getItem("account_id") || "Not added" },
    { label: "Username", value: getAccountValue("account_username", "username", "user_name") },
    { label: "Email", value: getAccountValue("account_email", "email", "user_email", "account_mail") },
    { label: "Mobile", value: getAccountValue("account_mobile", "mobile", "user_mobile", "account_phone", "phone") },
  ];
  const mobileProfileDetails = [
    { label: "Username", value: getAccountValue("account_username", "username", "user_name") },
    { label: "User ID", value: accountInfo?.account_id || localStorage.getItem("account_id") || "Not added" },
    { label: "Mobile", value: getAccountValue("account_mobile", "mobile", "user_mobile", "account_phone", "phone") },
    { label: "Email", value: getAccountValue("account_email", "email", "user_email", "account_mail") },
  ];
  const profileLinks = [
    { label: "My Tickets", path: "/support?view=history" },
    { label: "Change Password", path: "/change-password" },
    { label: "Refer & Earn", path: "/inviteandearn" },
    { label: "Transaction", path: "/transaction" },
    { label: "Bet History", path: "/betting-profit-loss" },
  ];
  const mobileQuickLinks = [
    { label: "My Account", action: () => setMobilePanel("account") },
    { label: "Deposit", path: "/deposit" },
    { label: "Withdrawal", path: "/withdraw" },
    { label: "Bet History", path: "/betting-profit-loss" },
    { label: "Promotions", path: "/promotion" },
    { label: "Bonus", path: "/bonus" },
    { label: "Install App", action: (e) => { setMobilePanel(null); openAppInstall(e); } },
    { label: "Refer a Friend", path: "/inviteandearn" },
    { label: "Rules", path: "/rules-regulation" },
    { label: "Exclusion", path: "/exclusion" },
    { label: "Privacy", path: "/privacy-policy" },
    { label: "Responsible", path: "/responsible-gambling" },
    { label: "Support", path: "/support" },
  ];
  const latestNewsItems = [
    "New Live Casino Games launching in 7 days",
    "Mega Slots Tournament starts in 10 days",
    "Weekly Cashback update version 2.0 releasing soon",
    "New Bonus System upgrade in 15 days",
  ];
  const isHomeActive = location.pathname === "/" && !location.hash;
  const isHashActive = (hash) => location.pathname === "/" && location.hash === hash;
  const isPathActive = (path) => location.pathname === path;
  const bottomLinks = [
    { label: "Casino", icon: <img src={cusinoImage} alt="Casino" className="bottom-nav-img" />, path: "/casino" },
    { label: "Sports", icon: <img src={sportImage} alt="Sports" className="bottom-nav-img" />, path: "/#live" },
    { label: "Home", icon: <FaHome />, path: "/", isHome: true },
    { label: "Promos", icon: <FaGift />, path: "/promotion" },
    { label: "Support", icon: <FaHeadset />, path: "/support" },
  ];
  const navClass = (active) => (active ? "active" : undefined);
  const catClass = (path) => `cat-item${isPathActive(path) ? " active" : ""}`;
  const goCategory = (event, path) => {
    event.preventDefault();
    navigate(path);
  };
  const scrollToHomeSection = (hash) => {
    const section = document.querySelector(hash);
    if (!section) return;

    const contentScroller = section.closest(".main-content");
    if (contentScroller && contentScroller.scrollHeight > contentScroller.clientHeight) {
      const sectionTop = section.getBoundingClientRect().top - contentScroller.getBoundingClientRect().top + contentScroller.scrollTop;
      contentScroller.scrollTo({
        top: Math.max(sectionTop - 8, 0),
        behavior: "smooth",
      });
      return;
    }

    const headerHeight = Number.parseFloat(
      window.getComputedStyle(document.documentElement).getPropertyValue("--rana-header-height")
    ) || document.querySelector(".rana-header-shell")?.getBoundingClientRect().height || 132;

    window.scrollTo({
      top: Math.max(section.getBoundingClientRect().top + window.scrollY - headerHeight - 8, 0),
      behavior: "smooth",
    });
  };
  const scrollHomeToTop = () => {
    const contentScroller = document.querySelector(".main-content");
    if (contentScroller && contentScroller.scrollHeight > contentScroller.clientHeight) {
      contentScroller.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const goHomeTop = (event) => {
    event.preventDefault();
    navigate("/");
    window.setTimeout(scrollHomeToTop, 80);
  };
  const goHomeSection = (event, hash) => {
    event.preventDefault();
    navigate(`/${hash}`);
    window.setTimeout(() => {
      scrollToHomeSection(hash);
    }, 80);
  };
  const isMobileViewport = () => window.matchMedia?.("(max-width: 820px)").matches;
  const formatBalance = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const openMobilePanel = (panel) => {
    setMenuOpen(false);
    setProfileOpen(false);
    setMobilePanel(panel);
  };
  const closeMobilePanel = () => setMobilePanel(null);
  const handleProfileClick = (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (isMobileViewport()) {
      openMobilePanel("account");
      return;
    }

    setProfileOpen((prev) => !prev);
  };
  const handleMobileMenuClick = (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (isMobileViewport()) {
      openMobilePanel("menu");
      return;
    }

    setMenuOpen((prev) => !prev);
  };
  const handleMobileNavigate = (path) => {
    closeMobilePanel();
    if (path && path !== "#") navigate(path);
  };
  const isBottomActive = (path) => {
    if (path === "/#live") return location.pathname === "/" && location.hash === "#live";
    if (path === "/") return location.pathname === "/" && !location.hash;
    return location.pathname === path;
  };

  useEffect(() => {
    if (mobilePanel) {
      document.body.classList.add("mobile-home-menu-open");
    } else {
      document.body.classList.remove("mobile-home-menu-open");
    }

    return () => document.body.classList.remove("mobile-home-menu-open");
  }, [mobilePanel]);

  // Logo URL Helper - resolve backend relative paths
  const getSafeLogoUrl = (logoPath) => {
    if (!logoPath || logoPath === "/favicon.png" || logoPath.includes("favicon.png")) return "/image.png";
    const cleanPath = logoPath.replace(/\\/g, "/");
    if (cleanPath.startsWith("http") || cleanPath.startsWith("data:")) return cleanPath;
    const base = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
    const path = cleanPath.startsWith("/") ? cleanPath : "/" + cleanPath;
    return `${base}${path}`;
  };

  return (
    <div className="rana-header-shell">
      {/* TOP BAR */}
      <div className="top-bar">
        <span
          style={{
            background: 'linear-gradient(90deg, #050812 0%, #081224 100%)',
            color: '#ffffff',
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '10px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          Latest News
        </span>
        <div className="marquee-wrap">
          <div className="marquee-inner">
            {latestNewsItems.map((item, index) => (
              <React.Fragment key={index}>
                <span><span className="win">{item}</span></span>
                <span>|</span>
              </React.Fragment>
            ))}
            {latestNewsItems.map((item, index) => (
              <React.Fragment key={`dup-${index}`}>
                <span><span className="win">{item}</span></span>
                <span>|</span>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="top-bar-right">
          <button
            type="button"
            onClick={isAppReady ? handleGetApp : undefined}
            disabled={!isAppReady}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              font: 'inherit',
              cursor: isAppReady ? 'pointer' : 'not-allowed',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              filter: isAppReady ? 'none' : 'blur(3px)',
              opacity: isAppReady ? 1 : 0.25,
              pointerEvents: isAppReady ? 'auto' : 'none',
              userSelect: 'none',
              transition: 'filter 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <FaDownload size={11} /> App
          </button>
          <a href="#">🇮🇳 EN</a>
          <Link to="/support">Help</Link>
        </div>
      </div>

      {/* HEADER */}
      <header>
        <div className="header-inner">
          <Link to="/" className="logo">
            <img
              src={getSafeLogoUrl(accountInfo?.service_site_logo)}
              className="logo-img"
              alt={accountInfo?.service_site_name || "Logo"}
              loading="eager" fetchpriority="high" decoding="async" onError={(e) => { e.target.src = "/image.png"; }}
            />
          </Link>
          <nav>
            <Link to="/" className={navClass(isHomeActive)} onClick={goHomeTop}>🏠 Home</Link>
            <Link to="/#live" className={navClass(isHashActive("#live"))} onClick={(e) => goHomeSection(e, "#live")}>⚽ Sports</Link>
            <Link to="/casino" className={navClass(isPathActive("/casino"))}>🎰 Casino</Link>
            <Link to="/#slots" className={navClass(isHashActive("#slots"))} onClick={(e) => goHomeSection(e, "#slots")}>🎰 Slots</Link>
            <Link to="/#fantasy-games" className={navClass(isHashActive("#fantasy-games"))} onClick={(e) => goHomeSection(e, "#fantasy-games")}>🎮 Fantasy Games</Link>
            <Link to="/promotion" className={navClass(isPathActive("/promotion"))}>💰 Promotions</Link>
          </nav>
          <div className="mobile-header-actions">
            {!isLoggedIn ? (
              <div className="mobile-auth-actions">
                {localStorage.getItem("auth_secret_key") === "guest" && (
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', marginRight: '4px' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
                    DEMO
                  </div>
                )}
                <button type="button" onClick={() => setShowLogin(true)}>Login</button>
                <button type="button" onClick={() => setShowRegister(true)}>Sign Up</button>
              </div>
            ) : (
                            <div className="mobile-wallet-actions">
                <button 
                  type="button" 
                  className="mobile-deposit-btn" 
                  onClick={() => navigate("/deposit")} 
                  aria-label="Deposit" 
                  title="Deposit (+)"
                >
                  <FaPlus size={12} />
                </button>
                <button 
                  type="button" 
                  className="mobile-withdraw-btn" 
                  onClick={() => navigate("/withdraw")} 
                  aria-label="Withdraw" 
                  title="Withdraw (?)"
                >
                  <FaArrowUp size={12} />
                </button>
                <button
                  type="button"
                  className="mobile-notif-btn relative"
                  onClick={() => navigate("/notifications")}
                  aria-label="Notifications"
                  title="Notifications"
                >
                  <FaBell size={13} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black min-w-[15px] h-[15px] px-0.5 rounded-full flex items-center justify-center shadow-md border border-[#0b101b] animate-pulse">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  className="mobile-search-btn"
                  onClick={() => navigate("/search")}
                  aria-label="Search Games"
                  title="Search Games"
                >
                  <FaSearch />
                </button>
                <button
                  type="button"
                  className="mobile-profile-open"
                  onTouchEnd={handleProfileClick}
                  onPointerUp={handleProfileClick}
                  onClick={handleProfileClick}
                  aria-label="Open profile"
                >
                  <FaUserCircle />
                </button>
                {profileOpen && (
                  <div className="mobile-header-popover mobile-profile-popover">
                    <div className="mobile-profile-popover-head">
                      <strong>{accountInfo?.account_username || "User"}</strong>
                      <span>My Profile</span>
                    </div>
                    {profileLinks.map((item) => (
                      <button type="button" key={item.path} onClick={() => openProfileLink(item.path)}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button
              type="button"
              className="mobile-header-menu-btn"
              onTouchEnd={handleMobileMenuClick}
              onPointerUp={handleMobileMenuClick}
              onClick={handleMobileMenuClick}
              aria-label="Open quick links"
            >
              <FaBars />
              <span>Menu</span>
            </button>
            {menuOpen && (
              <div className="mobile-header-popover">
                <button type="button" onClick={() => { setMenuOpen(false); navigate("/"); }}>Home</button>
                <button type="button" onClick={() => { setMenuOpen(false); navigate("/casino"); }}>Casino</button>
                <button type="button" onClick={() => { setMenuOpen(false); navigate("/promotion"); }}>Promotions</button>
                <button type="button" onClick={() => { setMenuOpen(false); navigate("/support"); }}>Support</button>
              </div>
            )}
          </div>
          <div className="header-cta">
            {isLoggedIn ? (
              <div className="header-cta-group">
                <div className="header-primary-actions">
                  <button className="btn btn-outline" onClick={() => navigate("/deposit")}>Deposit</button>
                  <button className="btn btn-brand" onClick={() => navigate("/withdraw")}>Withdraw</button>
                  {isWagering && (
                    <button
                      type="button"
                      className="header-wager-meter"
                      onClick={() => navigate("/active-bonus")}
                      title="View wagering progress"
                    >
                      <span className="header-wager-copy">
                        <span>Wagering</span>
                        <strong>{wagerPct}%</strong>
                      </span>
                      <span className="header-wager-bar">
                        <i style={{ width: `${wagerPct}%` }} />
                      </span>
                      <span className="header-wager-meta">
                        <FaGift />
                        {wagerStatusText}
                      </span>
                    </button>
                  )}
                </div>
                <div className="header-utility-actions">
                  {/*
                  <button
                    type="button"
                    className="header-icon-btn"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    title="Toggle theme"
                  >
                    {theme === "dark" ? <FaSun /> : <FaMoon />}
                  </button>
                  */}
                  <button
                    type="button"
                    className="header-icon-btn"
                    onClick={() => navigate("/search")}
                    aria-label="Search Games"
                    title="Search Games"
                  >
                    <FaSearch />
                  </button>
                                    <div className="header-profile-wrap relative">
                    <button
                      type="button"
                      className="header-icon-btn relative"
                      onClick={() => {
                        setNotifOpen((prev) => {
                          const next = !prev;
                          if (next && markAllNotificationsRead) markAllNotificationsRead();
                          return next;
                        });
                        setProfileOpen(false);
                      }}
                      aria-label="Notifications"
                      title="Notifications"
                    >
                      <FaBell />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center shadow-lg border border-[#0b101b] animate-pulse">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </button>

                    {notifOpen && (
                      <div className="header-mini-popover header-profile-popover !w-80 md:!w-96 !max-h-[85vh] !overflow-hidden z-[300]">
                        <button type="button" className="header-mini-close" onClick={() => setNotifOpen(false)} aria-label="Close notifications menu">
                          <FaTimes />
                        </button>
                        
                        <div className="header-profile-card-head border-b border-white/10 pb-3 mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-brand/20 text-brand flex items-center justify-center text-sm">
                              <FaBell />
                            </div>
                            <div>
                              <div className="header-mini-name text-xs font-black uppercase tracking-wider text-white">Notifications</div>
                              <div className="text-[10px] text-gray-400 font-bold">Activity & Announcements</div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setNotifOpen(false);
                              navigate("/notifications");
                            }}
                            className="text-[10px] font-black text-brand hover:underline uppercase tracking-wider pr-4"
                          >
                            View Hub ?
                          </button>
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                          {(() => {
                            let list = [];
                            try {
                              list = JSON.parse(localStorage.getItem("notifications_history") || "[]");
                            } catch(e) {}

                            const replaceTags = (txt) => {
                              if (!txt) return txt;
                              const u = accountInfo || {};
                              return txt
                                .replace(/@username/gi, u.account_username || u.account_full_name || 'Player')
                                .replace(/@name/gi, u.account_full_name || u.account_username || 'Player')
                                .replace(/@fullname/gi, u.account_full_name || u.account_username || 'Player')
                                .replace(/@userid/gi, u.account_id || '')
                                .replace(/@id/gi, u.account_id || '')
                                .replace(/@uid/gi, u.account_id || '')
                                .replace(/@balance/gi, '?' + (u.account_balance || '0.00'))
                                .replace(/@phone/gi, u.account_mobile || u.account_mobile_num || '')
                                .replace(/@mobile/gi, u.account_mobile || u.account_mobile_num || '')
                                .replace(/@mail/gi, u.account_email || '')
                                .replace(/@email/gi, u.account_email || '')
                                .replace(/@level/gi, u.account_level || '1');
                            };

                            if (list.length === 0) {
                              return (
                                <div className="py-8 text-center text-gray-400">
                                  <FaBell className="mx-auto text-2xl mb-2 text-gray-600 opacity-40" />
                                  <div className="text-[11px] font-bold uppercase tracking-wider">No notifications yet</div>
                                </div>
                              );
                            }

                            return list.slice(0, 6).map((n, i) => (
                              <div key={n.id || i} className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 hover:border-brand/20 transition-all text-left">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[11px] font-black text-white uppercase tracking-wide truncate max-w-[180px]">
                                    {replaceTags(n.title)}
                                  </span>
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-brand/20 text-brand uppercase tracking-wider">
                                    Notice
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-300 font-medium leading-relaxed line-clamp-2 m-0">
                                  {replaceTags(n.message)}
                                </p>
                              </div>
                            ));
                          })()}
                        </div>

                        <div className="pt-2 mt-2 border-t border-white/10">
                          <button
                            type="button"
                            onClick={() => {
                              setNotifOpen(false);
                              navigate("/notifications");
                            }}
                            className="w-full py-2.5 rounded-xl bg-brand text-black font-black uppercase text-[10px] tracking-wider transition-all hover:brightness-110 flex items-center justify-center gap-1.5 shadow-lg"
                          >
                            Open Notification Hub
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="header-profile-wrap">
                    <button
                      type="button"
                      className="header-icon-btn"
                      onClick={handleProfileClick}
                      aria-label="Profile"
                      title="Profile"
                    >
                      <FaUserCircle />
                    </button>
                    {profileOpen && (
                      <div className="header-mini-popover header-profile-popover">
                        <button type="button" className="header-mini-close" onClick={() => setProfileOpen(false)} aria-label="Close profile menu">
                          <FaTimes />
                        </button>
                        <div className="header-profile-card-head">
                          <div className="header-profile-avatar">
                            {(accountInfo?.account_username || "U").slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div className="header-mini-name">{accountInfo?.account_username || "User"}</div>
                            <div className="header-mini-sub">My Profile</div>
                          </div>
                        </div>
                        <div className="header-profile-details">
                          {profileDetails.map((item) => (
                            <div className="header-profile-row" key={item.label}>
                              <span>{item.label}</span>
                              <strong>{item.value}</strong>
                            </div>
                          ))}
                        </div>
                        <div className="header-profile-links">
                          {profileLinks.map((item) => (
                            <button type="button" key={item.path} onClick={() => openProfileLink(item.path)}>
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {/*
                  <div className="header-profile-wrap">
                    <button
                      type="button"
                      className="header-icon-btn"
                      onClick={() => setMenuOpen((prev) => !prev)}
                      aria-label="Menu"
                      title="Menu"
                    >
                      <FaBars />
                    </button>
                    {menuOpen && (
                      <div className="header-mini-popover header-menu-popover">
                        <button type="button" className="header-mini-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                          <FaTimes />
                        </button>
                        <div className="header-mini-actions header-menu-actions">
                          <button type="button" onClick={() => { setMenuOpen(false); navigate("/"); }}>Home</button>
                          <button type="button" onClick={() => { setMenuOpen(false); navigate("/casino"); }}>Casino</button>
                          <button type="button" onClick={() => { setMenuOpen(false); navigate("/promotion"); }}>Promotions</button>
                        </div>
                      </div>
                    )}
                  </div>
                  */}
                </div>
              </div>
            ) : localStorage.getItem("auth_secret_key") === "guest" ? (
              <div className="btn-demo-play" style={{ cursor: 'default', pointerEvents: 'none' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse mr-1"></span>
                <span>Demo Mode</span>
              </div>
            ) : (
              <button
                className="btn-demo-play"
                onClick={activateDemoMode}
              >
                <FaGem className="demo-icon" />
                <span>Demo Play</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CATEGORY NAV - ORDERED & DYNAMIC FROM DATABASE */}
      <div className="cat-nav">
        <div className="cat-nav-inner">
          {(() => {
            const ORDER_PRIORITY = [
              'Lottery',
              'Crash Games',
              'Roulette',
              'Blackjack',
              'Baccarat',
              'Dragon Tiger',
              'Teen Patti',
              'Poker',
              'Game Shows',
              'Andar Bahar',
              'Cockfight'
            ];

            const allCats = Array.from(
              new Set([
                ...ORDER_PRIORITY,
                ...(Array.isArray(navbarCategories) ? navbarCategories : [])
              ])
            );

            return allCats.sort((a, b) => {
              const idxA = ORDER_PRIORITY.findIndex(p => p.toLowerCase() === a.toLowerCase());
              const idxB = ORDER_PRIORITY.findIndex(p => p.toLowerCase() === b.toLowerCase());
              if (idxA !== -1 && idxB !== -1) return idxA - idxB;
              if (idxA !== -1) return -1;
              if (idxB !== -1) return 1;
              return a.localeCompare(b);
            });
          })().map((catName) => {
            const slug = catName.toLowerCase().replace(/\s+/g, '-');
            const targetPath = `/${slug}`;
            const icon = getCategoryIcon(catName);

            return (
              <a
                key={catName}
                href={targetPath}
                className={catClass(targetPath)}
                onClick={(e) => goCategory(e, targetPath)}
              >
                <span className="cat-icon">{icon}</span>
                <span className="cat-label">{catName}</span>
              </a>
            );
          })}

        </div>
      </div>
      {mobilePanel && (
        <div className={`mobile-home-drawer is-${mobilePanel}`} role="dialog" aria-modal="true">
          <button type="button" className="mobile-drawer-backdrop" onClick={closeMobilePanel} aria-label="Close mobile menu" />
          <section className="mobile-drawer-panel">
            <div className="mobile-drawer-head">
              <div>
                <span>{mobilePanel === "menu" ? "Quick Navigation" : "Account Desk"}</span>
                <strong>{mobilePanel === "menu" ? "Browse Menu" : accountInfo?.account_username || "My Account"}</strong>
              </div>
              <button type="button" onClick={closeMobilePanel} aria-label="Close">
                <FaTimes />
              </button>
            </div>
            <div className="mobile-drawer-body">
              {mobilePanel === "menu" ? (
                <div className="mobile-quick-panel">
                  <div className="mobile-quick-grid">
                    {mobileQuickLinks.map((item) => (
                      item.action ? (
                        <button type="button" key={item.label} onClick={item.action} data-keep-drawer="true">
                          {item.label}
                        </button>
                      ) : (
                        <button type="button" key={item.label} onClick={() => handleMobileNavigate(item.path)}>
                          {item.label}
                        </button>
                      )
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mobile-account-panel">
                  {isLoggedIn ? (
                    <>
                      <div className="mobile-account-hero">
                        <FaUserCircle />
                        <span>My Profile</span>
                        <strong>{accountInfo?.account_username || "User"}</strong>
                      </div>
                      <div className="mobile-account-details">
                        {mobileProfileDetails.map((item) => (
                          <div key={item.label}>
                            <span>{item.label}</span>
                            <strong>{item.value}</strong>
                          </div>
                        ))}
                      </div>
                      <div className="mobile-wallet-grid">
                        {[
                          ["Real Balance", accountInfo?.account_balance],
                          ["Casino Bonus", accountInfo?.account_casino_bonus],
                          ["Sports Bonus", accountInfo?.account_sports_bonus],
                          ["Total Balance", accountInfo?.account_total_balance ?? accountInfo?.account_balance],
                        ].map(([label, value]) => (
                          <div key={label} className="mobile-wallet-tile">
                            <span>{label}</span>
                            <strong><small>₹</small>{formatBalance(value)}</strong>
                          </div>
                        ))}
                      </div>
                      <div className="mobile-profile-links">
                        {profileLinks.map((item) => (
                          <button type="button" key={item.path} onClick={() => handleMobileNavigate(item.path)}>
                            {item.label}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="mobile-logout-btn"
                        onClick={() => {
                          localStorage.removeItem("auth_secret_key");
                          localStorage.removeItem("account_id");
                          window.location.reload();
                        }}
                      >
                        Log Out
                      </button>
                    </>
                  ) : localStorage.getItem("auth_secret_key") === "guest" ? (
                    <div className="mobile-login-card" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                      <FaGem style={{ color: '#34d399', fontSize: '2rem' }} className="animate-pulse" />
                      <strong>Demo Mode Active</strong>
                      <span>You are exploring the site in Demo Mode. Login to play with real money.</span>
                      <div>
                        <button type="button" onClick={() => { closeMobilePanel(); setShowLogin(true); }}>Log In</button>
                        <button type="button" onClick={() => { closeMobilePanel(); setShowRegister(true); }}>Sign Up</button>
                      </div>
                    </div>
                  ) : (
                    <div className="mobile-login-card">
                      <FaUserCircle />
                      <strong>Account Access</strong>
                      <span>Login or create your account to view wallet details.</span>
                      <div>
                        <button type="button" onClick={() => { closeMobilePanel(); setShowLogin(true); }}>Log In</button>
                        <button type="button" onClick={() => { closeMobilePanel(); setShowRegister(true); }}>Sign Up</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
      <nav className="mobile-home-dock" aria-label="Mobile bottom navigation">
        {bottomLinks.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            onClick={item.isHome ? goHomeTop : item.path === "/#live" ? (e) => goHomeSection(e, "#live") : undefined}
            className={`${isBottomActive(item.path) ? "active" : ""}${item.isHome ? " is-home" : ""}`.trim()}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default RanaHeader;


