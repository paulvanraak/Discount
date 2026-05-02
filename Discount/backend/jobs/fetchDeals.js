const fs   = require('fs');
const path = require('path');
const { fetchAmazonDeals } = require('../services/amazon');
const { fetchBolDeals }    = require('../services/bol');

const DATA_DIR   = path.join(__dirname, '../data');
const DEALS_FILE = path.join(DATA_DIR, 'deals.json');
const MOCK_FILE  = path.join(DATA_DIR, 'mockFallback.json');

async function fetchAndSaveDeals() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  let deals = [];
  const hasAmazon = !!process.env.AMAZON_ACCESS_KEY;
  const hasBol    = !!process.env.BOL_CLIENT_ID;

  // ── Amazon (all 4 markets) ─────────────────────────────────────────────────
  if (hasAmazon) {
    for (const lang of ['nl', 'en', 'de', 'es']) {
      const batch = await fetchAmazonDeals(lang);
      console.log(`[Amazon ${lang}] ${batch.length} deals`);
      deals.push(...batch);
    }
  }

  // ── Bol.com ────────────────────────────────────────────────────────────────
  if (hasBol) {
    const batch = await fetchBolDeals();
    console.log(`[Bol.com] ${batch.length} deals`);
    deals.push(...batch);
  }

  // ── Fallback: use mock data when no credentials are configured ─────────────
  if (!hasAmazon && !hasBol) {
    console.log('[fetchDeals] No API credentials — loading mock fallback');
    deals = JSON.parse(fs.readFileSync(MOCK_FILE, 'utf8'));
  }

  // ── Deduplicate by id ──────────────────────────────────────────────────────
  const seen   = new Set();
  const unique = deals.filter((d) => {
    if (seen.has(d.id)) return false;
    seen.add(d.id);
    return true;
  });

  // ── Sort: highest discount first ───────────────────────────────────────────
  unique.sort((a, b) => b.discountPercentage - a.discountPercentage);

  fs.writeFileSync(DEALS_FILE, JSON.stringify(unique, null, 2));
  console.log(`[fetchDeals] Saved ${unique.length} deals`);
  return unique;
}

module.exports = { fetchAndSaveDeals };