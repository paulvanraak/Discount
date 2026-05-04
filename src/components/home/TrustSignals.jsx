const BRANDS = ['NordVPN', 'Surfshark', 'Bunq', 'Revolut', 'N26', 'Knab']

export default function TrustSignals() {
  return (
    <section className="py-12 border-t border-ink-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-ink-300 mb-6">
          Aanbieders die we vergelijken
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          {BRANDS.map(brand => (
            <span key={brand} className="text-sm font-semibold text-ink-300">
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
