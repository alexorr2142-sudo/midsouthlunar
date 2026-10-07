import { useLang } from '../i18n/LanguageContext'
import event from '../data/event.json'
import Icon from '../components/Icon'

export default function Visit() {
  const { t, pick } = useLang()
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(event.venue.mapQuery)}&output=embed`
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue.mapQuery)}`

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="h-section">{t('visit.title')}</h1>

      <section className="mt-6 card bg-red text-white" aria-labelledby="tickets">
        <h2 id="tickets" className="font-display text-2xl font-bold text-gold-light">{t('visit.ticketsTitle')}</h2>
        <p className="mt-2">{t('visit.ticketsText')}</p>
        <a href={event.links.tickets} target="_blank" rel="noreferrer" className="btn-gold mt-4" data-testid="tickets-link">{t('visit.ticketsButton')}</a>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2" aria-labelledby="map">
        <div>
          <h2 id="map" className="font-display text-2xl font-bold text-red-dark">{t('visit.mapTitle')}</h2>
          <p className="mt-2 text-lg font-semibold">{pick(event.venue.name)}</p>
          <p>{t('visit.address')}</p>
          <a href={mapLink} target="_blank" rel="noreferrer" className="btn-primary mt-4">{t('visit.directions')}</a>
          <h3 className="mt-8 font-display text-xl font-bold text-red-dark">{t('visit.parkingTitle')}</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">{t('visit.parking').map((p) => <li key={p}>{p}</li>)}</ul>
          <h3 className="mt-6 font-display text-xl font-bold text-red-dark">{t('visit.accessTitle')}</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">{t('visit.access').map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
        <div className="card p-0 overflow-hidden min-h-80">
          {import.meta.env.VITE_HASH_ROUTER ? (
            // The claude.ai preview host blocks outside iframes, so the preview
            // build shows a labeled stand-in. The live site embeds the real map.
            <div className="flex h-full min-h-80 flex-col items-center justify-center gap-2 bg-gold-light/40 p-6 text-center text-ink/75">
              <Icon name="map" className="h-14 w-14 text-red" />
              <p className="font-semibold">{pick(event.venue.name)}</p>
              <p className="text-sm">Google Map loads here on the live site. Use the button to open directions.</p>
            </div>
          ) : (
            <iframe title={pick(event.venue.name)} src={mapSrc} className="h-full w-full min-h-80" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
          )}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="faq">
        <h2 id="faq" className="font-display text-2xl font-bold text-red-dark">{t('visit.faqTitle')}</h2>
        <div className="mt-4 grid gap-3">
          {t('visit.faq').map((f) => (
            <details key={f.q} className="card group">
              <summary className="cursor-pointer font-semibold text-lg list-none flex justify-between items-center focus:outline-none focus-visible:ring-4 focus-visible:ring-gold/60 rounded">
                {f.q}<span className="text-gold transition group-open:rotate-45 text-2xl" aria-hidden="true">+</span>
              </summary>
              <p className="mt-2 text-ink/80">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
