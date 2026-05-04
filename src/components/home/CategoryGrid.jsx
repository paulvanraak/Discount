import CategoryCard from './CategoryCard'

export default function CategoryGrid({ categories }) {
  return (
    <section id="categories" className="py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-medium text-ink-900 mb-2">Waar wil je op besparen?</h2>
        <p className="text-ink-500 mb-8">Kies een categorie en vergelijk direct.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map(cat => (
            <CategoryCard key={cat.slug} category={cat} />
          ))}
        </div>
      </div>
    </section>
  )
}
