/**
 * Browser adapter for the optional protected Yang Yang chat service.
 *
 * Only the public endpoint URL is included in the static site. Gemini
 * credentials belong in the backend host's GEMINI_API_KEY environment variable,
 * never in Vite variables or the GitHub Pages build.
 */
const CHAT_API_URL = (import.meta.env.VITE_CHAT_API_URL || '').trim()

export const aiEnabled = () => Boolean(CHAT_API_URL)

export async function askGemini(question, { lang = 'en', history = [], signal } = {}) {
  if (!CHAT_API_URL) throw new Error('Live chat is not configured')

  const response = await fetch(CHAT_API_URL, {
    method: 'POST',
    signal,
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      lang,
      history: history
        .filter((message) => ['user', 'bot'].includes(message.role))
        .slice(-6)
        .map((message) => ({ role: message.role, text: String(message.text).slice(0, 2500) })),
    }),
  })

  if (!response.ok) throw new Error('Live chat unavailable')

  const data = await response.json()
  if (typeof data.text !== 'string' || !data.text.trim() || data.text.length > 12000) {
    throw new Error('Invalid chat answer')
  }
  return data.text
}
