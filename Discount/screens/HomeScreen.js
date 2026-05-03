import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, SafeAreaView,
  RefreshControl, TouchableOpacity, TextInput,
  ActivityIndicator, ScrollView, Platform, Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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

  const [activeTab, setActiveTab] = useState('home');
  const [allDeals, setAllDeals] = useState([]);
  const [deals, setDeals] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeCat, setActiveCat] = useState('all');
  const [activeDisc, setActiveDisc] = useState(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(1);
  const [clicks, setClicks] = useState(0);
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    loadDeals(activeCat, activeDisc, minPrice, maxPrice);
    loadFavorites();
    initRewards();
  }, []);

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

  const handleQueryChange = (text) => {
    setQuery(text);
    if (!text.trim()) { setSuggestions([]); return; }
    const q = text.toLowerCase();
    const matches = mockDeals.filter(d => d.title.toLowerCase().includes(q)).slice(0, 5);
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
      await AsyncStorage.multiSet([['dd_streak', String(s)], ['dd_last_visit', today]]);

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

  const activeFilterCount = [activeCat !== 'all', activeDisc !== null, minPrice !== '', maxPrice !== ''].filter(Boolean).length;

  // Derive featured + flash deals from current result set
  const featuredDeal = allDeals.find(d => d.fomoKey === 'hot') || allDeals[0];
  const flashDeals = allDeals.filter(d => ['flash', 'hour3', 'limited', 'timer'].includes(d.fomoKey)).slice(0, 6);
  const gridDeals = deals;

  return (
    <SafeAreaView style={styles.safe}>

      {/* ── Top Bar ──────────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setFilterVisible(true)}>
          <MaterialIcons name="tune" size={20} color={C.dark} />
          {activeFilterCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeTxt}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.brandMark}>
          <Text style={styles.brandMarkTxt}>D%</Text>
        </View>

        <View style={[styles.searchWrap, searchFocused && styles.searchWrapFocused]}>
          <MaterialIcons name="search" size={16} color={C.grey} />
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
              <MaterialIcons name="close" size={16} color={C.grey} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.iconBtn} onPress={() => setMenuVisible(true)}>
          <MaterialIcons name="menu" size={20} color={C.dark} />
        </TouchableOpacity>
      </View>

      {/* ── Search suggestions ────────────────────────────────────────── */}
      {searchFocused && suggestions.length > 0 && (
        <View style={styles.suggestions}>
          {suggestions.map(s => (
            <TouchableOpacity key={s.id} style={styles.suggestion} onPress={() => handleSuggestionTap(s)}>
              <MaterialIcons name="search" size={14} color={C.grey} />
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
                data={gridDeals}
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
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.red} colors={[C.red]} />
                }
                onEndReached={onEndReached}
                onEndReachedThreshold={0.5}
                ListHeaderComponent={
                  <HomeHeader
                    featuredDeal={featuredDeal}
                    flashDeals={flashDeals}
                    dealCount={allDeals.length}
                    favorites={favorites}
                    onDealPress={handleDealPress}
                    onFavorite={toggleFavorite}
                    t={t}
                  />
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
          <RewardsScreen points={points} streak={streak} clicks={clicks} favCount={favCount} />
        )}
      </View>

      {/* ── Bottom Tab Bar ────────────────────────────────────────────── */}
      <View style={styles.tabBar}>
        <TabBtn
          icon="favorite-border"
          iconActive="favorite"
          label="Favorieten"
          active={activeTab === 'favorites'}
          badge={favorites.size > 0 ? favorites.size : null}
          onPress={() => setActiveTab('favorites')}
        />
        <TabBtn
          icon="home"
          iconActive="home"
          label="Home"
          active={activeTab === 'home'}
          isCenter
          onPress={() => setActiveTab('home')}
        />
        <TabBtn
          icon="card-giftcard"
          iconActive="card-giftcard"
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

      <MenuDrawer visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </SafeAreaView>
  );
}

/* ── Premium Home Header ─────────────────────────────────────────────── */

function HomeHeader({ featuredDeal, flashDeals, dealCount, favorites, onDealPress, onFavorite, t }) {
  if (!featuredDeal) return null;

  const store = t?.affiliates?.[featuredDeal.affiliateStore] ?? { name: featuredDeal.affiliateStore, color: C.navy };

  return (
    <View>
      {/* Featured Deal */}
      <View style={styles.featuredWrap}>
        <View style={styles.featuredLabelRow}>
          <MaterialIcons name="local-fire-department" size={14} color={C.red} />
          <Text style={styles.featuredLabel}>UITGELICHTE DEAL</Text>
        </View>

        <TouchableOpacity style={styles.featuredCard} onPress={() => onDealPress(featuredDeal)} activeOpacity={0.93}>
          <Image source={{ uri: featuredDeal.image }} style={styles.featuredImage} resizeMode="cover" />
          <View style={styles.featuredOverlay}>
            <View style={[styles.featuredStoreBadge, { backgroundColor: store.color }]}>
              <Text style={styles.featuredStoreTxt}>{store.name}</Text>
            </View>
            <Text style={styles.featuredTitle} numberOfLines={2}>{featuredDeal.title}</Text>
            <View style={styles.featuredPriceRow}>
              <Text style={styles.featuredPrice}>€{featuredDeal.discountedPrice.toFixed(2)}</Text>
              <Text style={styles.featuredOrig}>€{featuredDeal.originalPrice.toFixed(2)}</Text>
              <View style={styles.featuredDiscount}>
                <Text style={styles.featuredDiscountTxt}>-{featuredDeal.discountPercentage}%</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.featuredHeart}
            onPress={() => onFavorite(featuredDeal.id)}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <MaterialIcons
              name={favorites.has(featuredDeal.id) ? 'favorite' : 'favorite-border'}
              size={18}
              color={favorites.has(featuredDeal.id) ? C.red : C.grey}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* Flash Deals horizontal scroll */}
      {flashDeals.length > 0 && (
        <View style={styles.flashSection}>
          <View style={styles.sectionHeaderRow}>
            <MaterialIcons name="bolt" size={18} color={C.warning} />
            <Text style={styles.sectionTitle}>Flash Deals</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.flashScroll}>
            {flashDeals.map(deal => (
              <FlashCard
                key={deal.id}
                deal={deal}
                isFavorited={favorites.has(deal.id)}
                onPress={() => onDealPress(deal)}
                onFavorite={() => onFavorite(deal.id)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* All deals section header */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Alle Deals</Text>
        <Text style={styles.sectionCount}>{dealCount} gevonden</Text>
      </View>
    </View>
  );
}

function FlashCard({ deal, isFavorited, onPress, onFavorite }) {
  return (
    <TouchableOpacity style={styles.flashCard} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.flashImageWrap}>
        <Image source={{ uri: deal.image }} style={styles.flashImage} resizeMode="cover" />
        <View style={styles.flashFlag}>
          <Text style={styles.flashFlagTxt}>-{deal.discountPercentage}%</Text>
        </View>
        <TouchableOpacity style={styles.flashHeart} onPress={onFavorite} hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}>
          <MaterialIcons name={isFavorited ? 'favorite' : 'favorite-border'} size={13} color={isFavorited ? C.red : C.grey} />
        </TouchableOpacity>
      </View>
      <View style={styles.flashInfo}>
        <Text style={styles.flashTitle} numberOfLines={2}>{deal.title}</Text>
        <Text style={styles.flashPrice}>€{deal.discountedPrice.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

/* ── Tab button ──────────────────────────────────────────────────────── */

function TabBtn({ icon, iconActive, label, active, isCenter, badge, onPress }) {
  const iconName = active ? iconActive : icon;
  return (
    <TouchableOpacity style={[styles.tabBtn, isCenter && styles.tabBtnCenter]} onPress={onPress} activeOpacity={0.8}>
      {isCenter ? (
        <View style={[styles.tabCenterInner, active && styles.tabCenterActive]}>
          <MaterialIcons name={iconName} size={26} color={active ? C.white : C.grey} />
        </View>
      ) : (
        <View style={styles.tabBtnInner}>
          <View style={{ position: 'relative' }}>
            <MaterialIcons name={iconName} size={22} color={active ? C.red : C.grey} />
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

/* ── Styles ──────────────────────────────────────────────────────────── */

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
  searchWrapFocused: { borderColor: C.red, backgroundColor: C.white },
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
  list: { paddingBottom: 100 },

  // Featured Deal
  featuredWrap: { paddingHorizontal: 12, paddingTop: 16, paddingBottom: 4 },
  featuredLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  featuredLabel: {
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: 10,
    fontWeight: '700',
    color: C.red,
    letterSpacing: 1,
  },
  featuredCard: {
    borderRadius: R.xl,
    overflow: 'hidden',
    backgroundColor: C.dark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  featuredImage: {
    width: '100%',
    height: 200,
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 40,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  featuredStoreBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: R.full,
    marginBottom: 6,
  },
  featuredStoreTxt: {
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: 10,
    fontWeight: '700',
    color: C.white,
  },
  featuredTitle: {
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
    lineHeight: 22,
    marginBottom: 8,
  },
  featuredPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuredPrice: {
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: 20,
    fontWeight: '900',
    color: C.white,
  },
  featuredOrig: {
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    textDecorationLine: 'line-through',
    flex: 1,
  },
  featuredDiscount: {
    backgroundColor: C.red,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: R.full,
  },
  featuredDiscountTxt: {
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: 11,
    fontWeight: '800',
    color: C.white,
  },
  featuredHeart: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Flash deals
  flashSection: { paddingTop: 16 },
  flashScroll: { paddingHorizontal: 12, paddingBottom: 4, gap: 10 },
  flashCard: {
    width: 140,
    backgroundColor: C.white,
    borderRadius: R.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  flashImageWrap: {
    width: '100%',
    height: 110,
    backgroundColor: C.lightGrey,
    position: 'relative',
  },
  flashImage: { width: '100%', height: '100%' },
  flashFlag: {
    position: 'absolute',
    top: 8,
    left: 0,
    backgroundColor: C.red,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  flashFlagTxt: {
    color: C.white,
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontWeight: '800',
    fontSize: 10,
  },
  flashHeart: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashInfo: { padding: 8 },
  flashTitle: {
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: 12,
    fontWeight: '600',
    color: C.dark,
    lineHeight: 16,
    marginBottom: 4,
  },
  flashPrice: {
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: 13,
    fontWeight: '800',
    color: C.dark,
  },

  // Section headers
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 6,
  },
  sectionTitle: {
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: 15,
    fontWeight: '700',
    color: C.dark,
    flex: 1,
  },
  sectionCount: {
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
  tabBtn: { flex: 1, alignItems: 'center' },
  tabBtnCenter: { flex: 1, alignItems: 'center', marginBottom: 4 },
  tabBtnInner: { alignItems: 'center', gap: 2 },
  tabCenterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabCenterActive: { backgroundColor: C.red },
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
