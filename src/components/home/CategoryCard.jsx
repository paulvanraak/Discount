import { Link } from 'react-router-dom'
import Icon from '../shared/Icon'

export default function CategoryCard({ category }) {
  const { slug, name, tagline, icon, available } = category

  if (!available) {
    return (
      <div className="bg-white border border-ink-100 rounded-md p-5 opacity-60 cursor-not-allowed">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-md bg-ink-100 flex items-center justify-center">
            <Icon name={icon} className="text-ink-300 text-[20px]" />
          </div>
          <span className="text-xs font-medium bg-ink-100 text-ink-300 px-2 py-1 rounded-sm">
            Binnenkort
          </span>
        </div>
        <h3 className="font-medium text-ink-700 mb-1">{name}</h3>
        <p className="text-sm text-ink-300">{tagline}</p>
      </div>
    )
  }

  return (
    <Link
      to={`/vergelijk/${slug}`}
      className="bg-white border border-ink-100 rounded-md p-5 hover:border-primary-200 hover:shadow-sm transition-all group block"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-md bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
          <Icon name={icon} className="text-primary-500 text-[20px]" />
        </div>
        <Icon name="arrow_forward" className="text-ink-300 text-[18px] group-hover:text-primary-500 transition-colors" />
      </div>
      <h3 className="font-medium text-ink-900 mb-1">{name}</h3>
      <p className="text-sm text-ink-500">{tagline}</p>
    </Link>
  )
}
