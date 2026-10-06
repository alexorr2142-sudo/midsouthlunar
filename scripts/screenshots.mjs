/**
 * Manual-walkthrough screenshots for the Tuesday lab (test output evidence).
 * Usage: node scripts/screenshots.mjs [baseUrl]
 * Writes PNGs to docs/screenshots/.
 */
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const base = process.argv[2] || 'http://localhost:4173'
const out = 'docs/screenshots'
mkdirSync(out, { recursive: true })

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined })
const shots = []
async function shot(ctxName, viewport, name, path, actions) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  await page.goto(base + path, { waitUntil: 'networkidle' })
  if (actions) await actions(page)
  await page.waitForTimeout(300)
  const file = `${out}/${name}.png`
  await page.screenshot({ path: file, fullPage: true })
  shots.push(file)
  await ctx.close()
}

const phone = { width: 390, height: 844 }
const desktop = { width: 1280, height: 800 }

await shot('d', desktop, '01-home-desktop', '/')
await shot('p', phone, '02-home-phone', '/')
await shot('p', phone, '03-home-phone-zh', '/', async (p) => p.locator('[data-testid=lang-toggle]:visible').click())
await shot('p', phone, '04-home-happening-now', '/?now=2027-02-05T15:00:00-06:00')
await shot('d', desktop, '05-schedule-all', '/schedule')
await shot('d', desktop, '06-schedule-day2-performance', '/schedule?day=day2&type=performance')
await shot('p', phone, '07-schedule-phone-zh-food', '/schedule?type=food', async (p) => p.locator('[data-testid=lang-toggle]:visible').click())
await shot('d', desktop, '08-schedule-empty', '/schedule?day=day1&stage=market')
await shot('d', desktop, '09-vendors-all', '/vendors')
await shot('d', desktop, '10-vendors-search-dumpling', '/vendors', async (p) => p.getByTestId('vendor-search').fill('dumpling'))
await shot('p', phone, '11-vendors-phone-crafts-zh', '/vendors?cat=crafts', async (p) => p.locator('[data-testid=lang-toggle]:visible').click())
await shot('d', desktop, '12-vendors-empty', '/vendors', async (p) => p.getByTestId('vendor-search').fill('zzzz'))
await shot('d', desktop, '13-visit', '/visit')
await shot('p', phone, '14-get-involved-phone', '/get-involved')
await shot('d', desktop, '15-about', '/about')
await shot('p', phone, '16-mobile-menu-open', '/', async (p) => p.getByRole('button', { name: /menu/i }).click())

await browser.close()
console.log(shots.join('\n'))
