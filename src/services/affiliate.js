import { trackEvent } from './analytics'

export function openAffiliateLink(provider, category) {
  trackEvent('affiliate_click', {
    provider: provider.slug,
    category,
    network: provider.network,
  })
  window.open(provider.affiliateLink, '_blank', 'noopener,noreferrer')
}
