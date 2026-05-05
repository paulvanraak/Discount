export default function ScoreBadge({ score }) {
  // Nooit rood — schaal van oranje naar groen
  const getStyle = (s) => {
    if (s >= 8.5) return { color: '#1D9E75', label: 'Uitstekend' }
    if (s >= 7)   return { color: '#3EA882', label: 'Goed' }
    if (s >= 5.5) return { color: '#EF9F27', label: 'Kan beter' }
    return          { color: '#E07000', label: 'Ruimte voor verbetering' }
  }

  const { color, label } = getStyle(score)

  return (
    <div className="inline-flex flex-col items-center gap-0.5">
      <div
        className="text-5xl font-bold leading-none tabular-nums"
        style={{ color }}
      >
        {score.toFixed(1)}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-white/60 mt-1">
        Score
      </div>
      <div className="text-xs text-white/80 font-medium">
        {label}
      </div>
    </div>
  )
}
