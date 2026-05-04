import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from './Icon';
import { C, R, S } from '../data/theme';

export default function DealCard({ deal, onPress, onFavorite, isFavorited, t }) {
  const store = t?.affiliates?.[deal.affiliateStore] ?? { name: deal.affiliateStore, color: C.navy, textColor: C.white };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.93}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: deal.image }} style={styles.image} resizeMode="cover" />

        {/* Discount flag top-left */}
        <View style={styles.flag}>
          <Text style={styles.flagText}>-{deal.discountPercentage}%</Text>
        </View>

        {/* Heart aligned with flag (same top: 12) */}
        <TouchableOpacity style={styles.heartBtn} onPress={onFavorite} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Icon
            name={isFavorited ? 'favorite' : 'favorite-border'}
            size={16}
            color={isFavorited ? C.red : C.grey}
          />
        </TouchableOpacity>
      </View>

      {/* Info: title grows, price + store pinned to bottom */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{deal.title}</Text>
        <View style={styles.bottom}>
          <View style={styles.priceRow}>
            <Text style={styles.dealPrice}>€{deal.discountedPrice.toFixed(2)}</Text>
            <Text style={styles.origPrice}>€{deal.originalPrice.toFixed(2)}</Text>
          </View>
          <View style={[styles.storeBadge, { backgroundColor: store.color + '18' }]}>
            <Text style={[styles.storeText, { color: store.color }]}>{store.name}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: C.white,
    borderRadius: R.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  imageWrap: {
    position: 'relative',
    width: '100%',
    height: 170,
    backgroundColor: C.lightGrey,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  flag: {
    position: 'absolute',
    top: 12,
    left: 0,
    backgroundColor: C.red,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  flagText: {
    color: C.white,
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontWeight: '800',
    fontSize: 16,
  },
  heartBtn: {
    position: 'absolute',
    top: 12,       // aligned with flag
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 90,
  },
  title: {
    ...S.h3,
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 6,
  },
  bottom: {
    gap: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  dealPrice: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 21,
    fontWeight: '800',
    color: C.dark,
  },
  origPrice: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 11,
    color: C.grey,
    textDecorationLine: 'line-through',
  },
  storeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: R.full,
  },
  storeText: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 10,
    fontWeight: '700',
  },
});
