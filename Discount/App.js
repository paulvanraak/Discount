import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import SplashScreen from './screens/SplashScreen';
import LanguageScreen from './screens/LanguageScreen';
import HomeScreen from './screens/HomeScreen';

const Stack = createNativeStackNavigator();

function Navigator() {
  const { t } = useLanguage();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen
        name="Main"
        component={HomeScreen}
        options={{
          headerShown: true,
          title: t.appName,
          headerTitleAlign: 'center',
          headerTintColor: '#FF8C00',
          headerTitleStyle: { fontWeight: '900', fontSize: 22 },
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <NavigationContainer>
        <Navigator />
      </NavigationContainer>
    </LanguageProvider>
  );
}
