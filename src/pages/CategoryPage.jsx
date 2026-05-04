import { useParams } from 'react-router-dom'
import { getCategoryBySlug } from '../data/categories'
import { VPN_PROVIDERS } from '../data/providers/vpn'
import { BANKING_PROVIDERS } from '../data/providers/banking'
import ComparePage from '../components/compare/ComparePage'
import NotFoundPage from './NotFoundPage'
import PageContainer from '../components/layout/PageContainer'

const PROVIDERS_BY_CATEGORY = {
  'vpn-hosting': VPN_PROVIDERS,
  'bankrekening': BANKING_PROVIDERS,
}

export default function CategoryPage() {
  const { category } = useParams()
  const cat = getCategoryBySlug(category)

  if (!cat) return <NotFoundPage />

  if (!cat.available) {
    return (
      <PageContainer className="py-16 text-center">
        <h1 className="text-3xl font-medium mb-4">{cat.name}</h1>
        <p className="text-ink-500 mb-8">
          We werken hard aan het toevoegen van {cat.name.toLowerCase()}-vergelijkingen.
        </p>
        <a href="/" className="text-primary-500 font-medium">← Terug naar home</a>
      </PageContainer>
    )
  }

  const providers = PROVIDERS_BY_CATEGORY[category] || []
  return <ComparePage category={cat} providers={providers} />
}
