// services/ranking.js
// Scores each deal and returns them sorted best-first.

const FOMO_SCORE = {
  flash: 20, hot: 18, hour3: 18, limited: 15,
  stock: 15, timer: 12, today: 12, popular: 10,
  topdeal: 10, bestseller: 6,
};

/**
 * Rank deals by a composite score.
 * @param {Array}  deals         - raw deal array
 * @param {Object} opts
 * @param {Object} opts.clickHistory - { [dealId]: clickCount }
 * @param {string} opts.region       - 'NL' | 'DE' | 'UK' | ...
 */
export function rankDeals(deals, { clickHistory = {}, region = 'NL' } = {}) {
  return deals
    .map(deal => ({ ...deal, _score: score(deal, clickHistory) }))
    .sort((a, b) => b._score - a._score);
}

function score(deal, clickHistory) {
  let s = 0;

  // Discount percentage (0–40 pts)
  s += Math.min(deal.discountPercentage, 80) * 0.5;

  // Absolute saving — bigger € win ranks higher (0–15 pts)
  const saving = deal.originalPrice - deal.discountedPrice;
  s += Math.min(saving / 5, 15);

  // Popularity from click history (0–20 pts)
  s += Math.min((clickHistory[deal.id] || 0) * 2, 20);

  // Fomo urgency (0–20 pts)
  s += FOMO_SCORE[deal.fomoKey] || 0;

  // Price sweet spot €15–€250: highest purchase intent (0–10 pts)
  if (deal.discountedPrice >= 15 && deal.discountedPrice <= 250) s += 10;
  else if (deal.discountedPrice < 15) s += 3;
  else s += 5;

  return s;
}

/** Pick the single best deal to feature at the top. */
export function getFeaturedDeal(rankedDeals) {
  return rankedDeals.find(d => d.fomoKey) || rankedDeals[0] || null;
}
