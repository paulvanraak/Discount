// services/analytics.js
// Set EXPO_PUBLIC_GA4_ID and EXPO_PUBLIC_META_PIXEL_ID in your .env before going live

const GA4_ID    = process.env.EXPO_PUBLIC_GA4_ID        || 'G-XXXXXXXXXX';
const PIXEL_ID  = process.env.EXPO_PUBLIC_META_PIXEL_ID || 'XXXXXXXXXXXXXXXXX';

let ready = false;

export function initAnalytics() {
  if (typeof window === 'undefined' || ready) return;
  ready = true;

  // ── GA4 ──────────────────────────────────────────────────────────
  const ga = document.createElement('script');
  ga.async = true;
  ga.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(ga);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA4_ID, { send_page_view: false });

  // ── Meta Pixel ───────────────────────────────────────────────────
  if (!window.fbq) {
    const fbq = function () {
      fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
    };
    window.fbq = window._fbq = fbq;
    fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = [];
    const px = document.createElement('script');
    px.async = true;
    px.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(px);
    window.fbq('init', PIXEL_ID);
  }

  trackPageView();
}

export function trackPageView(path = '/') {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', 'page_view', { page_path: path });
  window.fbq?.('track', 'PageView');
}

export function trackDealClick(deal) {
  if (typeof window === 'undefined') return;
  const item = {
    item_id: deal.id,
    item_name: deal.title,
    item_category: deal.category || 'unknown',
    price: deal.discountedPrice,
    discount: deal.discountPercentage,
    affiliation: deal.affiliateStore,
  };
  window.gtag?.('event', 'select_item', { items: [item] });
  window.fbq?.('track', 'ViewContent', {
    content_ids: [deal.id],
    content_name: deal.title,
    content_category: deal.category,
    value: deal.discountedPrice,
    currency: 'EUR',
  });
}

export function trackAddToWishlist(deal) {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', 'add_to_wishlist', {
    items: [{ item_id: deal.id, item_name: deal.title, price: deal.discountedPrice }],
  });
  window.fbq?.('track', 'AddToWishlist', {
    content_ids: [deal.id],
    value: deal.discountedPrice,
    currency: 'EUR',
  });
}

export function trackPurchaseIntent(deal) {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', 'begin_checkout', {
    items: [{ item_id: deal.id, item_name: deal.title, price: deal.discountedPrice }],
    value: deal.discountedPrice,
    currency: 'EUR',
  });
  window.fbq?.('track', 'InitiateCheckout', {
    content_ids: [deal.id],
    value: deal.discountedPrice,
    currency: 'EUR',
  });
}
