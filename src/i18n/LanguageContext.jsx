import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import en from './en.json'

/** Supported languages. Order is the order shown in the switcher. */
export const LANGS = [
  { code: 'en', label: 'English', htmlLang: 'en' },
  { code: 'zh', label: '简体中文', htmlLang: 'zh-Hans' },
  { code: 'zh-Hant', label: '繁體中文', htmlLang: 'zh-Hant' },
  { code: 'th', label: 'ไทย', htmlLang: 'th' },
  { code: 'vi', label: 'Tiếng Việt', htmlLang: 'vi' },
  { code: 'ko', label: '한국어', htmlLang: 'ko' },
  { code: 'ja', label: '日本語', htmlLang: 'ja' },
]
export const LANG_CODES = LANGS.map((l) => l.code)

// Only English belongs in the initial bundle. A locale is downloaded when it
// is selected or restored; both resolved dictionaries and in-flight requests
// are shared across providers so repeated selections do not refetch it.
const LOADERS = {
  zh: () => import('./zh.json'),
  'zh-Hant': () => import('./zh-Hant.json'),
  th: () => import('./th.json'),
  vi: () => import('./vi.json'),
  ko: () => import('./ko.json'),
  ja: () => import('./ja.json'),
}
const DICTIONARIES = new Map([['en', en]])
const LOADING = new Map()
const STORAGE_KEY = 'msl-lang'
const LanguageContext = createContext(null)

function loadDictionary(code) {
  if (DICTIONARIES.has(code)) return Promise.resolve(DICTIONARIES.get(code))
  if (!LOADING.has(code)) {
    const pending = LOADERS[code]().then(({ default: dict }) => {
      DICTIONARIES.set(code, dict)
      LOADING.delete(code)
      return dict
    }, (error) => {
      LOADING.delete(code)
      throw error
    })
    LOADING.set(code, pending)
  }
  return LOADING.get(code)
}

function readStoredLang() {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    if (LANG_CODES.includes(v)) return v
  } catch { /* storage unavailable */ }
  return 'en'
}

/** Look up a dotted key in a dictionary; returns undefined when missing. */
export function lookup(dict, key) {
  return key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), dict)
}

export function LanguageProvider({ children, initial }) {
  const [preferred] = useState(() => (LANG_CODES.includes(initial) ? initial : readStoredLang()))
  const [selection, setSelection] = useState({ lang: 'en', dict: en })
  const current = useRef(selection)
  const requested = useRef('en')
  const requestId = useRef(0)
  const mounted = useRef(false)
  const { lang, dict } = selection

  const setLang = useCallback(async (code) => {
    if (!LANG_CODES.includes(code)) return false
    requested.current = code
    const id = ++requestId.current
    try {
      const dictionary = DICTIONARIES.has(code) ? DICTIONARIES.get(code) : await loadDictionary(code)
      if (!mounted.current || id !== requestId.current) return false
      current.current = { lang: code, dict: dictionary }
      setSelection((previous) => previous.lang === code && previous.dict === dictionary ? previous : current.current)
      // Persist only a committed choice. While restoring another language,
      // rendering the English fallback must not erase the stored preference.
      try { window.localStorage.setItem(STORAGE_KEY, code) } catch { /* ignore */ }
      return true
    } catch {
      if (id === requestId.current) requested.current = current.current.lang
      return false // Keep the usable current dictionary if a chunk fails.
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    void setLang(preferred)
    return () => {
      mounted.current = false
      requestId.current += 1
    }
  }, [preferred, setLang])

  useEffect(() => {
    document.documentElement.lang = LANGS.find((l) => l.code === lang)?.htmlLang ?? 'en'
  }, [lang])

  /** Cycle from the most recently requested language, even during a load. */
  const toggle = useCallback(() => setLang(LANG_CODES[(LANG_CODES.indexOf(requested.current) + 1) % LANG_CODES.length]), [setLang])

  const value = useMemo(() => {
    /** t('schedule.results', {count: 3}) -> "3 events". Falls back to English, then the key. */
    const t = (key, vars) => {
      let s = lookup(dict, key)
      if (s === undefined) s = lookup(en, key)
      if (s === undefined) return key
      if (typeof s === 'string' && vars) {
        for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v))
      }
      return s
    }
    /** Pick the current language from a multilingual data object. */
    const pick = (obj) => (obj && typeof obj === 'object' ? obj[lang] ?? obj.en ?? '' : obj ?? '')
    return { lang, setLang, toggle, t, pick, langs: LANGS }
  }, [dict, lang, setLang, toggle])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider')
  return ctx
}
