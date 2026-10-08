/**
 * Add-to-calendar helpers. Produces a Google Calendar link and an .ics file
 * (for Apple Calendar and Outlook) from festival dates. Pure functions.
 */
import { festivalDate } from './countdown.js'

function pad(n) { return String(n).padStart(2, '0') }

/** Format a Date as an iCalendar UTC timestamp: 20270205T160000Z */
export function toIcsUtc(date) {
  return (
    date.getUTCFullYear() + pad(date.getUTCMonth() + 1) + pad(date.getUTCDate()) +
    'T' + pad(date.getUTCHours()) + pad(date.getUTCMinutes()) + pad(date.getUTCSeconds()) + 'Z'
  )
}

/** Escape text for an iCalendar property value. */
export function icsEscape(s) {
  return String(s ?? '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

/** Fold UTF-8 content lines at 75 octets without splitting a character. */
export function foldIcsLine(line) {
  const parts = []
  let part = '', bytes = 0
  for (const character of line) {
    const size = new TextEncoder().encode(character).length
    if (bytes + size > 75) { parts.push(part); part = ' '; bytes = 1 }
    part += character; bytes += size
  }
  parts.push(part)
  return parts.join('\r\n')
}

/** One file can contain each festival day's separate opening window. */
export function buildIcs(calEvent, { now = new Date() } = {}) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Mid-South Lunar New Year//Festival//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH']
  for (const {uid,title,description='',location='',start,end} of calEvent.occurrences ?? [calEvent]) {
    lines.push('BEGIN:VEVENT', `UID:${icsEscape(uid)}@midsouthlunar.org`, `DTSTAMP:${toIcsUtc(now)}`, `DTSTART:${toIcsUtc(start)}`, `DTEND:${toIcsUtc(end)}`, `SUMMARY:${icsEscape(title)}`, `DESCRIPTION:${icsEscape(description)}`, `LOCATION:${icsEscape(location)}`, 'END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.map(foldIcsLine).join('\r\n') + '\r\n'
}

export function googleCalendarUrl({ title, description = '', location = '', start, end }) {
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${toIcsUtc(start)}/${toIcsUtc(end)}`,
    details: description,
    location,
    ctz: 'America/Chicago',
  })
  return `https://calendar.google.com/calendar/render?${p.toString()}`
}

/** Calendar details for the whole festival. */
export function festivalCalendarEvent(event, lang = 'en') {
  const occurrences = event.days.map(day => ({
    uid: `festival-${event.year}-${day.id}`,
    title: event.name[lang] ?? event.name.en,
    description: `${event.venue.name[lang] ?? event.venue.name.en}. midsouthlunar.org`,
    location: event.venue.address,
    calendarLabel: day.label[lang] ?? day.label.en,
    start: festivalDate(day.date, day.open, event.timezone),
    end: festivalDate(day.date, day.close, event.timezone),
  }))
  return { ...occurrences[0], uid: `festival-${event.year}`, occurrences }
}

/** Calendar details for a single schedule item. */
export function itemCalendarEvent(event, item, lang = 'en') {
  const day = event.days.find((d) => d.id === item.day)
  const stage = event.stages[item.stage]
  return {
    uid: `item-${item.id}`,
    title: item.title[lang] ?? item.title.en,
    description: `${item.description?.[lang] ?? item.description?.en ?? ''}\n${stage?.[lang] ?? stage?.en ?? ''}`.trim(),
    location: event.venue.address,
    start: festivalDate(day.date, item.start, event.timezone),
    end: festivalDate(day.date, item.end, event.timezone),
  }
}

/** Trigger a download of an .ics file in the browser. */
export function downloadIcs(filename, body) {
  const blob = new Blob([body], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
