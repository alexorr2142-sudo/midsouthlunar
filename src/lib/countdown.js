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

/** Build a Date for a local festival time. All festival times are US Central (UTC-6 in February). */
export function festivalDate(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}:00-06:00`)
}

export function getEventState(event, now = new Date()) {
  const t = now.getTime()
  const days = event.days.map((d) => ({
    id: d.id,
    open: festivalDate(d.date, d.open).getTime(),
    close: festivalDate(d.date, d.close).getTime(),
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
