export default function Icon({ name, className = '' }) {
  return (
    <span className={`material-symbols-rounded ${className}`}>
      {name}
    </span>
  )
}
