export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center gap-2 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 px-5 py-3 text-sm'
  const variants = {
    primary:   'bg-accent-500 hover:bg-accent-600 text-white focus:ring-accent-500',
    secondary: 'border border-ink-100 hover:bg-ink-100 text-ink-700 focus:ring-primary-500',
    text:      'text-primary-500 hover:text-primary-600 px-0 py-0 focus:ring-primary-500',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
