import { MD3DarkTheme as DefaultDarkTheme } from 'react-native-paper';

export const darkTheme = {
  ...DefaultDarkTheme,
  colors: {
    ...DefaultDarkTheme.colors,
    primary: '#58A6FF',
    background: '#0D1117',
    surface: '#161B22',
    onSurface: '#E6EDF3',
    surfaceVariant: '#21262D',
    onSurfaceVariant: '#8B949E',
    outline: '#30363D',
    elevation: {
      ...DefaultDarkTheme.colors.elevation,
      level1: '#161B22',
      level2: '#21262D',
      level3: '#30363D',
    }
  },
};
