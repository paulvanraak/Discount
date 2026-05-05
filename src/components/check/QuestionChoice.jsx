export default function QuestionChoice({ question, value, onChange, answers }) {
  if (question.showIf && !question.showIf(answers)) return null

  return (
    <div className="mb-10">
      <label className="block text-xl font-semibold text-ink-900 mb-5">
        {question.label}
      </label>
      <div className="flex flex-col gap-2">
        {question.options.map((opt) => {
          const selected = value === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={[
                'py-4 px-5 rounded-md border text-base font-medium transition-all text-left flex items-center justify-between',
                selected
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-ink-100 bg-white text-ink-700 hover:border-primary-200 hover:bg-primary-50/40',
              ].join(' ')}
            >
              {opt.label}
              {selected && (
                <span className="material-symbols-rounded text-primary-500 text-lg">check_circle</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
