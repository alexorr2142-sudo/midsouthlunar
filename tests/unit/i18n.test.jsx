import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { LanguageProvider, useLang, lookup } from '../../src/i18n/LanguageContext.jsx'
import en from '../../src/i18n/en.json'
import zh from '../../src/i18n/zh.json'

function Probe() {
  const { t, lang, toggle, pick } = useLang()
  return (
    <div>
      <span data-testid="lang">{lang}</span>
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
  beforeEach(() => window.localStorage.clear())

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
  })

  it('every English key has a Chinese value with the same shape (no raw keys can leak)', () => {
    const walk = (obj, path = []) => Object.entries(obj).flatMap(([k, v]) =>
      v && typeof v === 'object' && !Array.isArray(v) ? walk(v, [...path, k]) : [[...path, k].join('.')])
    const missing = walk(en).filter((k) => k !== '_meta.status' && lookup(zh, k) === undefined)
    expect(missing).toEqual([])
    // Arrays must have the same length so .map() renders the same number of cards.
    for (const k of ['home.highlights', 'visit.parking', 'visit.access', 'visit.faq', 'about.culture']) {
      expect(lookup(zh, k)).toHaveLength(lookup(en, k).length)
    }
  })
})
