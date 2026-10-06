import { Link, useSearchParams } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext'
import Countdown from '../components/Countdown'
import AddToCalendar from '../components/AddToCalendar'
import { festivalCalendarEvent } from '../lib/calendar'
import event from '../data/event.json'

const ICONS = ['🐉', '🥟', '🏮', '🧧']

export default function Home() {
  const { t, lang, pick } = useLang()
  const [params] = useSearchParams()
  // ?now=2027-02-05T15:00:00-06:00 lets reviewers preview the "happening now" state.
  const nowParam = params.get('now')
  const now = nowParam && !Number.isNaN(Date.parse(nowParam)) ? new Date(nowParam) : undefined
  const highlights = t('home.highlights')

  return (
    <>
      <section className="relative overflow-hidden bg-red text-white">
        <div className="absolute inset-0 opacity-15" aria-hidden="true"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #F3D27A 0 2px, transparent 3px), radial-gradient(circle at 70% 60%, #F3D27A 0 2px, transparent 3px), radial-gradient(circle at 45% 85%, #F3D27A 0 1.5px, transparent 2.5px)', backgroundSize: '160px 160px, 220px 220px, 120px 120px' }} />
        <div className="absolute right-4 top-4 hidden md:flex gap-6" aria-hidden="true">
          <span className="lantern scale-150 mt-4" /><span className="lantern scale-125" /><span className="lantern scale-150 mt-6" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-14 md:py-20 grid gap-10 lg:grid-cols-5 items-center">
          <div className="lg:col-span-3">
            <p className="text-gold-light font-semibold tracking-widest uppercase text-sm">{pick(event.zodiac)} · {event.year}</p>
            <h1 className="mt-2 font-display text-4xl md:text-6xl font-bold leading-tight">{pick(event.name)}</h1>
            <p className="mt-3 text-xl md:text-2xl text-gold-light font-display">{t('site.tagline')}</p>
            <dl className="mt-6 grid gap-2 text-lg">
              <div className="flex gap-3"><dt aria-hidden="true">📆</dt><dd data-testid="hero-dates">{t('home.dates')} · {t('home.hours')}</dd></div>
              <div className="flex gap-3"><dt aria-hidden="true">📍</dt><dd data-testid="hero-venue">{t('home.venue')}</dd></div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={event.links.tickets} target="_blank" rel="noreferrer" className="btn-gold text-lg">{t('home.tickets')}</a>
              <Link to="/schedule" className="btn-outline !border-white !text-white hover:!bg-white hover:!text-red text-lg">{t('home.schedule')}</Link>
              <AddToCalendar calEvent={festivalCalendarEvent(event, lang)} label={t('home.calendar')} className="btn-outline !border-gold-light !text-gold-light hover:!bg-gold-light hover:!text-ink text-lg" />
            </div>
          </div>
          <div className="lg:col-span-2"><Countdown now={now} /></div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="h-section">{t('home.highlightsTitle')}</h2>
        <p className="mt-2 text-sm text-ink/60">{t('home.preliminary')}</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((h, i) => (
            <Link key={h.title} to={i === 2 ? '/vendors' : '/schedule'} className="card hover:ring-gold hover:-translate-y-0.5 transition">
              <div className="text-4xl" aria-hidden="true">{ICONS[i]}</div>
              <h3 className="mt-3 font-display text-xl font-bold text-red-dark">{h.title}</h3>
              <p className="mt-1 text-ink/80">{h.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gold-light/40">
        <div className="mx-auto max-w-6xl px-4 py-14 grid gap-8 md:grid-cols-2 items-center">
          <div>
            <h2 className="h-section">{t('home.cultureTitle')}</h2>
            <p className="mt-4 text-lg leading-relaxed">{t('home.cultureText')}</p>
            <Link to="/about#traditions" className="btn-primary mt-6">{t('home.cultureLink')}</Link>
          </div>
          <div className="flex justify-center">
            <div className="relative w-56 h-56 md:w-72 md:h-72 rounded-full bg-red ring-8 ring-gold flex items-center justify-center shadow-xl" aria-hidden="true">
              <span className="font-display text-[7rem] md:text-[9rem] text-gold-light leading-none">羊</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 text-center">
        <h2 className="h-section">{t('home.sponsorsTitle')}</h2>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => <div key={n} className="h-20 rounded-xl border-2 border-dashed border-gold/60 flex items-center justify-center text-ink/40 text-sm">Sponsor {n}</div>)}
        </div>
        <p className="mt-6 text-ink/70">{t('home.sponsorsText')} <Link to="/get-involved#sponsor" className="font-semibold text-red underline">{t('home.sponsorsLink')}</Link></p>
      </section>
    </>
  )
}
