import ProviderRow from './ProviderRow'
import PageContainer from '../layout/PageContainer'
import AffiliateDisclosure from '../shared/AffiliateDisclosure'

export default function ComparePage({ category, providers }) {
  const sorted = [...providers].sort((a, b) => (b.bestChoice ? 1 : 0) - (a.bestChoice ? 1 : 0))

  return (
    <PageContainer className="py-10">
      <h1 className="text-2xl md:text-3xl font-semibold text-ink-900 mb-2">{category.name}</h1>
      <p className="text-ink-500 mb-8">{category.description}</p>

      <div className="space-y-4">
        {sorted.map(provider => (
          <ProviderRow key={provider.slug} provider={provider} category={category} />
        ))}
      </div>
      <AffiliateDisclosure />
    </PageContainer>
  )
}
