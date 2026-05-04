import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import ProviderPage from './pages/ProviderPage'
import NotFoundPage from './pages/NotFoundPage'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import { CompareProvider } from './context/CompareContext'

export default function App() {
  return (
    <BrowserRouter basename="/Discount/">
      <CompareProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/vergelijk/:category" element={<CategoryPage />} />
              <Route path="/aanbieder/:category/:provider" element={<ProviderPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CompareProvider>
    </BrowserRouter>
  )
}
