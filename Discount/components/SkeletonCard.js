import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { C, R } from '../data/theme';

export default function SkeletonCard() {
  const pulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 800, useNativeDriver: true }),
      ])
    ).start();
    return () => pulse.stopAnimation();
  }, []);

  return (
    <Animated.View style={[styles.card, { opacity: pulse }]}>
      <View style={styles.image} />
      <View style={styles.info}>
        <View style={styles.titleLine} />
        <View style={[styles.titleLine, { width: '65%' }]} />
        <View style={styles.priceRow}>
          <View style={styles.price} />
          <View style={styles.orig} />
        </View>
        <View style={styles.badge} />
      </View>
    </Animated.View>
  );
}

const BG = C.border;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: C.white,
    borderRadius: R.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 170,
    backgroundColor: BG,
  },
  info: {
    padding: 10,
    gap: 6,
  },
  titleLine: {
    height: 11,
    borderRadius: 6,
    backgroundColor: BG,
    width: '90%',
  },
  priceRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  price: {
    height: 20,
    width: 64,
    borderRadius: 6,
    backgroundColor: BG,
  },
  orig: {
    height: 12,
    width: 40,
    borderRadius: 6,
    backgroundColor: BG,
    alignSelf: 'flex-end',
  },
  badge: {
    height: 18,
    width: 60,
    borderRadius: R.full,
    backgroundColor: BG,
    marginTop: 2,
  },
});
