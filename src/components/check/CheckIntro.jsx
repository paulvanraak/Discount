import { CHECK_STEPS } from '../../data/checkQuestions'

export default function CheckIntro({ onStart }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-semibold text-ink-900 mb-4 leading-tight">
          Ontdek wat je kunt besparen
        </h1>
        <p className="text-lg text-ink-500">
          6 vragen, 3 minuten, 1 persoonlijk overzicht
        </p>
      </div>

      {/* Categorieën overzicht */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {CHECK_STEPS.map((step) => (
          <div
            key={step.id}
            className="bg-white rounded-md border border-ink-100 p-4 flex flex-col items-center gap-2"
          >
            <span className="material-symbols-rounded text-primary-500 text-2xl">{step.icon}</span>
            <span className="text-xs text-ink-700 font-medium text-center">{step.title}</span>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold text-base px-8 py-4 rounded-md transition-colors"
        >
          Start de check
          <span className="material-symbols-rounded text-lg">arrow_forward</span>
        </button>
        <p className="mt-4 text-sm text-ink-500">
          Geen account nodig. Resultaten direct zichtbaar.
        </p>
      </div>
    </div>
  )
}
