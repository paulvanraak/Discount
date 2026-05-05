import { useEffect, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { getCheckById } from '../services/check'
import { sortByQuickWins } from '../services/savings'
import ResultsHero from '../components/results/ResultsHero'
import ResultCategoryCard from '../components/results/ResultCategoryCard'
import EmailOptIn from '../components/results/EmailOptIn'
import SocialProof from '../components/results/SocialProof'

export default function CheckResultsPage() {
  const { id } = useParams()
  const location = useLocation()
  const [check, setCheck] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id === 'local' && location.state) {
      // Fallback: resultaten uit router state (Supabase niet beschikbaar)
      setCheck({
        id: 'local',
        results: location.state.results,
        total_savings: location.state.totalSavings,
        score: location.state.score,
      })
      setLoading(false)
      return
    }

    getCheckById(id)
      .then((data) => {
        setCheck(data)
      })
      .finally(() => setLoading(false))
  }, [id, location.state])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-ink-500">
        Laden…
      </div>
    )
  }

  if (!check) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-ink-500 mb-4">Resultaten niet gevonden.</p>
        <Link to="/check" className="text-primary-500 font-medium">Doe de check opnieuw →</Link>
      </div>
    )
  }

  const sorted = sortByQuickWins(check.results)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <ResultsHero
        totalSavings={check.total_savings}
        score={check.score}
      />

      {sorted.length > 0 ? (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-ink-900 mb-1">Quick wins eerst</h2>
          <p className="text-sm text-ink-500 mb-4">
            Gesorteerd op gemak van overstappen
          </p>
          <div className="space-y-3">
            {sorted.map(([category, result]) => (
              <ResultCategoryCard
                key={category}
                category={category}
                result={result}
                checkId={check.id}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-successBg border border-success/20 rounded-xl p-6 mb-8 text-center">
          <p className="font-medium text-ink-900">Je zit al goed!</p>
          <p className="text-sm text-ink-500 mt-1">
            Op basis van je antwoorden is er weinig ruimte voor besparing. Goed bezig.
          </p>
        </div>
      )}

      <div className="mb-4">
        <Link
          to="/check"
          className="text-sm text-ink-500 hover:text-ink-700 flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-rounded text-base">refresh</span>
          Check opnieuw doen
        </Link>
      </div>

      <EmailOptIn checkId={check.id} />
      <SocialProof />
    </div>
  )
}
