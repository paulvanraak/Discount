export default function QuestionChoice({ question, value, onChange, answers }) {
  // Conditionally show based on showIf
  if (question.showIf && !question.showIf(answers)) return null

  return (
    <div className="mb-8">
      <label className="block text-base font-medium text-ink-900 mb-4">
        {question.label}
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {question.options.map((opt) => {
          const selected = value === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={[
                'py-3 px-4 rounded-md border text-sm font-medium transition-colors text-left',
                selected
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-ink-100 bg-white text-ink-700 hover:border-ink-300',
              ].join(' ')}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
