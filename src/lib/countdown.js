/**
 * Pure event-state logic for the countdown. No React, no Date.now() calls
 * inside (the caller passes `now`) so it is easy to unit test.
 *
 * States:
 *   before  - festival has not started
 *   open    - doors are open on one of the festival days
 *   between - after day 1 closes and before day 2 opens
 *   after   - festival is over
 */

const DEFAULT_TZ = 'America/Chicago'

/**
 * Offset (minutes east of UTC) of `tz` at the given UTC instant, via Intl.
 * Lets festival times be written as plain local times in event.json without
 * caring whether the date falls in standard or daylight time.
 */
export function tzOffsetMinutes(utcDate, tz = DEFAULT_TZ) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(utcDate)
  const v = Object.fromEntries(parts.filter((p) => p.type !== 'literal').map((p) => [p.type, Number(p.value)]))
  const asUtc = Date.UTC(v.year, v.month - 1, v.day, v.hour, v.minute, v.second)
  return Math.round((asUtc - utcDate.getTime()) / 60000)
}

/** Build a Date for a local festival time ("2027-02-05", "10:00") in the festival's time zone. */
export function festivalDate(dateStr, timeStr, tz = DEFAULT_TZ) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [hh, mm] = timeStr.split(':').map(Number)
  const guess = Date.UTC(y, m - 1, d, hh, mm, 0)
  // Two passes handle the rare case where the guess straddles a DST change.
  let offset = tzOffsetMinutes(new Date(guess), tz)
  offset = tzOffsetMinutes(new Date(guess - offset * 60000), tz)
  return new Date(guess - offset * 60000)
}

export function getEventState(event, now = new Date()) {
  const t = now.getTime()
  const tz = event.timezone || DEFAULT_TZ
  const days = event.days.map((d) => ({
    id: d.id,
    open: festivalDate(d.date, d.open, tz).getTime(),
    close: festivalDate(d.date, d.close, tz).getTime(),
  }))
  const first = days[0]
  const last = days[days.length - 1]

  if (t < first.open) return { state: 'before', msUntil: first.open - t }
  if (t >= last.close) return { state: 'after', msUntil: 0 }
  const openDay = days.find((d) => t >= d.open && t < d.close)
  if (openDay) return { state: 'open', day: openDay.id, msUntil: openDay.close - t }
  const next = days.find((d) => t < d.open)
  return { state: 'between', nextDay: next.id, msUntil: next.open - t }
}

/** Split milliseconds into whole days/hours/minutes/seconds. Negative input clamps to zero. */
export function splitDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}
