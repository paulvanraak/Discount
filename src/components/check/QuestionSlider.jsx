export default function QuestionSlider({ question, value, onChange }) {
  const current = value ?? question.default

  return (
    <div className="mb-8">
      <label className="block text-base font-medium text-ink-900 mb-4">
        {question.label}
      </label>

      <div className="flex items-center gap-4">
        <input
          type="range"
          min={question.min}
          max={question.max}
          step={question.step}
          value={current}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-primary-500"
        />
        <div className="w-24 text-right">
          <span className="text-2xl font-semibold text-primary-500">
            {question.unit}{current % 1 === 0 ? current : current.toFixed(2)}
          </span>
          <span className="text-xs text-ink-500 block">/maand</span>
        </div>
      </div>

      {question.skippable && (
        <button
          onClick={() => onChange(0)}
          className="mt-3 text-sm text-ink-500 underline underline-offset-2"
        >
          {question.skipLabel}
        </button>
      )}
    </div>
  )
}
