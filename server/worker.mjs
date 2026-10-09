/**
 * Cloudflare Worker entry for the Yang Yang chat service.
 *
 * Same contract as server/chat.mjs (GET /api/chat/status, POST /api/chat),
 * same provider code (chat-service.mjs) and the same CORS / rate-limit rules
 * as server/http.mjs, but hosted on Cloudflare's free Workers tier so the
 * GitHub Pages site can reach a Gemini key that never leaves the server.
 *
 * Grounding data is bundled at deploy time from src/data and src/i18n, so the
 * Worker must be redeployed when those files change (the chat-worker workflow
 * does this automatically on push).
 *
 * Secrets / variables (set in the Cloudflare dashboard or via wrangler):
 *   GEMINI_API_KEY   secret, required for live answers
 *   GEMINI_MODEL     optional, default gemini-3.1-flash-lite
 *   ALLOWED_ORIGINS  comma-separated exact website origins
 */
import { ChatError, createChatService } from './chat-service.mjs'
import { allowedOrigins, createLimiter } from './policy.mjs'
import event from '../src/data/event.json' with { type: 'json' }
import schedule from '../src/data/schedule.json' with { type: 'json' }
import vendors from '../src/data/vendors.json' with { type: 'json' }
import knowledge from '../src/data/knowledge.json' with { type: 'json' }
import en from '../src/i18n/en.json' with { type: 'json' }
import zh from '../src/i18n/zh.json' with { type: 'json' }
import zhHant from '../src/i18n/zh-Hant.json' with { type: 'json' }
import th from '../src/i18n/th.json' with { type: 'json' }
import vi from '../src/i18n/vi.json' with { type: 'json' }
import ko from '../src/i18n/ko.json' with { type: 'json' }
import ja from '../src/i18n/ja.json' with { type: 'json' }

const DICTIONARIES = { en, zh, 'zh-Hant': zhHant, th, vi, ko, ja }
const BODY_LIMIT = 24 * 1024
const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', Vary: 'Origin' }

/** Grounding built from the JSON bundled with the Worker (no file system needed). */
export function bundledGrounding(lang = 'en') {
  return { event, schedule, vendors, knowledge, websiteText: DICTIONARIES[lang] || en, englishWebsiteText: en }
}

/**
 * Builds a fetch handler. `limiter` lives for the life of the isolate, so the
 * per-minute / per-day counters reset when Cloudflare recycles it; the
 * provider-side spending limit is still the real safety net.
 */
export function createWorkerHandler({ limiter = createLimiter(), fetchImpl } = {}) {
  return async (request, env = {}) => {
    const origin = request.headers.get('origin')
    const reply = (status, body, extra = {}) => new Response(status === 204 ? null : JSON.stringify(body), {
      status,
      headers: { ...JSON_HEADERS, ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}), ...extra },
    })
    let release
    try {
      const path = new URL(request.url).pathname
      if (!['/api/chat', '/api/chat/status'].includes(path)) return reply(404, { error: 'not_found' })
      const origins = allowedOrigins(env.ALLOWED_ORIGINS)
      if (origin && !origins.has(origin)) throw new ChatError(403, 'origin_not_allowed')
      const service = createChatService({ apiKey: env.GEMINI_API_KEY || '', model: env.GEMINI_MODEL || undefined, getGrounding: bundledGrounding, ...(fetchImpl ? { fetchImpl } : {}) })
      if (request.method === 'OPTIONS') {
        if (!origin) throw new ChatError(403, 'origin_required')
        return reply(204, null, { 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600' })
      }
      if (request.method === 'GET' && path === '/api/chat/status') return reply(200, { enabled: service.enabled })
      if (request.method !== 'POST' || path !== '/api/chat') return reply(405, { error: 'method_not_allowed' })
      if (!origin) throw new ChatError(403, 'origin_required')
      if (!service.enabled) throw new ChatError(503, 'chat_unavailable')
      if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) throw new ChatError(415, 'json_required')
      if (Number(request.headers.get('content-length') || 0) > BODY_LIMIT) throw new ChatError(413, 'request_too_large')
      // cf-connecting-ip is set by Cloudflare itself, so unlike X-Forwarded-For it cannot be spoofed by the visitor.
      release = limiter.reserve(request.headers.get('cf-connecting-ip') || 'unknown')
      const raw = await request.text()
      if (raw.length > BODY_LIMIT) throw new ChatError(413, 'request_too_large')
      let payload
      try { payload = JSON.parse(raw) } catch { throw new ChatError(400, 'invalid_json') }
      return reply(200, await service.ask(payload))
    } catch (error) {
      return reply(error instanceof ChatError ? error.status : 500, { error: error instanceof ChatError ? error.code : 'chat_unavailable' })
    } finally { release?.() }
  }
}

const handler = createWorkerHandler()
export default { fetch: (request, env) => handler(request, env) }
