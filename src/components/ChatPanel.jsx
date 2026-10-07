import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext'
import { HELLO, SUGGESTIONS } from '../lib/chatStrings'

// The engine, its data, and the Gemini adapter load on first use so the main
// bundle stays small (see ARCHITECTURE.md).
const loadEngine = () => import('../lib/chat')
const loadGemini = () => import('../lib/gemini')
const useAi = Boolean(import.meta.env.VITE_GEMINI_API_KEY)
import Goat from './Goat'
import Icon from './Icon'

/**
 * The chat panel body. Loaded lazily by ChatWidget the first time the visitor
 * opens it, so the engine, its data, and these strings stay out of the main
 * bundle. Built-in engine answers instantly in the visitor's language; when a
 * Gemini key is configured the model answers first and the engine is the
 * fallback.
 */
export default function ChatPanel({ open, setOpen }) {
  const { t, lang } = useLang()
  const [messages, setMessages] = useState(() => [{ role: 'bot', text: HELLO[lang], intent: 'greet' }])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const listRef = useRef(null)
  const inputRef = useRef(null)

  // Greet again in the new language when the site language changes and the
  // conversation has not started yet.
  useEffect(() => {
    setMessages((m) => (m.length === 1 && m[0].intent === 'greet' ? [{ role: 'bot', text: HELLO[lang], intent: 'greet' }] : m))
  }, [lang])

  useEffect(() => {
    if (open) { listRef.current?.scrollTo({ top: listRef.current.scrollHeight }); inputRef.current?.focus() }
  }, [open, messages, busy])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  async function send(text) {
    const q = text.trim()
    if (!q || busy) return
    setInput('')
    const history = messages
    setMessages((m) => [...m, { role: 'user', text: q }])
    setBusy(true)
    const { answer, detectLang } = await loadEngine()
    const qLang = detectLang(q, lang)
    let reply
    if (useAi) {
      try {
        const { askGemini } = await loadGemini()
        const txt = await askGemini(q, { lang: qLang, history })
        reply = { role: 'bot', text: txt, intent: 'ai', source: 'ai' }
      } catch { /* fall back */ }
    }
    if (!reply) {
      const a = answer(q, { lang })
      reply = { role: 'bot', text: a.text, intent: a.intent, links: a.links, source: 'local' }
    }
    setMessages((m) => [...m, reply])
    setBusy(false)
  }

  const suggestions = SUGGESTIONS[lang] ?? SUGGESTIONS.en

  return (
    <>
      {open && (
        <section id="yangyang-panel" role="dialog" aria-label={t('chat.title')} data-testid="chat-panel"
          className="fixed bottom-20 right-4 left-4 z-50 flex max-h-[min(70vh,34rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-red/20 sm:left-auto sm:w-[24rem]">
          <header className="flex items-center gap-3 bg-red-dark bg-pattern-dark px-4 py-3 text-white">
            <Goat className="h-10 w-10" mood="talk" />
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-bold leading-tight">{t('chat.title')}{lang !== 'zh' && <span className="text-gold-light"> 羊羊</span>}</p>
              <p className="truncate text-xs text-gold-light">{t('chat.subtitle')} · {t('chat.langs')}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={t('chat.close')} className="rounded-lg p-1.5 hover:bg-white/15 focus:outline-none focus-visible:ring-4 focus-visible:ring-gold/60">
              <Icon name="close" className="h-5 w-5" />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-cream bg-pattern-light px-3 py-3" data-testid="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div data-testid={`chat-${m.role}`} className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${m.role === 'user' ? 'rounded-br-md bg-red text-white' : 'rounded-bl-md bg-white text-ink ring-1 ring-red/10'}`}>
                  {m.text}
                  {m.links?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.links.map((l) => <Link key={l.to + l.label} to={l.to} onClick={() => setOpen(false)} className="rounded-full bg-gold-light/70 px-2.5 py-0.5 text-xs font-semibold text-ink hover:bg-gold">{l.label} →</Link>)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && <div className="flex justify-start"><div className="rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-sm text-ink/70 ring-1 ring-red/10" role="status">{t('chat.thinking')}</div></div>}
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 pt-1" data-testid="chat-suggestions">
                {suggestions.map((s) => <button key={s} type="button" onClick={() => send(s)} className="chip bg-white hover:bg-gold-light/60">{s}</button>)}
              </div>
            )}
          </div>

          <form className="flex items-center gap-2 border-t border-red/10 bg-white px-3 py-2" onSubmit={(e) => { e.preventDefault(); send(input) }}>
            <label htmlFor="chat-input" className="sr-only">{t('chat.placeholder')}</label>
            <input id="chat-input" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('chat.placeholder')} autoComplete="off" data-testid="chat-input"
              className="min-w-0 flex-1 rounded-full border border-red/30 px-4 py-2 text-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-gold/60" />
            <button type="submit" disabled={busy || !input.trim()} aria-label={t('chat.send')} data-testid="chat-send" className="btn-primary !p-2.5 disabled:opacity-40">
              <Icon name="send" className="h-5 w-5" />
            </button>
          </form>
          <p className="border-t border-red/10 bg-white px-3 py-1.5 text-[11px] leading-snug text-ink/70">{useAi ? t('chat.aiNote') : t('chat.localNote')}</p>
        </section>
      )}
    </>
  )
}
