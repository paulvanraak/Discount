import { formatEuro } from '../../services/savings'
import ScoreBadge from './ScoreBadge'

export default function ResultsHero({ totalSavings, score }) {
  const monthly = Math.round(totalSavings / 12)

  return (
    <div className="bg-primary-500 rounded-2xl overflow-hidden mb-8">
      <div className="p-6 sm:p-8">
        <p className="text-primary-200 text-xs font-semibold uppercase tracking-widest mb-3">
          Jouw potentiële besparing
        </p>

        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="text-6xl sm:text-7xl font-bold text-white leading-none tracking-tight">
              {formatEuro(totalSavings)}
            </div>
            <div className="text-primary-200 text-base mt-2">
              per jaar · <span className="text-white font-medium">{formatEuro(monthly)}/maand</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
            <ScoreBadge score={score} />
          </div>
        </div>
      </div>

      {/* Subtiele bodem-strip */}
      <div className="bg-primary-600/40 px-6 sm:px-8 py-3">
        <p className="text-primary-200 text-sm">
          {totalSavings > 500
            ? `Je laat momenteel ${formatEuro(monthly)}/maand liggen — de quick wins hieronder kosten je minder dan 10 minuten.`
            : totalSavings > 0
            ? `Je laat ${formatEuro(monthly)}/maand liggen. Elke kleine stap telt.`
            : 'Je zit al goed — weinig ruimte voor besparing.'}
        </p>
      </div>
    </div>
  )
}
