import { formatEuro } from '../../services/savings'

export default function PriceCard({ provider }) {
  const isVPN = !!provider.price
  return (
    <div className="bg-white border border-ink-100 rounded-md p-6">
      <h3 className="text-sm font-medium uppercase tracking-widest text-ink-300 mb-4">Prijs</h3>
      {isVPN ? (
        <div className="space-y-3">
          {[
            { label: 'Per maand', value: provider.price.monthly, note: null },
            { label: 'Jaarabonnement', value: provider.price.yearly, note: 'per maand' },
            { label: '2-jaarsabonnement', value: provider.price.biennial, note: 'per maand — beste deal', highlight: true },
          ].map(({ label, value, note, highlight }) => (
            <div key={label} className={`flex justify-between items-center p-3 rounded-md ${highlight ? 'bg-primary-50' : ''}`}>
              <span className="text-sm text-ink-500">{label}</span>
              <span className={`font-semibold ${highlight ? 'text-primary-500' : 'text-ink-900'}`}>
                {formatEuro(value)}/mnd
                {note && <span className="text-xs text-ink-300 ml-1">{note}</span>}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <span className="text-sm text-ink-500">Maandelijks</span>
          <span className="text-2xl font-semibold text-ink-900">
            {provider.monthlyFee === 0 ? 'Gratis' : `${formatEuro(provider.monthlyFee)}/mnd`}
          </span>
        </div>
      )}
    </div>
  )
}
