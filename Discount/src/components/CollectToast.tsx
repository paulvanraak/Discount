import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';
import { Coupon } from '../types';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

const CATEGORY_COLORS: Record<string, string> = {
  fashion:     '#ff6b9d',
  sports:      '#66cc44',
  electronics: '#00ccff',
  travel:      '#ffd166',
  food_drink:  '#ff9944',
  home_garden: '#88cc88',
};

interface Props {
  coupon: Coupon | null;
  onDone: () => void;
}

/**
 * Brief pop-up shown for 1.5 s when a coupon-diamond is collected mid-game.
 * Fades in → stays → fades out automatically.
 */
export function CollectToast({ coupon, onDone }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    if (!coupon) return;

    opacity.setValue(0);
    translateY.setValue(16);

    Animated.sequence([
      // Slide up + fade in
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, tension: 180, friction: 10, useNativeDriver: true }),
      ]),
      // Hold
      Animated.delay(1100),
      // Fade out
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => onDone());
  }, [coupon]);

  if (!coupon) return null;

  const accent = CATEGORY_COLORS[coupon.category] ?? COLORS.primary;

  return (
    <Animated.View
      style={[styles.container, { opacity, transform: [{ translateY }] }]}
      pointerEvents="none"
    >
      <View style={[styles.pill, { borderColor: `${accent}88` }]}>
        <Text style={styles.diamond}>◆</Text>
        <View>
          <Text style={[styles.discount, { color: accent }]}>
            {coupon.discountText}
          </Text>
          <Text style={styles.brand}>{coupon.advertiserName}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 60,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(18,18,42,0.92)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
  },
  diamond: {
    color: '#00ffff',
    fontSize: 16,
  },
  discount: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brand: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
});
