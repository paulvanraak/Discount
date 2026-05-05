import { useEffect, useMemo, useState } from 'react'
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
    // Fallback: resultaten uit router state (Supabase niet beschikbaar)
    if (id === 'local' && location.state) {
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
      .then((data) => setCheck(data))
      .finally(() => setLoading(false))
  }, [id, location.state])

  // Fix: useMemo i.p.v. berekening tijdens elke render (rerender-derived-state)
  const sorted = useMemo(
    () => (check?.results ? sortByQuickWins(check.results) : []),
    [check]
  )

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-ink-400 text-sm">Resultaten ophalen…</p>
      </div>
    )
  }

  // Fix: early return i.p.v. geneste ternary (js-early-exit)
  if (!check) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-ink-500 mb-4">Resultaten niet gevonden.</p>
        <Link to="/check" className="text-primary-500 font-medium">Doe de check opnieuw →</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <ResultsHero
        totalSavings={Number(check.total_savings)}
        score={Number(check.score)}
      />

      {/* Fix: ternary i.p.v. && voor conditioneel renderen (rendering-conditional-render) */}
      {sorted.length > 0 ? (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-ink-900 mb-1">Quick wins eerst</h2>
          <p className="text-sm text-ink-500 mb-4">Gesorteerd op gemak van overstappen</p>
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
          <span className="material-symbols-rounded text-success text-3xl">verified</span>
          <p className="font-medium text-ink-900 mt-2">Je zit al goed!</p>
          <p className="text-sm text-ink-500 mt-1">
            Op basis van je antwoorden is er weinig ruimte voor besparing. Goed bezig.
          </p>
        </div>
      )}

      <Link
        to="/check"
        className="text-sm text-ink-400 hover:text-ink-600 flex items-center gap-1 transition-colors mb-6"
      >
        <span className="material-symbols-rounded text-base">refresh</span>
        Check opnieuw doen
      </Link>

      <EmailOptIn checkId={check.id} />
      <SocialProof />
    </div>
  )
}
