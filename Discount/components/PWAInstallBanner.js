import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from './Icon';
import { C, R } from '../data/theme';

const DISMISSED_KEY = 'dd_pwa_dismissed';
const SHOW_DELAY_MS = 12000; // show after 12s of engagement

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(110)).current;

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    // Already installed (standalone mode) — hide forever
    if (window.matchMedia?.('(display-mode: standalone)')?.matches) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    AsyncStorage.getItem(DISMISSED_KEY).then(dismissed => {
      if (dismissed) return;
      const timer = setTimeout(() => {
        setVisible(true);
        Animated.spring(slideAnim, {
          toValue: 0, useNativeDriver: true, tension: 60, friction: 11,
        }).start();
      }, SHOW_DELAY_MS);
      return () => clearTimeout(timer);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = async () => {
    Animated.timing(slideAnim, { toValue: 110, duration: 220, useNativeDriver: true })
      .start(() => setVisible(false));
    await AsyncStorage.setItem(DISMISSED_KEY, '1');
  };

  const install = async () => {
    if (!deferredPrompt) {
      // iOS Safari — no prompt API, just tell user how
      dismiss();
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      await AsyncStorage.setItem(DISMISSED_KEY, '1');
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!visible || Platform.OS !== 'web') return null;

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.left}>
        <View style={styles.appIcon}>
          <Text style={styles.appIconTxt}>D%</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Donnie Discount</Text>
          <Text style={styles.sub}>Voeg toe aan beginscherm · Altijd bij de hand</Text>
        </View>
      </View>
      <View style={styles.right}>
        <TouchableOpacity style={styles.dismissBtn} onPress={dismiss} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Icon name="close" size={16} color={C.grey} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.installBtn} onPress={install} activeOpacity={0.85}>
          <Text style={styles.installTxt}>Installeer</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    bottom: 80,
    left: 12,
    right: 12,
    zIndex: 200,
    backgroundColor: C.white,
    borderRadius: R.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 24,
    borderWidth: 1,
    borderColor: C.border,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: C.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appIconTxt: {
    color: C.white,
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontWeight: '800',
    fontSize: 13,
  },
  title: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 13,
    fontWeight: '700',
    color: C.dark,
  },
  sub: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 11,
    color: C.grey,
    marginTop: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dismissBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: C.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  installBtn: {
    backgroundColor: C.red,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: R.md,
  },
  installTxt: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 13,
    fontWeight: '700',
    color: C.white,
  },
});
