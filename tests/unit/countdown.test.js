import { describe, it, expect } from 'vitest'
import { getEventState, splitDuration, festivalDate } from '../../src/lib/countdown.js'
import event from '../../src/data/event.json'

// Test case UT-1 (from FR-3): the countdown reports the correct state at the
// boundaries of the festival: before, open, between days, after.
describe('UT-1 getEventState boundaries (FR-3)', () => {
  const at = (iso) => getEventState(event, new Date(iso))

  it('is "before" one second before doors open on Feb 5', () => {
    const s = at('2027-02-05T09:59:59-06:00')
    expect(s.state).toBe('before')
    expect(s.msUntil).toBe(1000)
  })

  it('is "open" the moment doors open on Feb 5', () => {
    expect(at('2027-02-05T10:00:00-06:00')).toMatchObject({ state: 'open', day: 'day1' })
  })

  it('is "between" after day 1 closes and before day 2 opens', () => {
    expect(at('2027-02-05T21:00:00-06:00')).toMatchObject({ state: 'between', nextDay: 'day2' })
    expect(at('2027-02-06T03:00:00-06:00')).toMatchObject({ state: 'between', nextDay: 'day2' })
  })

  it('is "open" on day 2 and "after" once day 2 closes', () => {
    expect(at('2027-02-06T15:00:00-06:00')).toMatchObject({ state: 'open', day: 'day2' })
    expect(at('2027-02-06T21:00:00-06:00').state).toBe('after')
    expect(at('2027-03-01T00:00:00-06:00').state).toBe('after')
  })

  // Validation note: the AI-drafted version of this case expected 121 days,
  // copied from a screenshot taken at 5 PM. From 10:00 CDT on Oct 6 to 10:00
  // CST on Feb 5 is 122 days plus the 1-hour DST change. Expectation corrected.
  it('counts down 122 days and 1 hour from Oct 6 2026 at 10:00 CDT', () => {
    const d = splitDuration(at('2026-10-06T10:00:00-05:00').msUntil)
    expect(d.days).toBe(122)
    expect(d.hours).toBe(1)
  })
})

// Test case UT-2 (from FR-3, HO-10): dates are built in the festival time zone,
// not a hard-coded offset, so the data file can be reused in any month.
describe('UT-2 festivalDate is time-zone aware (FR-3, HO-10)', () => {
  it('resolves February (standard time) to UTC-6', () => {
    expect(festivalDate('2027-02-05', '10:00', 'America/Chicago').toISOString()).toBe('2027-02-05T16:00:00.000Z')
  })
  it('handles daylight time: July resolves to UTC-5', () => {
    expect(festivalDate('2027-07-04', '10:00', 'America/Chicago').toISOString()).toBe('2027-07-04T15:00:00.000Z')
  })
  it('splitDuration never goes negative', () => {
    expect(splitDuration(-5000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    expect(splitDuration(90061000)).toEqual({ days: 1, hours: 1, minutes: 1, seconds: 1 })
  })
})
