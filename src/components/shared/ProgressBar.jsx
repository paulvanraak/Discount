export default function ProgressBar({ current, total }) {
  const pct = ((current + 1) / total) * 100
  return (
    <div className="w-full h-1 bg-ink-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-primary-500 transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
