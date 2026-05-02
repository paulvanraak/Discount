import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as ScreenOrientation from 'expo-screen-orientation';
import mobileAds from 'react-native-google-mobile-ads';

import { AppNavigator } from './src/navigation/AppNavigator';

// Keep native splash screen visible while JS initialises
SplashScreen.preventAutoHideAsync();

// Initialise Google Mobile Ads SDK as early as possible
mobileAds()
  .initialize()
  .catch(() => {
    // Non-fatal — ads may not load but game still works
  });

export default function App() {
  useEffect(() => {
    // Lock to landscape for the entire app lifecycle
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    ).catch(() => {});

    // Hide native splash screen (our JS splash screen takes over)
    SplashScreen.hideAsync().catch(() => {});

    return () => {
      ScreenOrientation.unlockAsync().catch(() => {});
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar hidden />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
