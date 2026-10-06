/**
 * Performance test cases PT-1 and PT-2 (Thursday lab).
 *
 * PT-1  Lighthouse on a simulated phone over throttled 4G for Home and
 *       Schedule: performance, accessibility, and best-practices scores,
 *       plus first contentful paint and largest contentful paint.
 * PT-2  Budgets: the main JavaScript bundle under 350 kB raw / 110 kB gzip,
 *       and the vendor filter over 500+ rows responds under 100 ms.
 *
 * Usage: node scripts/perf.mjs            (expects `vite preview` on :4173, or starts one)
 * Writes docs/perf/perf.json and Lighthouse reports and prints a pass/fail table.
 */
import { spawn, execSync } from 'node:child_process'
import { readdirSync, statSync, mkdirSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { readFileSync } from 'node:fs'
import { performance } from 'node:perf_hooks'
import lighthouse from 'lighthouse'
import { launch } from 'chrome-launcher'
import { filterVendors } from '../src/lib/filter.js'
import vendors from '../src/data/vendors.json' with { type: 'json' }

const BASE = process.env.PERF_BASE || 'http://localhost:4173'
const CHROME = process.env.CHROME_PATH || undefined
const THRESH = { performance: 90, accessibility: 90, 'best-practices': 90, lcpMs: 3000, bundleKb: 350, bundleGzipKb: 110, filterMs: 100 }
mkdirSync('docs/perf', { recursive: true })
const results = []
const record = (id, name, actual, threshold, pass) => results.push({ id, name, actual, threshold, pass })

// Start a preview server if none is running.
let server
try { await fetch(BASE) } catch {
  execSync('npm run build', { stdio: 'inherit' })
  server = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], { stdio: 'ignore' })
  for (let i = 0; i < 40; i++) { try { await fetch(BASE); break } catch { await new Promise((r) => setTimeout(r, 250)) } }
}

// PT-1 Lighthouse, mobile emulation with simulated 4G throttling (Lighthouse default).
const chrome = await launch({ chromePath: CHROME, chromeFlags: ['--headless=new', '--no-sandbox'] })
for (const [label, path] of [['Home', '/'], ['Schedule', '/schedule'], ['Vendors', '/vendors']]) {
  const r = await lighthouse(BASE + path, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices'], formFactor: 'mobile', screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 3 } })
  const cats = r.lhr.categories
  for (const c of ['performance', 'accessibility', 'best-practices']) {
    const score = Math.round(cats[c].score * 100)
    record('PT-1', `${label}: Lighthouse ${c}`, score, `>= ${THRESH[c]}`, score >= THRESH[c])
  }
  const lcp = Math.round(r.lhr.audits['largest-contentful-paint'].numericValue)
  const fcp = Math.round(r.lhr.audits['first-contentful-paint'].numericValue)
  record('PT-1', `${label}: LCP on throttled 4G (ms)`, lcp, `< ${THRESH.lcpMs}`, lcp < THRESH.lcpMs)
  record('PT-1', `${label}: FCP on throttled 4G (ms)`, fcp, 'info', true)
  writeFileSync(`docs/perf/lighthouse-${label.toLowerCase()}.json`, JSON.stringify(r.lhr))
  writeFileSync(`docs/perf/lighthouse-${label.toLowerCase()}.html`, r.report?.[0] ?? (await import('lighthouse')).generateReport(r.lhr, 'html'))
}
await chrome.kill()

// PT-2a Bundle budget.
const assets = readdirSync('dist/assets').filter((f) => f.endsWith('.js'))
const main = assets.find((f) => f.startsWith('index-'))
const raw = statSync(`dist/assets/${main}`).size / 1024
const gz = gzipSync(readFileSync(`dist/assets/${main}`)).length / 1024
record('PT-2', 'Main JS bundle raw (kB)', +raw.toFixed(1), `< ${THRESH.bundleKb}`, raw < THRESH.bundleKb)
record('PT-2', 'Main JS bundle gzip (kB)', +gz.toFixed(1), `< ${THRESH.bundleGzipKb}`, gz < THRESH.bundleGzipKb)
record('PT-2', 'Page chunks (count)', assets.length - 1, 'info', true)

// PT-2b Filter speed over a 600-row synthetic vendor list (20x the demo data).
const big = Array.from({ length: 600 }, (_, i) => {
  const v = vendors.items[i % vendors.items.length]
  return { ...v, id: `${v.id}-${i}`, name: { en: `${v.name.en} ${i}`, zh: `${v.name.zh}${i}` }, booth: `${v.booth}-${i}` }
})
const queries = ['dumpling', '饺子', 'M4', 'tea', 'zzzz', '  golden   wok ']
let worst = 0
for (const q of queries) {
  for (const category of ['all', 'food', 'crafts']) {
    const t0 = performance.now()
    for (let i = 0; i < 20; i++) filterVendors(big, { query: q, category })
    const per = (performance.now() - t0) / 20
    worst = Math.max(worst, per)
  }
}
record('PT-2', `filterVendors over ${big.length} rows, worst case (ms)`, +worst.toFixed(2), `< ${THRESH.filterMs}`, worst < THRESH.filterMs)

writeFileSync('docs/perf/perf.json', JSON.stringify(results, null, 2))
const w = Math.max(...results.map((r) => r.name.length))
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.id}  ${r.name.padEnd(w)}  ${String(r.actual).padStart(8)}  (${r.threshold})`)
server?.kill()
process.exit(results.some((r) => !r.pass) ? 1 : 0)
