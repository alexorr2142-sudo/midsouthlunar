import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import { LanguageProvider, LANG_CODES, LANGS, useLang } from '../../src/i18n/LanguageContext.jsx'
import { answer } from '../../src/lib/chat.js'
import { HELLO } from '../../src/lib/chatStrings.js'
import event from '../../src/data/event.json'
import en from '../../src/i18n/en.json'

const { askGemini } = vi.hoisted(() => ({ askGemini: vi.fn() }))
vi.mock('../../src/lib/gemini', () => ({ askGemini }))

let ChatPanel
const originalScrollTo = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTo')
const venueQuestions = {
  en: 'where is the address of the event',
  zh: '活动的地址在哪里？',
  'zh-Hant': '活動的地址在哪裡？',
  ja: 'イベントの住所はどこですか？',
  ko: '행사 주소는 어디인가요?',
  vi: 'Địa chỉ của lễ hội ở đâu?',
  th: 'ที่อยู่ของงานเทศกาลอยู่ที่ไหน?',
}

function LanguageControls() {
  const { setLang } = useLang()
  return <button type="button" data-testid="switch-zh" onClick={() => setLang('zh')}>Switch to Chinese</button>
}

async function mount(lang = 'en') {
  const view = render(<MemoryRouter><LanguageProvider initial={lang}>
    <LanguageControls />
    <ChatPanel open setOpen={vi.fn()} />
  </LanguageProvider></MemoryRouter>)
  // Non-English dictionaries load before the provider commits its selection.
  // Await the actual locale, not the synchronous English loading frame.
  await waitFor(() => expect(document.documentElement.lang).toBe(LANGS.find(l => l.code === lang).htmlLang))
  return view
}

function send(question) {
  fireEvent.change(screen.getByTestId('chat-input'), { target: { value: question } })
  fireEvent.click(screen.getByTestId('chat-send'))
}

function pendingAnswer() {
  let resolve
  const promise = new Promise(done => { resolve = done })
  return { promise, resolve }
}

beforeAll(async () => {
  // The live mode is configured deliberately: venue assertions must prove that
  // an available provider cannot replace the source-of-truth street address.
  vi.stubEnv('VITE_CHAT_API_URL', 'https://chat.example.test/api/chat')
  Object.defineProperty(Element.prototype, 'scrollTo', { configurable: true, value: vi.fn() })
  ;({ default: ChatPanel } = await import('../../src/components/ChatPanel.jsx'))
})

beforeEach(() => {
  window.localStorage.clear()
  askGemini.mockReset()
  askGemini.mockResolvedValue('Live cultural answer.')
})

afterEach(() => cleanup())
afterAll(() => {
  vi.unstubAllEnvs()
  if (originalScrollTo) Object.defineProperty(Element.prototype, 'scrollTo', originalScrollTo)
  else delete Element.prototype.scrollTo
})

