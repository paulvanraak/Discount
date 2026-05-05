import Button from '../shared/Button'
import Icon from '../shared/Icon'

export default function Hero() {
  const scrollToCategories = () => {
    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="bg-primary-900 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-2xl">
          <p className="text-primary-200 text-sm font-medium uppercase tracking-widest mb-4">
            BespaarCheck
          </p>
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight tracking-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
            Betaal je te veel voor energie, internet en je bank?
          </h1>
          <p className="text-primary-100 text-lg leading-relaxed mb-8">
            Vergelijk en stap over in 3 minuten. Bespaar honderden euro's per jaar.
          </p>
          <Button
            variant="primary"
            onClick={scrollToCategories}
            className="text-base px-6 py-4"
          >
            Start vergelijken
            <Icon name="arrow_forward" className="text-[18px]" />
          </Button>
        </div>
      </div>
    </section>
  )
}
