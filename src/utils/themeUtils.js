/**
 * Theme-aware styling utility
 * Provides consistent theming across the entire application
 * 
 * Features:
 * - Centralized theme management
 * - Consistent styling across components
 * - Dark/light mode support
 * - Predefined styles for common UI elements
 */
import { useThemeStore } from '../store/useThemeStore';

// Theme color definitions
const THEME_COLORS = {
  primary: 'hsl(var(--p) / <alpha-value>)',
  secondary: 'hsl(var(--s) / <alpha-value>)',
  accent: 'hsl(var(--a) / <alpha-value>)',
  neutral: 'hsl(var(--n) / <alpha-value>)',
  info: 'hsl(var(--in) / <alpha-value>)',
  success: 'hsl(var(--su) / <alpha-value>)',
  warning: 'hsl(var(--wa) / <alpha-value>)',
  error: 'hsl(var(--er) / <alpha-value>)',
};

// Common style presets
const STYLE_PRESETS = {
  card: (theme) => ({
    className: `bg-base-100 shadow-md rounded-lg p-4 ${theme === 'dark' ? 'border border-base-300' : ''}`,
    header: 'border-b border-base-300 pb-2 mb-4',
    body: 'mt-2',
    footer: 'pt-4 mt-4 border-t border-base-300',
  }),
  metricCard: (theme) => ({
    className: `${theme === 'dark' ? 'bg-base-200' : 'bg-white'} rounded-lg p-4 shadow-sm`,
    title: 'text-sm font-medium text-gray-500',
    value: `${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-2xl font-bold`,
    trend: {
      positive: 'text-success',
      negative: 'text-error',
      neutral: 'text-info',
    },
  }),
  button: (theme, variant = 'primary') => {
    const baseStyles = 'rounded-md font-medium transition-colors inline-flex items-center justify-center';
    const variants = {
      primary: 'bg-primary text-primary-content hover:bg-primary-focus',
      secondary: 'bg-secondary text-secondary-content hover:bg-secondary-focus',
      accent: 'bg-accent text-accent-content hover:bg-accent-focus',
      ghost: 'bg-transparent hover:bg-base-200',
      outline: 'bg-transparent border border-base-300 hover:bg-base-200',
      link: 'bg-transparent text-primary hover:underline',
      danger: 'bg-error text-error-content hover:bg-error-focus',
    };
    
    return {
      base: baseStyles,
      variant: variants[variant] || variants.primary,
      size: {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-4 py-2',
        lg: 'text-base px-6 py-3',
      },
      disabled: 'opacity-50 cursor-not-allowed',
      loading: 'opacity-70 cursor-wait',
    };
  },
  input: (theme) => ({
    base: 'w-full rounded-md border border-base-300 bg-base-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50',
    disabled: 'bg-base-200 cursor-not-allowed opacity-70',
    error: 'border-error focus:ring-error/50',
    success: 'border-success focus:ring-success/50',
  }),
  badge: (theme) => ({
    base: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
    variant: {
      default: 'bg-base-200 text-base-content',
      primary: 'bg-primary/10 text-primary',
      success: 'bg-success/10 text-success',
      warning: 'bg-warning/10 text-warning',
      error: 'bg-error/10 text-error',
      info: 'bg-info/10 text-info',
    },
  }),
  alert: (theme) => ({
    base: 'rounded-lg p-4',
    variant: {
      info: 'bg-info/10 text-info-content border border-info/20',
      success: 'bg-success/10 text-success-content border border-success/20',
      warning: 'bg-warning/10 text-warning-content border border-warning/20',
      error: 'bg-error/10 text-error-content border border-error/20',
    },
    icon: 'h-5 w-5',
  }),
};

/**
 * Hook to access theme utilities
 * @returns {Object} Theme utilities and styles
 */
export const useTheme = () => {
  const { theme, setTheme } = useThemeStore();
  
  /**
   * Get styles for a specific component
   * @param {string} component - Component name (e.g., 'card', 'button')
   * @param {Object} options - Component-specific options
   * @returns {Object} Component styles
   */
  const getStyles = (component, options = {}) => {
    const preset = STYLE_PRESETS[component];
    if (!preset) {
      console.warn(`No style preset found for component: ${component}`);
      return {};
    }
    
    if (typeof preset === 'function') {
      return preset(theme, options);
    }
    
    return preset;
  };
  
  /**
   * Check if current theme is dark
   * @returns {boolean} True if dark theme is active
   */
  const isDark = () => theme === 'dark';
  
  /**
   * Toggle between light and dark theme
   */
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  /**
   * Get theme color
   * @param {string} color - Color variant (e.g., 'primary', 'success')
   * @param {number} opacity - Opacity value (0-100)
   * @returns {string} CSS color value
   */
  const getColor = (color, opacity = 100) => {
    const baseColor = THEME_COLORS[color] || THEME_COLORS.primary;
    return baseColor.replace('<alpha-value>', opacity / 100);
  };
  
  /**
   * Get text color based on background color
   * @param {string} bgColor - Background color
   * @returns {string} Text color class
   */
  const getTextColor = (bgColor) => {
    // Simple brightness calculation to determine text color
    const isLight = bgColor?.includes('100') || 
                   bgColor?.includes('200') || 
                   bgColor?.includes('300') ||
                   bgColor === 'white';
    return isLight ? 'text-gray-900' : 'text-white';
  };
  
  // Common component shortcuts
  const card = (options = {}) => getStyles('card', options);
  const button = (variant = 'primary', options = {}) => getStyles('button', { ...options, variant });
  const input = (options = {}) => getStyles('input', options);
  const badge = (options = {}) => getStyles('badge', options);
  const alert = (options = {}) => getStyles('alert', options);
  const metricCard = (options = {}) => getStyles('metricCard', options);
  
  return {
    // Theme state
    theme,
    isDark,
    setTheme,
    toggleTheme,
    
    // Style utilities
    getStyles,
    getColor,
    getTextColor,
    
    // Component styles
    card,
    button,
    input,
    badge,
    alert,
    metricCard,
    
    // Backward compatibility
    getCardStyles: () => getStyles('card'),
    getButtonStyles: (variant) => button(variant),
    getMetricCardStyles: () => metricCard(),
  };
};

// For backward compatibility
export const useThemeStyles = () => useTheme();
