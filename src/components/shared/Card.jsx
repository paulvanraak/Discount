export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white border border-ink-100 rounded-md p-6 ${className}`}>
      {children}
    </div>
  )
}
