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

/** Build an .ics file body for one event. */
export function buildIcs({ uid, title, description = '', location = '', start, end }) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mid-South Lunar New Year//Festival//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}@midsouthlunar.org`,
    `DTSTAMP:${toIcsUtc(new Date(0))}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${icsEscape(title)}`,
    `DESCRIPTION:${icsEscape(description)}`,
    `LOCATION:${icsEscape(location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.join('\r\n') + '\r\n'
}

export function googleCalendarUrl({ title, description = '', location = '', start, end }) {
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${toIcsUtc(start)}/${toIcsUtc(end)}`,
    details: description,
    location,
  })
  return `https://calendar.google.com/calendar/render?${p.toString()}`
}

/** Calendar details for the whole festival. */
export function festivalCalendarEvent(event, lang = 'en') {
  const first = event.days[0]
  const last = event.days[event.days.length - 1]
  return {
    uid: `festival-${event.year}`,
    title: event.name[lang] ?? event.name.en,
    description: `${event.venue.name[lang] ?? event.venue.name.en}. midsouthlunar.org`,
    location: event.venue.address,
    start: festivalDate(first.date, first.open),
    end: festivalDate(last.date, last.close),
  }
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
    start: festivalDate(day.date, item.start),
    end: festivalDate(day.date, item.end),
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
