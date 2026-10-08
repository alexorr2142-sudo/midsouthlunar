import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { LanguageProvider, useLang, lookup, LANG_CODES } from '../../src/i18n/LanguageContext.jsx'
import en from '../../src/i18n/en.json'
import zh from '../../src/i18n/zh.json'
import viDictionary from '../../src/i18n/vi.json'
import ko from '../../src/i18n/ko.json'
import ja from '../../src/i18n/ja.json'
import zhHant from '../../src/i18n/zh-Hant.json'
import th from '../../src/i18n/th.json'
import event from '../../src/data/event.json'
import schedule from '../../src/data/schedule.json'
import vendors from '../../src/data/vendors.json'

const DICTS = { zh, 'zh-Hant': zhHant, th, vi: viDictionary, ko, ja }

function Probe() {
  const { t, lang, toggle, pick, setLang } = useLang()
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <button onClick={() => setLang('ko')}>ko</button>
      <span data-testid="title">{t('schedule.title')}</span>
      <span data-testid="count">{t('schedule.results', { count: 3 })}</span>
      <span data-testid="pick">{pick({ en: 'Main Stage', zh: '主舞台' })}</span>
      <button onClick={toggle}>toggle</button>
    </div>
  )
}

// Test case UT-6 (from FR-2): the language context switches every string,
// persists the choice, sets <html lang>, and never shows a raw key.
describe('UT-6 language toggle (FR-2)', () => {
  beforeEach(() => { cleanup(); window.localStorage.clear() })

  it('starts in English, loads Chinese on selection, and persists', async () => {
    render(<LanguageProvider><Probe /></LanguageProvider>)
    expect(screen.getByTestId('title')).toHaveTextContent('Schedule')
    expect(screen.getByTestId('count')).toHaveTextContent('3 events')
    fireEvent.click(screen.getByText('toggle'))
    await waitFor(() => expect(screen.getByTestId('lang')).toHaveTextContent('zh'))
    expect(screen.getByTestId('title')).toHaveTextContent('活动日程')
    expect(screen.getByTestId('pick')).toHaveTextContent('主舞台')
    expect(document.documentElement.lang).toBe('zh-Hans')
    expect(window.localStorage.getItem('msl-lang')).toBe('zh')
    fireEvent.click(screen.getByText('ko'))
    await waitFor(() => expect(screen.getByTestId('title')).toHaveTextContent('일정'))
    expect(screen.getByTestId('count')).toHaveTextContent('행사 3개')
    expect(document.documentElement.lang).toBe('ko')
  })

  it('cycles through all seven languages after each dictionary is ready', async () => {
    render(<LanguageProvider><Probe /></LanguageProvider>)
    const seen = []
    for (let i = 0; i < LANG_CODES.length; i++) {
      seen.push(screen.getByTestId('lang').textContent)
      fireEvent.click(screen.getByText('toggle'))
      const next = LANG_CODES[(i + 1) % LANG_CODES.length]
      await waitFor(() => expect(screen.getByTestId('lang').textContent).toBe(next))
    }
    expect(seen).toEqual(LANG_CODES)
    expect(screen.getByTestId('lang')).toHaveTextContent('en')
  })

  it('restores a saved non-English preference with matching translated copy', async () => {
    window.localStorage.setItem('msl-lang', 'th')
    render(<LanguageProvider><Probe /></LanguageProvider>)
    await waitFor(() => expect(screen.getByTestId('lang').textContent).toBe('th'))
    expect(screen.getByTestId('title')).toHaveTextContent(th.schedule.title)
    expect(document.documentElement.lang).toBe('th')
    expect(window.localStorage.getItem('msl-lang')).toBe('th')
  })

  it('explicit English overrides a stored preference', () => {
    window.localStorage.setItem('msl-lang', 'ja')
    render(<LanguageProvider initial="en"><Probe /></LanguageProvider>)
    expect(screen.getByTestId('lang').textContent).toBe('en')
    expect(window.localStorage.getItem('msl-lang')).toBe('en')
  })

  it.each(Object.keys(DICTS))('every English key has a %s value with the same shape (no raw keys can leak)', (code) => {
    const dict = DICTS[code]
    const walk = (obj, path = []) => Object.entries(obj).flatMap(([k, v]) =>
      v && typeof v === 'object' && !Array.isArray(v) ? walk(v, [...path, k]) : [[...path, k].join('.')])
    const missing = walk(en).filter((k) => k !== '_meta.status' && lookup(dict, k) === undefined)
    expect(missing).toEqual([])
    const extra = walk(dict).filter((k) => k !== '_meta.status' && lookup(en, k) === undefined)
    expect(extra).toEqual([])
    // Arrays must have the same length so .map() renders the same number of cards.
    for (const k of ['home.highlights', 'visit.parking', 'visit.access', 'visit.faq', 'about.culture']) {
      expect(lookup(dict, k)).toHaveLength(lookup(en, k).length)
    }
  })

  it('every data label (event, schedule, vendors) exists in all seven languages', () => {
    const bad = []
    const check = (obj, where) => { for (const c of LANG_CODES) if (!obj?.[c]) bad.push(`${where}.${c}`) }
    check(event.name, 'event.name'); check(event.organizer, 'event.organizer'); check(event.zodiac, 'event.zodiac'); check(event.venue.name, 'event.venue.name')
    event.days.forEach((d) => check(d.label, `day.${d.id}`))
    for (const g of ['stages', 'types', 'vendorCategories']) for (const [k, v] of Object.entries(event[g])) check(v, `${g}.${k}`)
    schedule.items.forEach((it) => { check(it.title, `schedule.${it.id}.title`); check(it.description, `schedule.${it.id}.description`) })
    vendors.items.forEach((v) => { check(v.name, `vendor.${v.id}.name`); check(v.description, `vendor.${v.id}.description`) })
    expect(bad).toEqual([])
  })
})

