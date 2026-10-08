import { useEffect, useRef, useState } from 'react'
import { buildIcs, downloadIcs, googleCalendarUrl } from '../lib/calendar'
import Icon from './Icon'

/**
 * Small menu with two choices: Google Calendar (link) and .ics download
 * (Apple Calendar, Outlook). `calEvent` comes from festivalCalendarEvent or
 * itemCalendarEvent in lib/calendar.js.
 */
export default function AddToCalendar({ calEvent, label, className = 'btn-outline', size = 'md' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [open])

  const small = size === 'sm' ? '!px-3 !py-1 text-sm' : ''
  return (
    <div ref={ref} className="relative inline-block">
      <button type="button" className={`${className} ${small}`} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} data-testid="add-to-calendar">
        <Icon name="calendar" className="h-4 w-4" /> {label}
      </button>
      {open && (
        <div role="menu" className="absolute z-30 mt-2 min-w-48 rounded-xl bg-white p-1 text-ink shadow-lg ring-1 ring-red/15">
          {(calEvent.occurrences ?? [calEvent]).map(record => <a key={record.uid} role="menuitem" href={googleCalendarUrl(record)} target="_blank" rel="noopener noreferrer" className="block rounded-lg px-3 py-2 hover:bg-cream" onClick={() => setOpen(false)}>Google Calendar{record.calendarLabel ? ` · ${record.calendarLabel}` : ''}</a>)}
          <button role="menuitem" type="button" className="block w-full text-left rounded-lg px-3 py-2 hover:bg-cream"
            onClick={() => { downloadIcs(`${calEvent.uid}.ics`, buildIcs(calEvent)); setOpen(false) }}>
            Apple / Outlook (.ics)
          </button>
        </div>
      )}
    </div>
  )
}
