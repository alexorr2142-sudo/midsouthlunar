/**
 * Render a .mmd file to PNG with Playwright + Mermaid (no mermaid-cli needed).
 * Usage: node scripts/render-mermaid.mjs docs/architecture.mmd docs/architecture.png
 */
import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'

const [,, input, output] = process.argv
const src = readFileSync(input, 'utf8')
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined })
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 2 })
await page.setContent(`<!doctype html><html><body style="margin:0;background:#fff;padding:24px">
<pre class="mermaid">${src.replace(/</g, '&lt;')}</pre>
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs'
  mermaid.initialize({ startOnLoad: false, theme: 'base', themeVariables: { primaryColor: '#FFF3D6', primaryBorderColor: '#B5121B', primaryTextColor: '#2A1A12', lineColor: '#8A0E15', clusterBkg: '#FFF8EC', clusterBorder: '#D4A017', fontSize: '14px' } })
  await mermaid.run()
  window.__done = true
</script></body></html>`)
await page.waitForFunction(() => window.__done === true, null, { timeout: 60000 })
const svg = page.locator('svg').first()
await svg.screenshot({ path: output })
await browser.close()
console.log('wrote', output)
