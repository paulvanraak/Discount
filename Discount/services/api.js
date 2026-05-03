import { mockDeals } from '../data/mockData';
import { rankDeals } from './ranking';

// Set EXPO_PUBLIC_API_URL in .env once the backend (Supabase) is deployed
const API_URL        = process.env.EXPO_PUBLIC_API_URL        || null;
const SUPABASE_URL   = process.env.EXPO_PUBLIC_SUPABASE_URL   || null;
const SUPABASE_ANON  = process.env.EXPO_PUBLIC_SUPABASE_ANON  || null;

export async function fetchDeals({ category, minDiscount, minPrice, maxPrice, region = 'NL' } = {}) {
  let deals;

  if (SUPABASE_URL && SUPABASE_ANON) {
    deals = await fetchFromSupabase({ category, minDiscount, minPrice, maxPrice, region });
  } else if (API_URL) {
    deals = await fetchFromAPI({ category, minDiscount, minPrice, maxPrice });
  } else {
    deals = filterMock({ category, minDiscount, minPrice, maxPrice });
  }

  // Client-side ranking (also applied server-side via ranked_deals view when Supabase is live)
  return rankDeals(deals, { region });
}

async function fetchFromSupabase({ category, minDiscount, minPrice, maxPrice, region }) {
  try {
    const params = new URLSearchParams({
      select: '*',
      is_active: 'eq.true',
      order: 'score.desc',
      limit: '100',
    });
    if (category && category !== 'all') params.append('category', `eq.${category}`);
    if (minDiscount) params.append('discount_percentage', `gte.${parseInt(minDiscount, 10)}`);
    if (minPrice)    params.append('discounted_price',    `gte.${parseFloat(minPrice)}`);
    if (maxPrice)    params.append('discounted_price',    `lte.${parseFloat(maxPrice)}`);
    // Region filter (deals.regions is a text array)
    params.append('regions', `cs.{${region}}`);

    const res = await fetch(`${SUPABASE_URL}/rest/v1/ranked_deals?${params}`, {
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
        Accept: 'application/json',
      },
    });
    if (!res.ok) throw new Error(`Supabase ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[api] Supabase unavailable, falling back to mock:', err.message);
    return filterMock({ category, minDiscount, minPrice, maxPrice });
  }
}

async function fetchFromAPI({ category, minDiscount, minPrice, maxPrice }) {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (minDiscount)                    params.append('minDiscount', minDiscount);
    if (minPrice)                       params.append('minPrice', minPrice);
    if (maxPrice)                       params.append('maxPrice', maxPrice);

    const res = await fetch(`${API_URL}/api/deals?${params}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[api] Backend unavailable, using mock:', err.message);
    return filterMock({ category, minDiscount, minPrice, maxPrice });
  }
}

function filterMock({ category, minDiscount, minPrice, maxPrice } = {}) {
  let r = [...mockDeals];
  if (category && category !== 'all') r = r.filter(d => d.category === category);
  if (minDiscount) r = r.filter(d => d.discountPercentage >= parseInt(minDiscount, 10));
  if (minPrice)    r = r.filter(d => d.discountedPrice >= parseFloat(minPrice));
  if (maxPrice)    r = r.filter(d => d.discountedPrice <= parseFloat(maxPrice));
  return r;
}

/** Record a click on Supabase (fire-and-forget) */
export function recordClick(dealId, region = 'NL', sessionId = getSessionId()) {
  if (!SUPABASE_URL || !SUPABASE_ANON) return;
  fetch(`${SUPABASE_URL}/rest/v1/deal_clicks`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${SUPABASE_ANON}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ deal_id: dealId, region, session_id: sessionId }),
  }).catch(() => {});
}

function getSessionId() {
  if (typeof window === 'undefined') return 'server';
  if (!window.__dd_session) {
    window.__dd_session = Math.random().toString(36).slice(2);
  }
  return window.__dd_session;
}
