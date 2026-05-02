import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { AdBanner } from '../components/AdBanner';
import { useProgressStore } from '../store/useProgressStore';
import { playMusic } from '../services/audio';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainMenu'>;
};

export function MainMenuScreen({ navigation }: Props) {
  const totalStars = useProgressStore((s) => s.totalStars);
  const coins = useProgressStore((s) => s.coins);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    playMusic('menu');

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Background orbs */}
      <View style={[styles.orb, styles.orbA]} />
      <View style={[styles.orb, styles.orbB]} />
      <View style={[styles.orb, styles.orbC]} />

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.statChip}>
          <Text style={styles.statIcon}>★</Text>
          <Text style={styles.statText}>{totalStars}</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statIcon}>◈</Text>
          <Text style={styles.statText}>{coins}</Text>
        </View>
      </View>

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoArea,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.marbleIcon}>
          <View style={styles.marbleHighlight} />
        </View>
        <Text style={styles.titleTop}>MARBLE</Text>
        <Text style={styles.titleBottom}>MAZE</Text>
      </Animated.View>

      {/* Buttons */}
      <Animated.View
        style={[
          styles.btnArea,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <MenuButton
          label="▶  Play"
          onPress={() => navigation.navigate('WorldSelect')}
          variant="primary"
        />
        <MenuButton
          label="◆  Wallet"
          onPress={() => navigation.navigate('Wallet')}
          variant="secondary"
        />
        <MenuButton
          label="◉  Skins"
          onPress={() => navigation.navigate('Skins')}
          variant="secondary"
        />
        <MenuButton
          label="⚙  Settings"
          onPress={() => navigation.navigate('Settings')}
          variant="secondary"
        />
      </Animated.View>

      {/* Banner Ad */}
      <AdBanner />
    </View>
  );
}

interface BtnProps {
  label: string;
  onPress: () => void;
  variant: 'primary' | 'secondary';
}

function MenuButton({ label, onPress, variant }: BtnProps) {
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        variant === 'primary' ? styles.btnPrimary : styles.btnSecondary,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.btnText, variant === 'primary' && styles.btnTextPrimary]}>
        {label}
      </Text>
    </TouchableOpacity>
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
    opacity: 0.1,
  },
  orbA: {
    width: 350,
    height: 350,
    backgroundColor: COLORS.primary,
    top: -120,
    left: -100,
  },
  orbB: {
    width: 280,
    height: 280,
    backgroundColor: COLORS.accent,
    bottom: -60,
    right: -80,
  },
  orbC: {
    width: 200,
    height: 200,
    backgroundColor: '#00ccff',
    bottom: 100,
    left: -60,
  },
  statsBar: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: {
    color: COLORS.accentAlt,
    fontSize: 14,
  },
  statText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  marbleIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#c8c8d8',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  marbleHighlight: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.7)',
    margin: 8,
  },
  titleTop: {
    color: COLORS.primary,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 10,
  },
  titleBottom: {
    color: COLORS.text,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 10,
  },
  btnArea: {
    width: 240,
    gap: SPACING.sm,
  },
  btn: {
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  btnSecondary: {
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  btnTextPrimary: {
    color: COLORS.text,
  },
});
