export default function QuestionSlider({ question, value, onChange, dimmed = false }) {
  const current = value ?? question.default
  const pct = ((current - question.min) / (question.max - question.min)) * 100

  return (
    <div className={`mb-10 transition-opacity duration-200 ${dimmed ? 'opacity-40 pointer-events-none select-none' : 'opacity-100'}`}>
      <label className="block text-xl font-semibold text-ink-900 mb-6">
        {question.label}
      </label>

      {/* Waarde — krachtig en simpel */}
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-6xl font-bold text-primary-500 leading-none tracking-tight">
          {question.unit}{current % 1 === 0 ? current : current.toFixed(2)}
        </span>
        <span className="text-ink-400 text-base font-medium">/maand</span>
      </div>

      {/* Slider — premium */}
      <div className="relative">
        <input
          type="range"
          min={question.min}
          max={question.max}
          step={question.step}
          value={current}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full"
          style={{
            background: `linear-gradient(to right, #3340DD ${pct}%, #E5E4DF ${pct}%)`,
          }}
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-ink-300 font-medium">{question.unit}{question.min}</span>
          <span className="text-xs text-ink-300 font-medium">{question.unit}{question.max}</span>
        </div>
      </div>

      {question.skippable && (
        <button
          onClick={() => onChange(0)}
          className="mt-5 text-sm text-ink-400 hover:text-ink-600 underline underline-offset-2 transition-colors"
        >
          {question.skipLabel}
        </button>
      )}
    </div>
  )
}
