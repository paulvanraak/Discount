export const CATEGORIES = [
  {
    slug: 'bankrekening',
    name: 'Bankrekening',
    tagline: 'De beste banken op een rij',
    description: 'Vergelijk betaalrekeningen en banken.',
    icon: 'account_balance',
    color: 'blue',
    available: true,
  },
  {
    slug: 'vpn-hosting',
    name: 'VPN & hosting',
    tagline: 'Tot 70% korting op VPN en hosting',
    description: 'De beste VPN-diensten en hostingproviders.',
    icon: 'language',
    color: 'pink',
    available: true,
  },
  {
    slug: 'energie',
    name: 'Energie',
    tagline: 'Bespaar tot €600 per jaar',
    description: 'Vergelijk energieleveranciers en stap eenvoudig over.',
    icon: 'bolt',
    color: 'red',
    available: false,
  },
  {
    slug: 'telecom',
    name: 'Telecom',
    tagline: 'Internet & mobiel — beste deals',
    description: 'Vergelijk providers voor internet en mobiel.',
    icon: 'smartphone',
    color: 'purple',
    available: false,
  },
  {
    slug: 'verzekering',
    name: 'Verzekering',
    tagline: 'Auto, zorg, woning — slimmer verzekerd',
    description: 'Vergelijk verzekeringen.',
    icon: 'shield',
    color: 'amber',
    available: false,
  },
  {
    slug: 'beleggen',
    name: 'Beleggen',
    tagline: 'Lage tarieven, slim beleggen',
    description: 'Vergelijk beleggingsapps en brokers.',
    icon: 'trending_up',
    color: 'green',
    available: false,
  },
]

export const getCategoryBySlug = (slug) =>
  CATEGORIES.find(c => c.slug === slug)
