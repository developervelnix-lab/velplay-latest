import { useState, useEffect } from 'react';

/**
 * Hook to handle PWA installation prompt logic.
 */
export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(() => (typeof window !== 'undefined' ? window.__deferredPrompt : null));
  const [isInstallable, setIsInstallable] = useState(() => (typeof window !== 'undefined' ? !!window.__deferredPrompt : false));
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState('desktop');

  useEffect(() => {
    const getPlatform = () => {
      if (typeof window === 'undefined') return 'desktop';
      const ua = navigator.userAgent;
      if (/android/i.test(ua)) return 'android';
      if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
      return 'desktop';
    };
    setPlatform(getPlatform());

    const checkInstalled = async () => {
      if (typeof window === 'undefined') return;
      if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
        setIsInstalled(true);
        return;
      }
      if ('getInstalledRelatedApps' in navigator) {
        try {
          const relatedApps = await navigator.getInstalledRelatedApps();
          if (relatedApps.length > 0) setIsInstalled(true);
        } catch (err) {}
      }
    };

    const handlePrompt = (e) => {
      if (e && e.preventDefault) e.preventDefault();
      const promptObj = (e && e.detail) ? e.detail : (e || window.__deferredPrompt);
      if (promptObj) {
        window.__deferredPrompt = promptObj;
        setDeferredPrompt(promptObj);
        setIsInstallable(true);
      }
    };

    if (window.__deferredPrompt) {
      setIsInstallable(true);
      setDeferredPrompt(window.__deferredPrompt);
    }

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('pwa-prompt-available', handlePrompt);
    checkInstalled();

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('pwa-prompt-available', handlePrompt);
    };
  }, []);

  const installApp = async () => {
    const promptEvent = deferredPrompt || (typeof window !== 'undefined' ? window.__deferredPrompt : null);
    if (!promptEvent) return false;
    try {
      await promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      if (choiceResult && choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        if (typeof window !== 'undefined') window.__deferredPrompt = null;
      }
      setDeferredPrompt(null);
      return true;
    } catch (err) {
      setDeferredPrompt(null);
      return false;
    }
  };

  return { isInstallable, isInstalled, installApp, platform };
};
