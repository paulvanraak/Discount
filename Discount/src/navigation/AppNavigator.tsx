import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

import { SplashScreen } from '../screens/SplashScreen';
import { MainMenuScreen } from '../screens/MainMenuScreen';
import { WorldSelectScreen } from '../screens/WorldSelectScreen';
import { LevelSelectScreen } from '../screens/LevelSelectScreen';
import { GameplayScreen } from '../screens/GameplayScreen';
import { SkinsScreen } from '../screens/SkinsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { WalletScreen } from '../screens/WalletScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: '#080818' },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="MainMenu" component={MainMenuScreen} />
        <Stack.Screen
          name="WorldSelect"
          component={WorldSelectScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="LevelSelect"
          component={LevelSelectScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="Gameplay"
          component={GameplayScreen}
          options={{ animation: 'fade', gestureEnabled: false }}
        />
        <Stack.Screen
          name="Skins"
          component={SkinsScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Wallet"
          component={WalletScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
