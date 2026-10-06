import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext'
import event from '../data/event.json'

const NAV = [
  ['/', 'nav.home'],
  ['/schedule', 'nav.schedule'],
  ['/vendors', 'nav.vendors'],
  ['/visit', 'nav.visit'],
  ['/get-involved', 'nav.involved'],
  ['/about', 'nav.about'],
]

function Wordmark() {
  const { t, lang } = useLang()
  return (
    <NavLink to="/" className="flex items-center gap-3 focus:outline-none focus-visible:ring-4 focus-visible:ring-gold/60 rounded-lg" aria-label={t('site.name')}>
      <span className="lantern" aria-hidden="true" />
      <span className="leading-tight">
        <span className="block font-display font-bold text-base sm:text-lg md:text-xl text-white whitespace-nowrap">{t('site.name')}</span>
        <span className="hidden sm:block text-xs text-gold-light tracking-widest uppercase">{lang === 'zh' ? 'Mid-South Lunar New Year' : '中南农历新年'} · {event.year}</span>
      </span>
    </NavLink>
  )
}

export function LangToggle({ className = '' }) {
  const { t, toggle, lang } = useLang()
  return (
    <button type="button" onClick={toggle} aria-label={t('lang.label')} data-testid="lang-toggle" data-lang={lang}
      className={`btn-gold !py-1.5 !px-4 text-sm whitespace-nowrap ${className}`}>
      <span aria-hidden="true">🌐</span> {t('lang.switch')}
    </button>
  )
}

export default function Layout() {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const linkClass = ({ isActive }) =>
    `block rounded-full px-4 py-2 font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-gold/60 ${isActive ? 'bg-gold text-ink' : 'text-white hover:bg-white/15'}`

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded focus:bg-gold focus:px-3 focus:py-2">{t('nav.skip')}</a>
      <header className="sticky top-0 z-40 bg-red-dark text-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Wordmark />
          <nav aria-label="Main" className="hidden lg:flex items-center gap-1">
            {NAV.map(([to, key]) => <NavLink key={to} to={to} end={to === '/'} className={linkClass}>{t(key)}</NavLink>)}
            <LangToggle className="ml-2" />
          </nav>
          <div className="flex items-center gap-2 lg:hidden">
            <LangToggle />
            <button type="button" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? t('nav.close') : t('nav.menu')}
              onClick={() => setOpen((o) => !o)} className="rounded-lg p-2 hover:bg-white/15 focus:outline-none focus-visible:ring-4 focus-visible:ring-gold/60">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>
        {open && (
          <nav id="mobile-nav" aria-label="Main" className="lg:hidden border-t border-white/15 px-4 pb-4 pt-2 flex flex-col gap-1 bg-red-dark">
            {NAV.map(([to, key]) => <NavLink key={to} to={to} end={to === '/'} className={linkClass} onClick={() => setOpen(false)}>{t(key)}</NavLink>)}
          </nav>
        )}
        <div className="papercut" aria-hidden="true" />
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-16 bg-ink text-cream">
        <div className="papercut rotate-180" aria-hidden="true" />
        <div className="mx-auto max-w-6xl px-4 py-10 grid gap-6 md:grid-cols-3 text-sm">
          <div>
            <p className="font-display text-lg text-gold">{t('site.name')} {event.year}</p>
            <p className="mt-1 text-cream/80">{t('home.dates')} · {t('home.hours')}</p>
            <p className="text-cream/80">{event.venue.address}</p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-1">
            {NAV.map(([to, key]) => <NavLink key={to} to={to} end={to === '/'} className="hover:text-gold">{t(key)}</NavLink>)}
          </nav>
          <div className="text-cream/70">
            <p>© {event.year} {t('footer.rights')}</p>
            <p className="mt-2">{t('footer.note')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
