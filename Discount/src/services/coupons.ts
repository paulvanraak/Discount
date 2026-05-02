import AsyncStorage from '@react-native-async-storage/async-storage';
import { Coupon, WorldCouponCategory } from '../types';

// ─── Configuration ────────────────────────────────────────────────────────────
// Sign up at https://www.awin.com as a publisher to get these credentials.
// Leave empty to use demo coupons.
export const AWIN_CONFIG = {
  publisherId: '',   // TODO: replace with your Awin Publisher ID
  apiKey: '',        // TODO: replace with your Awin API Key (Settings → API)
};

// Sign up at https://www.tradetracker.com as a publisher.
export const TRADETRACKER_CONFIG = {
  customerId: '',    // TODO: replace with your TradeTracker Customer ID
  passPhrase: '',    // TODO: replace with your TradeTracker pass phrase
};

const CACHE_KEY = '@marble_coupons_v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── Awin category IDs ────────────────────────────────────────────────────────
// https://wiki.awin.com/index.php/Publisher_API
const AWIN_CATEGORY_MAP: Record<WorldCouponCategory, number[]> = {
  fashion:     [1],       // Clothes & Accessories
  sports:      [11],      // Sport & Outdoors
  electronics: [5, 6],    // Phone & Navigation + Computers
  travel:      [9],       // Travel
  food_drink:  [13],      // Food & Drink
  home_garden: [2],       // Home & Garden
};