// Fresh modules let us hold individual locale imports without affecting the
// real dictionary completeness checks above.
describe('on-demand locale loading', () => {
  beforeEach(() => {
    cleanup()
    window.localStorage.clear()
    vi.resetModules()
  })
  afterEach(() => {
    cleanup()
    for (const code of ['th', 'zh', 'ko']) vi.doUnmock(`../../src/i18n/${code}.json`)
    vi.resetModules()
  })

  async function harness(initial) {
    const { LanguageProvider: AsyncProvider, useLang: useAsyncLang } = await import('../../src/i18n/LanguageContext.jsx')
    function AsyncProbe() {
      const { lang, t, setLang } = useAsyncLang()
      return <>
        <span data-testid="loaded-lang">{lang}</span>
        <span data-testid="loaded-title">{t('schedule.title')}</span>
        {['en', 'th', 'ko'].map((code) => <button key={code} onClick={() => setLang(code)}>load {code}</button>)}
      </>
    }
    return render(<AsyncProvider initial={initial}><AsyncProbe /></AsyncProvider>)
  }

  it('keeps the English dictionary and stored choice intact until restoration is ready, then reuses its cache', async () => {
    let release
    const gate = new Promise((resolve) => { release = resolve })
    vi.doMock('../../src/i18n/th.json', async () => { await gate; return { default: th } })
    window.localStorage.setItem('msl-lang', 'th')
    await harness()
    expect(screen.getByTestId('loaded-lang').textContent).toBe('en')
    expect(screen.getByTestId('loaded-title')).toHaveTextContent(en.schedule.title)
    expect(document.documentElement.lang).toBe('en')
    expect(window.localStorage.getItem('msl-lang')).toBe('th')

    await act(async () => { release(); await import('../../src/i18n/th.json') })
    await waitFor(() => expect(screen.getByTestId('loaded-lang').textContent).toBe('th'))
    expect(screen.getByTestId('loaded-title')).toHaveTextContent(th.schedule.title)
    expect(document.documentElement.lang).toBe('th')
    fireEvent.click(screen.getByText('load en'))
    fireEvent.click(screen.getByText('load th'))
    // Cached selections commit synchronously; they need no second fetch.
    expect(screen.getByTestId('loaded-lang').textContent).toBe('th')
    expect(window.localStorage.getItem('msl-lang')).toBe('th')
  })

  it('ignores a slow earlier selection after another language finishes first', async () => {
    let release
    const gate = new Promise((resolve) => { release = resolve })
    vi.doMock('../../src/i18n/th.json', async () => { await gate; return { default: th } })
    await harness('en')
    fireEvent.click(screen.getByText('load th'))
    expect(screen.getByTestId('loaded-lang').textContent).toBe('en')
    fireEvent.click(screen.getByText('load ko'))
    await waitFor(() => expect(screen.getByTestId('loaded-lang').textContent).toBe('ko'))
    await act(async () => { release(); await import('../../src/i18n/th.json') })
    expect(screen.getByTestId('loaded-lang').textContent).toBe('ko')
    expect(screen.getByTestId('loaded-title')).toHaveTextContent(ko.schedule.title)
    expect(document.documentElement.lang).toBe('ko')
    expect(window.localStorage.getItem('msl-lang')).toBe('ko')
  })

  it('allows English to cancel a pending restored preference', async () => {
    let release
    const gate = new Promise((resolve) => { release = resolve })
    vi.doMock('../../src/i18n/th.json', async () => { await gate; return { default: th } })
    window.localStorage.setItem('msl-lang', 'th')
    await harness()
    fireEvent.click(screen.getByText('load en'))
    await act(async () => { release(); await import('../../src/i18n/th.json') })
    expect(screen.getByTestId('loaded-lang').textContent).toBe('en')
    expect(window.localStorage.getItem('msl-lang')).toBe('en')
  })

  it('retains the current readable language if a locale download fails', async () => {
    vi.doMock('../../src/i18n/th.json', async () => { throw new Error('locale unavailable') })
    await harness('en')
    fireEvent.click(screen.getByText('load th'))
    await act(async () => { await import('../../src/i18n/th.json').catch(() => {}) })
    expect(screen.getByTestId('loaded-lang').textContent).toBe('en')
    expect(screen.getByTestId('loaded-title')).toHaveTextContent(en.schedule.title)
    expect(document.documentElement.lang).toBe('en')
    expect(window.localStorage.getItem('msl-lang')).toBe('en')
  })
})
