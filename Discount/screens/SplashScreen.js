import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';
import BrandMark from '../components/BrandMark';

export default function SplashScreen({ navigation }) {
  const { setLang, setRegion } = useLanguage();
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Fade + slide the logo in
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 14, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(async () => {
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
    }, 1800);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <BrandMark size={96} />
        <View style={styles.textWrap}>
          <Text style={styles.line1}>Donnie</Text>
          <Text style={styles.line2}>Discount</Text>
        </View>
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
  logoWrap: {
    alignItems: 'center',
    gap: 0,
  },
  textWrap: {
    alignItems: 'center',
    marginTop: 20,
    gap: 0,
  },
  line1: {
    fontFamily: 'Nunito, "Open Sans", system-ui, sans-serif',
    fontSize: 52,
    fontWeight: '900',
    color: '#111111',
    lineHeight: 58,
  },
  line2: {
    fontFamily: 'Nunito, "Open Sans", system-ui, sans-serif',
    fontSize: 52,
    fontWeight: '900',
    color: '#111111',
    lineHeight: 56,
  },
  tagline: {
    fontFamily: '"Open Sans", system-ui, sans-serif',
    fontSize: 14,
    fontWeight: '500',
    color: '#8A9BAD',
    marginTop: 20,
    letterSpacing: 0.3,
  },
});
