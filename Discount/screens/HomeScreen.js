import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, SafeAreaView,
  RefreshControl, TouchableOpacity, TextInput,
  Platform, Image, Animated, ScrollView, PanResponder,
  Dimensions, useWindowDimensions,
} from 'react-native';
import Icon from '../components/Icon';
import BrandMark from '../components/BrandMark';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DealCard from '../components/DealCard';
import DealModal from '../components/DealModal';
import FilterPanel from '../components/FilterPanel';
import MenuDrawer from '../components/MenuDrawer';
import SkeletonCard from '../components/SkeletonCard';
import PWAInstallBanner from '../components/PWAInstallBanner';
import FavoritesScreen from './FavoritesScreen';
import RewardsScreen from './RewardsScreen';
import { fetchDeals, recordClick } from '../services/api';
import { mockDeals } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import { trackDealClick, trackAddToWishlist } from '../services/analytics';
import { C, R } from '../data/theme';

const PAGE_SIZE = 8;

export const CATS = [
  { key: 'all',     label: 'Alles',      icon: 'apps' },
  { key: 'tech',    label: 'Tech',        icon: 'laptop' },
  { key: 'fashion', label: 'Mode',        icon: 'checkroom' },
  { key: 'home',    label: 'Wonen',       icon: 'weekend' },
  { key: 'sport',   label: 'Sport',       icon: 'fitness-center' },
  { key: 'beauty',  label: 'Beauty',      icon: 'spa' },
  { key: 'toys',    label: 'Speelgoed',   icon: 'toys' },
  { key: 'garden',  label: 'Tuin',        icon: 'yard' },
];

/* ─────────────────────────────────────────────────────────────────────
   Animated category tab bar
───────────────────────────────────────────────────────────────────── */

