import Hero from '../components/home/Hero'
import CategoryGrid from '../components/home/CategoryGrid'
import SavingsBanner from '../components/home/SavingsBanner'
import TrustSignals from '../components/home/TrustSignals'
import { CATEGORIES } from '../data/categories'

export default function HomePage() {
  return (
    <>
      <Hero />
      <SavingsBanner />
      <CategoryGrid categories={CATEGORIES} />
      <TrustSignals />
    </>
  )
}
