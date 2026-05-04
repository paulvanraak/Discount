export default function StarRating({ rating, reviewCount }) {
  const stars = Math.round(rating * 2) / 2
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1,2,3,4,5].map(i => (
          <span key={i} className={`text-base ${i <= stars ? 'text-warning' : 'text-ink-100'}`}>★</span>
        ))}
      </div>
      <span className="text-sm text-ink-500">{rating.toFixed(1)}</span>
      {reviewCount && (
        <span className="text-sm text-ink-300">({reviewCount.toLocaleString('nl-NL')} reviews)</span>
      )}
    </div>
  )
}
