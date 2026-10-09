import { useLang } from '../i18n/LanguageContext'
import event from '../data/event.json'
import Icon from '../components/Icon'
import { Link } from 'react-router-dom'

export default function GetInvolved() {
  const { t } = useLang()
  const cards = [
    { id: 'vendor', icon: 'shop', title: t('involved.vendorTitle'), text: t('involved.vendorText'), button: t('involved.vendorButton'), href: '/apply/vendor' },
    { id: 'volunteer', icon: 'hand', title: t('involved.volunteerTitle'), text: t('involved.volunteerText'), button: t('involved.volunteerButton'), href: '/apply/volunteer' },
    { id: 'sponsor', icon: 'handshake', title: t('involved.sponsorTitle'), text: t('involved.sponsorText'), button: t('involved.sponsorButton'), href: '/apply/sponsor' },
  ]
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="h-section">{t('involved.title')}</h1>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {cards.map((c) => (
          <section key={c.id} id={c.id} className="card flex flex-col scroll-mt-24" aria-labelledby={`h-${c.id}`}>
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red text-white ring-4 ring-gold/50"><Icon name={c.icon} className="h-9 w-9" /></div>
            <h2 id={`h-${c.id}`} className="mt-3 font-display text-2xl font-bold text-red-dark">{c.title}</h2>
            <p className="mt-2 flex-1 text-ink/80">{c.text}</p>
            <Link to={c.href} className="btn-primary mt-5 self-start" data-testid={`link-${c.id}`}>{c.button}</Link>
          </section>
        ))}
      </div>
    </div>
  )
}
