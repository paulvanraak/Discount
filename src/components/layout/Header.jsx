import { Link, NavLink } from 'react-router-dom'
import Logo from '../shared/Logo'
import { CATEGORIES } from '../../data/categories'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-ink-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex-shrink-0">
          <Logo className="text-lg" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {CATEGORIES.filter(c => c.available).map(cat => (
            <NavLink
              key={cat.slug}
              to={`/vergelijk/${cat.slug}`}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary-500 bg-primary-50'
                    : 'text-ink-500 hover:text-ink-700 hover:bg-ink-100'
                }`
              }
            >
              {cat.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
