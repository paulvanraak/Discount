export function calculateVPNSavings(provider, plan = 'biennial') {
  const monthly = provider.price.monthly
  const chosen = provider.price[plan]
  return Math.round((monthly - chosen) * 24)
}

export function formatEuro(amount) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}
