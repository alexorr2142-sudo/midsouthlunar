/**
 * Request policy shared by the Node server (http.mjs) and the Cloudflare
 * Worker (worker.mjs): exact-origin allowlist and in-memory rate limiting.
 * Kept free of Node-only imports so it bundles anywhere.
 */
import { ChatError } from './chat-service.mjs'

export const DEFAULT_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5175', 'http://127.0.0.1:5175']

export function allowedOrigins(value) {
  const values = value ? value.split(',').map((s) => s.trim()).filter(Boolean) : DEFAULT_ORIGINS
  return new Set(values.map((s) => {
    const u = new URL(s)
    if (!['http:', 'https:'].includes(u.protocol) || u.origin !== s || u.username || u.password) throw new Error('ALLOWED_ORIGINS must contain exact origins without paths')
    return s
  }))
}

export function createLimiter({ now = Date.now, perMinute = 10, perDay = 200, concurrent = 4 } = {}) {
  const ips = new Map()
  let day = -1, daily = 0, active = 0
  const reserve = (ip) => {
    const stamp = now(), minute = Math.floor(stamp / 60_000), today = Math.floor(stamp / 86_400_000)
    if (today !== day) { day = today; daily = 0 }
    for (const [key, record] of ips) if (record.minute < minute) ips.delete(key)
    const record = ips.get(ip) || { minute, count: 0 }
    if (record.count >= perMinute || daily >= perDay || ips.size >= 20_000) throw new ChatError(429, 'rate_limited')
    if (active >= concurrent) throw new ChatError(429, 'chat_busy')
    record.count++; ips.set(ip, record); daily++; active++
    let released = false
    return () => { if (!released) { active--; released = true } }
  }
  return { reserve }
}
