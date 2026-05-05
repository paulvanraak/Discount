import CheckHero from '../components/home/CheckHero'
import ReturnUserBanner from '../components/home/ReturnUserBanner'
import CategoryGrid from '../components/home/CategoryGrid'
import SavingsBanner from '../components/home/SavingsBanner'
import TrustSignals from '../components/home/TrustSignals'
import { CATEGORIES } from '../data/categories'

export default function HomePage() {
  return (
    <>
      <CheckHero />
      <ReturnUserBanner />
      <div id="vergelijkers">
        <SavingsBanner />
        <CategoryGrid categories={CATEGORIES} />
      </div>
      <TrustSignals />
    </>
  )
}
