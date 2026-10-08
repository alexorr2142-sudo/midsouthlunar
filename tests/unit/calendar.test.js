import { describe, it, expect } from 'vitest'
import { buildIcs, googleCalendarUrl, festivalCalendarEvent, itemCalendarEvent, icsEscape } from '../../src/lib/calendar.js'
import event from '../../src/data/event.json'
import schedule from '../../src/data/schedule.json'

// Test case UT-5 (from FR-9): calendar output is valid and carries the right times.
describe('UT-5 calendar export (FR-9)', () => {
  it('builds a festival .ics with CRLF line endings and UTC times', () => {
    const ics = buildIcs(festivalCalendarEvent(event, 'en'))
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
    expect(ics).toContain('DTSTART:20270205T160000Z')
    expect(ics).toContain('DTEND:20270206T030000Z')
    expect(ics).toContain('DTSTART:20270206T160000Z')
    expect(ics).toContain('DTEND:20270207T030000Z')
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2)
    expect(ics).toContain('SUMMARY:Mid-South Lunar New Year Festival')
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
  })

  it('escapes commas and semicolons in text fields', () => {
    expect(icsEscape('a, b; c\nd')).toBe('a\\, b\\; c\\nd')
    const ics = buildIcs(festivalCalendarEvent(event, 'en'))
    expect(ics).toContain('LOCATION:7777 Walnut Grove Rd\\, Memphis\\, TN 38120')
  })

  it('builds a Google Calendar link for a single schedule item in Chinese', () => {
    const item = schedule.items.find((i) => i.id === 'd1-opening')
    const url = new URL(googleCalendarUrl(itemCalendarEvent(event, item, 'zh')))
    expect(url.searchParams.get('text')).toBe('开幕式与舞龙表演')
    expect(url.searchParams.get('dates')).toBe('20270205T160000Z/20270205T163000Z')
  })
})

 it('folds long multilingual lines at 75 UTF-8 octets without breaking characters', () => {
    const record = itemCalendarEvent(event, schedule.items[0], 'zh')
    record.description = '新年文化與慶典。'.repeat(35)
    const ics = buildIcs(record)
    for (const line of ics.split('\r\n')) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75)
    expect(ics.replace(/\r\n /g, '')).toContain(record.description)
  })
