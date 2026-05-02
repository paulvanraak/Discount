import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants/theme';
import { useProgressStore } from '../store/useProgressStore';
import { initAudio } from '../services/audio';
import { initAds } from '../services/admob';

const { width, height } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

export function SplashScreen({ navigation }: Props) {
  const load = useProgressStore((s) => s.load);

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initialise services in parallel with animation
    Promise.all([
      load(),
      initAudio(),
    ]).then(() => {
      initAds();
    });

    // Logo fade+scale in
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 900,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 80,
        friction: 8,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtitle fades in after logo
    Animated.timing(subtitleOpacity, {
      toValue: 1,
      duration: 600,
      delay: 1000,
      useNativeDriver: true,
    }).start();

    // Navigate to menu after 2.5 s
    const timer = setTimeout(() => {
      navigation.replace('MainMenu');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Background glow orbs */}
      <View style={[styles.orb, styles.orbTop]} />
      <View style={[styles.orb, styles.orbBottom]} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        {/* Marble icon (simple circle) */}
        <View style={styles.marbleIcon}>
          <View style={styles.marbleHighlight} />
        </View>
        <Text style={styles.titleTop}>MARBLE</Text>
        <Text style={styles.titleBottom}>MAZE</Text>
      </Animated.View>

      {/* Subtitle */}
      <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
        Tilt to Roll • Reach the Exit
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.12,
  },
  orbTop: {
    width: 300,
    height: 300,
    backgroundColor: COLORS.primary,
    top: -100,
    left: -80,
  },
  orbBottom: {
    width: 250,
    height: 250,
    backgroundColor: COLORS.accent,
    bottom: -80,
    right: -60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  marbleIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#c8c8d8',
    marginBottom: 20,
    shadowColor: '#6c63ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 12,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  marbleHighlight: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    margin: 8,
  },
  titleTop: {
    color: COLORS.primary,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 12,
    lineHeight: 48,
  },
  titleBottom: {
    color: COLORS.text,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 12,
    lineHeight: 48,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    letterSpacing: 2,
    marginTop: 4,
    position: 'absolute',
    bottom: 48,
  },
});
