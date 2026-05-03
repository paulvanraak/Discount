// services/affiliate.js
// Replace placeholder values with your real IDs once accounts are approved.
// Set via .env: EXPO_PUBLIC_AWIN_ID, EXPO_PUBLIC_AMAZON_TAG_NL, etc.

export const AFFILIATE_IDS = {
  AWIN_PUBLISHER_ID:  process.env.EXPO_PUBLIC_AWIN_ID          || 'YOUR_AWIN_PUBLISHER_ID',
  AMAZON_TAG_NL:      process.env.EXPO_PUBLIC_AMAZON_TAG_NL     || 'donniediscount-nl-21',
  AMAZON_TAG_DE:      process.env.EXPO_PUBLIC_AMAZON_TAG_DE     || 'donniediscount-de-21',
  AMAZON_TAG_UK:      process.env.EXPO_PUBLIC_AMAZON_TAG_UK     || 'donniediscount-uk-21',
  AMAZON_TAG_US:      process.env.EXPO_PUBLIC_AMAZON_TAG_US     || 'donniediscount-us-20',
  AMAZON_TAG_AU:      process.env.EXPO_PUBLIC_AMAZON_TAG_AU     || 'donniediscount-au-22',
  EBAY_CAMPAIGN_ID:   process.env.EXPO_PUBLIC_EBAY_CAMPAIGN_ID  || '5338000000000000',
};

// Awin merchant IDs — verify/update at awin.com after approval
export const AWIN_MERCHANTS = {
  'bol.com':    { awinId: 18129,  domain: 'bol.com' },
  'coolblue':   { awinId: 13356,  domain: 'coolblue.nl' },
  'zalando':    { awinId: 14535,  domain: 'zalando.nl' },
  'mediamarkt': { awinId: 5068,   domain: 'mediamarkt.nl' },
  'wehkamp':    { awinId: 4841,   domain: 'wehkamp.nl' },
  'asos':       { awinId: 10834,  domain: 'asos.com' },
  'argos':      { awinId: 1636,   domain: 'argos.co.uk' },
  'currys':     { awinId: 197,    domain: 'currys.co.uk' },
  'otto':       { awinId: 20081,  domain: 'otto.de' },
  'fnac':       { awinId: 5588,   domain: 'fnac.es' },
};

const AMAZON_DOMAIN = {
  NL: 'amazon.nl',  BE: 'amazon.nl',
  DE: 'amazon.de',  AT: 'amazon.de',  CH: 'amazon.de',
  UK: 'amazon.co.uk',
  US: 'amazon.com', CA: 'amazon.ca',  AU: 'amazon.com.au',
  ES: 'amazon.es',  MX: 'amazon.com.mx',
  AR: 'amazon.com.ar', CO: 'amazon.com.co',
};

const AMAZON_TAG = {
  NL: AFFILIATE_IDS.AMAZON_TAG_NL, BE: AFFILIATE_IDS.AMAZON_TAG_NL,
  DE: AFFILIATE_IDS.AMAZON_TAG_DE, AT: AFFILIATE_IDS.AMAZON_TAG_DE, CH: AFFILIATE_IDS.AMAZON_TAG_DE,
  UK: AFFILIATE_IDS.AMAZON_TAG_UK,
  US: AFFILIATE_IDS.AMAZON_TAG_US, CA: AFFILIATE_IDS.AMAZON_TAG_US,
  AU: AFFILIATE_IDS.AMAZON_TAG_AU,
  ES: AFFILIATE_IDS.AMAZON_TAG_DE, // use DE tag for ES until ES tag is created
};

/**
 * Build a properly formatted affiliate deep link.
 *
 * store shape: { key, network, url, awinId? }
 * deal shape:  { id, title, asin? }
 * region:      'NL' | 'BE' | 'DE' | 'UK' | 'US' | ...
 */
export function buildAffiliateUrl(deal, store, region = 'NL') {
  const network = store.network || 'direct';
  const deepLink = store.url || '';

  switch (network) {
    case 'amazon': {
      const domain = AMAZON_DOMAIN[region] || 'amazon.nl';
      const tag    = AMAZON_TAG[region]    || AFFILIATE_IDS.AMAZON_TAG_NL;
      if (deal.asin) return `https://www.${domain}/dp/${deal.asin}?tag=${tag}`;
      return `https://www.${domain}/s?k=${encodeURIComponent(deal.title)}&tag=${tag}`;
    }

    case 'awin': {
      const merchant = AWIN_MERCHANTS[store.key] || {};
      const awinId   = store.awinId || merchant.awinId;
      if (!awinId) return deepLink;
      return (
        `https://www.awin1.com/cread.php` +
        `?awinmid=${awinId}` +
        `&awinaffid=${AFFILIATE_IDS.AWIN_PUBLISHER_ID}` +
        `&clickref=${deal.id}` +
        `&ued=${encodeURIComponent(deepLink)}`
      );
    }

    case 'ebay': {
      return (
        `https://rover.ebay.com/rover/1/1-53471-19255-0/1` +
        `?campid=${AFFILIATE_IDS.EBAY_CAMPAIGN_ID}` +
        `&mpre=${encodeURIComponent(deepLink)}`
      );
    }

    case 'mercadolibre': {
      // Mercado Libre Afiliados deep link format
      return `https://mercadolibre.com/afiliados?url=${encodeURIComponent(deepLink)}`;
    }

    default:
      return deepLink;
  }
}
