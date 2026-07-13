import React from 'react';
import { Link } from 'react-router-dom';
import { FaDownload, FaShieldAlt } from 'react-icons/fa';
import { useColors } from '../../../hooks/useColors';
import { FONTS } from '../../../constants/theme';
import { useSite } from '../../../context/SiteContext';
import { URL as BASE_URL } from '../../../utils/constants';
import { usePWAInstall } from '../../../hooks/usePWAInstall';

const RanaFooter = () => {
  const COLORS = useColors();
  const { accountInfo } = useSite();
  const { isInstalled, isInstallable, installApp, platform } = usePWAInstall();

  const siteName = accountInfo?.service_site_name || 'velplay365';
  const logoUrl = accountInfo?.service_site_logo?.startsWith('http')
    ? accountInfo.service_site_logo
    : (!accountInfo?.service_site_logo ? '/banner/image.png' : `${BASE_URL}${accountInfo.service_site_logo}`);

  const handleGetApp = () => {
    if (isInstalled) {
      window.open(window.location.origin, '_blank', 'noopener,noreferrer');
      return;
    }

    if (isInstallable) {
      installApp();
      return;
    }

    if (platform === 'android') {
      window.open(accountInfo?.service_app_download_url || '/velplay365.apk', '_blank', 'noopener,noreferrer');
      return;
    }

    window.open(window.location.origin, '_blank', 'noopener,noreferrer');
  };

  const quickLinks = [
    { label: 'Live Betting', href: '/#live' },
    { label: 'Cricket Hub', href: '/#live' },
    { label: 'Casino Lobby', href: '/casino' },
    {
      label: 'Direct Support',
      href: accountInfo?.service_support_url || '/support',
      external: !!accountInfo?.service_support_url
    },
    { label: 'Promotions', href: '/promotion' },
    { label: 'Get App', href: '#', onClick: handleGetApp }
  ];

  const payments = [
    'UPI',
    'GPay',
    'PhonePe',
    'Net Banking',
    'Paytm'
  ];

  return (
    <footer
      className="rana-footer relative pt-4 pb-4 md:pt-5 md:pb-4 border-t overflow-hidden"
      style={{ backgroundColor: '#ffffff', borderColor: 'rgba(0,0,0,0.08)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      ></div>
      <div
        className="absolute top-0 left-0 w-full h-px"
        style={{ background: `linear-gradient(to right, transparent, ${COLORS.brand}66, transparent)` }}
      ></div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:flex-nowrap gap-4 lg:gap-6 items-start">
          <div className="space-y-3 min-w-0 md:basis-[36%] md:shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1 bg-blue-50 rounded-xl border border-blue-100">
                <img
                  src={logoUrl}
                  alt={siteName}
                  className="h-6 md:h-7 w-auto px-1"
                  onError={(e) => { e.currentTarget.src = '/banner/image.png'; }}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span
                  className="font-black text-base md:text-[17px] tracking-tighter uppercase leading-none truncate"
                  style={{ fontFamily: FONTS.head, color: '#111827' }}
                >
                  {siteName.toUpperCase()}
                </span>
                {accountInfo?.service_tagline && (
                  <span
                    className="text-[7px] md:text-[8px] font-bold uppercase tracking-[0.28em] mt-1 truncate"
                    style={{ color: COLORS.brand }}
                  >
                    {accountInfo.service_tagline}
                  </span>
                )}
              </div>
            </div>

            <p className="text-[10px] md:text-xs leading-relaxed font-medium max-w-[300px]" style={{ color: '#6b7280' }}>
              <strong style={{ color: '#111827' }}>{siteName}</strong> is the best platform for live and uninterrupted online betting for sports, Live 24hr betting with a wide spectrum of sports such as Cricket, Soccer, Horse Racing, Kabaddi, <strong style={{ color: COLORS.brand }}>Aviator Predictor</strong>, Hockey, Basketball, <strong style={{ color: COLORS.brand }}>Andar Bahar Game</strong> and many more.
            </p>
          </div>

          <div className="space-y-2.5 min-w-0 md:basis-[22%] md:shrink-0">
            <h3 className="font-black text-[10px] md:text-[11px] uppercase tracking-[0.32em] flex items-center gap-2 leading-none" style={{ color: '#111827' }}>
              <span className="w-2 h-[2px]" style={{ backgroundColor: COLORS.brand }}></span>
              Quick Navigation
            </h3>
            <ul className="grid grid-cols-1 gap-1">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  {link.onClick ? (
                    <button
                      type="button"
                      onClick={link.onClick}
                      className="text-left text-[10px] md:text-[11px] font-medium transition-all duration-300 flex items-center gap-2 group cursor-pointer leading-none"
                      style={{ color: '#6b7280' }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      to={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="text-[10px] md:text-[11px] font-medium transition-all duration-300 flex items-center gap-2 group cursor-pointer leading-none"
                      style={{ color: '#6b7280' }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2.5 lg:text-right flex flex-col items-center lg:items-end min-w-0 md:basis-[42%] md:shrink-0">
            <h2
              className="font-black text-[10px] md:text-[11px] uppercase tracking-[0.28em] w-full text-center lg:text-right leading-none"
              style={{ fontFamily: FONTS.head, color: '#111827' }}
            >
              Accepted Modes Of Payments
            </h2>
            <div className="w-full max-w-[360px] bg-gray-50 p-2.5 rounded-xl border border-gray-200 shadow-sm group hover:bg-gray-100 transition-all flex items-start justify-center lg:justify-end">
              <div className="flex flex-col items-center gap-1.5 pt-0.5">
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.22em] leading-none" style={{ color: '#6b7280' }}>
                  Payment Options
                </span>
                <img
                  src="https://i.postimg.cc/3w5tyBC0/paymentopt1-removebg-preview-1.png"
                  alt="Payment Options"
                  className="h-8 md:h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-500"
                />
                <div className="text-[7px] md:text-[8px] font-medium uppercase tracking-[0.16em] text-center leading-relaxed max-w-[280px]" style={{ color: '#9ca3af' }}>
                  {payments.join(' / ')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 lg:grid-cols-[1.35fr_auto] gap-3 lg:gap-5 items-center">
          <div className="space-y-2.5">
            <h2
              className="font-black text-[13px] md:text-[14px] uppercase tracking-tight leading-tight"
              style={{ fontFamily: FONTS.head, color: '#111827' }}
            >
              100% Safe & Instant Payments
            </h2>
            <p className="text-[10px] md:text-[11px] leading-relaxed font-medium" style={{ color: '#6b7280' }}>
              You can make payments and receive earnings instantly via your UPI ID...
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-start lg:justify-end gap-1.5">
            <span className="px-2 py-1 bg-red-50 border border-red-200 text-red-500 rounded-lg text-[8px] font-black uppercase tracking-widest">
              18+ Only
            </span>
            <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[8px] font-black uppercase tracking-widest" style={{ color: '#6b7280' }}>
              G
            </span>
            <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[8px] font-black uppercase tracking-widest" style={{ color: '#6b7280' }}>
              GT
            </span>
            <button
              onClick={handleGetApp}
              className="inline-flex items-center gap-2 px-4 py-2 text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:-translate-y-1 transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(34,197,94,0.35)] cursor-pointer w-fit"
              style={{ backgroundColor: '#22C55E' }}
            >
              <FaDownload className="text-[10px]" />
              {isInstalled ? 'Go to App' : 'Get App'}
            </button>
          </div>
        </div>

        <div className="pt-3 border-t space-y-2.5" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
          <div className="flex flex-col md:flex-row items-center justify-center gap-x-8 gap-y-2">
            <div className="flex items-center gap-1.5 text-[7px] md:text-[8px] uppercase tracking-widest font-medium" style={{ color: '#9ca3af' }}>
              <FaShieldAlt size={10} />
              <span>Copyright 2025 {siteName.toUpperCase()}</span>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-2 md:gap-5">
              {[
                'Responsible Gambling',
                'Terms & Condition',
                'KYC Policy'
              ].map((text, i) => (
                <a
                  key={i}
                  href="#"
                  className="text-[8px] font-medium uppercase tracking-[0.18em] transition-colors whitespace-nowrap hover:text-blue-600"
                  style={{ color: '#9ca3af' }}
                >
                  {text}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <p
              className="text-[8px] md:text-[9px] font-medium uppercase tracking-[0.14em] text-center leading-relaxed max-w-2xl"
              style={{ color: COLORS.brand, filter: 'drop-shadow(0 0 10px rgba(245,158,11,0.2))' }}
            >
              Gambling can be addictive, please play responsibly
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default RanaFooter;
