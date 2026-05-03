import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, SafeAreaView,
  RefreshControl, TouchableOpacity, TextInput,
  ActivityIndicator, ScrollView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DealCard from '../components/DealCard';
import DealModal from '../components/DealModal';
import FilterPanel from '../components/FilterPanel';
import MenuDrawer from '../components/MenuDrawer';
import FavoritesScreen from './FavoritesScreen';
import RewardsScreen from './RewardsScreen';
import { fetchDeals } from '../services/api';
import { mockDeals } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import { C, R } from '../data/theme';

const PAGE_SIZE = 8;

export default function HomeScreen() {
  const { t } = useLanguage();

  // ── Tab ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('home');

  // ── Deals ─────────────────────────────────────────────────────────────
  const [allDeals, setAllDeals] = useState([]);
  const [deals, setDeals] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Filters ───────────────────────────────────────────────────────────
  const [activeCat, setActiveCat] = useState('all');
  const [activeDisc, setActiveDisc] = useState(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);

  // ── Search ────────────────────────────────────────────────────────────
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);

  // ── Menu ──────────────────────────────────────────────────────────────
  const [menuVisible, setMenuVisible] = useState(false);

  // ── Selected deal (modal) ─────────────────────────────────────────────
  const [selectedDeal, setSelectedDeal] = useState(null);

  // ── Favorites ─────────────────────────────────────────────────────────
  const [favorites, setFavorites] = useState(new Set());

  // ── Rewards state ─────────────────────────────────────────────────────
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(1);
  const [clicks, setClicks] = useState(0);
  const [favCount, setFavCount] = useState(0);

  // ── Init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    loadDeals(activeCat, activeDisc, minPrice, maxPrice);
    loadFavorites();
    initRewards();
  }, []);

  // ── Deals loading ─────────────────────────────────────────────────────
  const loadDeals = useCallback(async (cat, disc, min, max, search = '') => {
    try {
      const minDiscount = disc ? parseInt(disc, 10) : undefined;
      let result = await fetchDeals({ category: cat, minDiscount, minPrice: min || undefined, maxPrice: max || undefined });

      if (search.trim()) {
        const q = search.toLowerCase();
        result = result.filter(d => d.title.toLowerCase().includes(q));
      }

      setAllDeals(result);
      setDeals(result.slice(0, PAGE_SIZE));
      setPage(1);
    } catch (err) {
      console.error('[HomeScreen]', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
    setLoading(true);
    loadDeals(activeCat, activeDisc, minPrice, maxPrice, query);
  }, [activeCat, activeDisc, minPrice, maxPrice, query, loadDeals]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDeals(activeCat, activeDisc, minPrice, maxPrice, query);
    setRefreshing(false);
  }, [activeCat, activeDisc, minPrice, maxPrice, query, loadDeals]);

  const onEndReached = () => {
    const next = page + 1;
    const more = allDeals.slice((next - 1) * PAGE_SIZE, next * PAGE_SIZE);
    if (!more.length) return;
    setDeals(prev => [...prev, ...more]);
    setPage(next);
  };

  // ── Search ────────────────────────────────────────────────────────────
  const handleQueryChange = (text) => {
    setQuery(text);
    if (!text.trim()) { setSuggestions([]); return; }
    const q = text.toLowerCase();
    const matches = mockDeals
      .filter(d => d.title.toLowerCase().includes(q))
      .slice(0, 5);
    setSuggestions(matches);
  };

  const handleSuggestionTap = (deal) => {
    setQuery(deal.title);
    setSuggestions([]);
    setSearchFocused(false);
    setSelectedDeal(deal);
    addClick();
  };

  const handleSearchSubmit = () => {
    setSuggestions([]);
    setSearchFocused(false);
    setLoading(true);
    loadDeals(activeCat, activeDisc, minPrice, maxPrice, query);
  };

  // ── Favorites ─────────────────────────────────────────────────────────
  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem('dd_favorites');
      if (stored) setFavorites(new Set(JSON.parse(stored)));
    } catch {}
  };

  const toggleFavorite = async (dealId) => {
    const next = new Set(favorites);
    if (next.has(dealId)) {
      next.delete(dealId);
    } else {
      next.add(dealId);
      await addPoints(5);
      const fc = favCount + 1;
      setFavCount(fc);
      await AsyncStorage.setItem('dd_fav_count', String(fc));
    }
    setFavorites(next);
    await AsyncStorage.setItem('dd_favorites', JSON.stringify([...next]));
  };

  // ── Rewards ───────────────────────────────────────────────────────────
  const initRewards = async () => {
    try {
      const [pts, cl, fc, st, lv] = await AsyncStorage.multiGet(
        ['dd_points', 'dd_clicks', 'dd_fav_count', 'dd_streak', 'dd_last_visit']
      );
      const p = parseInt(pts[1] || '0', 10);
      const c = parseInt(cl[1] || '0', 10);
      const f = parseInt(fc[1] || '0', 10);
      let s = parseInt(st[1] || '1', 10);
      const lastVisit = lv[1];
      const today = new Date().toDateString();

      if (lastVisit && lastVisit !== today) {
        const diff = Math.round((new Date(today) - new Date(lastVisit)) / 86400000);
        s = diff === 1 ? s + 1 : 1;
      }

      await AsyncStorage.multiSet([
        ['dd_streak', String(s)],
        ['dd_last_visit', today],
      ]);

      // Daily visit bonus
      if (lastVisit !== today) {
        const newP = p + 2;
        setPoints(newP);
        await AsyncStorage.setItem('dd_points', String(newP));
      } else {
        setPoints(p);
      }

      setClicks(c);
      setFavCount(f);
      setStreak(s);
    } catch {}
  };

  const addPoints = async (amt) => {
    const next = points + amt;
    setPoints(next);
    await AsyncStorage.setItem('dd_points', String(next));
  };

  const addClick = async () => {
    const next = clicks + 1;
    setClicks(next);
    await AsyncStorage.setItem('dd_clicks', String(next));
    await addPoints(1);
  };

  const handleDealPress = (deal) => {
    setSelectedDeal(deal);
    addClick();
  };

  // ── Render helpers ────────────────────────────────────────────────────
  const activeFilterCount = [
    activeCat !== 'all',
    activeDisc !== null,
    minPrice !== '',
    maxPrice !== '',
  ].filter(Boolean).length;

  // ── UI ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>

      {/* ── Top Bar ──────────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        {/* Filter button */}
        <TouchableOpacity style={styles.iconBtn} onPress={() => setFilterVisible(true)}>
          <Text style={styles.iconBtnTxt}>⊟</Text>
          {activeFilterCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeTxt}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Brand mark */}
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkTxt}>D%</Text>
        </View>

        {/* Search */}
        <View style={[styles.searchWrap, searchFocused && styles.searchWrapFocused]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            ref={searchRef}
            style={styles.searchInput}
            value={query}
            onChangeText={handleQueryChange}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            onSubmitEditing={handleSearchSubmit}
            placeholder="Zoek deals..."
            placeholderTextColor={C.grey}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setSuggestions([]); applyFilters(); }}>
              <Text style={{ color: C.grey, fontSize: 14, paddingRight: 4 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Menu button */}
        <TouchableOpacity style={styles.iconBtn} onPress={() => setMenuVisible(true)}>
          <Text style={styles.iconBtnTxt}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* ── Search suggestions ────────────────────────────────────────── */}
      {searchFocused && suggestions.length > 0 && (
        <View style={styles.suggestions}>
          {suggestions.map(s => (
            <TouchableOpacity key={s.id} style={styles.suggestion} onPress={() => handleSuggestionTap(s)}>
              <Text style={styles.suggestionIcon}>🔍</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.suggestionTitle} numberOfLines={1}>{s.title}</Text>
                <Text style={styles.suggestionPrice}>€{s.discountedPrice.toFixed(2)} · -{s.discountPercentage}%</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── Content area ──────────────────────────────────────────────── */}
      <View style={{ flex: 1 }}>
        {activeTab === 'home' && (
          <>
            {loading && deals.length === 0 ? (
              <ActivityIndicator size="large" color={C.red} style={{ marginTop: 60 }} />
            ) : (
              <FlatList
                data={deals}
                keyExtractor={item => item.id}
                numColumns={2}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                  <DealCard
                    deal={item}
                    onPress={() => handleDealPress(item)}
                    onFavorite={() => toggleFavorite(item.id)}
                    isFavorited={favorites.has(item.id)}
                    t={t}
                  />
                )}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={C.red}
                    colors={[C.red]}
                  />
                }
                onEndReached={onEndReached}
                onEndReachedThreshold={0.5}
                ListHeaderComponent={
                  <View style={styles.listHeader}>
                    <Text style={styles.resultCount}>
                      {allDeals.length} deals gevonden
                    </Text>
                  </View>
                }
              />
            )}
          </>
        )}

        {activeTab === 'favorites' && (
          <FavoritesScreen
            allDeals={allDeals.length ? allDeals : mockDeals}
            favorites={favorites}
            onDealPress={handleDealPress}
            onFavoriteToggle={toggleFavorite}
            t={t}
          />
        )}

        {activeTab === 'rewards' && (
          <RewardsScreen
            points={points}
            streak={streak}
            clicks={clicks}
            favCount={favCount}
          />
        )}
      </View>

      {/* ── Bottom Tab Bar ────────────────────────────────────────────── */}
      <View style={styles.tabBar}>
        <TabBtn
          icon="❤️"
          label="Favorieten"
          active={activeTab === 'favorites'}
          badge={favorites.size > 0 ? favorites.size : null}
          onPress={() => setActiveTab('favorites')}
        />
        <TabBtn
          icon="🏠"
          label="Home"
          active={activeTab === 'home'}
          isCenter
          onPress={() => setActiveTab('home')}
        />
        <TabBtn
          icon="🎁"
          label="Rewards"
          active={activeTab === 'rewards'}
          onPress={() => setActiveTab('rewards')}
        />
      </View>

      {/* ── Modals ────────────────────────────────────────────────────── */}
      <DealModal
        deal={selectedDeal}
        visible={!!selectedDeal}
        onClose={() => setSelectedDeal(null)}
        isFavorited={selectedDeal ? favorites.has(selectedDeal.id) : false}
        onFavorite={() => selectedDeal && toggleFavorite(selectedDeal.id)}
        t={t}
      />

      <FilterPanel
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        activeCat={activeCat}
        setActiveCat={setActiveCat}
        activeDisc={activeDisc}
        setActiveDisc={setActiveDisc}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        onApply={applyFilters}
      />

      <MenuDrawer
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </SafeAreaView>
  );
}