describe('chat panel source-of-truth and recovery', () => {
  it.each(LANG_CODES)('answers the %s event-address question locally even with live AI configured', async lang => {
    await mount(lang)
    send(venueQuestions[lang])
    await waitFor(() => expect(screen.getAllByTestId('chat-bot')).toHaveLength(2))
    const reply = screen.getAllByTestId('chat-bot').at(-1)
    expect(reply).toHaveTextContent(event.venue.address)
    expect(reply).toHaveTextContent(event.venue.name[lang])
    expect(reply).not.toHaveTextContent('Food Hall')
    expect(reply.querySelector('a')).toHaveAttribute('href', '/visit')
    expect(askGemini).not.toHaveBeenCalled()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('recovers from a live-provider error with local knowledge and lets the visitor ask again', async () => {
    askGemini.mockRejectedValueOnce(new Error('Private upstream diagnostic'))
    await mount()
    const question = 'How much are tickets?'
    const local = answer(question)
    send(question)
    await waitFor(() => expect(screen.getAllByTestId('chat-bot')).toHaveLength(2))
    const reply = screen.getAllByTestId('chat-bot').at(-1)
    expect(reply).toHaveTextContent(local.text.replace(/\s+/g, ' '))
    expect(reply).toHaveTextContent(en.chat.unavailable)
    expect(reply).not.toHaveTextContent('Private upstream diagnostic')
    expect(askGemini).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    send('Tell me about the history of Lunar New Year')
    await waitFor(() => expect(screen.getAllByTestId('chat-bot')).toHaveLength(3))
    expect(screen.getAllByTestId('chat-bot').at(-1)).toHaveTextContent('Live cultural answer.')
    expect(askGemini).toHaveBeenCalledTimes(2)
  })

  it('clears the conversation, draft input and subsequent provider history', async () => {
    await mount()
    const oldQuestion = 'Tell me about Chinese cultural history'
    send(oldQuestion)
    await waitFor(() => expect(screen.getAllByTestId('chat-bot')).toHaveLength(2))
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'Unsent draft' } })
    fireEvent.click(screen.getByTestId('chat-clear'))
    expect(screen.getAllByTestId('chat-bot')).toHaveLength(1)
    expect(screen.getByTestId('chat-bot')).toHaveTextContent(HELLO.en)
    expect(screen.queryByTestId('chat-user')).not.toBeInTheDocument()
    expect(screen.getByTestId('chat-input')).toHaveValue('')
    expect(screen.getByTestId('chat-suggestions')).toBeInTheDocument()
    send('Explain the Lantern Festival')
    await waitFor(() => expect(askGemini).toHaveBeenCalledTimes(2))
    expect(askGemini.mock.calls[1][1].history.map(m => m.text)).toEqual([HELLO.en])
    expect(JSON.stringify(askGemini.mock.calls[1][1].history)).not.toContain(oldQuestion)
  })

  it('aborts a pending answer on language switch and suppresses its late response', async () => {
    const deferred = pendingAnswer()
    askGemini.mockReturnValueOnce(deferred.promise)
    await mount()
    send('Explain the history of Lunar New Year')
    await waitFor(() => expect(askGemini).toHaveBeenCalledTimes(1))
    const signal = askGemini.mock.calls[0][1].signal
    expect(signal.aborted).toBe(false)
    fireEvent.click(screen.getByTestId('switch-zh'))
    await waitFor(() => expect(document.documentElement.lang).toBe(LANGS.find(l => l.code === 'zh').htmlLang))
    expect(signal.aborted).toBe(true)
    expect(screen.getByTestId('chat-bot')).toHaveTextContent(HELLO.zh)
    expect(screen.queryByTestId('chat-user')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    await act(async () => { deferred.resolve('STALE ENGLISH RESPONSE'); await deferred.promise })
    expect(screen.getAllByTestId('chat-bot')).toHaveLength(1)
    expect(screen.queryByText('STALE ENGLISH RESPONSE')).not.toBeInTheDocument()
    send(venueQuestions.zh)
    await waitFor(() => expect(screen.getAllByTestId('chat-bot')).toHaveLength(2))
    expect(screen.getAllByTestId('chat-bot').at(-1)).toHaveTextContent(event.venue.address)
    expect(askGemini).toHaveBeenCalledTimes(1)
  })

  it('aborts a pending answer on clear and does not append a late provider reply', async () => {
    const deferred = pendingAnswer()
    askGemini.mockReturnValueOnce(deferred.promise)
    await mount()
    send('Explain Chinese new year traditions')
    await waitFor(() => expect(askGemini).toHaveBeenCalledTimes(1))
    const signal = askGemini.mock.calls[0][1].signal
    fireEvent.click(screen.getByTestId('chat-clear'))
    expect(signal.aborted).toBe(true)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    await act(async () => { deferred.resolve('STALE CLEARED RESPONSE'); await deferred.promise })
    expect(screen.getAllByTestId('chat-bot')).toHaveLength(1)
    expect(screen.queryByText('STALE CLEARED RESPONSE')).not.toBeInTheDocument()
    expect(screen.getByTestId('chat-bot')).toHaveTextContent(HELLO.en)
  })
})
