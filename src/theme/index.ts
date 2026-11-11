import { MD3DarkTheme as DefaultDarkTheme } from 'react-native-paper';

export const darkTheme = {
  ...DefaultDarkTheme,
  colors: {
    ...DefaultDarkTheme.colors,
    primary: '#38BDF8', // Cyan / Sky blue
    onPrimary: '#082F49',
    primaryContainer: '#0C4A6E',
    onPrimaryContainer: '#BAE6FD',
    secondary: '#818CF8', // Indigo
    onSecondary: '#1E1B4B',
    secondaryContainer: '#312E81',
    onSecondaryContainer: '#C7D2FE',
    tertiary: '#34D399', // Emerald
    onTertiary: '#064E3B',
    tertiaryContainer: '#065F46',
    onTertiaryContainer: '#A7F3D0',
    background: '#0B0F17', // Deep slate dark
    surface: '#131B2A', // Elevated slate card
    onSurface: '#F1F5F9', // High contrast text
    surfaceVariant: '#1E293B', // Input / chip background
    onSurfaceVariant: '#94A3B8', // Subdued text
    outline: '#334155', // Subtle border
    outlineVariant: '#1E293B',
    error: '#F87171',
    onError: '#450A0A',
    errorContainer: '#7F1D1D',
    onErrorContainer: '#FECACA',
    elevation: {
      ...DefaultDarkTheme.colors.elevation,
      level0: 'transparent',
      level1: '#131B2A',
      level2: '#172236',
      level3: '#1E293B',
      level4: '#243247',
      level5: '#2D3D56',
    },
  },
};

export const UI_COLORS = {
  accentBlue: '#38BDF8',
  accentPurple: '#A855F7',
  accentEmerald: '#10B981',
  accentAmber: '#F59E0B',
  accentRose: '#F43F5E',
  accentIndigo: '#6366F1',
  codeBackground: '#0F172A',
  cardBorder: '#1E293B',
  cardHover: '#1A2333',
};
