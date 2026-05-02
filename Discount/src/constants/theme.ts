export const COLORS = {
  bg: '#080818',
  surface: '#12122a',
  surfaceAlt: '#1a1a38',
  border: '#2a2a5a',
  primary: '#6c63ff',
  primaryLight: '#8a84ff',
  primaryDark: '#4a43cc',
  accent: '#ff6b9d',
  accentAlt: '#ffd166',
  gold: '#ffd700',
  silver: '#c0c0c0',
  bronze: '#cd7f32',
  text: '#ffffff',
  textSecondary: '#9999cc',
  textMuted: '#555580',
  success: '#4caf50',
  danger: '#f44336',
  warning: '#ff9800',
};

export const FONTS = {
  regular: 'System',
  bold: 'System',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 32,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  }),
};
