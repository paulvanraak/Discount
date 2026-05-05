import { Link } from 'react-router-dom'

export default function CheckHero() {
  return (
    <div className="bg-primary-500 text-white">
      <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-xl">
          <p className="text-primary-200 text-sm font-medium uppercase tracking-widest mb-4">
            BespaarCheck
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold leading-tight mb-4">
            Ontdek wat je kunt besparen
          </h1>
          <p className="text-primary-200 text-lg mb-8">
            6 vragen, 3 minuten, 1 persoonlijk overzicht. Geen account nodig.
          </p>
          <Link
            to="/check"
            className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold text-base px-8 py-4 rounded-md transition-colors"
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
      </div>
    </div>
  )
}
