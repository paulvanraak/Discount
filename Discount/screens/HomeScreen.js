import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  Linking,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as StoreReview from 'expo-store-review';
import DealCard from '../components/DealCard';
import { useLanguage } from '../context/LanguageContext';
import { fetchDeals } from '../services/api';

const CATEGORY_KEYS = ['all', 'tech', 'kitchen', 'home'];
const DISCOUNT_OPTIONS = ['50%+', '60%+', '70%+'];
const STORE_KEYS = ['primary', 'secondary', 'tertiary', 'quaternary', 'quinary'];
const PAGE_SIZE = 8;

export default function HomeScreen() {
  const { t } = useLanguage();

  // Filter state
  const [activeCat, setActiveCat]       = useState('all');
  const [activeDisc, setActiveDisc]     = useState(null);
  const [activeStores, setActiveStores] = useState(new Set()); // empty = all shown
  const [minPrice, setMinPrice]         = useState('');
  const [maxPrice, setMaxPrice]         = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // List state
  const [allDeals, setAllDeals]     = useState([]);
  const [deals, setDeals]           = useState([]);
  const [page, setPage]             = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [clicks, setClicks]         = useState(0);

  // Initial load
  React.useEffect(() => {
    loadDeals('all', null, new Set(), '', '');
  }, []);

  // ── Filtering ──────────────────────────────────────────────────────────────

  const loadDeals = useCallback(async (cat, disc, stores, min, max) => {
    try {
      // Server handles category, minDiscount, minPrice, maxPrice
      const minDiscount = disc ? parseInt(disc, 10) : undefined;
      let result = await fetchDeals({
        category:    cat,
        minDiscount,
        minPrice:    min || undefined,
        maxPrice:    max || undefined,
      });

      // Client-side store filter (language-specific — server doesn't know about it)
      if (stores.size > 0) {
        result = result.filter((d) => stores.has(d.affiliateStore));
      }

      setAllDeals(result);
      setDeals(result.slice(0, PAGE_SIZE));
      setPage(1);
    } catch (err) {
      console.error('[HomeScreen] loadDeals error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyAllFilters = useCallback((cat, disc, stores, min, max) => {
    setLoading(true);
    loadDeals(cat, disc, stores, min, max);
  }, [loadDeals]);

  const handleCategoryPress = (cat) => {
    setActiveCat(cat);
    applyAllFilters(cat, activeDisc, activeStores, minPrice, maxPrice);
  };

  const handleDiscountPress = (disc) => {
    const next = activeDisc === disc ? null : disc;
    setActiveDisc(next);
    applyAllFilters(activeCat, next, activeStores, minPrice, maxPrice);
  };

  const handleStorePress = (key) => {
    const next = new Set(activeStores);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setActiveStores(next);
    applyAllFilters(activeCat, activeDisc, next, minPrice, maxPrice);
  };

  const handlePriceBlur = () => {
    applyAllFilters(activeCat, activeDisc, activeStores, minPrice, maxPrice);
  };

  const clearPriceFilter = () => {
    setMinPrice('');
    setMaxPrice('');
    applyAllFilters(activeCat, activeDisc, activeStores, '', '');
  };

  // ── List events ────────────────────────────────────────────────────────────

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDeals(activeCat, activeDisc, activeStores, minPrice, maxPrice);
    setRefreshing(false);
  }, [activeCat, activeDisc, activeStores, minPrice, maxPrice, loadDeals]);

  const onEndReached = () => {
    const next = page + 1;
    const more = allDeals.slice((next - 1) * PAGE_SIZE, next * PAGE_SIZE);
    if (!more.length) return;
    setDeals((prev) => [...prev, ...more]);
    setPage(next);
  };

  const handleDealClick = async (deal) => {
    const store = t.affiliates[deal.affiliateStore];
    const url = store.url + '/' + deal.id;
    const newClicks = clicks + 1;
    setClicks(newClicks);
    if (newClicks === 5 && Platform.OS !== 'web') {
      const available = await StoreReview.isAvailableAsync();
      if (available) StoreReview.requestReview();
    }
    Linking.openURL(url).catch(() => {});
  };

  const getCategoryLabel = (key) =>
    ({ all: t.all, tech: t.tech, kitchen: t.kitchen, home: t.home })[key];

  // ── Filter UI ──────────────────────────────────────────────────────────────

  const renderFilters = () => (
    <View style={styles.filterWrapper}>
      {/* Row 1: Categories + Discounts */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {CATEGORY_KEYS.map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.chip, activeCat === key && styles.chipOn]}
            onPress={() => handleCategoryPress(key)}
          >
            <Text style={[styles.chipTxt, activeCat === key && styles.chipTxtOn]}>
              {getCategoryLabel(key)}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={styles.sep} />
        {DISCOUNT_OPTIONS.map((disc) => (
          <TouchableOpacity
            key={disc}
            style={[styles.chip, activeDisc === disc && styles.chipOn]}
            onPress={() => handleDiscountPress(disc)}
          >
            <Text style={[styles.chipTxt, activeDisc === disc && styles.chipTxtOn]}>
              {disc}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={styles.sep} />
        {/* Toggle advanced filters */}
        <TouchableOpacity
          style={[styles.chip, showAdvanced && styles.chipOn]}
          onPress={() => setShowAdvanced(!showAdvanced)}
        >
          <Text style={[styles.chipTxt, showAdvanced && styles.chipTxtOn]}>
            {t.filtersLabel} {showAdvanced ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Rows 2 + 3: shown only when advanced is open */}
      {showAdvanced && (
        <>
          {/* Row 2: Store toggles */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {STORE_KEYS.map((key) => {
              const store = t.affiliates[key];
              const active = activeStores.has(key);
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.storeChip,
                    { borderColor: store.color },
                    active && { backgroundColor: store.color },
                  ]}
                  onPress={() => handleStorePress(key)}
                >
                  <Text
                    style={[
                      styles.storeChipTxt,
                      { color: active ? store.textColor : store.color },
                    ]}
                  >
                    {store.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Row 3: Price range */}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{t.priceMin}</Text>
            <TextInput
              style={styles.priceInput}
              value={minPrice}
              onChangeText={setMinPrice}
              onBlur={handlePriceBlur}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#bbb"
              returnKeyType="done"
            />
            <Text style={styles.priceDash}>—</Text>
            <Text style={styles.priceLabel}>{t.priceMax}</Text>
            <TextInput
              style={styles.priceInput}
              value={maxPrice}
              onChangeText={setMaxPrice}
              onBlur={handlePriceBlur}
              keyboardType="numeric"
              placeholder="9999"
              placeholderTextColor="#bbb"
              returnKeyType="done"
            />
            {(minPrice || maxPrice) ? (
              <TouchableOpacity style={styles.clearBtn} onPress={clearPriceFilter}>
                <Text style={styles.clearTxt}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </>
      )}
    </View>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading && deals.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#FF8C00" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {renderFilters()}
        <FlatList
          data={deals}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <DealCard deal={item} onPress={() => handleDealClick(item)} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF8C00"
              colors={['#FF8C00']}
            />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
        />
      </KeyboardAvoidingView>

      {/* AdMob Banner Placeholder */}
      <View style={styles.adBanner}>
        <Text style={styles.adTxt}>{t.adLabel}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  filterWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  filterRow: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  chip: {
    backgroundColor: '#eee',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginHorizontal: 4,
    alignSelf: 'flex-start',
  },
  chipOn: {
    backgroundColor: '#FF8C00',
  },
  chipTxt: {
    color: '#333',
    fontWeight: '600',
    fontSize: 13,
  },
  chipTxtOn: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sep: {
    width: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 8,
    borderRadius: 1,
  },
  storeChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 2,
    alignSelf: 'flex-start',
  },
  storeChipTxt: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  priceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginRight: 4,
  },
  priceInput: {
    width: 70,
    height: 34,
    borderWidth: 1.5,
    borderColor: '#FF8C00',
    borderRadius: 8,
    paddingHorizontal: 8,
    fontSize: 13,
    color: '#333',
    backgroundColor: '#fff',
  },
  priceDash: {
    marginHorizontal: 8,
    color: '#999',
    fontSize: 16,
  },
  clearBtn: {
    marginLeft: 10,
    backgroundColor: '#FF3B30',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearTxt: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  listContent: {
    padding: 8,
    paddingBottom: 60,
  },
  adBanner: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 50,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adTxt: {
    color: '#666',
    fontWeight: 'bold',
  },
});