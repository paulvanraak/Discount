import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Coupon } from '../types';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

// Category accent colours (used when no logo available)
const CATEGORY_COLORS: Record<string, string> = {
  fashion:     '#ff6b9d',
  sports:      '#66cc44',
  electronics: '#00ccff',
  travel:      '#ffd166',
  food_drink:  '#ff9944',
  home_garden: '#88cc88',
};

interface Props {
  coupon: Coupon;
  collected?: boolean; // dim if not yet collected
  compact?: boolean;   // smaller card for horizontal list
}

export function CouponCard({ coupon, collected = true, compact = false }: Props) {
  const accent = CATEGORY_COLORS[coupon.category] ?? COLORS.primary;

  const handlePress = async () => {
    if (!coupon.affiliateUrl) return;
    await WebBrowser.openBrowserAsync(coupon.affiliateUrl, {
      toolbarColor: '#080818',
      controlsColor: accent,
      dismissButtonStyle: 'close',
    });
  };

  // Brand initials for placeholder logo
  const initials = coupon.advertiserName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const expiryText = coupon.expiresAt
    ? `Geldig t/m ${new Date(coupon.expiresAt).toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'short',
      })}`
    : null;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        compact && styles.cardCompact,
        !collected && styles.cardDimmed,
        { borderColor: `${accent}55` },
      ]}
      onPress={handlePress}
      activeOpacity={collected ? 0.8 : 1}
      disabled={!collected}
    >
      {/* Accent bar */}
      <View style={[styles.accentBar, { backgroundColor: accent }]} />

      {/* Header: logo + name */}
      <View style={styles.header}>
        {coupon.logoUrl ? (
          <Image
            source={{ uri: coupon.logoUrl }}
            style={styles.logo}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.logoPlaceholder, { backgroundColor: `${accent}33` }]}>
            <Text style={[styles.logoInitials, { color: accent }]}>{initials}</Text>
          </View>
        )}
        <View style={styles.headerText}>
          <Text style={styles.brandName} numberOfLines={1}>
            {coupon.advertiserName}
          </Text>
          {expiryText && (
            <Text style={styles.expiry}>{expiryText}</Text>
          )}
        </View>
      </View>

      {/* Discount badge */}
      <View style={[styles.badge, { backgroundColor: `${accent}22` }]}>
        <Text style={[styles.badgeText, { color: accent }]}>
          {coupon.discountText}
        </Text>
      </View>

      {/* Description */}
      {!compact && (
        <Text style={styles.description} numberOfLines={2}>
          {coupon.description}
        </Text>
      )}

      {/* Code + CTA */}
      <View style={styles.footer}>
        {coupon.code ? (
          <View style={styles.codePill}>
            <Text style={styles.codeText}>{coupon.code}</Text>
          </View>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        {collected && (
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: accent }]}
            onPress={handlePress}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>Gebruik →</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  cardCompact: {
    width: 170,
    padding: SPACING.sm,
  },
  cardDimmed: {
    opacity: 0.4,
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: 4,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
  },
  logoPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInitials: {
    fontSize: 13,
    fontWeight: '800',
  },
  headerText: {
    flex: 1,
  },
  brandName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  expiry: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  codePill: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  codeText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  ctaBtn: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
  },
  ctaText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});
