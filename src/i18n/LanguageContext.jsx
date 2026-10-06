import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import en from './en.json'
import zh from './zh.json'

const DICT = { en, zh }
const STORAGE_KEY = 'msl-lang'
const LanguageContext = createContext(null)

function readStoredLang() {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    if (v === 'en' || v === 'zh') return v
  } catch { /* storage unavailable */ }
  return 'en'
}

/** Look up a dotted key in a dictionary; returns undefined when missing. */
export function lookup(dict, key) {
  return key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), dict)
}

export function LanguageProvider({ children, initial }) {
  const [lang, setLang] = useState(() => initial || readStoredLang())

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
    try { window.localStorage.setItem(STORAGE_KEY, lang) } catch { /* ignore */ }
  }, [lang])

  const toggle = useCallback(() => setLang((l) => (l === 'en' ? 'zh' : 'en')), [])

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
    /** Pick the current language from a bilingual {en, zh} data object. */
    const pick = (obj) => (obj && typeof obj === 'object' ? obj[lang] ?? obj.en ?? '' : obj ?? '')
    return { lang, setLang, toggle, t, pick }
  }, [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider')
  return ctx
}
