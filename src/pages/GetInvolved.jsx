import { useLang } from '../i18n/LanguageContext'
import event from '../data/event.json'
import Icon from '../components/Icon'
import { externalLink } from '../lib/links'

export default function GetInvolved() {
  const { t } = useLang()
  const cards = [
    { id: 'vendor', icon: 'shop', title: t('involved.vendorTitle'), text: t('involved.vendorText'), button: t('involved.vendorButton'), href: externalLink(event.links.vendorForm, 'vendorForm') },
    { id: 'volunteer', icon: 'hand', title: t('involved.volunteerTitle'), text: t('involved.volunteerText'), button: t('involved.volunteerButton'), href: externalLink(event.links.volunteerForm, 'volunteerForm') },
    { id: 'sponsor', icon: 'handshake', title: t('involved.sponsorTitle'), text: t('involved.sponsorText'), button: t('involved.sponsorButton'), href: event.links.sponsorEmail },
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
            {c.href ? <a href={c.href} target={c.href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer" className="btn-primary mt-5 self-start" data-testid={`link-${c.id}`}>{c.button}</a> : <p className="mt-5 font-semibold text-red" data-testid={`pending-${c.id}`}>{t(`involved.${c.id}Pending`)}</p>}
          </section>
        ))}
      </div>
    </div>
  )
}
