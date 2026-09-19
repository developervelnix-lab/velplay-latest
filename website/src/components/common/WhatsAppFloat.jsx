import React, { useEffect, useState } from 'react';
import { FaWhatsapp, FaTelegramPlane, FaHeadset } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { apiGet } from '@/utils/apiFetch';

const WhatsAppFloat = () => {
  const [contactUrl, setContactUrl] = useState("https://wa.link/velplay365");
  const [isTelegram, setIsTelegram] = useState(false);
  const [isDirectSupport, setIsDirectSupport] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchContactSettings = async () => {
      try {
        const response = await apiGet("route-app-status");
        const data = await response.json();

        let link = "";
        let foundDirectSupport = false;
        let foundTelegram = false;

        // 1. Prioritize 'Direct Support' in Dynamic Social Links
        if (data.site_social_links && Array.isArray(data.site_social_links)) {
          const directSupportItem = data.site_social_links.find(
            item => item.platform === "Direct Support" || 
                    item.platform === "Direct Support Link" || 
                    item.platform === "Direct Support WhatsApp"
          );
          if (directSupportItem && directSupportItem.value && directSupportItem.value.trim() !== "") {
            link = directSupportItem.value.trim();
            foundDirectSupport = true;
          }
        }

        // 2. Fallback to support_url from site branding
        if (!link && data.support_url && data.support_url.trim() !== "") {
          link = data.support_url.trim();
          foundDirectSupport = true;
        }

        // 3. Fallback to WhatsApp in Dynamic Social Links
        if (!link && data.site_social_links && Array.isArray(data.site_social_links)) {
          const waItem = data.site_social_links.find(item => item.platform === "WhatsApp");
          if (waItem && waItem.value && waItem.value.trim() !== "") {
            link = waItem.value.trim();
          }
        }

        // 4. Fallback to whatsapp_num or telegram_url
        if (!link && data.whatsapp_num && data.whatsapp_num.trim() !== "") {
          link = data.whatsapp_num.trim();
        } else if (!link && data.telegram_url && data.telegram_url.trim() !== "") {
          link = data.telegram_url.trim();
          foundTelegram = true;
        }

        // 5. Final link formatting
        if (link) {
          if (!link.startsWith("http://") && !link.startsWith("https://") && !link.startsWith("tg://")) {
            const cleanNum = link.replace(/[^0-9]/g, "");
            if (cleanNum.length >= 7) {
              link = "https://wa.me/" + cleanNum;
            } else {
              link = "https://" + link;
            }
          }
          setContactUrl(link);
          setIsDirectSupport(foundDirectSupport);
          setIsTelegram(foundTelegram);
        }
      } catch (err) {
        console.error("Error loading floating contact URL:", err);
      }
    };

    fetchContactSettings();
  }, []);

  // Hide floating support button inside gameplay screens (/game/... or /game-url/...)
  const isGamePage = location.pathname.startsWith('/game/') || location.pathname.startsWith('/game-url/') || location.pathname.includes('/game');
  if (isGamePage) {
    return null;
  }

  return (
    <a
      href={contactUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat Support"
      className="custom-whatsapp-float group flex items-center gap-2 decoration-none select-none transition-all duration-300 transform hover:scale-105"
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '16px',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        opacity: 1,
        visibility: 'visible',
        pointerEvents: 'auto',
        textDecoration: 'none'
      }}
    >
      {/* Tooltip on hover */}
      <span className="hidden sm:inline-block px-3 py-1.5 bg-gray-900/90 text-white text-xs font-bold rounded-lg shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-white/10">
        Direct Support ??
      </span>

      {/* Floating Action Button */}
      <div
        className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-[0_4px_25px_rgba(37,211,102,0.6)] transition-all duration-300 group-hover:shadow-[0_6px_30px_rgba(37,211,102,0.9)]"
        style={{
          background: isTelegram 
            ? 'linear-gradient(135deg, #0088cc 0%, #005580 100%)' 
            : 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          border: '2px solid rgba(255, 255, 255, 0.8)'
        }}
      >
        {/* Pulsating animation ring */}
        <span 
          className="absolute inset-0 rounded-full opacity-75 animate-ping group-hover:animate-none"
          style={{ background: isTelegram ? '#0088cc' : '#25D366' }}
        ></span>

        {/* Support Icon */}
        {isTelegram ? (
          <FaTelegramPlane className="relative z-10 text-white text-2xl sm:text-3xl" />
        ) : (
          <FaWhatsapp className="relative z-10 text-white text-2xl sm:text-3xl" />
        )}
      </div>
    </a>
  );
};

export default WhatsAppFloat;
