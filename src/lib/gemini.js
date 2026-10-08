/**
 * Optional AI mode for Yang Yang using the Google Gemini API (free tier).
 *
 * Off by default. To turn it on, set VITE_GEMINI_API_KEY at build time (a
 * GitHub Actions secret, see .github/workflows/deploy.yml). The key is
 * compiled into the public bundle, so it must be a key created for this
 * site only, restricted in Google AI Studio / Cloud Console to the site's
 * HTTP referrers (midsouthlunar.org and the github.io address). That limits
 * casual abuse; free-tier quotas and availability still apply.
 *
 * The model is grounded on the same data the built-in engine uses, so it
 * cannot invent events, vendors, or prices. If the call fails for any reason
 * (no key, quota, network), ChatWidget falls back to lib/chat.js answer().
 */
import event from '../data/event.json'
import schedule from '../data/schedule.json'
import vendors from '../data/vendors.json'
import knowledge from '../data/knowledge.json'

export const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
export const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash-lite'
export const aiEnabled = () => Boolean(GEMINI_KEY)

const LANG_NAMES = { en: 'English', zh: 'Simplified Chinese', vi: 'Vietnamese', ko: 'Korean', ja: 'Japanese' }

/** Compact grounding text built once per language. */
function grounding(lang) {
  const p = (o) => o?.[lang] ?? o?.en ?? ''
  const days = event.days.map((d) => `${d.id}: ${p(d.label)} ${d.open}-${d.close}`).join('; ')
  const sched = schedule.items.map((it) => `- ${it.day} ${it.start}-${it.end} [${p(event.stages[it.stage])}] ${p(it.title)}: ${p(it.description)}`).join('\n')
  const vend = vendors.items.map((v) => `- ${p(v.name)} (booth ${v.booth}, ${v.category}): ${p(v.description)}`).join('\n')
  const facts = knowledge.topics.map((t) => `## ${t.id}\n${p(t.answer)}`).join('\n')
  return `EVENT: ${p(event.name)}, organized by ${p(event.organizer)}. ${p(event.zodiac)} ${event.year}. Venue: ${p(event.venue.name)}, ${event.venue.address}. Days: ${days}. Tickets via Eventbrite (pricing not yet announced). Vendor and volunteer sign-up via Google Forms on the Get Involved page. Free parking off Walnut Grove Road; accessible parking and drop-off at the main entrance; rideshare at the north lot. Fully accessible, one level; quiet room on request. Rain or shine; lantern walk is outdoors. Most vendors take cards; ATM on site. The schedule and vendor list are PRELIMINARY and may change.

SCHEDULE:
${sched}

VENDORS:
${vend}

LUNAR NEW YEAR FACTS:
${facts}`
}

const cache = {}

/**
 * Ask Gemini. `history` is [{role:'user'|'bot', text}]. Resolves to the reply
 * text, or throws so the caller can fall back to the built-in engine.
 */
export async function askGemini(question, { lang = 'en', history = [], signal } = {}) {
  if (!GEMINI_KEY) throw new Error('no key')
  cache[lang] ??= grounding(lang)
  const system = `You are Yang Yang (羊羊), the friendly goat mascot and assistant for the Mid-South Lunar New Year Festival website in Memphis. Answer ONLY from the information below. If something is not covered, say you do not know and point to the relevant page (Schedule, Vendors, Tickets & Visit, Get Involved, About). Never invent events, vendors, prices, or dates. Be warm and brief (under 120 words unless listing schedule items). Reply in the same language the visitor writes in; if unclear, reply in ${LANG_NAMES[lang] || 'English'}. Use plain text with short lines, no markdown headings.\n\n${cache[lang]}`
  const contents = [
    ...history.slice(-6).map((m) => ({ role: m.role === 'bot' ? 'model' : 'user', parts: [{ text: m.text }] })),
    { role: 'user', parts: [{ text: question }] },
  ]
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`
  const res = await fetch(url, {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_KEY },
    body: JSON.stringify({ system_instruction: { parts: [{ text: system }] }, contents, generationConfig: { temperature: 0.4, maxOutputTokens: 512 } }),
  })
  if (!res.ok) throw new Error(`gemini ${res.status}`)
  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('').trim()
  if (!text) throw new Error('empty')
  return text
}
