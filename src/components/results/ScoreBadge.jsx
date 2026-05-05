export default function ScoreBadge({ score }) {
  const isGood = score >= 8
  const isMedium = score >= 6

  const color = isGood ? '#1D9E75' : isMedium ? '#EF9F27' : '#E24B4A'
  const label = isGood ? 'Uitstekend' : isMedium ? 'Redelijk' : 'Ruimte voor verbetering'

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div className="text-5xl font-bold leading-none" style={{ color }}>
        {score.toFixed(1)}
      </div>
      <div className="text-xs font-semibold uppercase tracking-widest text-white/70 mt-0.5">
        Score
      </div>
      <div className="text-xs text-white/60">
        {label}
      </div>
    </div>
  )
}
