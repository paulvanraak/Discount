const GA4_ID = 'G-XXXXXXXXXX' // TODO: replace
const META_PIXEL_ID = 'XXXXXXXXXXXXXXXXX' // TODO: replace

export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return
  if (window.gtag) window.gtag('event', eventName, params)
  if (window.fbq) window.fbq('trackCustom', eventName, params)
  if (import.meta.env.DEV) console.log('[Analytics]', eventName, params)
}

export function trackPageView(path) {
  if (window.gtag) window.gtag('config', GA4_ID, { page_path: path })
  if (window.fbq) window.fbq('track', 'PageView')
}