// ─── Demo coupons (fallback when API not configured) ──────────────────────────
const DEMO_COUPONS: Coupon[] = [
  // Fashion
  { id: 'd-f1', advertiserName: 'Zalando', code: 'WELCOME10', discountText: '10% KORTING', description: '10% korting op je eerste bestelling', affiliateUrl: 'https://www.zalando.nl', category: 'fashion', source: 'demo' },
  { id: 'd-f2', advertiserName: 'H&M', code: 'HM15', discountText: '15% KORTING', description: '15% korting bij aankoop van €50 of meer', affiliateUrl: 'https://www.hm.com/nl_nl', category: 'fashion', source: 'demo' },
  { id: 'd-f3', advertiserName: 'ZARA', code: 'ZARA20', discountText: '20% OP SALE', description: 'Extra 20% op alle sale artikelen', affiliateUrl: 'https://www.zara.com/nl', category: 'fashion', source: 'demo' },
  { id: 'd-f4', advertiserName: 'Nike', code: 'NIKE25', discountText: '25% KORTING', description: '25% op geselecteerde items', affiliateUrl: 'https://www.nike.com/nl', category: 'fashion', source: 'demo' },
  // Sports
  { id: 'd-s1', advertiserName: 'Decathlon', code: 'DEC10', discountText: '10% KORTING', description: '10% korting op je volgende bestelling', affiliateUrl: 'https://www.decathlon.nl', category: 'sports', source: 'demo' },
  { id: 'd-s2', advertiserName: 'Intersport', code: 'SPORT15', discountText: '15% KORTING', description: 'Spaar en bespaar 15% op uitloopmodellen', affiliateUrl: 'https://www.intersport.nl', category: 'sports', source: 'demo' },
  { id: 'd-s3', advertiserName: 'Runners World', code: 'RUN20', discountText: 'GRATIS LEVERING', description: 'Gratis bezorging op hardloopschoenen', affiliateUrl: 'https://www.runnersworld.nl', category: 'sports', source: 'demo' },
  { id: 'd-s4', advertiserName: 'Sportsdirect', code: 'SPORT5', discountText: '5% EXTRA KORTING', description: '5% extra korting op uitverkoop', affiliateUrl: 'https://www.sportsdirect.com/nl', category: 'sports', source: 'demo' },
  // Electronics
  { id: 'd-e1', advertiserName: 'Coolblue', code: '', discountText: 'GRATIS LEVERING', description: 'Gratis bezorging en retour op alles', affiliateUrl: 'https://www.coolblue.nl', category: 'electronics', source: 'demo' },
  { id: 'd-e2', advertiserName: 'MediaMarkt', code: 'MM10', discountText: '10% KORTING', description: '10% korting op een product naar keuze', affiliateUrl: 'https://www.mediamarkt.nl', category: 'electronics', source: 'demo' },
  { id: 'd-e3', advertiserName: 'Bol.com', code: 'BOL5', discountText: '€5 KORTING', description: '€5 korting bij besteding van €40 of meer', affiliateUrl: 'https://www.bol.com', category: 'electronics', source: 'demo' },
  { id: 'd-e4', advertiserName: 'Samsung', code: 'SAM15', discountText: '15% KORTING', description: '15% korting op Galaxy serie', affiliateUrl: 'https://www.samsung.com/nl', category: 'electronics', source: 'demo' },
  // Travel
  { id: 'd-t1', advertiserName: 'Booking.com', code: '', discountText: '10% CASHBACK', description: '10% terug op geselecteerde hotels', affiliateUrl: 'https://www.booking.com', category: 'travel', source: 'demo' },
  { id: 'd-t2', advertiserName: 'Travelbird', code: 'BIRD20', discountText: '€20 KORTING', description: '€20 korting op je volgende stedentrip', affiliateUrl: 'https://www.travelbird.nl', category: 'travel', source: 'demo' },
  { id: 'd-t3', advertiserName: 'KLM', code: 'KLM10', discountText: '10% OP VLUCHTEN', description: '10% korting op geselecteerde vluchten', affiliateUrl: 'https://www.klm.com/nl', category: 'travel', source: 'demo' },
  { id: 'd-t4', advertiserName: 'Airbnb', code: '', discountText: '€30 TEGOEDBON', description: '€30 korting op je eerste verblijf', affiliateUrl: 'https://www.airbnb.nl', category: 'travel', source: 'demo' },
  // Food & Drink
  { id: 'd-fd1', advertiserName: 'Thuisbezorgd', code: 'THUIS5', discountText: '€5 KORTING', description: '€5 korting op je eerste bestelling', affiliateUrl: 'https://www.thuisbezorgd.nl', category: 'food_drink', source: 'demo' },
  { id: 'd-fd2', advertiserName: 'Picnic', code: '', discountText: 'GRATIS LEVERING', description: 'Gratis bezorging voor nieuwe klanten', affiliateUrl: 'https://www.picnic.app', category: 'food_drink', source: 'demo' },
  { id: 'd-fd3', advertiserName: 'HelloFresh', code: 'HELLO40', discountText: '40% KORTING', description: '40% korting op je eerste HelloFresh box', affiliateUrl: 'https://www.hellofresh.nl', category: 'food_drink', source: 'demo' },
  { id: 'd-fd4', advertiserName: 'Deliveroo', code: 'ROOLIT', discountText: '€10 TEGOEDBON', description: '€10 korting op je eerste bestelling', affiliateUrl: 'https://deliveroo.nl', category: 'food_drink', source: 'demo' },
  // Home & Garden
  { id: 'd-h1', advertiserName: 'IKEA', code: '', discountText: 'GRATIS LEVERING', description: 'Gratis levering bij aankoop boven €149', affiliateUrl: 'https://www.ikea.com/nl', category: 'home_garden', source: 'demo' },
  { id: 'd-h2', advertiserName: 'HEMA', code: 'HEMA3VOOR2', discountText: '3 VOOR 2', description: 'Koop 3, betaal 2 op woonaccessoires', affiliateUrl: 'https://www.hema.nl', category: 'home_garden', source: 'demo' },
  { id: 'd-h3', advertiserName: 'Praxis', code: 'PRAX10', discountText: '10% KORTING', description: '10% korting op gereedschap', affiliateUrl: 'https://www.praxis.nl', category: 'home_garden', source: 'demo' },
  { id: 'd-h4', advertiserName: 'Fonq', code: 'FONQ15', discountText: '15% KORTING', description: '15% korting op design woonaccessoires', affiliateUrl: 'https://www.fonq.nl', category: 'home_garden', source: 'demo' },
];

// ─── Cache helpers ────────────────────────────────────────────────────────────
interface CacheEntry {
  coupons: Coupon[];
  fetchedAt: number;
}

async function readCache(): Promise<CacheEntry | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry;
  } catch {
    return null;
  }
}

async function writeCache(coupons: Coupon[]): Promise<void> {
  try {
    const entry: CacheEntry = { coupons, fetchedAt: Date.now() };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Non-critical
  }
}

// ─── Awin API ─────────────────────────────────────────────────────────────────
interface AwinPromotion {
  promotionId: number;
  advertiserId: number;
  advertiserName: string;
  type: string;
  code?: string;
  description: string;
  startsAt?: string;
  expiresAt?: string;
  clickThroughUrl: string;
  logoUrl?: string;
  categoryId?: number;
}

function awinCategoryToWorld(categoryId?: number): WorldCouponCategory {
  switch (categoryId) {
    case 1:  return 'fashion';
    case 2:  return 'home_garden';
    case 5:
    case 6:  return 'electronics';
    case 9:  return 'travel';
    case 11: return 'sports';
    case 13: return 'food_drink';
    default: return 'fashion';
  }
}

