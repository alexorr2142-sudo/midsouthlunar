import { useEffect, useState } from 'react'
import { useLang } from '../i18n/LanguageContext'
import { getEventState, splitDuration } from '../lib/countdown'
import event from '../data/event.json'
import { Link } from 'react-router-dom'

/**
 * Countdown hero widget. `now` can be injected (used by tests and by the
 * ?now=ISO query string for demos) so every state can be shown on demand.
 */
export default function Countdown({ now: nowOverride }) {
  const { t } = useLang()
  const [now, setNow] = useState(() => nowOverride ?? new Date())

  useEffect(() => {
    if (nowOverride) { setNow(nowOverride); return }
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [nowOverride])

  const st = getEventState(event, now)

  if (st.state === 'after') return <Banner title={t('countdown.after')} text={t('countdown.afterText')} state="after" />
  if (st.state === 'between') return <Banner title={t('countdown.between')} text={t('countdown.betweenText')} state="between" />
  if (st.state === 'open') {
    return (
      <Banner title={t('countdown.now')} text={t('countdown.nowText')} state="open">
        <Link to="/schedule" className="btn-gold mt-3">{t('home.schedule')}</Link>
      </Banner>
    )
  }

  const d = splitDuration(st.msUntil)
  const cells = [[d.days, 'days'], [d.hours, 'hours'], [d.minutes, 'minutes'], [d.seconds, 'seconds']]
  return (
    <div data-testid="countdown" data-state="before" className="rounded-2xl bg-red-dark/80 ring-2 ring-gold/70 p-4 md:p-6 text-white backdrop-blur">
      <p className="text-center text-gold-light uppercase tracking-widest text-sm font-semibold">{t('countdown.until')}</p>
      <div className="mt-3 grid grid-cols-4 gap-2 md:gap-4" role="timer" aria-live="off">
        {cells.map(([n, key]) => (
          <div key={key} className="rounded-xl bg-black/25 py-3 text-center">
            <div className="font-display text-3xl md:text-5xl font-bold tabular-nums" data-testid={`cd-${key}`}>{String(n).padStart(2, '0')}</div>
            <div className="text-xs md:text-sm text-gold-light">{t(`countdown.${key}`)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Banner({ title, text, state, children }) {
  return (
    <div data-testid="countdown" data-state={state} className="rounded-2xl bg-red-dark/80 ring-2 ring-gold/70 p-6 text-white text-center backdrop-blur">
      <p className="font-display text-3xl md:text-4xl font-bold text-gold-light">{title}</p>
      <p className="mt-2 text-white/90">{text}</p>
      {children}
    </div>
  )
}
