import { formatEuro } from '../../services/savings'
import ScoreBadge from './ScoreBadge'

export default function ResultsHero({ totalSavings, score }) {
  const monthly = Math.round(totalSavings / 12)

  return (
    <div className="bg-primary-500 rounded-xl p-6 sm:p-8 text-white mb-8">
      <p className="text-primary-200 text-sm font-medium mb-2">Jouw potentiële besparing</p>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-6xl sm:text-7xl font-semibold leading-none">
            {formatEuro(totalSavings)}
          </div>
          <div className="text-primary-200 text-base mt-2">
            per jaar · {formatEuro(monthly)}/maand
          </div>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <ScoreBadge score={score} />
        </div>
      </div>
      {totalSavings > 0 && (
        <p className="text-primary-200 text-sm mt-4">
          Je laat momenteel {formatEuro(monthly)}/maand liggen
        </p>
      )}
    </div>
  )
}
