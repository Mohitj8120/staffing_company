// Design tokens matching the Chrome Extension's popup.css
export const theme = {
  // Colors
  bgDark: '#07070a',
  bgGradientStart: '#11111a',
  bgGradientEnd: '#07070a',
  glassBg: 'rgba(255, 255, 255, 0.03)',
  glassBgLight: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassBorderLight: 'rgba(255, 255, 255, 0.12)',
  primary: '#8a2be2',
  primaryGlow: 'rgba(138, 43, 226, 0.5)',
  primaryBg: 'rgba(138, 43, 226, 0.1)',
  secondary: '#00e5ff',
  secondaryGlow: 'rgba(0, 229, 255, 0.4)',
  secondaryBg: 'rgba(0, 229, 255, 0.1)',
  textMain: '#ffffff',
  textMuted: '#a0a0a0',
  danger: '#ff4757',
  dangerBg: 'rgba(255, 71, 87, 0.1)',
  
  // Gradients
  gradientPrimary: ['#8a2be2', '#00e5ff'],
  gradientAccent: ['#00f2fe', '#4facfe'],
  gradientBackground: ['#11111a', '#07070a'],
  gradientCreditBanner: ['rgba(138,43,226,0.1)', 'rgba(0,229,255,0.05)'],

  // Spacing
  paddingSm: 8,
  paddingMd: 16,
  paddingLg: 24,
  paddingXl: 32,

  // Border Radius
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusFull: 50,

  // Font Sizes
  fontXs: 11,
  fontSm: 12,
  fontMd: 14,
  fontLg: 16,
  fontXl: 20,
  font2xl: 24,
  font3xl: 32,

  // Shadows
  shadowCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  shadowGlow: {
    shadowColor: '#8a2be2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
};
