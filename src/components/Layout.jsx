import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext'
import event from '../data/event.json'
import Icon from './Icon'
import { patternDataUri } from './Goat'
import ChatWidget from './ChatWidget'

// Two pattern tints: red-on-cream for the page body, gold-on-red for dark bands.
const PATTERN_VARS = {
  '--pattern-light': patternDataUri({ stroke: '#B5121B', fill: '#D4A017', alpha: 0.06 }),
  '--pattern-dark': patternDataUri({ stroke: '#F3D27A', fill: '#F3D27A', alpha: 0.14 }),
}

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
    <NavLink to="/" className="flex min-w-0 flex-1 items-center gap-3 focus:outline-none focus-visible:ring-4 focus-visible:ring-gold/60 rounded-lg" aria-label={t('site.name')}>
      <span className="lantern" aria-hidden="true" />
      <span className="min-w-0 leading-tight">
        <span className="block truncate font-display font-bold text-base sm:text-lg md:text-xl text-white">{t('site.name')}</span>
        <span className="hidden sm:block text-xs text-gold-light tracking-widest uppercase">{lang === 'en' ? '中南农历新年' : 'Mid-South Lunar New Year'} · {event.year}</span>
      </span>
    </NavLink>
  )
}

/**
 * Language switcher: a native <select> styled as a gold pill. A select works
 * with keyboard, screen readers, and phones without any custom menu code,
 * and supports all seven site languages.
 */
export function LangToggle({ className = '' }) {
  const { t, lang, setLang, langs } = useLang()
  return (
    <label className={`relative inline-flex items-center ${className}`}>
      <span className="sr-only">{t('lang.label')}</span>
      <span className="pointer-events-none absolute left-3 text-ink" aria-hidden="true"><Icon name="globe" className="h-4 w-4" /></span>
      <select value={lang} onChange={(e) => setLang(e.target.value)} data-testid="lang-select" data-lang={lang}
        className="max-w-[8.5rem] sm:max-w-none truncate appearance-none rounded-full bg-gold pl-9 pr-8 py-1.5 text-sm font-semibold text-ink hover:bg-gold-light focus:outline-none focus-visible:ring-4 focus-visible:ring-gold/60 cursor-pointer whitespace-nowrap">
        {langs.map((l) => <option key={l.code} value={l.code} lang={l.htmlLang}>{l.label}</option>)}
      </select>
      <span className="pointer-events-none absolute right-3 text-[10px]" aria-hidden="true">▾</span>
    </label>
  )
}

export default function Layout() {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const linkClass = ({ isActive }) =>
    `block rounded-full px-4 py-2 font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-gold/60 ${isActive ? 'bg-gold text-ink' : 'text-white hover:bg-white/15'}`

  return (
    <div className="min-h-screen flex flex-col bg-pattern-light" style={PATTERN_VARS}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded focus:bg-gold focus:px-3 focus:py-2">{t('nav.skip')}</a>
      <header className="sticky top-0 z-40 bg-red-dark bg-pattern-dark text-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Wordmark />
          <nav aria-label="Main" className="hidden lg:flex items-center gap-1">
            {NAV.map(([to, key]) => <NavLink key={to} to={to} end={to === '/'} className={linkClass}>{t(key)}</NavLink>)}
            <LangToggle className="ml-2" />
          </nav>
          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            <LangToggle />
            <button type="button" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? t('nav.close') : t('nav.menu')}
              onClick={() => setOpen((o) => !o)} className="rounded-lg p-2 hover:bg-white/15 focus:outline-none focus-visible:ring-4 focus-visible:ring-gold/60">
              <Icon name={open ? 'close' : 'menu'} className="h-7 w-7" />
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

      <footer className="mt-16 bg-ink bg-pattern-dark text-cream">
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
      <ChatWidget />
    </div>
  )
}
