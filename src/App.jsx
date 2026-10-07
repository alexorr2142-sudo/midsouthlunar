import { BrowserRouter, HashRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { LanguageProvider, useLang } from './i18n/LanguageContext'
import Layout from './components/Layout'
import Home from './pages/Home'

// Route-level code splitting: Home ships in the main bundle, every other
// page loads on demand. See docs/ARCHITECTURE.md, finding 1.
const Schedule = lazy(() => import('./pages/Schedule'))
const Vendors = lazy(() => import('./pages/Vendors'))
const Visit = lazy(() => import('./pages/Visit'))
const GetInvolved = lazy(() => import('./pages/GetInvolved'))
const About = lazy(() => import('./pages/About'))
const IconSheet = import.meta.env.DEV ? lazy(() => import('./dev/IconSheet')) : null

// VITE_HASH_ROUTER=1 builds a copy that works from any folder with no server
// redirect (used for the preview published from Claude). GitHub Pages uses
// clean URLs via BrowserRouter plus public/404.html.
const Router = import.meta.env.VITE_HASH_ROUTER
  ? HashRouter
  : ({ children }) => <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>{children}</BrowserRouter>

function Loading() {
  return <div className="mx-auto max-w-6xl px-4 py-20 text-center text-ink/75" role="status">…</div>
}

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
      <Router>
        <ScrollManager />
        <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="visit" element={<Visit />} />
            <Route path="get-involved" element={<GetInvolved />} />
            <Route path="about" element={<About />} />
            {IconSheet && <Route path="dev/icons" element={<IconSheet />} />}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        </Suspense>
      </Router>
    </LanguageProvider>
  )
}
