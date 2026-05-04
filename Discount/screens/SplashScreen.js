import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';

// Stacked logo — mark + "Donnie / Discount" two-line layout
const stackedLogo = require('../assets/logo-stacked.png');

const isDesktop = Platform.OS === 'web' && typeof window !== 'undefined' && window.innerWidth >= 1024;

export default function SplashScreen({ navigation }) {
  const { setLang, setRegion } = useLanguage();
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    const navigate = async () => {
      try {
        const [[, savedLang], [, savedRegion]] = await AsyncStorage.multiGet(['language', 'region']);
        if (savedLang) {
          setLang(savedLang);
          if (savedRegion) setRegion(savedRegion);
          navigation.replace('Main');
        } else {
          navigation.replace('Language');
        }
      } catch {
        navigation.replace('Language');
      }
    };

    if (isDesktop) {
      const t = setTimeout(navigate, 0);
      return () => clearTimeout(t);
    }

    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 14, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(navigate, 1800);
    return () => clearTimeout(timer);
  }, [navigation]);

  if (isDesktop) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Stacked logo PNG — exact brand asset */}
        <Image source={stackedLogo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.tagline}>Extreme kortingen. Elke dag.</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    alignItems: 'center',
    paddingHorizontal: 32,
    width: '100%',
  },
  // 2558×829 → ratio 3.09
  logo: {
    width: '80%',
    aspectRatio: 2558 / 829,
    marginBottom: 24,
  },
  tagline: {
    fontFamily: '"Open Sans", system-ui, sans-serif',
    fontSize: 14,
    fontWeight: '500',
    color: '#8A9BAD',
    letterSpacing: 0.3,
  },
});
