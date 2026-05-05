import { trackEvent } from './analytics'
import { supabase } from './supabase'

export async function openAffiliateLink(provider, category, userId = null, checkId = null) {
  // Track in Supabase
  if (userId) {
    await supabase.from('actions').insert({
      user_id: userId,
      check_id: checkId && checkId !== 'local' ? checkId : null,
      category,
      provider: provider.slug,
      action_type: 'affiliate_click',
      metadata: { network: provider.network },
    }).catch(() => {}) // niet blokkeren als het mislukt
  }

  // Track in GA4 / Meta Pixel
  trackEvent('affiliate_click', {
    provider: provider.slug,
    category,
    network: provider.network,
  })

  window.open(provider.affiliateLink, '_blank', 'noopener,noreferrer')
}
