import { useTheme } from '../context/ThemeContext';
import { useSite } from '../context/SiteContext';
import { COLORS, lightTheme, FONTS } from '../constants/theme';

/**
 * useColors hook - returns the active theme's colors reactively.
 * Now integrated with dynamic branding from database.
 */
export const useColors = () => {
  const { theme } = useTheme();
  const { accountInfo } = useSite();
  
  const baseColors = theme === 'light' ? lightTheme : COLORS;
  
  // Create a reactive color object
  const activeColors = { ...baseColors };
  
  if (accountInfo) {
    if (accountInfo.service_brand_color && accountInfo.service_brand_color.startsWith('#')) {
      activeColors.brand = accountInfo.service_brand_color;
      activeColors.brandLight = accountInfo.service_brand_color;
      activeColors.brandDark = accountInfo.service_brand_color;
      
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

  return activeColors;
};

export { FONTS };
