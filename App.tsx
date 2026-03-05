import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { darkTheme } from './src/theme';
import { RootNavigator } from './src/navigation/RootNavigator';

// Combine React Navigation Theme with Paper Theme
const CombinedDarkTheme = {
  ...NavigationDarkTheme,
  ...darkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    ...darkTheme.colors,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={CombinedDarkTheme}>
        <NavigationContainer theme={CombinedDarkTheme as any}>
          <RootNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
