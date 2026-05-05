export default function QuestionSlider({ question, value, onChange }) {
  const current = value ?? question.default
  const pct = ((current - question.min) / (question.max - question.min)) * 100

  return (
    <div className="mb-10">
      <label className="block text-lg font-medium text-ink-900 mb-6">
        {question.label}
      </label>

      {/* Groot bedrag */}
      <div className="text-center mb-6">
        <span className="text-5xl font-semibold text-primary-500">
          {question.unit}{current % 1 === 0 ? current : current.toFixed(2)}
        </span>
        <span className="text-ink-400 text-sm ml-2">/maand</span>
      </div>

      {/* Slider */}
      <div className="relative px-1">
        <input
          type="range"
          min={question.min}
          max={question.max}
          step={question.step}
          value={current}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 appearance-none cursor-pointer rounded-full outline-none"
          style={{
            background: `linear-gradient(to right, #3340DD ${pct}%, #E5E4DF ${pct}%)`,
          }}
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-ink-400">{question.unit}{question.min}</span>
          <span className="text-xs text-ink-400">{question.unit}{question.max}</span>
        </div>
      </div>

      {question.skippable && (
        <button
          onClick={() => onChange(0)}
          className="mt-4 text-sm text-ink-400 hover:text-ink-600 underline underline-offset-2 transition-colors"
        >
          {question.skipLabel}
        </button>
      )}
    </div>
  )
}
