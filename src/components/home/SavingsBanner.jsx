import Icon from '../shared/Icon'

export default function SavingsBanner() {
  return (
    <div className="bg-successBg border-y border-success/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-center gap-3">
        <Icon name="check_circle" className="text-success text-[20px]" />
        <p className="text-sm font-medium text-ink-700">
          BespaarCheck-gebruikers besparen gemiddeld <span className="text-success font-semibold whitespace-nowrap">€847 per jaar</span>
        </p>
      </div>
    </div>
  )
}