function CategoryTabBar({ activeCat, onSelect, isDesktop, onFilter, activeFilterCount = 0 }) {
  const scrollRef  = useRef(null);
  const tabLayouts = useRef({});
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorW = useRef(new Animated.Value(40)).current;

  const moveIndicator = (key, animate) => {
    const layout = tabLayouts.current[key];
    if (!layout) return;
    if (animate) {
      Animated.parallel([
        Animated.spring(indicatorX, { toValue: layout.x, useNativeDriver: false, tension: 160, friction: 18 }),
        Animated.spring(indicatorW, { toValue: layout.width, useNativeDriver: false, tension: 160, friction: 18 }),
      ]).start();
    } else {
      indicatorX.setValue(layout.x);
      indicatorW.setValue(layout.width);
    }
    if (scrollRef.current && layout) {
      scrollRef.current.scrollTo({ x: Math.max(0, layout.x - 80), animated: animate });
    }
  };

  useEffect(() => { moveIndicator(activeCat, true); }, [activeCat]);

  return (
    <View style={tabBarStyles.wrap}>
      {/* Scrollable tabs area */}
      <View style={tabBarStyles.scrollArea}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tabBarStyles.content}
        >
          {/* Inner row with animated indicator at bottom */}
          <View style={{ flexDirection: 'row', position: 'relative', paddingBottom: 2 }}>
            {CATS.map(({ key, label, icon }) => {
              const active = activeCat === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={tabBarStyles.tab}
                  onPress={() => onSelect(key)}
                  onLayout={e => {
                    const { x, width } = e.nativeEvent.layout;
                    tabLayouts.current[key] = { x, width };
                    if (key === activeCat) moveIndicator(key, false);
                  }}
                  activeOpacity={0.75}
                >
                  <Icon name={icon} size={14} color={active ? C.red : C.grey} />
                  <Text style={[tabBarStyles.label, active && tabBarStyles.labelActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
            <Animated.View style={[tabBarStyles.indicator, { left: indicatorX, width: indicatorW }]} />
          </View>
        </ScrollView>

        {/* Arrow hint — mobile only */}
        {!isDesktop && (
          <View style={tabBarStyles.arrowWrap} pointerEvents="none">
            <Icon name="chevron-right" size={16} color={C.grey} />
          </View>
        )}
      </View>

      {/* Filter button — desktop: right of tabs, always visible */}
      {isDesktop && (
        <TouchableOpacity style={tabBarStyles.filterBtn} onPress={onFilter} activeOpacity={0.75}>
          <Icon name="tune" size={18} color={activeFilterCount > 0 ? C.red : C.grey} />
          {activeFilterCount > 0 && (
            <Text style={tabBarStyles.filterCount}>{activeFilterCount}</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const tabBarStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  scrollArea: { flex: 1, overflow: 'hidden', position: 'relative' },
  content: { paddingHorizontal: 4 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  label: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 13, fontWeight: '500', color: C.grey },
  labelActive: { color: C.red, fontWeight: '700' },
  indicator: { position: 'absolute', bottom: 0, height: 2, backgroundColor: C.red, borderRadius: 1 },
  arrowWrap: {
    position: 'absolute', right: 0, top: 0, bottom: 0, width: 32,
    justifyContent: 'center', alignItems: 'center',
    ...(Platform.OS === 'web'
      ? { background: 'linear-gradient(to right, transparent, white 60%)' }
      : { backgroundColor: 'rgba(255,255,255,0.9)' }),
  },
  filterBtn: {
    width: 52, borderLeftWidth: 1, borderLeftColor: C.border,
    justifyContent: 'center', alignItems: 'center', gap: 2,
    backgroundColor: C.white,
  },
  filterCount: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 10, fontWeight: '800', color: C.red,
  },
});

/* ─────────────────────────────────────────────────────────────────────
   Desktop nav button (replaces bottom tab on ≥ 1024 px)
───────────────────────────────────────────────────────────────────── */

function DesktopNavBtn({ icon, iconActive, label, active, badge, onPress }) {
  return (
    <TouchableOpacity
      style={[deskStyles.navBtn, active && deskStyles.navBtnActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Icon name={active ? iconActive : icon} size={18} color={active ? C.red : C.grey} />
      <Text style={[deskStyles.navLabel, active && deskStyles.navLabelActive]}>{label}</Text>
      {badge != null && (
        <View style={deskStyles.navBadge}>
          <Text style={deskStyles.navBadgeTxt}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const deskStyles = StyleSheet.create({
  navBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: R.md,
    position: 'relative',
  },
  navBtnActive: { backgroundColor: C.red + '12' },
  navLabel: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 13, fontWeight: '600', color: C.grey },
  navLabelActive: { color: C.red, fontWeight: '700' },
  navBadge: {
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: C.red, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4,
  },
  navBadgeTxt: { color: C.white, fontSize: 9, fontWeight: '800' },
});

/* ─────────────────────────────────────────────────────────────────────
   HomeScreen
───────────────────────────────────────────────────────────────────── */

export default function HomeScreen() {
  const { t, region } = useLanguage();

  // Responsive breakpoints — updates live on window resize
  const { width } = useWindowDimensions();
  const isTablet  = width >= 768;
  const isDesktop = width >= 1024;
  const numCols   = isDesktop ? 4 : isTablet ? 3 : 2;
  const featH     = isDesktop ? 300 : isTablet ? 240 : 200;

  const [activeTab, setActiveTab]   = useState('home');
  const [allDeals, setAllDeals]     = useState([]);
  const [deals, setDeals]           = useState([]);
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeCat,  setActiveCat]  = useState('all');
  const [activeDisc, setActiveDisc] = useState(null);
  const [minPrice,   setMinPrice]   = useState('');
  const [maxPrice,   setMaxPrice]   = useState('');
  const [filterVisible, setFilterVisible] = useState(false);

  const [query, setQuery]               = useState('');
  const [suggestions, setSuggestions]   = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);

  const [menuVisible, setMenuVisible]   = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [favorites, setFavorites]       = useState(new Set());

  const [points, setPoints]     = useState(0);
  const [streak, setStreak]     = useState(1);
  const [clicks, setClicks]     = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [streakToast, setStreakToast] = useState(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  // Slide animation for category transitions
  const slideAnim       = useRef(new Animated.Value(0)).current;
  const catChangeDirRef = useRef(0);
  const activeCatRef    = useRef(activeCat);
  useEffect(() => { activeCatRef.current = activeCat; }, [activeCat]);

  useEffect(() => {
    const dir = catChangeDirRef.current;
    if (dir === 0) return;
    catChangeDirRef.current = 0;
    const W = Dimensions.get('window').width;
    slideAnim.setValue(dir * W);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 14 }).start();
  }, [activeCat]);

  /* ── Data ───────────────────────────────────────────────────────── */

  useEffect(() => {
    loadPersistedFilters();
    loadFavorites();
    initRewards();
  }, []);

  const loadPersistedFilters = async () => {
    try {
      const [[, cat], [, disc], [, min], [, max]] = await AsyncStorage.multiGet(
        ['dd_filter_cat', 'dd_filter_disc', 'dd_filter_min', 'dd_filter_max']
      );
      const resolvedCat  = cat || 'all';
      const resolvedDisc = disc ? parseInt(disc, 10) : null;
      const resolvedMin  = min || '';
      const resolvedMax  = max || '';
      if (cat)  setActiveCat(resolvedCat);
      if (disc) setActiveDisc(resolvedDisc);
      if (min)  setMinPrice(resolvedMin);
      if (max)  setMaxPrice(resolvedMax);
      loadDeals(resolvedCat, resolvedDisc, resolvedMin, resolvedMax);
    } catch {
      loadDeals('all', null, '', '');
    }
  };

  const loadDeals = useCallback(async (cat, disc, min, max, search = '') => {
    try {
      let result = await fetchDeals({
        category: cat, minDiscount: disc || undefined,
        minPrice: min || undefined, maxPrice: max || undefined, region,
      });
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

  const handleCatChange = useCallback((cat) => {
    if (cat === activeCatRef.current) return;
    if (catChangeDirRef.current === 0) {
      const keys = CATS.map(c => c.key);
      const diff = keys.indexOf(cat) - keys.indexOf(activeCatRef.current);
      catChangeDirRef.current = diff > 0 ? 1 : -1;
    }
    setActiveCat(cat);
    setLoading(true);
    loadDeals(cat, activeDisc, minPrice, maxPrice, query);
    AsyncStorage.setItem('dd_filter_cat', cat).catch(() => {});
  }, [activeDisc, minPrice, maxPrice, query, loadDeals]);

  const handleCatChangeRef = useRef(handleCatChange);
  useEffect(() => { handleCatChangeRef.current = handleCatChange; }, [handleCatChange]);

  const applyFilters = useCallback(() => {
    setLoading(true);
    loadDeals(activeCat, activeDisc, minPrice, maxPrice, query);
    AsyncStorage.multiSet([
      ['dd_filter_cat',  activeCat],
      ['dd_filter_disc', activeDisc != null ? String(activeDisc) : ''],
      ['dd_filter_min',  minPrice],
      ['dd_filter_max',  maxPrice],
    ]).catch(() => {});
  }, [activeCat, activeDisc, minPrice, maxPrice, query, loadDeals]);

  const handleFilterReset = useCallback(() => {
    setActiveDisc(null);
    setMinPrice('');
    setMaxPrice('');
    setLoading(true);
    loadDeals(activeCat, null, '', '', query);
    AsyncStorage.multiSet([
      ['dd_filter_disc', ''], ['dd_filter_min', ''], ['dd_filter_max', ''],
    ]).catch(() => {});
  }, [activeCat, query, loadDeals]);

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

  /* ── Search ─────────────────────────────────────────────────────── */

  const handleQueryChange = (text) => {
    setQuery(text);
    if (!text.trim()) { setSuggestions([]); return; }
    const q = text.toLowerCase();
    setSuggestions(mockDeals.filter(d => d.title.toLowerCase().includes(q)).slice(0, 5));
  };
  const handleSuggestionTap = (deal) => {
    setQuery(deal.title); setSuggestions([]); setSearchFocused(false);
    setSelectedDeal(deal); addClick();
  };
  const handleSearchSubmit = () => {
    setSuggestions([]); setSearchFocused(false);
    setLoading(true);
    loadDeals(activeCat, activeDisc, minPrice, maxPrice, query);
  };

  /* ── Favorites ──────────────────────────────────────────────────── */

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

  /* ── Rewards ────────────────────────────────────────────────────── */

  const initRewards = async () => {
    try {
      const [pts, cl, fc, st, lv] = await AsyncStorage.multiGet(
        ['dd_points', 'dd_clicks', 'dd_fav_count', 'dd_streak', 'dd_last_visit']
      );
      const p = parseInt(pts[1] || '0', 10);
      const c = parseInt(cl[1] || '0', 10);
      const f = parseInt(fc[1] || '0', 10);
      let s   = parseInt(st[1] || '1', 10);
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
        if (s > 1) {
          setStreakToast(s);
          Animated.sequence([
            Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.delay(3200),
            Animated.timing(toastOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
          ]).start(() => setStreakToast(null));
        }
      } else {
        setPoints(p);
      }
      setClicks(c); setFavCount(f); setStreak(s);
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
    setSelectedDeal(deal); addClick();
    trackDealClick(deal); recordClick(deal.id, region);
  };
  const handleFavoriteWithTracking = async (dealId) => {
    const deal = allDeals.find(d => d.id === dealId);
    await toggleFavorite(dealId);
    if (deal && !favorites.has(dealId)) trackAddToWishlist(deal);
  };

  /* ── Swipe (mobile/tablet only) ─────────────────────────────────── */

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 15 && Math.abs(gs.dy) < 25,
      onPanResponderRelease: (_, gs) => {
        if (Math.abs(gs.dx) < 50) return;
        const keys = CATS.map(c => c.key);
        const idx  = keys.indexOf(activeCatRef.current);
        if (gs.dx < 0 && idx < keys.length - 1) {
          catChangeDirRef.current = 1;
          handleCatChangeRef.current(keys[idx + 1]);
        } else if (gs.dx > 0 && idx > 0) {
          catChangeDirRef.current = -1;
          handleCatChangeRef.current(keys[idx - 1]);
        }
      },
    })
  ).current;

  /* ── Derived ────────────────────────────────────────────────────── */

  const activeFilterCount = [activeDisc !== null, minPrice !== '', maxPrice !== ''].filter(Boolean).length;
  const featuredDeal = allDeals.find(d => d.fomoKey === 'hot') || allDeals[0];

  /* ── Render ─────────────────────────────────────────────────────── */

  return (
    <SafeAreaView style={styles.safe}>

      {/* ── Top Bar ─────────────────────────────────────────────────── */}
      <View style={styles.topBarOuter}>
        <View style={[styles.topBarInner, isDesktop && styles.topBarInnerDesktop]}>

          {/* Brand — always visible; on desktop shows full name */}
          <View style={styles.brand}>
            <BrandMark size={36} />
            {isDesktop && <Text style={styles.brandName}>Donnie Discount</Text>}
          </View>

          {/* Filter button — mobile/tablet left side */}
          {!isDesktop && (
            <TouchableOpacity style={styles.iconBtn} onPress={() => setFilterVisible(true)}>
              <Icon name="tune" size={20} color={C.dark} />
              {activeFilterCount > 0 && (
                <View style={styles.badge}><Text style={styles.badgeTxt}>{activeFilterCount}</Text></View>
              )}
            </TouchableOpacity>
          )}

          {/* Search */}
          <View style={[styles.searchWrap, searchFocused && styles.searchWrapFocused]}>
            <Icon name="search" size={16} color={C.grey} />
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
                <Icon name="close" size={16} color={C.grey} />
              </TouchableOpacity>
            )}
          </View>

          {/* Desktop: nav links replace bottom tab bar */}
          {isDesktop && (
            <View style={styles.desktopNav}>
              <DesktopNavBtn
                icon="home" iconActive="home" label="Home"
                active={activeTab === 'home'} onPress={() => setActiveTab('home')}
              />
              <DesktopNavBtn
                icon="favorite-border" iconActive="favorite" label="Favorieten"
                active={activeTab === 'favorites'}
                badge={favorites.size > 0 ? favorites.size : null}
                onPress={() => setActiveTab('favorites')}
              />
              <DesktopNavBtn
                icon="card-giftcard" iconActive="card-giftcard" label="Rewards"
                active={activeTab === 'rewards'} onPress={() => setActiveTab('rewards')}
              />
            </View>
          )}

          {/* Menu always visible */}
          <TouchableOpacity style={styles.iconBtn} onPress={() => setMenuVisible(true)}>
            <Icon name="menu" size={20} color={C.dark} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Category Tab Bar ─────────────────────────────────────────── */}
      <CategoryTabBar
        activeCat={activeCat}
        onSelect={handleCatChange}
        isDesktop={isDesktop}
        onFilter={() => setFilterVisible(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* ── Search suggestions ────────────────────────────────────────── */}
      {searchFocused && suggestions.length > 0 && (
        <View style={styles.suggestions}>
          {suggestions.map(s => (
            <TouchableOpacity key={s.id} style={styles.suggestion} onPress={() => handleSuggestionTap(s)}>
              <Icon name="search" size={14} color={C.grey} />
              <View style={{ flex: 1 }}>
                <Text style={styles.suggestionTitle} numberOfLines={1}>{s.title}</Text>
                <Text style={styles.suggestionPrice}>€{s.discountedPrice.toFixed(2)} · -{s.discountPercentage}%</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── Streak toast ──────────────────────────────────────────────── */}
      {streakToast && (
        <Animated.View style={[styles.streakToast, { opacity: toastOpacity }]}>
          <Text style={styles.streakToastIcon}>🔥</Text>
          <View>
            <Text style={styles.streakToastTitle}>{streakToast} dagen op rij!</Text>
            <Text style={styles.streakToastSub}>Kom morgen terug om je streak te bewaren.</Text>
          </View>
        </Animated.View>
      )}

      {/* ── Content ──────────────────────────────────────────────────── */}
      <View style={{ flex: 1 }} {...(!isDesktop && activeTab === 'home' ? panResponder.panHandlers : {})}>
        {activeTab === 'home' && (
          <Animated.View style={{ flex: 1, transform: [{ translateX: slideAnim }] }}>
            {/* Center content on desktop */}
            <View style={[{ flex: 1 }, isDesktop && styles.centeredContent]}>
              {loading && deals.length === 0 ? (
                <FlatList
                  key={`skel-${numCols}`}
                  data={[1, 2, 3, 4, 5, 6, numCols > 2 ? 7 : null, numCols > 3 ? 8 : null].filter(Boolean)}
                  keyExtractor={item => String(item)}
                  numColumns={numCols}
                  columnWrapperStyle={styles.row}
                  contentContainerStyle={styles.list}
                  renderItem={() => <SkeletonCard />}
                  scrollEnabled={false}
                />
              ) : (
                <FlatList
                  key={String(numCols)}
                  data={deals}
                  keyExtractor={item => item.id}
                  numColumns={numCols}
                  columnWrapperStyle={styles.row}
                  contentContainerStyle={styles.list}
                  renderItem={({ item }) => (
                    <DealCard
                      deal={item}
                      onPress={() => handleDealPress(item)}
                      onFavorite={() => handleFavoriteWithTracking(item.id)}
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
                      dealCount={allDeals.length}
                      favorites={favorites}
                      featuredHeight={featH}
                      onDealPress={handleDealPress}
                      onFavorite={handleFavoriteWithTracking}
                      t={t}
                    />
                  }
                />
              )}
            </View>
          </Animated.View>
        )}

        {activeTab === 'favorites' && (
          <View style={[{ flex: 1 }, isDesktop && styles.centeredContent]}>
            <FavoritesScreen
              allDeals={allDeals.length ? allDeals : mockDeals}
              favorites={favorites}
              onDealPress={handleDealPress}
              onFavoriteToggle={handleFavoriteWithTracking}
              onBrowse={() => setActiveTab('home')}
              t={t}
            />
          </View>
        )}

        {activeTab === 'rewards' && (
          <View style={[{ flex: 1 }, isDesktop && styles.centeredContent]}>
            <RewardsScreen points={points} streak={streak} clicks={clicks} favCount={favCount} />
          </View>
        )}
      </View>

      {/* ── Bottom Tab Bar — mobile/tablet only ──────────────────────── */}
      {!isDesktop && (
        <View style={styles.tabBar}>
          <TabBtn icon="favorite-border" iconActive="favorite" label="Favorieten"
            active={activeTab === 'favorites'} badge={favorites.size > 0 ? favorites.size : null}
            onPress={() => setActiveTab('favorites')} />
          <View style={styles.tabSep} />
          <TabBtn icon="home" iconActive="home" label="Home"
            active={activeTab === 'home'} onPress={() => setActiveTab('home')} />
          <View style={styles.tabSep} />
          <TabBtn icon="card-giftcard" iconActive="card-giftcard" label="Rewards"
            active={activeTab === 'rewards'} onPress={() => setActiveTab('rewards')} />
        </View>
      )}

      {/* ── Modals ────────────────────────────────────────────────────── */}
      <DealModal
        deal={selectedDeal} visible={!!selectedDeal} onClose={() => setSelectedDeal(null)}
        isFavorited={selectedDeal ? favorites.has(selectedDeal.id) : false}
        onFavorite={() => selectedDeal && toggleFavorite(selectedDeal.id)}
        t={t}
      />
      <FilterPanel
        visible={filterVisible} onClose={() => setFilterVisible(false)}
        activeDisc={activeDisc} setActiveDisc={setActiveDisc}
        minPrice={minPrice} setMinPrice={setMinPrice}
        maxPrice={maxPrice} setMaxPrice={setMaxPrice}
        onApply={applyFilters} onReset={handleFilterReset}
      />
      <MenuDrawer visible={menuVisible} onClose={() => setMenuVisible(false)} />
      <PWAInstallBanner />
    </SafeAreaView>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Featured Deal Header
───────────────────────────────────────────────────────────────────── */

function HomeHeader({ featuredDeal, dealCount, favorites, featuredHeight, onDealPress, onFavorite, t }) {
  if (!featuredDeal) return null;
  const store = t?.affiliates?.[featuredDeal.affiliateStore] ?? { name: featuredDeal.affiliateStore, color: C.navy };

  return (
    <View>
      <View style={styles.featuredWrap}>
        <View style={styles.featuredLabelRow}>
          <Icon name="local-fire-department" size={14} color={C.red} />
          <Text style={styles.featuredLabel}>UITGELICHTE DEAL</Text>
        </View>

        <TouchableOpacity style={styles.featuredCard} onPress={() => onDealPress(featuredDeal)} activeOpacity={0.93}>
          <Image source={{ uri: featuredDeal.image }} style={[styles.featuredImage, { height: featuredHeight }]} resizeMode="cover" />

          <View
            style={[
              styles.featuredOverlay,
              Platform.OS === 'web' && { background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.82) 100%)', backgroundColor: undefined },
            ]}
          >
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
            <Icon
              name={favorites.has(featuredDeal.id) ? 'favorite' : 'favorite-border'}
              size={18}
              color={favorites.has(featuredDeal.id) ? C.red : C.grey}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Alle Deals</Text>
        <Text style={styles.sectionCount}>{dealCount} gevonden</Text>
      </View>
    </View>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Bottom tab button (mobile only)
───────────────────────────────────────────────────────────────────── */

function TabBtn({ icon, iconActive, label, active, badge, onPress }) {
  return (
    <TouchableOpacity style={styles.tabBtn} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.tabBtnInner}>
        <View style={{ position: 'relative' }}>
          <Icon name={active ? iconActive : icon} size={20} color={active ? C.red : C.grey} />
          {badge != null && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeTxt}>{badge > 9 ? '9+' : badge}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Styles
───────────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.lightGrey },

  // Top bar shell (full-width) + inner (max-width on desktop)
  topBarOuter: {
    backgroundColor: '#F5F5F7',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2, zIndex: 10,
  },
  topBarInner: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10, gap: 8,
  },
  topBarInnerDesktop: {
    maxWidth: 1400, alignSelf: 'center', width: '100%',
    paddingHorizontal: 20, paddingVertical: 12,
  },

  // Brand
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandName: { fontFamily: 'Nunito, "Open Sans", system-ui, sans-serif', fontSize: 17, fontWeight: '900', color: '#111111' },

  // Icon button (filter, menu)
  iconBtn: {
    width: 38, height: 38, borderRadius: R.md,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center', alignItems: 'center', position: 'relative',
  },
  badge: {
    position: 'absolute', top: -4, right: -4,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: C.red, justifyContent: 'center', alignItems: 'center',
  },
  badgeTxt: { color: C.white, fontSize: 9, fontWeight: '800' },

  // Search
  searchWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: R.full,
    paddingHorizontal: 12, height: 38,
    borderWidth: 1.5, borderColor: C.border, gap: 6,
  },
  searchWrapFocused: { borderColor: C.red },
  searchInput: {
    flex: 1, fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 13, color: C.dark, outlineStyle: 'none', height: '100%',
  },

  // Desktop nav group (between search and buttons)
  desktopNav: { flexDirection: 'row', alignItems: 'center', gap: 2 },

  // Centered content container on desktop
  centeredContent: { maxWidth: 1400, alignSelf: 'center', width: '100%' },

  // Search suggestions
  suggestions: {
    position: 'absolute', top: 112, left: 8, right: 8,
    backgroundColor: C.white, borderRadius: R.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 20, zIndex: 999, overflow: 'hidden',
  },
  suggestion: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.lightGrey, gap: 10,
  },
  suggestionTitle: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 13, fontWeight: '600', color: C.dark },
  suggestionPrice: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 11, color: C.grey, marginTop: 1 },

  // Deal grid
  list: { paddingBottom: 32, paddingHorizontal: 6 },
  row:  { alignItems: 'stretch' },

  // Featured Deal
  featuredWrap: { paddingHorizontal: 12, paddingTop: 16, paddingBottom: 4 },
  featuredLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  featuredLabel: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 10, fontWeight: '700', color: C.red, letterSpacing: 1 },
  featuredCard: {
    borderRadius: R.xl, overflow: 'hidden', backgroundColor: C.dark,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 6,
  },
  featuredImage: { width: '100%' },
  featuredOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, paddingTop: 80,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  featuredStoreBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: R.full, marginBottom: 6,
  },
  featuredStoreTxt: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 10, fontWeight: '700', color: C.white },
  featuredTitle: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 16, fontWeight: '700', color: C.white, lineHeight: 22, marginBottom: 8 },
  featuredPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featuredPrice: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 24, fontWeight: '800', color: C.white },
  featuredOrig: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecorationLine: 'line-through', flex: 1 },
  featuredDiscount: { backgroundColor: C.red, paddingHorizontal: 8, paddingVertical: 3, borderRadius: R.full },
  featuredDiscountTxt: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 11, fontWeight: '800', color: C.white },
  featuredHeart: {
    position: 'absolute', top: 12, right: 12,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center',
  },

  // Section header
  sectionHeaderRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingTop: 16, paddingBottom: 8, gap: 6,
  },
  sectionTitle: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 15, fontWeight: '700', color: C.dark, flex: 1 },
  sectionCount: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 12, color: C.grey, fontWeight: '500' },

  // Bottom tab bar (mobile/tablet)
  tabBar: {
    flexDirection: 'row', backgroundColor: C.white,
    borderTopWidth: 1, borderTopColor: C.border,
    paddingBottom: Platform.OS === 'ios' ? 18 : 4, paddingTop: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 8,
  },
  tabSep: { width: 1, height: 28, backgroundColor: C.border, alignSelf: 'center' },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  tabBtnInner: { alignItems: 'center', gap: 2 },
  tabLabel: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 10, color: C.grey, fontWeight: '500' },
  tabLabelActive: { color: C.red, fontWeight: '700' },
  tabBadge: {
    position: 'absolute', top: -4, right: -6,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: C.red, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3,
  },
  tabBadgeTxt: { color: C.white, fontSize: 9, fontWeight: '800' },

  // Streak toast
  streakToast: {
    position: 'absolute', top: 120, left: 12, right: 12, zIndex: 100,
    backgroundColor: C.dark, borderRadius: R.lg,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 20,
  },
  streakToastIcon: { fontSize: 26 },
  streakToastTitle: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 14, fontWeight: '800', color: C.white },
  streakToastSub: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 1 },
});
