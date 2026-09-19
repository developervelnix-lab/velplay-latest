import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaDownload, FaShareSquare, FaPlusSquare, FaApple } from 'react-icons/fa';
import { useColors } from '../../hooks/useColors';
import { FONTS } from '../../constants/theme';
import { URL as BASE_URL } from "../../utils/constants";

const AppInstallModal = ({ isOpen, onClose, isInstallable, installApp, isInstalled, currentPlatform, accountInfo }) => {
  const COLORS = useColors();

  if (!isOpen) return null;

  const siteName = accountInfo?.service_site_name || "Official Platform";
  const getSafeLogoUrl = (logoPath) => {
    if (!logoPath || logoPath === "/favicon.png" || logoPath.includes('favicon.png')) return "/image.png";
    if (logoPath.startsWith('http') || logoPath.startsWith('data:')) return logoPath;
    const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    const path = logoPath.startsWith('/') ? logoPath : `/${logoPath}`;
    return `${base}${path}`;
  };

  const siteLogo = getSafeLogoUrl(accountInfo?.service_site_logo);

  const handleInstallClick = async () => {
    if (installApp) {
      await installApp();
    }
    onClose();
  };

  const isIOS = currentPlatform === 'ios';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-[440px] rounded-[2rem] bg-[#121620] border border-white/10 text-white shadow-2xl overflow-hidden flex flex-col"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors z-[110] cursor-pointer"
          >
            <FaTimes size={18} />
          </button>

          <div className="p-6 sm:p-8 space-y-6">
            {/* App Profile Header */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-xl border-2 border-white/10 flex-shrink-0 bg-[#0a0d14] flex items-center justify-center p-2">
                <img
                  src={siteLogo}
                  alt={siteName}
                  className="w-full h-full object-contain"
                  onError={(e) => { e.target.src = "/image.png"; }}
                />
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight">{siteName}</h2>
                <span className="text-xs font-bold text-[#22c6e8] tracking-wider uppercase mt-1">Official Web App (PWA)</span>
                <span className="text-xs text-white/40 mt-0.5">{typeof window !== 'undefined' ? window.location.host : ''}</span>
              </div>
            </div>

            {/* Content */}
            {isIOS ? (
              <div className="bg-[#1a2234] border border-[#22c6e8]/20 rounded-2xl p-5 space-y-3.5">
                <div className="flex items-center gap-2.5 text-[#22c6e8]">
                  <FaApple size={22} />
                  <span className="font-bold text-sm">iOS Install Guide (Safari)</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#1646d7] text-white flex items-center justify-center text-xs font-black flex-shrink-0">1</div>
                    <p className="text-xs text-white/80 leading-relaxed">
                      Tap the <FaShareSquare className="inline-block mx-1 text-[#22c6e8]" /> <strong>Share</strong> button in Safari toolbar.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#1646d7] text-white flex items-center justify-center text-xs font-black flex-shrink-0">2</div>
                    <p className="text-xs text-white/80 leading-relaxed">
                      Select <FaPlusSquare className="inline-block mx-1 text-[#22c6e8]" /> <strong>Add to Home Screen</strong>.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-4 px-6 rounded-xl font-black text-sm tracking-wider uppercase text-white shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #1646d7 0%, #22c6e8 100%)" }}
              >
                <FaDownload size={16} />
                <span>INSTALL APP NOW</span>
              </button>
            )}
          </div>

          {/* Footer Branding */}
          <div className="px-6 py-4 bg-[#0a0d14] border-t border-white/10 flex items-center justify-between">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{siteName} Verified PWA</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#22c6e8]"></div>
              <span className="text-[10px] font-bold text-[#22c6e8] uppercase tracking-wider">Fast & Secure</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AppInstallModal;
