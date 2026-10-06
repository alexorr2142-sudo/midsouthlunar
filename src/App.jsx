import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { LanguageProvider, useLang } from './i18n/LanguageContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Schedule from './pages/Schedule'
import Vendors from './pages/Vendors'
import Visit from './pages/Visit'
import GetInvolved from './pages/GetInvolved'
import About from './pages/About'

function NotFound() {
  const { t } = useLang()
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 text-center">
      <h1 className="h-section">{t('notFound.title')}</h1>
      <p className="mt-2">{t('notFound.text')}</p>
      <Link to="/" className="btn-primary mt-6">{t('notFound.home')}</Link>
    </div>
  )
}

/** Scroll to top on route change, or to the #hash target when present. */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) { el.scrollIntoView({ block: 'start' }); return }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <ScrollManager />
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="visit" element={<Visit />} />
            <Route path="get-involved" element={<GetInvolved />} />
            <Route path="about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}
