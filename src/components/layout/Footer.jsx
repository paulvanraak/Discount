import { NavLink, useLocation } from 'react-router-dom'
import Logo from '../shared/Logo'
import AffiliateDisclosure from '../shared/AffiliateDisclosure'

export default function Footer() {
  const location = useLocation()
  const isCheckFlow = location.pathname.startsWith('/check')

  return (
    <>
      {/* Mobile bottom nav — alleen buiten check-flow */}
      {!isCheckFlow && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-ink-100 flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors ${
                isActive ? 'text-primary-500' : 'text-ink-500'
              }`
            }
          >
            <span className="material-symbols-rounded text-xl">home</span>
            Home
          </NavLink>
          <NavLink
            to="/check"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors ${
                isActive ? 'text-primary-500' : 'text-ink-500'
              }`
            }
          >
            <span className="material-symbols-rounded text-xl">bolt</span>
            Check
          </NavLink>
          <NavLink
            to="/vergelijk/bankrekening"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors ${
                isActive ? 'text-primary-500' : 'text-ink-500'
              }`
            }
          >
            <span className="material-symbols-rounded text-xl">compare_arrows</span>
            Vergelijk
          </NavLink>
        </nav>
      )}

      {/* Footer — verberg op check-flow */}
      {!isCheckFlow && (
        <footer className="border-t border-ink-100 bg-white mt-16 pb-20 md:pb-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div>
                <Logo className="text-base" />
                <p className="text-sm text-ink-500 mt-2 max-w-xs">
                  Persoonlijke bespaarcheck + vergelijker voor energie, bank, telecom en meer.
                </p>
              </div>
              <div className="flex gap-6 text-sm text-ink-500">
                <a href="/privacy" className="hover:text-ink-700">Privacy</a>
                <a href="/over" className="hover:text-ink-700">Over ons</a>
                <a href="mailto:info@donniediscount.com" className="hover:text-ink-700">Contact</a>
              </div>
            </div>
            <AffiliateDisclosure />
            <p className="text-xs text-ink-300 text-center mt-2">© 2026 Bespaar met Donnie</p>
          </div>
        </footer>
      )}
    </>
  )
}
