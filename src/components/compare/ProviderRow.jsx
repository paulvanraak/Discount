import { Link } from 'react-router-dom'
import StarRating from '../shared/StarRating'
import Icon from '../shared/Icon'
import { formatEuro } from '../../services/savings'

export default function ProviderRow({ provider, category }) {
  const isVPN = !!provider.price
  const price = isVPN ? provider.price.biennial : provider.monthlyFee

  return (
    <Link
      to={`/aanbieder/${category.slug}/${provider.slug}`}
      className={`block bg-white border rounded-md p-5 hover:border-primary-200 hover:shadow-sm transition-all ${
        provider.bestChoice ? 'border-success' : 'border-ink-100'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div
          className="w-12 h-12 rounded-md flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ backgroundColor: provider.logoColor }}
        >
          {provider.logo}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-ink-900">{provider.name}</h3>
            {provider.bestChoice && (
              <span className="text-xs font-medium bg-successBg text-success px-2 py-0.5 rounded-sm">
                Beste keuze
              </span>
            )}
          </div>
          <StarRating rating={provider.rating} reviewCount={provider.reviewCount} />

          {/* Features preview */}
          <ul className="mt-3 space-y-1">
            {provider.features.slice(0, 3).map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-500">
                <Icon name="check" className="text-success text-[16px] mt-0.5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Price */}
        <div className="text-right flex-shrink-0">
          {isVPN ? (
            <>
              <p className="text-xl font-semibold text-ink-900">
                {formatEuro(price)}<span className="text-sm text-ink-500">/mnd</span>
              </p>
              <p className="text-xs text-ink-300 mt-0.5">bij 2-jaar abonnement</p>
            </>
          ) : (
            <>
              <p className="text-xl font-semibold text-ink-900">
                {price === 0 ? 'Gratis' : `${formatEuro(price)}/mnd`}
              </p>
              {provider.bonus > 0 && (
                <p className="text-xs text-success mt-0.5">+€{provider.bonus} bonus</p>
              )}
            </>
          )}
          <div className="mt-2 flex items-center gap-1 text-primary-500 text-sm">
            <span>Bekijk aanbieder</span>
            <Icon name="arrow_forward" className="text-[14px]" />
          </div>
        </div>
      </div>
    </Link>
  )
}
