/** Optional Gemini adapter: the browser contacts only a protected backend. */
const configured = import.meta.env.VITE_CHAT_API_URL || ''
export function chatEndpoint(value = configured) {
  if (!value) return null
  try {
    const u = new URL(value)
    if (u.username || u.password) return null
    if (u.protocol === 'https:' || import.meta.env.DEV && u.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(u.hostname)) return u.href.replace(/\/$/, '')
  } catch { /* invalid endpoint */ }
  return null
}
export const aiEnabled = () => Boolean(chatEndpoint())
export async function askGemini(question, { lang = 'en', history = [], signal } = {}) {
  const endpoint = chatEndpoint()
  if (!endpoint) throw new Error('Live chat is not configured')
  const response = await fetch(endpoint, {
    method: 'POST', signal, credentials: 'omit',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, lang, history: history.filter(m => ['user', 'bot'].includes(m.role)).slice(-6).map(m => ({ role: m.role, text: m.text.slice(0, 2500) })) }),
  })
  if (!response.ok) throw new Error('Live chat unavailable')
  const data = await response.json()
  if (typeof data.text !== 'string' || !data.text.trim() || data.text.length > 12000) throw new Error('Invalid chat answer')
  return data.text
}
