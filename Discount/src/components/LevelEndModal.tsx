import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  ScrollView,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { StarRating } from './StarRating';
import { CouponCard } from './CouponCard';
import { Coupon } from '../types';

interface Props {
  visible: boolean;
  stars: number;
  time: number;
  diamonds: number;
  totalDiamonds: number;
  coinsEarned: number;
  isNewBest: boolean;
  collectedCoupons: Coupon[];
  allCoupons: Coupon[];
  onNext: () => void;
  onRetry: () => void;
  onMenu: () => void;
  hasNextLevel: boolean;
}

export function LevelEndModal({
  visible,
  stars,
  time,
  diamonds,
  totalDiamonds,
  coinsEarned,
  isNewBest,
  collectedCoupons,
  allCoupons,
  onNext,
  onRetry,
  onMenu,
  hasNextLevel,
}: Props) {
  const slideAnim = useRef(new Animated.Value(60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(60);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 120,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const cs = Math.floor((secs % 1) * 10);
    return `${m}:${s.toString().padStart(2, '0')}.${cs}`;
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View
          style={[
            styles.card,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Title */}
          <Text style={styles.title}>Level Clear!</Text>
          {isNewBest && <Text style={styles.newBest}>★ New Best!</Text>}

          {/* Stars */}
          <View style={styles.starsRow}>
            <StarRating stars={stars} size={44} animated={visible} />
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatBox label="Time" value={formatTime(time)} />
            <StatBox label="Diamonds" value={`${diamonds}/${totalDiamonds}`} />
            <StatBox label="Coins" value={`+${coinsEarned}`} color={COLORS.accentAlt} />
          </View>

          {/* Coupons */}
          {allCoupons.length > 0 && (
            <View style={styles.couponsSection}>
              <Text style={styles.couponsTitle}>◆ Coupons</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.couponsScroll}
              >
                {allCoupons.map((c) => (
                  <CouponCard
                    key={c.id}
                    coupon={c}
                    collected={collectedCoupons.some((cc) => cc.id === c.id)}
                    compact
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.btnRow}>
            {hasNextLevel && (
              <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={onNext} activeOpacity={0.8}>
                <Text style={styles.btnText}>Next ▶</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={onRetry} activeOpacity={0.8}>
              <Text style={styles.btnText}>Retry ↺</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={onMenu} activeOpacity={0.8}>
              <Text style={[styles.btnText, { color: COLORS.textSecondary }]}>Menu</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function StatBox({
  label,
  value,
  color = COLORS.text,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 340,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  newBest: {
    color: COLORS.accentAlt,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  starsRow: {
    marginVertical: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  btnRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
  },
  btn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
  },
  btnSecondary: {
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  couponsSection: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  couponsTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  couponsScroll: {
    gap: SPACING.sm,
    paddingBottom: 4,
  },
});
