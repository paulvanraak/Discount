export default function Logo({ className = '' }) {
  return (
    <span className={`font-semibold text-ink-900 ${className}`}>
      Bespaar<span className="text-primary-500">Check</span>
    </span>
  )
}
