import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Coupon } from '../types';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useProgressStore } from '../store/useProgressStore';
import { CouponCard } from '../components/CouponCard';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Wallet'>;
};

export function WalletScreen({ navigation }: Props) {
  const wallet = useProgressStore((s) => s.couponWallet);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>◆ Coupon Wallet</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{wallet.length}</Text>
        </View>
      </View>

      {wallet.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>◆</Text>
          <Text style={styles.emptyTitle}>No coupons yet</Text>
          <Text style={styles.emptySubtitle}>
            Collect diamonds in levels to earn coupons
          </Text>
        </View>
      ) : (
        <FlatList<Coupon>
          data={wallet}
          keyExtractor={(c) => c.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <CouponCard coupon={item} collected />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    paddingVertical: 6,
    paddingRight: SPACING.sm,
  },
  backText: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: '600',
  },
  title: {
    flex: 1,
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  countBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    minWidth: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
  },
  countText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xxl,
  },
  emptyIcon: {
    color: COLORS.border,
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  grid: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  row: {
    gap: SPACING.md,
    justifyContent: 'flex-start',
  },
});
