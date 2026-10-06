import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { LanguageProvider, useLang, lookup, LANG_CODES } from '../../src/i18n/LanguageContext.jsx'
import en from '../../src/i18n/en.json'
import zh from '../../src/i18n/zh.json'
import vi from '../../src/i18n/vi.json'
import ko from '../../src/i18n/ko.json'
import ja from '../../src/i18n/ja.json'
import event from '../../src/data/event.json'
import schedule from '../../src/data/schedule.json'
import vendors from '../../src/data/vendors.json'

const DICTS = { zh, vi, ko, ja }

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

  it('starts in English, toggles to Chinese, and persists', () => {
    render(<LanguageProvider><Probe /></LanguageProvider>)
    expect(screen.getByTestId('title')).toHaveTextContent('Schedule')
    expect(screen.getByTestId('count')).toHaveTextContent('3 events')
    fireEvent.click(screen.getByText('toggle'))
    expect(screen.getByTestId('lang')).toHaveTextContent('zh')
    expect(screen.getByTestId('title')).toHaveTextContent('活动日程')
    expect(screen.getByTestId('pick')).toHaveTextContent('主舞台')
    expect(document.documentElement.lang).toBe('zh-CN')
    expect(window.localStorage.getItem('msl-lang')).toBe('zh')
    fireEvent.click(screen.getByText('ko'))
    expect(screen.getByTestId('title')).toHaveTextContent('일정')
    expect(screen.getByTestId('count')).toHaveTextContent('행사 3개')
    expect(document.documentElement.lang).toBe('ko')
  })

  it('cycles through all five languages and ignores unknown codes', () => {
    render(<LanguageProvider><Probe /></LanguageProvider>)
    const seen = []
    for (let i = 0; i < LANG_CODES.length; i++) {
      seen.push(screen.getByTestId('lang').textContent)
      fireEvent.click(screen.getByText('toggle'))
    }
    expect(seen).toEqual(LANG_CODES)
    expect(screen.getByTestId('lang')).toHaveTextContent('en')
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

  it('every data label (event, schedule, vendors) exists in all five languages', () => {
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