function extractDiscountText(description: string): string {
  // Attempt to pull out a percentage or amount from the description
  const pct = description.match(/(\d+)\s*%/);
  if (pct) return `${pct[1]}% KORTING`;
  const eur = description.match(/€\s*(\d+)/);
  if (eur) return `€${eur[1]} KORTING`;
  return 'AANBIEDING';
}

async function fetchAwin(): Promise<Coupon[]> {
  const { publisherId, apiKey } = AWIN_CONFIG;
  if (!publisherId || !apiKey) return [];

  try {
    const allCategoryIds = Object.values(AWIN_CATEGORY_MAP).flat().join(',');
    const url =
      `https://api.awin.com/publishers/${publisherId}/promotions` +
      `?type=voucherCode&categoryIds=${allCategoryIds}&regionId=1`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`Awin ${res.status}`);
    const data: AwinPromotion[] = await res.json();

    return data.map((p) => ({
      id: `awin-${p.promotionId}`,
      advertiserName: p.advertiserName,
      advertiserId: String(p.advertiserId),
      logoUrl: p.logoUrl,
      code: p.code || undefined,
      description: p.description,
      discountText: extractDiscountText(p.description),
      affiliateUrl: p.clickThroughUrl,
      expiresAt: p.expiresAt,
      category: awinCategoryToWorld(p.categoryId),
      source: 'awin' as const,
    }));
  } catch (err) {
    console.warn('[Coupons] Awin fetch failed:', err);
    return [];
  }
}

// ─── TradeTracker API ─────────────────────────────────────────────────────────
async function fetchTradeTracker(): Promise<Coupon[]> {
  const { customerId, passPhrase } = TRADETRACKER_CONFIG;
  if (!customerId || !passPhrase) return [];

  try {
    const url =
      `https://api.tradetracker.com/rest/affiliate/CampaignCouponFeeds` +
      `?customerID=${encodeURIComponent(customerId)}` +
      `&passPhrase=${encodeURIComponent(passPhrase)}` +
      `&countryCode=NL&format=json`;

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`TradeTracker ${res.status}`);
    const data = await res.json();

    // TradeTracker response varies; adapt field names as needed
    const items: any[] = data?.result ?? data?.campaigns ?? [];
    return items.map((item, i) => ({
      id: `tt-${item.ID ?? i}`,
      advertiserName: item.campaignName ?? item.name ?? 'Aanbieding',
      code: item.couponCode || undefined,
      description: item.description ?? '',
      discountText: extractDiscountText(item.description ?? ''),
      affiliateUrl: item.clickOutURL ?? item.url ?? '',
      expiresAt: item.stopDate,
      category: 'fashion' as WorldCouponCategory, // TT feed lacks category
      source: 'tradetracker' as const,
    }));
  } catch (err) {
    console.warn('[Coupons] TradeTracker fetch failed:', err);
    return [];
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────
let _pool: Coupon[] = [];

/** Call once at app start. Loads from cache or fetches fresh. */
export async function initCoupons(): Promise<void> {
  const cached = await readCache();
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    _pool = cached.coupons;
    return;
  }

  const [awin, tt] = await Promise.all([fetchAwin(), fetchTradeTracker()]);
  const live = [...awin, ...tt];

  if (live.length > 0) {
    _pool = live;
    await writeCache(live);
  } else {
    // Fallback to demo coupons (also cached so we don't re-run every launch)
    _pool = DEMO_COUPONS;
    await writeCache(DEMO_COUPONS);
  }
}

/**
 * Returns `count` coupons for the given category, randomised per level.
 * Uses a seeded Fisher-Yates so the same level always returns the same coupons.
 */
export function getCouponsForLevel(
  category: WorldCouponCategory,
  worldId: number,
  levelId: number,
  count = 3
): Coupon[] {
  const pool = _pool.length > 0 ? _pool : DEMO_COUPONS;

  // Filter by category; fallback to full pool if category has fewer than count
  let filtered = pool.filter((c) => c.category === category);
  if (filtered.length < count) filtered = pool;

  // Seeded shuffle so same world/level always gives same coupons
  const seed = worldId * 1000 + levelId * 37;
  let s = seed;
  const rng = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };

  const arr = [...filtered];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.slice(0, count);
}

/** Mark a coupon as collected (adds metadata). */
export function stampCoupon(
  coupon: Coupon,
  worldId: number,
  levelId: number
): Coupon {
  return {
    ...coupon,
    collectedAt: new Date().toISOString(),
    worldId,
    levelId,
  };
}

export { DEMO_COUPONS };
