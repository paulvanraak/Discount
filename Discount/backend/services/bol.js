const axios = require('axios');

// Bol.com Partner API v10
// Docs: https://api.bol.com/retailer/public/redoc/v10
// Credentials: https://partner.bol.com → Instellingen → API

const TOKEN_URL = 'https://login.bol.com/token';
const API_BASE  = 'https://api.bol.com/retailer';

function mapCategory(cat = '') {
  const c = cat.toLowerCase();
  if (c.includes('electroni') || c.includes('computer') || c.includes('telefoon')) return 'tech';
  if (c.includes('keuken') || c.includes('kook') || c.includes('eten')) return 'kitchen';
  return 'home';
}

function fomoKey(pct) {
  if (pct >= 70) return 'hot';
  if (pct >= 60) return 'popular';
  return 'limited';
}

async function getBolToken() {
  const res = await axios.post(
    TOKEN_URL,
    'grant_type=client_credentials',
    {
      auth: {
        username: process.env.BOL_CLIENT_ID,
        password: process.env.BOL_CLIENT_SECRET,
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );
  return res.data.access_token;
}

async function fetchBolDeals() {
  if (!process.env.BOL_CLIENT_ID) return [];

  try {
    const token = await getBolToken();

    // Fetch promotions / deals endpoint
    const res = await axios.get(`${API_BASE}/promotions`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept:        'application/vnd.retailer.v10+json',
      },
    });

    return (res.data.promotionList || [])
      .map((p) => {
        const oldPrice = p.originalUnitPrice?.amount;
        const newPrice = p.unitPrice?.amount;
        if (!oldPrice || !newPrice || oldPrice <= newPrice) return null;

        const pct = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
        if (pct < 50) return null;

        return {
          id:                 String(p.ean || p.promotionId),
          title:              p.title || 'Bol.com deal',
          image:              p.image?.url || '',
          originalPrice:      oldPrice,
          discountedPrice:    newPrice,
          discountPercentage: pct,
          category:           mapCategory(p.mainCategory),
          fomoKey:            fomoKey(pct),
          affiliateStore:     'secondary',  // secondary = Bol.com in NL language
          affiliatePath:      p.productPageUrl || '',
          source:             'bol',
          fetchedAt:          new Date().toISOString(),
        };
      })
      .filter(Boolean);
  } catch (err) {
    console.error('[Bol.com] Fetch error:', err.message);
    return [];
  }
}

module.exports = { fetchBolDeals };