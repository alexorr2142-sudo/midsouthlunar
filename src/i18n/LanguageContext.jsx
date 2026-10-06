import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import en from './en.json'
import zh from './zh.json'
import vi from './vi.json'
import ko from './ko.json'
import ja from './ja.json'

/** Supported languages. Order is the order shown in the switcher. */
export const LANGS = [
  { code: 'en', label: 'English', htmlLang: 'en' },
  { code: 'zh', label: '中文', htmlLang: 'zh-CN' },
  { code: 'vi', label: 'Tiếng Việt', htmlLang: 'vi' },
  { code: 'ko', label: '한국어', htmlLang: 'ko' },
  { code: 'ja', label: '日本語', htmlLang: 'ja' },
]
export const LANG_CODES = LANGS.map((l) => l.code)
const DICT = { en, zh, vi, ko, ja }
const STORAGE_KEY = 'msl-lang'
const LanguageContext = createContext(null)

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
  const [lang, setLangState] = useState(() => (LANG_CODES.includes(initial) ? initial : readStoredLang()))

  useEffect(() => {
    document.documentElement.lang = LANGS.find((l) => l.code === lang)?.htmlLang ?? 'en'
    try { window.localStorage.setItem(STORAGE_KEY, lang) } catch { /* ignore */ }
  }, [lang])

  const setLang = useCallback((code) => { if (LANG_CODES.includes(code)) setLangState(code) }, [])
  /** Cycle to the next language (kept for keyboard users and tests). */
  const toggle = useCallback(() => setLangState((l) => LANG_CODES[(LANG_CODES.indexOf(l) + 1) % LANG_CODES.length]), [])

  const value = useMemo(() => {
    const dict = DICT[lang]
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
    /** Pick the current language from a multilingual {en, zh, vi, ko, ja} data object. */
    const pick = (obj) => (obj && typeof obj === 'object' ? obj[lang] ?? obj.en ?? '' : obj ?? '')
    return { lang, setLang, toggle, t, pick, langs: LANGS }
  }, [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider')
  return ctx
}
