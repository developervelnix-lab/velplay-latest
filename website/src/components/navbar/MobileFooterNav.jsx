import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import homeImage from "./images/home.webp";
import promotionImage from "./images/Promotion.webp";
import esport from "./images/e-sport.webp"
import { FaFutbol, FaDice } from "react-icons/fa";
import { esportfooter } from "../../components/jsondata/esport.js";
import { livecusinofooter } from "../jsondata/livecusiniofooter";
import { API_URL } from "@/utils/constants";
import { useColors } from '../../hooks/useColors';
import { FONTS } from '../../constants/theme';
import { useSite } from "../../context/SiteContext";
import { liveSport } from "../jsondata/live";

const FooterNav = () => {
  const COLORS = useColors();
  const navigate = useNavigate();
  const location = useLocation();
  const { setShowLogin, refreshSiteData } = useSite();
  const [toast, setToast] = React.useState(null);
  const [sportsLoading, setSportsLoading] = React.useState(false);
  
  const authSecretKey = localStorage.getItem("auth_secret_key")
  const userId = localStorage.getItem("account_id")
  
  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSportClick = async () => {
    const gameObj = liveSport?.find(g => g["Game Name"] === "Luck Sports");
    if (!gameObj) {
      showToast("error", "Sports game configuration not found.");
      return;
    }

    if (!authSecretKey) {
      setShowLogin(true);
      return;
    }

    setSportsLoading(true);
    try {
      const response = await fetch(`${API_URL}?Route=route-play-games&AuthToken=${encodeURIComponent(authSecretKey)}&USER_ID=${encodeURIComponent(userId)}`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Route: "route-play-games",
          AuthToken: authSecretKey,
        },
        body: JSON.stringify({
          USER_ID: userId,
          GAME_NAME: gameObj["Game Name"],
          GAME_UID: gameObj["Game UID"],
        }),
      });

      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();

      if (data.status_code === "success" && data.data?.game_url) {
        const encodedUrl = btoa(data.data.game_url);
        navigate(`/game-url/${encodeURIComponent(encodedUrl)}/${encodeURIComponent(gameObj["Game Name"])}`);
      } else if (data.status_code === "balance_error") {
        showToast("error", "Minimum balance of ₹100 required to play sports.");
      } else if (data.status_code === "authorization_error" || data.status_code === "auth_error") {
        showToast("error", "Session expired. Please login again.");
        localStorage.removeItem("auth_secret_key");
        localStorage.removeItem("account_id");
        refreshSiteData();
        setShowLogin(true);
      } else {
        showToast("error", data.status_code || "Failed to load sports.");
      }
    } catch (error) {
      showToast("error", "Network error. Please check your connection.");
    } finally {
      setSportsLoading(false);
    }
  };

  const goToHome = () => {
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  // ... (keeping existing handlers handlecusinofooter, handleESportClick) ...
  async function handlecusinofooter(){
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
         "Content-Type": "application/json",
          route: "route-play-games",
          AuthToken: authSecretKey,
        },
        body: JSON.stringify({
          USER_ID: userId,
          GAME_NAME: livecusinofooter["Game Name"],
          GAME_UID: livecusinofooter["Game UID"],
        }),
      });
  
      if (!response.ok) throw new Error("Network response was not ok");
  
      const data = await response.json();
      if (data.data?.game_url) {
        navigate(`/game-url/${encodeURIComponent(data.data.game_url)}/${encodeURIComponent(livecusinofooter["Game Name"])}`);
      }
    } catch (error) {
      console.error("Error logging game click:", error);
    }
  }

  const handleESportClick = async () => {
      try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
         "Content-Type": "application/json",
          route: "route-play-games",
          AuthToken: authSecretKey,
        },
        body: JSON.stringify({
          USER_ID: userId,
          GAME_NAME: esportfooter["Game Name"],
          GAME_UID: esportfooter["Game UID"],
        }),
      });
  
      if (!response.ok) throw new Error("Network response was not ok");
  
      const data = await response.json();
      if (data.data?.game_url) {
        navigate(`/game-url/${encodeURIComponent(data.data.game_url)}/${encodeURIComponent(esportfooter["Game Name"])}`);
      }
    } catch (error) {
      console.error("Error logging game click:", error);
    }
  };

  const scrollToSection = (id) => {
    if (location.pathname === "/") {
      const element = document.getElementById(id);
      if (element) {
        const isMobile = window.innerWidth < 768
        const offset = isMobile ? 95 : 135
        const bodyRect = document.body.getBoundingClientRect().top
        const elementRect = element.getBoundingClientRect().top
        const elementPosition = elementRect - bodyRect
        const offsetPosition = elementPosition - offset

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        })
      }
    } else {
      navigate(`/#${id}`);
    }
  };

  const navItems = [
    { 
      label: "Sport", 
      icon: <FaFutbol />, 
      active: decodeURIComponent(location.pathname).includes("Luck Sports") || (location.pathname === "/" && location.hash === "#live"),
      action: () => {
        if (!sportsLoading) {
          handleSportClick();
        }
      }
    },
    { label: "Slots", icon: esport, active: location.pathname === "/" && location.hash === "#slots", action: () => scrollToSection("slots") },
    { label: "Home", icon: homeImage, isCenter: true, action: goToHome },
    { label: "Casino", icon: <FaDice />, active: isActive("/casino"), action: () => navigate("/casino") },
    { label: "Promo", icon: promotionImage, active: isActive("/promotion"), action: () => navigate("/promotion") },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 w-full z-50 px-4 pb-4 md:hidden">
        <div 
          className="w-full h-16 rounded-[2rem] flex justify-around items-center border border-black/5 dark:border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] relative group/nav"
          style={{ 
            backgroundColor: `${COLORS.bg2}E0`,
            backdropFilter: "blur(20px)"
          }}
        >
          {/* Glow Effects */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand/5 to-transparent opacity-50 rounded-[2rem] pointer-events-none"></div>
          
          {navItems.map((item, i) => (
            <div 
              key={i} 
              className={`flex flex-col items-center justify-center transition-all duration-300 relative ${item.isCenter ? '-mt-8 scale-110 z-10' : 'flex-1'}`}
              onClick={item.action}
            >
              {item.isCenter ? (
                <div className="flex flex-col items-center group/home">
                  <div className="absolute -inset-4 bg-brand/20 blur-2xl rounded-full opacity-0 group-hover/home:opacity-100 transition-opacity pointer-events-none"></div>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand to-brandDark p-1 shadow-[0_0_25px_rgba(29,78,216,0.4)] relative">
                    <div className="w-full h-full rounded-full bg-black/10 dark:bg-black/40 flex items-center justify-center overflow-hidden">
                      <img src={item.icon} alt={item.label} className="w-8 h-8 object-contain drop-shadow-lg" />
                    </div>
                  </div>
                  <span 
                    className="mt-1.5 text-[9px] font-black uppercase tracking-widest text-black dark:text-white shadow-sm" 
                    style={{ fontFamily: FONTS.head, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                  >
                    {item.label}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center group/item">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${item.active ? 'bg-brand/20 border-brand/40 text-brand' : 'bg-gray-100 dark:bg-white/5 border-black/5 dark:border-white/5 text-black/40 dark:text-white/40'} border mb-1`}>
                    {item.label === "Sport" && sportsLoading ? (
                      <span className="text-brand animate-spin text-lg">⏳</span>
                    ) : (
                      typeof item.icon === 'string' ? (
                        <img 
                          src={item.icon} 
                          alt={item.label} 
                          className={`w-6 h-6 object-contain rounded-lg transition-all duration-300 ${item.active ? 'opacity-100 scale-110' : 'opacity-40 group-hover/item:opacity-70 group-hover/item:scale-105'}`} 
                        />
                      ) : (
                        <div className={`text-[22px] transition-all duration-300 ${item.active ? 'scale-110' : 'group-hover/item:opacity-70 group-hover/item:scale-105'}`}>
                          {item.icon}
                        </div>
                      )
                    )}
                  </div>
                  <span className={`text-[8px] font-bold uppercase tracking-widest transition-colors duration-300 ${item.active ? 'text-brand' : 'text-black/40 dark:text-white/40 group-hover/item:text-black/70 dark:text-white/70'}`} style={{ fontFamily: FONTS.ui }}>{item.label}</span>
                  {item.active && <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-brand shadow-[0_0_8px_brand]"></div>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100001] animate-fadeIn">
          <div
            className={`px-5 py-3 rounded-xl shadow-2xl border backdrop-blur-xl flex items-center gap-3 max-w-sm ${toast.type === "success"
              ? "bg-green-500/90 border-green-400/30 text-white"
              : "bg-red-500/90 border-red-400/30 text-white"
              }`}
            style={{ fontFamily: FONTS.ui }}
          >
            <span className="text-sm font-bold">{toast.type === "success" ? "✓" : "⚠"}</span>
            <span className="text-xs font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-white/70 hover:text-white text-sm font-bold">✕</button>
          </div>
        </div>
      )}
    </>
  );
};

export default FooterNav;

