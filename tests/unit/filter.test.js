import { describe, it, expect } from 'vitest'
import { filterSchedule, filterVendors, normalize } from '../../src/lib/filter.js'
import schedule from '../../src/data/schedule.json'
import vendors from '../../src/data/vendors.json'

// Test case UT-3 (from FR-4): schedule filters by day, stage, and type and
// returns items sorted by time; "all" means no filter.
describe('UT-3 filterSchedule (FR-4)', () => {
  it('returns every item sorted by day then start when no filter is set', () => {
    const out = filterSchedule(schedule.items)
    expect(out).toHaveLength(schedule.items.length)
    for (let i = 1; i < out.length; i++) {
      const a = out[i - 1], b = out[i]
      expect(a.day < b.day || (a.day === b.day && a.start <= b.start)).toBe(true)
    }
  })

  it('combines day, stage, and type filters with AND', () => {
    const out = filterSchedule(schedule.items, { day: 'day2', stage: 'main', type: 'performance' })
    expect(out.length).toBeGreaterThan(0)
    out.forEach((it) => expect(it).toMatchObject({ day: 'day2', stage: 'main', type: 'performance' }))
  })

  it('returns an empty list, not an error, when nothing matches', () => {
    expect(filterSchedule(schedule.items, { day: 'day1', stage: 'market' })).toEqual([])
  })

  it('does not mutate the source array', () => {
    const before = schedule.items.map((i) => i.id).join()
    filterSchedule(schedule.items, { type: 'food' })
    expect(schedule.items.map((i) => i.id).join()).toBe(before)
  })
})

// Test case UT-4 (from FR-5): vendor search is case/whitespace insensitive,
// matches both languages and the booth number, and combines with category.
describe('UT-4 filterVendors (FR-5)', () => {
  it('normalizes case and whitespace', () => {
    expect(normalize('  Golden   WOK ')).toBe('golden wok')
    expect(filterVendors(vendors.items, { query: '  gOLDEN   wok ' }).map((v) => v.id)).toEqual(['v01'])
  })

  it('matches Chinese text while browsing in English', () => {
    expect(filterVendors(vendors.items, { query: '饺子' }).map((v) => v.id)).toContain('v01')
  })

  it.each(['zh-Hant', 'th', 'vi', 'ko', 'ja'])('searches localized vendor names in %s', lang => {
    const vendor = vendors.items[0]
    expect(filterVendors(vendors.items, {query:vendor.name[lang]}).map(v => v.id)).toContain(vendor.id)
  })

  it('matches on description and booth number', () => {
    expect(filterVendors(vendors.items, { query: 'tanghulu' }).map((v) => v.id)).toEqual(['v06'])
    expect(filterVendors(vendors.items, { query: 'M4' }).map((v) => v.id)).toEqual(['v14'])
  })

  it('combines query with category and returns empty for no match', () => {
    const food = filterVendors(vendors.items, { query: 'dumpling', category: 'food' })
    expect(food.every((v) => v.category === 'food')).toBe(true)
    expect(filterVendors(vendors.items, { query: 'dumpling', category: 'crafts' })).toEqual([])
    expect(filterVendors(vendors.items, { query: 'zzzz' })).toEqual([])
  })
})
