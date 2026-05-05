import { Link } from 'react-router-dom'
import ProgressBar from '../shared/ProgressBar'

export default function CheckLayout({ step, currentIndex, total, onNext, onPrev, isLast, saving, children }) {
  const isFirst = currentIndex === 0

  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      {/* Top bar */}
      <div className="bg-white border-b border-ink-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="text-primary-500 font-semibold text-sm tracking-tight">
            Bespaar met Donnie
          </Link>
          <span className="text-sm text-ink-500">
            Stap {currentIndex + 1} van {total}
          </span>
        </div>
        <ProgressBar current={currentIndex} total={total} />
      </div>

      {/* Content */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-rounded text-primary-500 text-xl">{step.icon}</span>
            <span className="text-xs font-medium uppercase tracking-widest text-ink-500">{step.title}</span>
          </div>
        </div>
        {children}
      </div>

      {/* Bottom nav */}
      <div className="bg-white border-t border-ink-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex gap-3">
          {!isFirst && (
            <button
              onClick={onPrev}
              className="flex-1 py-3 rounded-md border border-ink-100 text-ink-700 text-sm font-medium hover:bg-ink-50 transition-colors"
            >
              Vorige
            </button>
          )}
          <button
            onClick={onNext}
            className="flex-1 py-3 rounded-md bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold transition-colors"
          >
            {saving ? 'Berekenen…' : isLast ? 'Bekijk mijn besparing' : 'Volgende'}
          </button>
        </div>
      </div>
    </div>
  )
}
