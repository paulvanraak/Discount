import React, { useState, useEffect, useRef } from 'react';
import {
  Modal, View, Text, Image, StyleSheet, TouchableOpacity,
  ScrollView, Linking, Share, Animated,
} from 'react-native';
import Icon from './Icon';
import { C, R } from '../data/theme';
import { buildAffiliateUrl } from '../services/affiliate';
import { trackPurchaseIntent } from '../services/analytics';
import { useLanguage } from '../context/LanguageContext';

export default function DealModal({ deal, visible, onClose, isFavorited, onFavorite, t }) {
  const { region } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [currentDeal, setCurrentDeal] = useState(deal);
  const slideAnim = useRef(new Animated.Value(700)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && deal) {
      setCurrentDeal(deal);
      setMounted(true);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 700, duration: 240, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start(() => {
        slideAnim.setValue(700);
        fadeAnim.setValue(0);
        setMounted(false);
      });
    }
  }, [visible, deal]);

  if (!currentDeal) return null;

  const store = t?.affiliates?.[currentDeal.affiliateStore] ?? { name: currentDeal.affiliateStore, color: C.navy, textColor: C.white, url: '' };
  const affiliateUrl = buildAffiliateUrl(currentDeal, store, region);
  const savings = (currentDeal.originalPrice - currentDeal.discountedPrice).toFixed(2);

  const handleViewDeal = () => {
    trackPurchaseIntent(currentDeal);
    Linking.openURL(affiliateUrl).catch(() => {});
    onClose();
  };

  const handleShare = async () => {
    try {
      const msg = `${currentDeal.title} — €${currentDeal.discountedPrice.toFixed(2)} (was €${currentDeal.originalPrice.toFixed(2)}) – ${currentDeal.discountPercentage}% off! ${affiliateUrl}`;
      await Share.share({ message: msg });
    } catch {}
  };

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Backdrop fades in independently — no sliding rectangle */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        </Animated.View>

        {/* Sheet slides up independently */}
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.handle} />

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.imageWrap}>
              <Image source={{ uri: currentDeal.image }} style={styles.image} resizeMode="cover" />
              <View style={styles.flag}>
                <Text style={styles.flagText}>-{currentDeal.discountPercentage}%</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Icon name="close" size={18} color={C.dark} />
              </TouchableOpacity>
            </View>

            <View style={styles.body}>
              <View style={[styles.storeBadge, { backgroundColor: store.color + '18' }]}>
                <Text style={[styles.storeText, { color: store.color }]}>{store.name}</Text>
              </View>

              <Text style={styles.title}>{currentDeal.title}</Text>

              <View style={styles.priceBlock}>
                <Text style={styles.dealPrice}>€{currentDeal.discountedPrice.toFixed(2)}</Text>
                <View style={styles.priceRight}>
                  <Text style={styles.origPrice}>€{currentDeal.originalPrice.toFixed(2)}</Text>
                  <Text style={styles.savings}>Je bespaart €{savings}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <InfoRow icon="local-offer" label="Korting" value={`${currentDeal.discountPercentage}% korting`} />
              <InfoRow icon="store" label="Winkel" value={store.name} />
              {currentDeal.fomoKey ? <InfoRow icon="bolt" label="Status" value={getFomoText(currentDeal.fomoKey)} /> : null}

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
        </Animated.View>
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
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.52)',
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
