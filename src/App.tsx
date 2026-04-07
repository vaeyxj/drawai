import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppStore } from './store/useAppStore'
import Header from './components/layout/Header'
import MobileNav from './components/layout/MobileNav'
import GeneratePage from './pages/GeneratePage'
import GalleryPage from './pages/GalleryPage'
import FavoritesPage from './pages/FavoritesPage'
import AssetsPage from './pages/AssetsPage'
import Toast from './components/ui/Toast'

function App() {
  const loadFromStorage = useAppStore((s) => s.loadFromStorage)

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        <Routes>
          <Route path="/" element={<GeneratePage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <MobileNav />
      <Toast />
    </div>
  )
}

export default App
