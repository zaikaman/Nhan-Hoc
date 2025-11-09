import { useThemeStore } from '../stores/useThemeStore';

// Light Theme
const lightTheme = {
  primary: '#26648E',
  secondary: '#4F8FC0',
  accent: '#53D2DC',
  warning: '#FFE3B3',
  
  background: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    card: '#FFFFFF',
  },
  
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    muted: '#94a3b8',
  },
  
  border: {
    default: '#e2e8f0',
    focus: '#53D2DC',
  },
  
  success: '#10b981',
  error: '#ef4444',
  info: '#3b82f6',
  
  shadow: '#000000',
};

// Dark Theme (hiện tại)
const darkTheme = {
  primary: '#26648E',
  secondary: '#4F8FC0',
  accent: '#53D2DC',
  warning: '#FFE3B3',
  
  background: {
    primary: '#020617',
    secondary: '#0f172a',
    card: '#1e293b',
  },
  
  text: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    muted: '#64748b',
  },
  
  border: {
    default: '#334155',
    focus: '#53D2DC',
  },
  
  success: '#10b981',
  error: '#ef4444',
  info: '#3b82f6',
  
  shadow: '#000000',
};

// Ocean Theme
const oceanTheme = {
  primary: '#0ea5e9',
  secondary: '#06b6d4',
  accent: '#22d3ee',
  warning: '#fbbf24',
  
  background: {
    primary: '#0c4a6e',
    secondary: '#075985',
    card: '#0369a1',
  },
  
  text: {
    primary: '#f0f9ff',
    secondary: '#bae6fd',
    muted: '#7dd3fc',
  },
  
  border: {
    default: '#0284c7',
    focus: '#22d3ee',
  },
  
  success: '#10b981',
  error: '#ef4444',
  info: '#3b82f6',
  
  shadow: '#000000',
};

// Sunset Theme
const sunsetTheme = {
  primary: '#f97316',
  secondary: '#fb923c',
  accent: '#fbbf24',
  warning: '#fde047',
  
  background: {
    primary: '#7c2d12',
    secondary: '#9a3412',
    card: '#c2410c',
  },
  
  text: {
    primary: '#fff7ed',
    secondary: '#fed7aa',
    muted: '#fdba74',
  },
  
  border: {
    default: '#ea580c',
    focus: '#fbbf24',
  },
  
  success: '#10b981',
  error: '#ef4444',
  info: '#3b82f6',
  
  shadow: '#000000',
};

const themes = {
  light: lightTheme,
  dark: darkTheme,
  ocean: oceanTheme,
  sunset: sunsetTheme,
};

export const useTheme = () => {
  const { mode, setTheme } = useThemeStore();
  return {
    colors: themes[mode],
    mode,
    setTheme,
  };
};
