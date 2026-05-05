import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo from '../shared/Logo'
import { CATEGORIES } from '../../data/categories'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [compareOpen, setCompareOpen] = useState(false)
  const location = useLocation()

  // Verberg header op check-flow pagina's — die hebben eigen top bar
  if (location.pathname.startsWith('/check')) return null

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-ink-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex-shrink-0">
          <Logo className="text-lg" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink
            to="/check"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive ? 'text-primary-500 bg-primary-50' : 'text-ink-700 hover:bg-ink-100'
              }`
            }
          >
            BespaarCheck
          </NavLink>

          {/* Vergelijken dropdown */}
          <div className="relative">
            <button
              onClick={() => setCompareOpen((v) => !v)}
              className="px-3 py-2 rounded-md text-sm font-medium text-ink-500 hover:text-ink-700 hover:bg-ink-100 transition-colors flex items-center gap-1"
            >
              Vergelijken
              <span className="material-symbols-rounded text-base">expand_more</span>
            </button>
            {compareOpen && (
              <>
                <div className="fixed inset-0" onClick={() => setCompareOpen(false)} />
                <div className="absolute right-0 top-full mt-1 bg-white border border-ink-100 rounded-lg shadow-lg py-1 min-w-44 z-50">
                  {CATEGORIES.map(cat => (
                    <NavLink
                      key={cat.slug}
                      to={`/vergelijk/${cat.slug}`}
                      onClick={() => setCompareOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                          isActive ? 'text-primary-500 bg-primary-50' : 'text-ink-700 hover:bg-ink-50'
                        } ${!cat.available ? 'opacity-40 pointer-events-none' : ''}`
                      }
                    >
                      {cat.name}
                      {!cat.available && (
                        <span className="text-xs text-ink-300 ml-auto">Binnenkort</span>
                      )}
                    </NavLink>
                  ))}
                </div>
              </>
            )}
          </div>
        </nav>

        {/* Desktop CTA */}
        <Link
          to="/check"
          className="hidden md:inline-flex items-center gap-1.5 bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors"
        >
          Start check
          <span className="material-symbols-rounded text-base">arrow_forward</span>
        </Link>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden p-2 rounded-md text-ink-500 hover:bg-ink-100 transition-colors"
        >
          <span className="material-symbols-rounded">{menuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile slide-over */}
      {menuOpen && (
        <div className="md:hidden border-t border-ink-100 bg-white px-4 py-4 space-y-1">
          <Link
            to="/check"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-3 rounded-md bg-accent-500 text-white font-semibold text-sm"
          >
            <span className="material-symbols-rounded text-base">bolt</span>
            Start de BespaarCheck
          </Link>

          <div className="pt-2">
            <p className="text-xs text-ink-300 uppercase tracking-widest px-3 mb-1">Vergelijken</p>
            {CATEGORIES.map(cat => (
              <NavLink
                key={cat.slug}
                to={`/vergelijk/${cat.slug}`}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-colors ${
                    isActive ? 'text-primary-500 bg-primary-50' : 'text-ink-700 hover:bg-ink-50'
                  } ${!cat.available ? 'opacity-40 pointer-events-none' : ''}`
                }
              >
                {cat.name}
                {!cat.available && <span className="text-xs text-ink-300">Binnenkort</span>}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
