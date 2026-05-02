import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';

export default function DealCard({ deal, onPress }) {
  const { t } = useLanguage();
  const [isFavorited, setIsFavorited] = useState(false);

  const store = t.affiliates[deal.affiliateStore];
  const affiliateUrl = store.url + '/' + deal.id;
  const fomoText = deal.fomoKey ? t.fomo[deal.fomoKey] : '';

  const handleShare = async () => {
    try {
      await Share.share({
        message: t.shareMsg(deal.title, deal.discountPercentage, affiliateUrl),
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleFavorite = async () => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      const favorites = stored ? JSON.parse(stored) : [];
      if (isFavorited) {
        await AsyncStorage.setItem(
          'favorites',
          JSON.stringify(favorites.filter((f) => f.id !== deal.id))
        );
        setIsFavorited(false);
      } else {
        await AsyncStorage.setItem('favorites', JSON.stringify([...favorites, deal]));
        setIsFavorited(true);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: deal.image }} style={styles.image} />

      {/* Discount badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>-{deal.discountPercentage}%</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>{deal.title}</Text>

        {fomoText ? <Text style={styles.fomo}>{fomoText}</Text> : null}

        <View style={styles.priceRow}>
          <Text style={styles.originalPrice}>€{deal.originalPrice.toFixed(2)}</Text>
          <Text style={styles.newPrice}>€{deal.discountedPrice.toFixed(2)}</Text>
        </View>

        {/* Store badge */}
        <View style={[styles.storeBadge, { backgroundColor: store.color }]}>
          <Text style={[styles.storeText, { color: store.textColor }]}>{store.name}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.favoriteBtn} onPress={handleFavorite}>
            <Text style={{ fontSize: 16 }}>{isFavorited ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Text style={styles.shareText}>{t.share}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  infoContainer: {
    padding: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  fomo: {
    fontSize: 11,
    color: '#FF9500',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  newPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
  },
  storeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 8,
  },
  storeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoriteBtn: {
    padding: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  shareBtn: {
    backgroundColor: '#25D366',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  shareText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});