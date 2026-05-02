const amazonPaapi = require('amazon-paapi');

// Marketplace per language
const MARKETPLACES = {
  nl: 'www.amazon.nl',
  en: 'www.amazon.com',
  de: 'www.amazon.de',
  es: 'www.amazon.es',
};

// Amazon SearchIndex per app category
const SEARCH_INDEXES = {
  tech:    ['Electronics', 'Computers'],
  kitchen: ['Kitchen'],
  home:    ['HomeAndKitchen', 'Appliances'],
};

// FOMO key based on discount depth
function fomoKey(pct) {
  if (pct >= 70) return 'hot';
  if (pct >= 65) return 'stock';
  if (pct >= 60) return 'popular';
  return '';
}

async function fetchAmazonDeals(lang = 'nl') {
  if (!process.env.AMAZON_ACCESS_KEY) return [];

  const commonParams = {
    AccessKey:   process.env.AMAZON_ACCESS_KEY,
    SecretKey:   process.env.AMAZON_SECRET_KEY,
    PartnerTag:  process.env.AMAZON_PARTNER_TAG,
    PartnerType: 'Associates',
    Marketplace: MARKETPLACES[lang] || MARKETPLACES.nl,
  };

  const deals = [];

  for (const [category, indexes] of Object.entries(SEARCH_INDEXES)) {
    for (const searchIndex of indexes) {
      try {
        const response = await amazonPaapi.SearchItems(commonParams, {
          Keywords:          'deal',
          SearchIndex:       searchIndex,
          MinSavingPercent:  50,
          ItemCount:         10,
          Resources: [
            'Images.Primary.Large',
            'ItemInfo.Title',
            'Offers.Listings.Price',
            'Offers.Listings.SavingBasis',
            'DetailPageURL',
          ],
        });

        for (const item of response.SearchResult?.Items || []) {
          const listing = item.Offers?.Listings?.[0];
          if (!listing) continue;

          const newPrice  = listing.Price?.Amount;
          const oldPrice  = listing.SavingBasis?.Amount;
          if (!newPrice || !oldPrice || oldPrice <= newPrice) continue;

          const pct = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
          if (pct < 50) continue;

          deals.push({
            id:                 item.ASIN,
            title:              item.ItemInfo?.Title?.DisplayValue || 'Unknown',
            image:              item.Images?.Primary?.Large?.URL || '',
            originalPrice:      oldPrice,
            discountedPrice:    newPrice,
            discountPercentage: pct,
            category,
            fomoKey:            fomoKey(pct),
            affiliateStore:     'primary',   // primary = Amazon in all languages
            affiliatePath:      item.DetailPageURL || '',
            source:             `amazon_${lang}`,
            fetchedAt:          new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error(`[Amazon] ${lang}/${searchIndex} error:`, err.message);
      }
    }
  }

  return deals;
}

module.exports = { fetchAmazonDeals };