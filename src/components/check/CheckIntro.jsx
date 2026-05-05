import { Link } from 'react-router-dom'
import { CHECK_STEPS } from '../../data/checkQuestions'

const STEP_COLORS = {
  energie:     { bg: 'bg-red-50',    icon: 'text-red-500',    border: 'border-red-100' },
  bank:        { bg: 'bg-blue-50',   icon: 'text-blue-500',   border: 'border-blue-100' },
  telecom:     { bg: 'bg-purple-50', icon: 'text-purple-500', border: 'border-purple-100' },
  verzekering: { bg: 'bg-amber-50',  icon: 'text-amber-500',  border: 'border-amber-100' },
  beleggen:    { bg: 'bg-green-50',  icon: 'text-green-600',  border: 'border-green-100' },
  vpn:         { bg: 'bg-pink-50',   icon: 'text-pink-500',   border: 'border-pink-100' },
}

export default function CheckIntro({ onStart }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-500 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
          <span className="material-symbols-rounded text-sm">bolt</span>
          BespaarCheck
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-ink-900 mb-3 leading-tight">
          Ontdek wat je kunt besparen
        </h1>
        <p className="text-ink-500 text-lg">
          6 vragen · 3 minuten · 1 persoonlijk overzicht
        </p>
      </div>

      {/* Categorie tiles */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {CHECK_STEPS.map((step) => {
          const c = STEP_COLORS[step.id] ?? { bg: 'bg-ink-50', icon: 'text-ink-500', border: 'border-ink-100' }
          return (
            <div
              key={step.id}
              className={`${c.bg} border ${c.border} rounded-xl p-4 flex flex-col items-center gap-2`}
            >
              <span className={`material-symbols-rounded ${c.icon} text-2xl`}>{step.icon}</span>
              <span className="text-xs text-ink-700 font-medium text-center leading-snug">{step.title}</span>
            </div>
          )
        })}
      </div>

      <div className="text-center">
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold text-base px-8 py-4 rounded-md transition-colors shadow-lg shadow-accent-600/20"
        >
          Start de check
          <span className="material-symbols-rounded text-lg">arrow_forward</span>
        </button>
        <p className="mt-4 text-sm text-ink-400">
          Geen account nodig · Resultaten direct zichtbaar
        </p>
      </div>
    </div>
  )
}
