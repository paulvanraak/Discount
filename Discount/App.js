import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LanguageProvider } from './context/LanguageContext';
import SplashScreen from './screens/SplashScreen';
import LanguageScreen from './screens/LanguageScreen';
import HomeScreen from './screens/HomeScreen';

// Inject Open Sans + Material Icons from Google Fonts on web
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const fonts = document.createElement('link');
  fonts.rel = 'stylesheet';
  fonts.href = 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&display=swap';
  document.head.appendChild(fonts);

  const icons = document.createElement('link');
  icons.rel = 'stylesheet';
  icons.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
  document.head.appendChild(icons);
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <LanguageProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Language" component={LanguageScreen} />
          <Stack.Screen name="Main" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </LanguageProvider>
  );
}
