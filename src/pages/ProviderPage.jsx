import { useParams, Link } from 'react-router-dom'
import { getCategoryBySlug } from '../data/categories'
import { getVPNProvider } from '../data/providers/vpn'
import { getBankingProvider } from '../data/providers/banking'
import StarRating from '../components/shared/StarRating'
import BenefitList from '../components/provider/BenefitList'
import PriceCard from '../components/provider/PriceCard'
import AffiliateCTA from '../components/provider/AffiliateCTA'
import PageContainer from '../components/layout/PageContainer'
import NotFoundPage from './NotFoundPage'
import Card from '../components/shared/Card'

function getProvider(category, providerSlug) {
  if (category === 'vpn-hosting') return getVPNProvider(providerSlug)
  if (category === 'bankrekening') return getBankingProvider(providerSlug)
  return null
}

export default function ProviderPage() {
  const { category, provider: providerSlug } = useParams()
  const cat = getCategoryBySlug(category)
  const provider = getProvider(category, providerSlug)

  if (!cat || !provider) return <NotFoundPage />

  return (
    <PageContainer className="py-10">
      <Link to={`/vergelijk/${category}`} className="text-sm text-ink-500 hover:text-ink-700 mb-6 inline-flex items-center gap-1">
        ← {cat.name}
      </Link>

      {/* Hero */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-16 h-16 rounded-md flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
          style={{ backgroundColor: provider.logoColor }}
        >
          {provider.logo}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">{provider.name}</h1>
          <StarRating rating={provider.rating} reviewCount={provider.reviewCount} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <h2 className="font-medium text-ink-900 mb-4">Voordelen</h2>
            <BenefitList features={provider.features} />
          </Card>
          <PriceCard provider={provider} />
        </div>
        <div>
          <AffiliateCTA provider={provider} category={cat} />
        </div>
      </div>
    </PageContainer>
  )
}
