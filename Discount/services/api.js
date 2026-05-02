import { mockDeals } from '../data/mockData';

// Set EXPO_PUBLIC_API_URL in your .env or app.config.js once the backend is deployed
const API_URL = process.env.EXPO_PUBLIC_API_URL || null;

export async function fetchDeals({ category, minDiscount, minPrice, maxPrice } = {}) {
  if (!API_URL) {
    // No backend configured yet — filter mock data locally
    return filterMock({ category, minDiscount, minPrice, maxPrice });
  }

  try {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (minDiscount)                    params.append('minDiscount', minDiscount);
    if (minPrice)                       params.append('minPrice', minPrice);
    if (maxPrice)                       params.append('maxPrice', maxPrice);

    const res = await fetch(`${API_URL}/api/deals?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[api] Backend unavailable, using mock data:', err.message);
    return filterMock({ category, minDiscount, minPrice, maxPrice });
  }
}

function filterMock({ category, minDiscount, minPrice, maxPrice } = {}) {
  let result = [...mockDeals];
  if (category && category !== 'all') result = result.filter((d) => d.category === category);
  if (minDiscount) result = result.filter((d) => d.discountPercentage >= parseInt(minDiscount, 10));
  if (minPrice)    result = result.filter((d) => d.discountedPrice >= parseFloat(minPrice));
  if (maxPrice)    result = result.filter((d) => d.discountedPrice <= parseFloat(maxPrice));
  return result;
}