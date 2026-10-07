import { describe, it, expect } from 'vitest'
import { answer, detectLang, mentionScore, CHAT_LANGS } from '../../src/lib/chat.js'
import { HELLO, SUGGESTIONS } from '../../src/lib/chatStrings.js'
import knowledge from '../../src/data/knowledge.json'

// Test case UT-7 (FR-13, chatbot): the assistant detects the language of a
// question from its script and answers in that language.
describe('UT-7 language detection and reply language', () => {
  it('detects script', () => {
    expect(detectLang('Where do I park?')).toBe('en')
    expect(detectLang('在哪里停车？')).toBe('zh')
    expect(detectLang('Đậu xe ở đâu?')).toBe('vi')
    expect(detectLang('주차는 어디에?')).toBe('ko')
    expect(detectLang('駐車場はどこですか？')).toBe('ja')
    expect(detectLang('dau xe o dau', 'vi')).toBe('vi') // no diacritics: follows the UI language
    expect(detectLang('漢字だけ', 'ja')).toBe('ja')
  })

  it('answers each suggested starter question in its own language with a real intent', () => {
    for (const lang of CHAT_LANGS) {
      for (const q of SUGGESTIONS[lang]) {
        const a = answer(q, { lang: 'en' })
        expect(a.lang, q).toBe(lang)
        expect(a.intent, q).not.toBe('fallback')
        expect(a.text.length, q).toBeGreaterThan(20)
      }
    }
  })

  it('has a greeting in every language', () => {
    for (const lang of CHAT_LANGS) expect(HELLO[lang]).toMatch(/Yang Yang|羊羊|양양|ヤンヤン/)
  })
})

// Test case UT-8 (FR-13): intents route to the right source of truth.
describe('UT-8 intents', () => {
  it('schedule questions list matching events with links', () => {
    const a = answer('What is on Saturday on the main stage?')
    expect(a.intent).toBe('schedule')
    expect(a.text).toContain('Sat Feb 6')
    expect(a.text).not.toContain('Fri Feb 5')
    expect(a.links[0].to).toContain('day=day2')
    expect(a.links[0].to).toContain('stage=main')
  })

  it('"when is X" finds a named event in English and Chinese', () => {
    expect(answer('when is the lion dance').text).toContain('Lion Dance')
    expect(answer('舞狮几点').text).toContain('舞狮')
  })

  it('vendor questions find vendors in any language, including Korean particles', () => {
    expect(answer('Where can I get dumplings?').text).toContain('Golden Wok')
    expect(answer('哪里有饺子？').text).toContain('金锅')
    expect(answer('Mua sủi cảo ở đâu?').text).toContain('Golden Wok')
    expect(answer('만두는 어디서 사요?').text).toContain('만두')
    expect(answer('餃子はどこで買えますか？').text).toContain('餃子')
  })

  it('tradition questions return the knowledge base in the question language', () => {
    const topics = ['red-envelope', 'goat-year', 'greetings', 'tet', 'seollal', 'japan-others']
    const qs = {
      'red-envelope': ['Why are red envelopes given?', '为什么要发红包？', 'Tại sao lì xì?', '세뱃돈은 왜 주나요?', 'なぜお年玉を渡すのですか？'],
      'goat-year': ['what year is it in the zodiac', '今年属什么', 'năm mùi là gì', '양띠', '未年について'],
      'greetings': ['how do you say happy new year in korean'],
      'tet': ['how does vietnam celebrate'],
      'seollal': ['how does korea celebrate'],
      'japan-others': ['does japan celebrate lunar new year'],
    }
    for (const id of topics) for (const q of qs[id]) {
      const a = answer(q)
      expect(a.intent, q).toBe(`topic:${id}`)
      expect(a.text, q).toBe(knowledge.topics.find((t) => t.id === id).answer[a.lang])
    }
  })

  it('"what is on now" uses the clock', () => {
    const open = answer("what's on now", { now: new Date('2027-02-06T15:05:00-06:00') })
    expect(open.intent).toBe('now')
    expect(open.text).toContain('Red Envelope')
    const closed = answer("what's on now", { now: new Date('2026-10-07T12:00:00-05:00') })
    expect(closed.text).toMatch(/not open right now/)
  })

  it('practical questions: parking, tickets, accessibility, weather, cash', () => {
    expect(answer('Where do I park?').intent).toBe('location')
    expect(answer('how much are tickets').intent).toBe('tickets')
    expect(answer('is it wheelchair accessible').intent).toBe('accessibility')
    expect(answer('what if it rains').intent).toBe('weather')
    expect(answer('can I pay cash').intent).toBe('payment')
    expect(answer('I want to volunteer').links[0].to).toContain('volunteer')
  })

  it('nonsense gets the fallback with helpful links, never a crash', () => {
    const a = answer('asdfgh qwerty')
    expect(a.intent).toBe('fallback')
    expect(a.links.map((l) => l.to)).toEqual(['/schedule', '/vendors'])
    expect(answer('').intent).toBe('greet')
  })

  it('mentionScore ignores Japanese particles and matches Korean stems', () => {
    expect(mentionScore('土曜日は何がありますか', { ja: '旧正月の風習トーク' })).toBe(0)
    expect(mentionScore('만두는 어디서 사요?', { ko: '골든 웍 만두집' })).toBe(1)
  })
})

// Knowledge base completeness: every topic has keywords and an answer in all five languages.
describe('knowledge base shape', () => {
  it('is complete in five languages', () => {
    for (const t of knowledge.topics) for (const l of CHAT_LANGS) {
      expect(t.keywords[l]?.length, `${t.id}.keywords.${l}`).toBeGreaterThan(0)
      expect(t.answer[l]?.length, `${t.id}.answer.${l}`).toBeGreaterThan(40)
    }
  })
})