function TabBtn({ icon, label, active, isCenter, badge, onPress }) {
  return (
    <TouchableOpacity style={[styles.tabBtn, isCenter && styles.tabBtnCenter]} onPress={onPress} activeOpacity={0.8}>
      {isCenter ? (
        <View style={[styles.tabCenterInner, active && styles.tabCenterActive]}>
          <Text style={styles.tabCenterIcon}>{icon}</Text>
        </View>
      ) : (
        <View style={styles.tabBtnInner}>
          <View>
            <Text style={[styles.tabIcon, active && styles.tabIconActive]}>{icon}</Text>
            {badge != null && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeTxt}>{badge > 9 ? '9+' : badge}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.lightGrey },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: R.md,
    backgroundColor: C.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconBtnTxt: { fontSize: 18, color: C.dark },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeTxt: { color: C.white, fontSize: 9, fontWeight: '900' },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: C.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandMarkTxt: {
    color: C.white,
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontWeight: '900',
    fontSize: 11,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.lightGrey,
    borderRadius: R.full,
    paddingHorizontal: 12,
    height: 38,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 6,
  },
  searchWrapFocused: {
    borderColor: C.red,
    backgroundColor: C.white,
  },
  searchIcon: { fontSize: 14 },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: 13,
    color: C.dark,
    outlineStyle: 'none',
    height: '100%',
  },

  // Suggestions
  suggestions: {
    position: 'absolute',
    top: 60,
    left: 8,
    right: 8,
    backgroundColor: C.white,
    borderRadius: R.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
    zIndex: 999,
    overflow: 'hidden',
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.lightGrey,
    gap: 10,
  },
  suggestionIcon: { fontSize: 14, color: C.grey },
  suggestionTitle: {
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: 13,
    fontWeight: '600',
    color: C.dark,
  },
  suggestionPrice: {
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: 11,
    color: C.grey,
    marginTop: 1,
  },

  // List
  list: { padding: 8, paddingBottom: 100 },
  listHeader: { paddingHorizontal: 6, paddingVertical: 8 },
  resultCount: {
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: 12,
    color: C.grey,
    fontWeight: '500',
  },

  // Bottom tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
  },
  tabBtnCenter: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 4,
  },
  tabBtnInner: { alignItems: 'center', gap: 2 },
  tabCenterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  tabCenterActive: { backgroundColor: C.red },
  tabCenterIcon: { fontSize: 24 },
  tabIcon: { fontSize: 20, opacity: 0.4, textAlign: 'center' },
  tabIconActive: { opacity: 1 },
  tabLabel: {
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: 10,
    color: C.grey,
    fontWeight: '500',
    marginTop: 2,
  },
  tabLabelActive: { color: C.red, fontWeight: '700' },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.red,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  tabBadgeTxt: { color: C.white, fontSize: 9, fontWeight: '900' },
});
