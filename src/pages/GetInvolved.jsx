import { useLang } from '../i18n/LanguageContext'
import event from '../data/event.json'

export default function GetInvolved() {
  const { t } = useLang()
  const cards = [
    { id: 'vendor', icon: '🏮', title: t('involved.vendorTitle'), text: t('involved.vendorText'), button: t('involved.vendorButton'), href: event.links.vendorForm },
    { id: 'volunteer', icon: '🙋', title: t('involved.volunteerTitle'), text: t('involved.volunteerText'), button: t('involved.volunteerButton'), href: event.links.volunteerForm },
    { id: 'sponsor', icon: '🤝', title: t('involved.sponsorTitle'), text: t('involved.sponsorText'), button: t('involved.sponsorButton'), href: event.links.sponsorEmail },
  ]
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="h-section">{t('involved.title')}</h1>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {cards.map((c) => (
          <section key={c.id} id={c.id} className="card flex flex-col scroll-mt-24" aria-labelledby={`h-${c.id}`}>
            <div className="text-5xl" aria-hidden="true">{c.icon}</div>
            <h2 id={`h-${c.id}`} className="mt-3 font-display text-2xl font-bold text-red-dark">{c.title}</h2>
            <p className="mt-2 flex-1 text-ink/80">{c.text}</p>
            <a href={c.href} target={c.href.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer" className="btn-primary mt-5 self-start" data-testid={`link-${c.id}`}>{c.button}</a>
          </section>
        ))}
      </div>
    </div>
  )
}
