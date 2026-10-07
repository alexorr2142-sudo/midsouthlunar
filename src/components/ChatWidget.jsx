import { lazy, Suspense, useState } from 'react'
import { useLang } from '../i18n/LanguageContext'
import Goat from './Goat'

const ChatPanel = lazy(() => import('./ChatPanel'))

/**
 * Floating "Ask Yang Yang" button on every page. The panel, the engine, and
 * the knowledge base load only when someone opens it.
 */
export default function ChatWidget() {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  return (
    <>
      <button type="button" onClick={() => { setLoaded(true); setOpen((o) => !o) }} aria-expanded={open} aria-controls="yangyang-panel" data-testid="chat-open"
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-red-dark pl-1.5 pr-4 py-1.5 text-white shadow-xl ring-4 ring-gold/70 transition hover:bg-red focus:outline-none focus-visible:ring-gold">
        <Goat className="h-11 w-11" mood={open ? 'talk' : 'happy'} />
        <span className="font-semibold">{open ? t('chat.close') : t('chat.open')}</span>
      </button>
      {loaded && (
        <Suspense fallback={null}>
          <ChatPanel open={open} setOpen={setOpen} />
        </Suspense>
      )}
    </>
  )
}
