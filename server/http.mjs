import { createServer } from 'node:http'
import { ChatError, createChatService } from './chat-service.mjs'
import { allowedOrigins, createLimiter } from './policy.mjs'

// Re-exported so existing imports and tests keep working.
export { DEFAULT_ORIGINS, allowedOrigins, createLimiter } from './policy.mjs'

function readBody(req, limit = 24 * 1024) {
  if (Number(req.headers['content-length'] || 0) > limit) return Promise.reject(new ChatError(413, 'request_too_large'))
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0, finished = false
    const finish = (error, value) => {
      if (finished) return
      finished = true; clearTimeout(timer)
      req.off('data', onData); req.off('end', onEnd); req.off('error', onError); req.off('aborted', onAborted)
      if (error) { req.resume(); reject(error) } else resolve(value)
    }
    const onData = (chunk) => {
      size += chunk.length
      if (size > limit) finish(new ChatError(413, 'request_too_large'))
      else chunks.push(chunk)
    }
    const onEnd = () => {
      try { finish(null, JSON.parse(Buffer.concat(chunks).toString('utf8'))) } catch { finish(new ChatError(400, 'invalid_json')) }
    }
    const onError = () => finish(new ChatError(400, 'invalid_request'))
    const onAborted = () => finish(new ChatError(400, 'request_aborted'))
    const timer = setTimeout(() => finish(new ChatError(408, 'request_timeout')), 10_000)
    req.on('data', onData); req.once('end', onEnd); req.once('error', onError); req.once('aborted', onAborted)
  })
}

export function createChatHandler({ service = createChatService(), origins = allowedOrigins(process.env.ALLOWED_ORIGINS), limiter = createLimiter() } = {}) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Vary', 'Origin')
    const send = (status, body) => {
      if (res.writableEnded || res.destroyed) return
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify(body))
    }
    let release
    try {
      const path = new URL(req.url, 'http://localhost').pathname
      if (!['/api/chat', '/api/chat/status'].includes(path)) return send(404, { error: 'not_found' })
      const origin = req.headers.origin
      if (origin && !origins.has(origin)) throw new ChatError(403, 'origin_not_allowed')
      if (origin) res.setHeader('Access-Control-Allow-Origin', origin)
      if (req.method === 'OPTIONS') {
        if (!origin) throw new ChatError(403, 'origin_required')
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
        res.writeHead(204); return res.end()
      }
      if (req.method === 'GET' && path === '/api/chat/status') return send(200, { enabled: service.enabled })
      if (req.method !== 'POST' || path !== '/api/chat') return send(405, { error: 'method_not_allowed' })
      if (!origin) throw new ChatError(403, 'origin_required')
      if (!service.enabled) throw new ChatError(503, 'chat_unavailable')
      if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) throw new ChatError(415, 'json_required')
      // Reserve quota and concurrency before accepting or reading the body.
      // Ignore forwarded headers: they are spoofable unless the host normalizes them.
      release = limiter.reserve(req.socket?.remoteAddress || 'unknown')
      const payload = await readBody(req)
      return send(200, await service.ask(payload))
    } catch (error) {
      return send(error instanceof ChatError ? error.status : 500, { error: error instanceof ChatError ? error.code : 'chat_unavailable' })
    } finally { release?.(); if (!req.complete && !req.destroyed) req.resume() }
  }
}

export function createChatServer(options = {}) {
  const server = createServer({ maxHeaderSize: 8192 }, createChatHandler(options))
  server.requestTimeout = 15_000
  server.headersTimeout = 10_000
  server.timeout = 30_000
  server.maxHeadersCount = 32
  return server
}
