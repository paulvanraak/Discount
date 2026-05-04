import Icon from '../shared/Icon'

export default function BenefitList({ features }) {
  return (
    <ul className="space-y-3">
      {features.map((feature, i) => (
        <li key={i} className="flex items-start gap-3">
          <Icon name="check_circle" className="text-success text-[20px] flex-shrink-0 mt-0.5" />
          <span className="text-ink-700">{feature}</span>
        </li>
      ))}
    </ul>
  )
}
