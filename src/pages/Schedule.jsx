import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext'
import ChipGroup from '../components/ChipGroup'
import AddToCalendar from '../components/AddToCalendar'
import { filterSchedule } from '../lib/filter'
import { itemCalendarEvent } from '../lib/calendar'
import event from '../data/event.json'
import schedule from '../data/schedule.json'

const TYPE_ICON = { performance: '🎭', food: '🥟', culture: '🖌️', family: '🧧' }

export default function Schedule() {
  const { t, lang, pick } = useLang()
  const [params, setParams] = useSearchParams()
  const filters = { day: params.get('day') || 'all', stage: params.get('stage') || 'all', type: params.get('type') || 'all' }
  const set = (k) => (v) => { const p = new URLSearchParams(params); if (v === 'all') p.delete(k); else p.set(k, v); setParams(p, { replace: true }) }
  const clear = () => setParams({}, { replace: true })

  const items = useMemo(() => filterSchedule(schedule.items, filters), [filters.day, filters.stage, filters.type])
  const byDay = event.days.map((d) => ({ day: d, items: items.filter((it) => it.day === d.id) })).filter((g) => g.items.length)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="h-section">{t('schedule.title')}</h1>
      <p className="mt-2 max-w-2xl text-ink/80">{t('schedule.intro')}</p>
      <p className="mt-1 text-sm text-ink/75">{t('home.preliminary')}</p>

      <div className="mt-6 card grid gap-4 md:grid-cols-3">
        <ChipGroup name="day" label={t('schedule.day')} allLabel={t('schedule.all')} value={filters.day} onChange={set('day')} options={event.days.map((d) => [d.id, pick(d.label)])} />
        <ChipGroup name="stage" label={t('schedule.stage')} allLabel={t('schedule.all')} value={filters.stage} onChange={set('stage')} options={Object.entries(event.stages).map(([k, v]) => [k, pick(v)])} />
        <ChipGroup name="type" label={t('schedule.type')} allLabel={t('schedule.all')} value={filters.type} onChange={set('type')} options={Object.entries(event.types).map(([k, v]) => [k, pick(v)])} />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="font-semibold" data-testid="schedule-count" aria-live="polite">{items.length === 1 ? t('schedule.resultsOne') : t('schedule.results', { count: items.length })}</p>
        {(filters.day !== 'all' || filters.stage !== 'all' || filters.type !== 'all') && <button type="button" onClick={clear} className="text-red underline font-medium">{t('schedule.clear')}</button>}
      </div>

      {items.length === 0 && (
        <div className="mt-6 card text-center py-12" data-testid="schedule-empty">
          <p className="text-xl font-display text-red-dark">{t('schedule.empty')}</p>
          <button type="button" onClick={clear} className="btn-primary mt-4">{t('schedule.clear')}</button>
        </div>
      )}

      {byDay.map(({ day, items: dayItems }) => (
        <section key={day.id} className="mt-8" aria-labelledby={`h-${day.id}`}>
          <h2 id={`h-${day.id}`} className="font-display text-2xl font-bold text-red-dark border-b-2 border-gold pb-1">{pick(day.label)}</h2>
          <ul className="mt-4 grid gap-3">
            {dayItems.map((it) => (
              <li key={it.id} className="card flex flex-col sm:flex-row gap-3 sm:items-start" data-testid="schedule-item" data-day={it.day} data-stage={it.stage} data-type={it.type}>
                <div className="sm:w-32 shrink-0 font-semibold tabular-nums text-red-dark">{it.start} – {it.end}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-bold"><span aria-hidden="true">{TYPE_ICON[it.type]}</span> {pick(it.title)}</h3>
                  <p className="text-ink/80">{pick(it.description)}</p>
                  <p className="mt-1 text-sm text-ink/75">
                    <span className="rounded-full bg-gold-light/60 px-2 py-0.5">{pick(event.stages[it.stage])}</span>
                    <span className="ml-2 rounded-full bg-red/10 px-2 py-0.5">{pick(event.types[it.type])}</span>
                  </p>
                </div>
                <AddToCalendar calEvent={itemCalendarEvent(event, it, lang)} label={t('schedule.addItem')} size="sm" />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
