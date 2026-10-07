/**
 * Pure filtering helpers for the Schedule and Vendors pages.
 * Each function takes the full item list and returns a new filtered array.
 */

/**
 * Filter schedule items. Any filter set to 'all' (or undefined) is ignored.
 * Result is sorted by day then start time.
 */
export function filterSchedule(items, { day = 'all', stage = 'all', type = 'all' } = {}) {
  return items
    .filter((it) => (day === 'all' || it.day === day) && (stage === 'all' || it.stage === stage) && (type === 'all' || it.type === type))
    .slice()
    .sort((a, b) => (a.day === b.day ? a.start.localeCompare(b.start) : a.day.localeCompare(b.day)))
}

/** Lower-case, trim, and collapse whitespace so "  Golden   Wok " matches "golden wok". */
export function normalize(s) {
  return String(s ?? '').normalize('NFC').toLowerCase().trim().replace(/\s+/g, ' ')
}

/**
 * Filter vendors by free-text query and category.
 * The query matches against name and description in BOTH languages so a
 * visitor on the English page can still find 金锅 by typing it, and vice versa.
 */
export function filterVendors(items, { query = '', category = 'all' } = {}) {
  const q = normalize(query)
  return items.filter((v) => {
    if (category !== 'all' && v.category !== category) return false
    if (!q) return true
    const hay = [v.name?.en, v.name?.zh, v.description?.en, v.description?.zh, v.booth].map(normalize).join(' | ')
    return hay.includes(q)
  })
}
