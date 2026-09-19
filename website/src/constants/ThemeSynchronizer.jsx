import { useEffect } from 'react';
import { COLORS, lightTheme, FONTS } from './theme';
import { useTheme } from '../context/ThemeContext';
import { useSite } from '../context/SiteContext';

const ThemeSynchronizer = () => {
  const { theme } = useTheme();
  const { accountInfo } = useSite();

  useEffect(() => {
    const root = document.documentElement;
    let activeColors = { ...(theme === 'light' ? lightTheme : COLORS) };
    
    console.log("Applying Theme Colors:", { theme, branding: accountInfo });

    // Override with dynamic branding from database if available
    if (accountInfo) {
      if (accountInfo.service_brand_color && accountInfo.service_brand_color.startsWith('#')) {
        activeColors.brand = accountInfo.service_brand_color;
        // Auto-calculate light/dark brand variants
        activeColors.brandLight = accountInfo.service_brand_color; 
        activeColors.brandDark = accountInfo.service_brand_color;
        
        // Calculate Gradient
        const gradEnd = accountInfo.service_brand_gradient_end || accountInfo.service_brand_color;
        activeColors.brandGradient = `linear-gradient(135deg, ${accountInfo.service_brand_color} 0%, ${gradEnd} 100%)`;
      }
      
      if (theme !== 'light') {
        if (accountInfo.service_bg_color && accountInfo.service_bg_color.startsWith('#')) {
            activeColors.bg = accountInfo.service_bg_color;
        }
        if (accountInfo.service_text_color && accountInfo.service_text_color.startsWith('#')) {
            activeColors.text = accountInfo.service_text_color;
        }
      }
    }

    // Sync Colors
    Object.entries(activeColors).forEach(([key, value]) => {
      const kebabKey = key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
      root.style.setProperty(`--${kebabKey}`, value);
      
      if (key === 'brand') root.style.setProperty('--brand-color', value);
      if (key === 'brandLight') root.style.setProperty('--brand-color-light', value);
      if (key === 'brandDark') root.style.setProperty('--brand-color-dark', value);
      if (key === 'secondaryBg') root.style.setProperty('--secondary-bg', value);
    });

    // Derived values (RGB for transparency)
    const brandRGB = activeColors.brand.startsWith('#') 
      ? hexToRgb(activeColors.brand) 
      : { r: 29, g: 78, b: 216 };
    
    root.style.setProperty('--brand-rgb', `${brandRGB.r}, ${brandRGB.g}, ${brandRGB.b}`);
    root.style.setProperty('--accent-glow', `rgba(${brandRGB.r}, ${brandRGB.g}, ${brandRGB.b}, 0.1)`);
    root.style.setProperty('--border', `rgba(${brandRGB.r}, ${brandRGB.g}, ${brandRGB.b}, 0.12)`);
    root.style.setProperty('--border2', theme === 'light' ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.07)');

    // Sync Fonts
    Object.entries(FONTS).forEach(([key, value]) => {
      root.style.setProperty(`--font-${key}`, value);
    });

  }, [theme, accountInfo]);

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  return null; // This component doesn't render anything
};

export default ThemeSynchronizer;
