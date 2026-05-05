export default function ScoreBadge({ score }) {
  const color =
    score >= 8 ? 'text-success' : score >= 6 ? 'text-warning' : 'text-danger'

  return (
    <div className="inline-flex flex-col items-center">
      <div className={`text-5xl font-semibold ${color}`}>
        {score.toFixed(1)}
      </div>
      <div className="text-xs uppercase tracking-widest text-ink-500 mt-1">
        BespaarCheck-score
      </div>
    </div>
  )
}
