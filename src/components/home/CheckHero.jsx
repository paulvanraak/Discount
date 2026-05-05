import { Link } from 'react-router-dom'

const STATS = [
  { value: '€847', label: 'gemiddelde besparing/jaar' },
  { value: '6', label: 'vragen, 3 minuten' },
  { value: '100%', label: 'gratis & anoniem' },
]

export default function CheckHero() {
  return (
    <div className="bg-primary-500 text-white overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
        <div className="grid sm:grid-cols-2 gap-12 items-center">
          {/* Left — copy */}
          <div>
            <p className="text-primary-200 text-xs font-semibold uppercase tracking-widest mb-4">
              BespaarCheck
            </p>
            <h1 className="text-4xl sm:text-5xl font-semibold leading-tight mb-4">
              Ontdek wat je kunt besparen
            </h1>
            <p className="text-primary-200 text-lg mb-8 leading-relaxed">
              6 vragen, 3 minuten, 1 persoonlijk overzicht. Geen account nodig.
            </p>
            <Link
              to="/check"
              className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold text-base px-7 py-4 rounded-md transition-colors shadow-lg shadow-accent-600/30"
            >
              Start de BespaarCheck
              <span className="material-symbols-rounded text-lg">arrow_forward</span>
            </Link>
            <p className="text-primary-300 text-sm mt-4">
              Of{' '}
              <a href="#vergelijkers" className="underline underline-offset-2 hover:text-white transition-colors">
                vergelijk direct per categorie
              </a>
            </p>
          </div>

          {/* Right — stats (alleen desktop) */}
          <div className="hidden sm:grid grid-cols-1 gap-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="bg-white/10 rounded-xl px-6 py-5 flex items-center gap-5 backdrop-blur-sm"
              >
                <span className="text-4xl font-semibold text-white leading-none">{s.value}</span>
                <span className="text-primary-200 text-sm leading-snug">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
