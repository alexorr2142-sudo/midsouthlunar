import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext'
import ChipGroup from '../components/ChipGroup'
import { filterVendors } from '../lib/filter'
import event from '../data/event.json'
import vendors from '../data/vendors.json'

const CAT_ICON = { food: '🥟', crafts: '🏮', cultural: '📜' }

export default function Vendors() {
  const { t, pick } = useLang()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const category = params.get('cat') || 'all'
  const update = (k, v) => { const p = new URLSearchParams(params); if (!v || v === 'all') p.delete(k); else p.set(k, v); setParams(p, { replace: true }) }

  const items = useMemo(() => filterVendors(vendors.items, { query, category }), [query, category])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="h-section">{t('vendors.title')}</h1>
      <p className="mt-2 max-w-2xl text-ink/80">{t('vendors.intro')}</p>
      <p className="mt-1 text-sm text-ink/75">{t('home.preliminary')}</p>

      <div className="mt-6 card grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="vendor-search" className="mb-1 block text-sm font-semibold text-red-dark">{t('vendors.search')}</label>
          <input id="vendor-search" type="search" value={query} onChange={(e) => update('q', e.target.value)} placeholder={t('vendors.searchPlaceholder')}
            data-testid="vendor-search" className="w-full rounded-full border border-red/30 bg-white px-4 py-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-gold/60" />
        </div>
        <ChipGroup name="category" label={t('vendors.category')} allLabel={t('vendors.all')} value={category} onChange={(v) => update('cat', v)}
          options={Object.entries(event.vendorCategories).map(([k, v]) => [k, pick(v)])} />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="font-semibold" data-testid="vendor-count" aria-live="polite">{items.length === 1 ? t('vendors.resultsOne') : t('vendors.results', { count: items.length })}</p>
        {(query || category !== 'all') && <button type="button" onClick={() => setParams({}, { replace: true })} className="text-red underline font-medium">{t('vendors.clear')}</button>}
      </div>

      {items.length === 0 ? (
        <div className="mt-6 card text-center py-12" data-testid="vendor-empty">
          <p className="text-xl font-display text-red-dark">{t('vendors.empty')}</p>
          <button type="button" onClick={() => setParams({}, { replace: true })} className="btn-primary mt-4">{t('vendors.clear')}</button>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((v) => (
            <li key={v.id} className="card" data-testid="vendor-card" data-category={v.category}>
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display text-lg font-bold text-red-dark"><span aria-hidden="true">{CAT_ICON[v.category]}</span> {pick(v.name)}</h2>
                <span className="shrink-0 rounded-full bg-gold-light/60 px-2 py-0.5 text-xs font-semibold">{t('vendors.booth')} {v.booth}</span>
              </div>
              <p className="mt-1 text-ink/80">{pick(v.description)}</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-ink/70">{pick(event.vendorCategories[v.category])}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
