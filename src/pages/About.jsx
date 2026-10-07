import { useLang } from '../i18n/LanguageContext'
import event from '../data/event.json'
import Icon from '../components/Icon'

const ICONS = ['dumpling', 'lantern', 'envelope', 'goat', 'blossom', 'dragon']

export default function About() {
  const { t } = useLang()
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="h-section">{t('about.title')}</h1>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="card" aria-labelledby="mission">
          <h2 id="mission" className="font-display text-2xl font-bold text-red-dark">{t('about.missionTitle')}</h2>
          <p className="mt-2 leading-relaxed text-ink/85">{t('about.mission')}</p>
        </section>
        <section className="card" aria-labelledby="org">
          <h2 id="org" className="font-display text-2xl font-bold text-red-dark">{t('about.orgTitle')}</h2>
          <p className="mt-2 leading-relaxed text-ink/85">{t('about.org')}</p>
        </section>
      </div>

      <section id="traditions" className="mt-12 scroll-mt-24" aria-labelledby="traditions-h">
        <h2 id="traditions-h" className="font-display text-2xl font-bold text-red-dark">{t('about.cultureTitle')}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t('about.culture').map((c, i) => (
            <article key={c.title} className="card border-t-4 border-gold">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red/10 text-red"><Icon name={ICONS[i]} className="h-7 w-7" /></div>
              <h3 className="mt-2 font-display text-xl font-bold">{c.title}</h3>
              <p className="mt-1 text-ink/80">{c.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="mt-12 card bg-red-dark text-white text-center scroll-mt-24" aria-labelledby="contact-h">
        <h2 id="contact-h" className="font-display text-2xl font-bold text-gold-light">{t('about.contactTitle')}</h2>
        <p className="mt-2">{t('about.contactText')}</p>
        <a href={event.links.contactEmail} className="btn-gold mt-4">{t('about.contactButton')}</a>
      </section>
    </div>
  )
}
