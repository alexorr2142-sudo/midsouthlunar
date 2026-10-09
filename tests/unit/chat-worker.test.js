// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { bundledGrounding, createWorkerHandler } from '../../server/worker.mjs'
import { websiteGrounding } from '../../server/chat-service.mjs'
import { createLimiter } from '../../server/policy.mjs'

const SITE = 'https://alexorr2142-sudo.github.io'
const env = { GEMINI_API_KEY: 'worker-secret', ALLOWED_ORIGINS: `${SITE},https://midsouthlunar.org` }
const question = { question: 'Why are red envelopes given?', lang: 'en', history: [] }
const geminiReply = (text = 'A cultural answer.') => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }), { status: 200 })

function call(handler, { method = 'POST', path = '/api/chat', origin = SITE, body = JSON.stringify(question), headers = {}, ip = '203.0.113.7', vars = env } = {}) {
  const request = new Request(`https://midsouthlunar-chat.example.workers.dev${path}`, {
    method,
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': ip, ...(origin ? { origin } : {}), ...headers },
    ...(method === 'POST' && body ? { body } : {}),
  })
  return handler(request, vars)
}

// Test case UT-10 (FR-13, HO-13): the Cloudflare Worker exposes the same
// contract as the Node server, keeps the key server-side, and is grounded on
// the same website JSON the Node server reads from disk.
describe('UT-10 Yang Yang Cloudflare Worker', () => {
  it('bundles the same grounding the Node server reads from disk, for all seven languages', () => {
    const fromDisk = websiteGrounding('ko')
    const bundled = bundledGrounding('ko')
    expect(bundled.event).toEqual(fromDisk.event)
    expect(bundled.schedule).toEqual(fromDisk.schedule)
    expect(bundled.vendors).toEqual(fromDisk.vendors)
    expect(bundled.knowledge).toEqual(fromDisk.knowledge)
    expect(bundled.websiteText).toEqual(fromDisk.websiteText)
    for (const lang of ['en', 'zh', 'zh-Hant', 'th', 'vi', 'ko', 'ja']) expect(bundledGrounding(lang).websiteText.schedule.title).toBe(websiteGrounding(lang).websiteText.schedule.title)
    expect(bundledGrounding('xx').websiteText).toBe(bundledGrounding('en').websiteText)
  })

  it('reports enabled only when the GEMINI_API_KEY secret is present', async () => {
    const handler = createWorkerHandler()
    expect(await (await call(handler, { method: 'GET', path: '/api/chat/status' })).json()).toEqual({ enabled: true })
    expect(await (await call(handler, { method: 'GET', path: '/api/chat/status', vars: { ALLOWED_ORIGINS: SITE } })).json()).toEqual({ enabled: false })
    const noKey = await call(handler, { vars: { ALLOWED_ORIGINS: SITE } })
    expect(noKey.status).toBe(503)
  })

  it('answers a question through Gemini with the key only in the server-side header', async () => {
    const fetchImpl = vi.fn(async () => geminiReply('Red envelopes carry good wishes.'))
    const handler = createWorkerHandler({ fetchImpl })
    const res = await call(handler, { body: JSON.stringify({ ...question, lang: 'ja', history: [{ role: 'user', text: 'hi' }, { role: 'bot', text: 'hello' }] }) })
    expect(res.status).toBe(200)
    expect(res.headers.get('access-control-allow-origin')).toBe(SITE)
    expect(res.headers.get('cache-control')).toBe('no-store')
    expect(await res.json()).toEqual({ text: 'Red envelopes carry good wishes.' })
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toBe('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent')
    expect(init.headers['x-goog-api-key']).toBe('worker-secret')
    const body = JSON.parse(init.body)
    expect(body.systemInstruction.parts[0].text).toContain('Reply in Japanese')
    expect(body.systemInstruction.parts[0].text).toContain('7777 Walnut Grove Rd')
    expect(body.contents).toHaveLength(3)
    expect(JSON.stringify(body)).not.toContain('worker-secret')
  })

  it('honours GEMINI_MODEL from Worker vars', async () => {
    const fetchImpl = vi.fn(async () => geminiReply())
    await call(createWorkerHandler({ fetchImpl }), { vars: { ...env, GEMINI_MODEL: 'gemini-2.5-flash' } })
    expect(fetchImpl.mock.calls[0][0]).toContain('gemini-2.5-flash:generateContent')
  })

  it('enforces exact origins and answers CORS preflight', async () => {
    const handler = createWorkerHandler({ fetchImpl: vi.fn(async () => geminiReply()) })
    expect((await call(handler, { origin: 'https://evil.example' })).status).toBe(403)
    expect(await (await call(handler, { origin: 'https://evil.example' })).json()).toEqual({ error: 'origin_not_allowed' })
    expect((await call(handler, { origin: null })).status).toBe(403)
    expect((await call(handler, { origin: `${SITE}/midsouthlunar` })).status).toBe(403)
    const preflight = await call(handler, { method: 'OPTIONS', origin: 'https://midsouthlunar.org' })
    expect(preflight.status).toBe(204)
    expect(preflight.headers.get('access-control-allow-origin')).toBe('https://midsouthlunar.org')
    expect(preflight.headers.get('access-control-allow-methods')).toContain('POST')
    expect((await call(handler, { method: 'OPTIONS', origin: null })).status).toBe(403)
  })

  it('rejects wrong paths, methods, content types, bad JSON and oversized bodies', async () => {
    const fetchImpl = vi.fn(async () => geminiReply())
    const handler = createWorkerHandler({ fetchImpl })
    expect((await call(handler, { path: '/other' })).status).toBe(404)
    expect((await call(handler, { method: 'GET' })).status).toBe(405)
    expect((await call(handler, { headers: { 'content-type': 'text/plain' } })).status).toBe(415)
    expect((await call(handler, { body: '{not json' })).status).toBe(400)
    expect((await call(handler, { body: JSON.stringify({ ...question, question: 'x'.repeat(1300) }) })).status).toBe(400)
    expect((await call(handler, { body: JSON.stringify({ ...question, question: 'x'.repeat(30_000) }) })).status).toBe(413)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('maps provider failures and timeouts to 502/504 so the site falls back to built-in answers', async () => {
    const failing = createWorkerHandler({ fetchImpl: vi.fn(async () => new Response('nope', { status: 400 })) })
    expect(await (await call(failing)).json()).toEqual({ error: 'provider_unavailable' })
    const empty = createWorkerHandler({ fetchImpl: vi.fn(async () => new Response(JSON.stringify({ candidates: [] }), { status: 200 })) })
    expect(await (await call(empty)).json()).toEqual({ error: 'invalid_provider_response' })
  })

  it('rate-limits by cf-connecting-ip and releases concurrency after each answer', async () => {
    let now = 0
    const limiter = createLimiter({ now: () => now, perMinute: 2, perDay: 100, concurrent: 1 })
    const handler = createWorkerHandler({ limiter, fetchImpl: vi.fn(async () => geminiReply()) })
    expect((await call(handler, { ip: '198.51.100.1' })).status).toBe(200)
    expect((await call(handler, { ip: '198.51.100.1' })).status).toBe(200)
    expect(await (await call(handler, { ip: '198.51.100.1' })).json()).toEqual({ error: 'rate_limited' })
    expect((await call(handler, { ip: '198.51.100.2' })).status).toBe(200)
    now += 60_000
    expect((await call(handler, { ip: '198.51.100.1' })).status).toBe(200)
  })
})
