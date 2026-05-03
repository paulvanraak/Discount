import React from 'react';
import {
  Modal, View, Text, Image, StyleSheet, TouchableOpacity,
  ScrollView, Linking, Share, Platform,
} from 'react-native';
import Icon from './Icon';
import { C, R } from '../data/theme';

export default function DealModal({ deal, visible, onClose, isFavorited, onFavorite, t }) {
  if (!deal) return null;

  const store = t?.affiliates?.[deal.affiliateStore] ?? { name: deal.affiliateStore, color: C.navy, textColor: C.white, url: '' };
  const affiliateUrl = store.url + '/' + deal.id;
  const savings = (deal.originalPrice - deal.discountedPrice).toFixed(2);

  const handleViewDeal = () => {
    Linking.openURL(affiliateUrl).catch(() => {});
    onClose();
  };

  const handleShare = async () => {
    try {
      const msg = `${deal.title} — €${deal.discountedPrice.toFixed(2)} (was €${deal.originalPrice.toFixed(2)}) – ${deal.discountPercentage}% off! ${affiliateUrl}`;
      await Share.share({ message: msg });
    } catch {}
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

      <View style={styles.sheet}>
        <View style={styles.handle} />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.imageWrap}>
            <Image source={{ uri: deal.image }} style={styles.image} resizeMode="cover" />
            <View style={styles.flag}>
              <Text style={styles.flagText}>-{deal.discountPercentage}%</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Icon name="close" size={18} color={C.dark} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <View style={[styles.storeBadge, { backgroundColor: store.color + '18' }]}>
              <Text style={[styles.storeText, { color: store.color }]}>{store.name}</Text>
            </View>

            <Text style={styles.title}>{deal.title}</Text>

            <View style={styles.priceBlock}>
              <Text style={styles.dealPrice}>€{deal.discountedPrice.toFixed(2)}</Text>
              <View style={styles.priceRight}>
                <Text style={styles.origPrice}>€{deal.originalPrice.toFixed(2)}</Text>
                <Text style={styles.savings}>Je bespaart €{savings}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <InfoRow icon="local-offer" label="Korting" value={`${deal.discountPercentage}% korting`} />
            <InfoRow icon="store" label="Winkel" value={store.name} />
            {deal.fomoKey ? <InfoRow icon="bolt" label="Status" value={getFomoText(deal.fomoKey)} /> : null}

            <TouchableOpacity style={styles.ctaBtn} onPress={handleViewDeal}>
              <Text style={styles.ctaText}>Bekijk Deal bij {store.name}</Text>
              <Icon name="arrow-forward" size={18} color={C.white} style={{ marginLeft: 6 }} />
            </TouchableOpacity>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn} onPress={onFavorite}>
                <Icon
                  name={isFavorited ? 'favorite' : 'favorite-border'}
                  size={24}
                  color={isFavorited ? C.red : C.grey}
                />
                <Text style={styles.actionLabel}>{isFavorited ? 'Opgeslagen' : 'Opslaan'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
                <Icon name="share" size={24} color={C.grey} />
                <Text style={styles.actionLabel}>Delen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Icon name={icon} size={18} color={C.grey} style={{ width: 24 }} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function getFomoText(key) {
  const map = {
    hot: 'Bijna uitverkocht',
    timer: 'Verloopt binnenkort',
    popular: 'Meest geklikt',
    limited: 'Beperkt op voorraad',
    flash: 'Flash sale',
    stock: 'Slechts 2 op voorraad',
    bestseller: 'Bestseller',
    today: 'Nog vandaag',
    hour3: 'Nog 3 uur',
    topdeal: 'Top deal',
  };
  return map[key] || '';
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  imageWrap: {
    width: '100%',
    height: 240,
    backgroundColor: C.lightGrey,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  flag: {
    position: 'absolute',
    top: 16,
    left: 0,
    backgroundColor: C.red,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  flagText: {
    color: C.white,
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontWeight: '800',
    fontSize: 14,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    padding: 20,
  },
  storeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: R.full,
    marginBottom: 10,
  },
  storeText: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 18,
    fontWeight: '700',
    color: C.dark,
    lineHeight: 26,
    marginBottom: 14,
  },
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dealPrice: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 34,
    fontWeight: '800',
    color: C.dark,
  },
  priceRight: {
    alignItems: 'flex-end',
  },
  origPrice: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 14,
    color: C.grey,
    textDecorationLine: 'line-through',
  },
  savings: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 12,
    fontWeight: '600',
    color: C.success,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  infoLabel: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 12,
    color: C.grey,
    width: 60,
  },
  infoValue: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 12,
    fontWeight: '600',
    color: C.dark,
    flex: 1,
  },
  ctaBtn: {
    backgroundColor: C.red,
    borderRadius: R.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  ctaText: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    color: C.white,
    fontWeight: '700',
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 8,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 6,
  },
  actionLabel: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 11,
    color: C.grey,
    fontWeight: '500',
  },
});
