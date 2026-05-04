import Logo from '../shared/Logo'
import AffiliateDisclosure from '../shared/AffiliateDisclosure'

export default function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <Logo className="text-base" />
            <p className="text-sm text-ink-500 mt-2 max-w-xs">
              Vergelijk en bespaar op energie, bank, telecom en meer.
            </p>
          </div>
          <div className="flex gap-6 text-sm text-ink-500">
            <a href="/privacy" className="hover:text-ink-700">Privacy</a>
            <a href="/over-ons" className="hover:text-ink-700">Over ons</a>
            <a href="mailto:info@donniediscount.com" className="hover:text-ink-700">Contact</a>
          </div>
        </div>
        <AffiliateDisclosure />
        <p className="text-xs text-ink-300 text-center mt-2">© 2025 Bespaar met Donnie</p>
      </div>
    </footer>
  )
}
