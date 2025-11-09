// Theme colors for Nhàn Học
export const colors = {
  primary: '#26648E',      // Dark Blue - Main brand color
  secondary: '#4F8FC0',    // Medium Blue - Secondary actions
  accent: '#53D2DC',       // Light Cyan - Highlights and accents
  warning: '#FFE3B3',      // Light Peach - Warnings and notifications
  
  // Purple gradient colors (new)
  purple: {
    dark: '#5B21B6',       // Deep purple
    main: '#7C3AED',       // Main purple
    light: '#A78BFA',      // Light purple
    gradient: ['#6B21A8', '#7C3AED', '#8B5CF6'], // Gradient array
  },
  
  // Background colors
  background: {
    primary: '#020617',    // Dark background
    secondary: '#0f172a',  // Lighter dark background
    card: '#1e293b',       // Card background
    light: '#F8FAFC',      // Light background
  },
  
  // Text colors
  text: {
    primary: '#f8fafc',    // White text
    secondary: '#cbd5e1',  // Light gray text
    muted: '#64748b',      // Muted gray text
    dark: '#1E293B',       // Dark text
  },
  
  // Border colors
  border: {
    default: '#334155',
    focus: '#53D2DC',
    light: '#E2E8F0',
  },
  
  // Status colors
  success: '#10b981',
  error: '#ef4444',
  info: '#3b82f6',
  indigo: '#6366F1',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  fontSize,
};

export default theme;
