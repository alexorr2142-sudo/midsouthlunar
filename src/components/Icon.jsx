/**
 * Original Lunar New Year icon set, drawn as 24x24 SVG paths. All icons use
 * currentColor so they take the text color of wherever they sit; a few add a
 * gold accent via the `accent` class (set by the parent through CSS vars).
 *
 * Usage: <Icon name="lantern" className="h-6 w-6 text-red" />
 * Decorative by default (aria-hidden). Pass `label` for a meaningful icon.
 */
const GOLD = 'var(--color-gold)'

const ICONS = {
  lantern: (
    <>
      <rect x="9" y="2" width="6" height="2.5" rx="0.8" fill={GOLD} />
      <path d="M6.5 7.5c0-1.4 2.5-2.5 5.5-2.5s5.5 1.1 5.5 2.5v7c0 1.4-2.5 2.5-5.5 2.5S6.5 15.9 6.5 14.5z" />
      <path d="M9.5 5.4v11.2M14.5 5.4v11.2" stroke={GOLD} strokeWidth="0.9" fill="none" />
      <rect x="9.5" y="17.2" width="5" height="1.6" rx="0.6" fill={GOLD} />
      <path d="M11 19h2v3h-2z" fill={GOLD} />
    </>
  ),
  dumpling: (
    <>
      <path d="M3.5 14.5c0-4 4-7.5 8.5-7.5s8.5 3.5 8.5 7.5c0 2-1 3-3 3h-11c-2 0-3-1-3-3z" />
      <path d="M6 9.5c1-1.2 2-1.5 3-1.2m-1.5 2c1-1 2-1.2 3-.8m2.5-.3c1-.4 2-.1 3 .9m-1.5-2.2c1 .3 2 .9 2.6 1.9" stroke={GOLD} strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M4.5 19.5h15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  dragon: (
    <>
      {/* serpentine body */}
      <path d="M2.5 17.5c2.5 0 3.3-2.2 5.3-2.2s2.8 2.2 5 2.2 2.8-2.2 4.8-2.2c1.6 0 2.4 1.2 3.4 1.8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M2.5 17.5c2.5 0 3.3-2.2 5.3-2.2s2.8 2.2 5 2.2 2.8-2.2 4.8-2.2" fill="none" stroke={GOLD} strokeWidth="1" strokeLinecap="round" strokeDasharray="1.2 1.8" />
      {/* head */}
      <path d="M13.5 4.5c3.4-.6 6.5 1 7.5 4 .5 1.6.1 3-1 3.6l-1.8-.4-1.2 1.4c-1.6-.1-3-.7-4-1.8l-.6-2.1-1.7-.2c-.4-2 .7-3.9 2.8-4.5z" />
      <circle cx="17.3" cy="7.6" r="1" fill={GOLD} />
      {/* horn and whisker */}
      <path d="M15 4.3 13.8 1.5M17.5 4.2l.9-2.6" stroke={GOLD} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M20.5 10.5c1.2.6 2 1.8 2.3 3.2" stroke={GOLD} strokeWidth="1.1" strokeLinecap="round" fill="none" />
      <path d="M11.2 8.8c-1.4.2-2.6-.4-3.3-1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
    </>
  ),
  lion: (
    <>
      <path d="M5 11a7 7 0 0 1 14 0v4.5c0 1.5-1 2.5-2.5 2.5h-9C6 18 5 17 5 15.5z" />
      <path d="M5.3 8.5 2.8 6.2m15.9 2.3 2.5-2.3M7 5.8 5.6 3.4m11.4 2.4 1.4-2.4M12 4.2V2" stroke={GOLD} strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="9.3" cy="11" r="1.2" fill={GOLD} />
      <circle cx="14.7" cy="11" r="1.2" fill={GOLD} />
      <path d="M9.5 14.6c1 1.2 4 1.2 5 0" stroke={GOLD} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M7 18v3m10-3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  envelope: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <path d="M5 8.5l7 4.5 7-4.5" stroke={GOLD} strokeWidth="1.2" fill="none" />
      <circle cx="12" cy="15.5" r="2.4" fill={GOLD} />
      <path d="M12 14v3m-1.5-1.5h3" stroke="currentColor" strokeWidth="0.9" />
    </>
  ),
  brush: (
    <>
      <path d="M14.5 3.5 20.5 9.5 10 20 4 14z" />
      <path d="M4 14l-1.5 6.5L9 19" fill={GOLD} />
      <path d="M12.5 5.5l6 6" stroke={GOLD} strokeWidth="1.1" />
    </>
  ),
  drum: (
    <>
      <ellipse cx="12" cy="7" rx="8" ry="3" fill={GOLD} />
      <path d="M4 7v9c0 1.7 3.6 3 8 3s8-1.3 8-3V7c0 1.7-3.6 3-8 3S4 8.7 4 7z" />
      <path d="M7 10.5v7m10-7v7" stroke={GOLD} strokeWidth="1" />
      <path d="M2.5 3.5 6 7m15.5-3.5L18 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  tea: (
    <>
      <path d="M4 9h12v5a6 6 0 0 1-12 0z" />
      <path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <path d="M7 6.5c0-1 .8-1 .8-2M10 6.5c0-1 .8-1 .8-2M13 6.5c0-1 .8-1 .8-2" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M3 21h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  firecracker: (
    <>
      <rect x="9" y="6" width="6" height="13" rx="1.2" />
      <path d="M9 9.5h6M9 15.5h6" stroke={GOLD} strokeWidth="1.1" />
      <path d="M12 6V3.5" stroke={GOLD} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M5 4l1.5 1.5M19 4l-1.5 1.5M12 1v1M4 9h2m12 0h2" stroke={GOLD} strokeWidth="1.3" strokeLinecap="round" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="9" fill={GOLD} />
      <rect x="9" y="9" width="6" height="6" fill="currentColor" />
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </>
  ),
  blossom: (
    <>
      <circle cx="12" cy="6.5" r="3" /><circle cx="17.2" cy="10.3" r="3" /><circle cx="15.2" cy="16.5" r="3" /><circle cx="8.8" cy="16.5" r="3" /><circle cx="6.8" cy="10.3" r="3" />
      <circle cx="12" cy="12" r="2.2" fill={GOLD} />
    </>
  ),
  cloud: (
    <>
      <path d="M6 17a3.5 3.5 0 0 1-.5-7 5 5 0 0 1 9.6-1.4A4 4 0 0 1 18.5 17z" />
      <path d="M8 13.5a2 2 0 0 1 2-2m3 0a2 2 0 0 1 2 2" stroke={GOLD} strokeWidth="1" fill="none" strokeLinecap="round" />
    </>
  ),
  goat: (
    <>
      <path d="M7.5 9.5C6 8.5 4.8 6.8 5 4.5c1.6.3 2.8 1.6 3.3 3.2M16.5 9.5c1.5-1 2.7-2.7 2.5-5-1.6.3-2.8 1.6-3.3 3.2" fill={GOLD} />
      <path d="M12 7c3.3 0 5.5 2.2 5.5 5.2 0 1.8-.8 3-1.6 3.9l.3 2.4c.1.7-.5 1.2-1.1 1l-1.6-.7c-.5.2-1 .2-1.5.2s-1 0-1.5-.2l-1.6.7c-.6.2-1.2-.3-1.1-1l.3-2.4c-.8-.9-1.6-2.1-1.6-3.9C6.5 9.2 8.7 7 12 7z" />
      <circle cx="10" cy="12" r="0.9" fill={GOLD} /><circle cx="14" cy="12" r="0.9" fill={GOLD} />
      <path d="M11 15.2c.6.5 1.4.5 2 0" stroke={GOLD} strokeWidth="1" fill="none" strokeLinecap="round" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9.5h18" stroke={GOLD} strokeWidth="1.2" />
      <path d="M8 3v4m8-4v4" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" />
      <rect x="7" y="12" width="3" height="3" rx="0.5" fill={GOLD} />
    </>
  ),
  ticket: (
    <>
      <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2.5a1.5 1.5 0 0 0 0 3V16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2.5a1.5 1.5 0 0 0 0-3z" />
      <path d="M9 7v10" stroke={GOLD} strokeWidth="1.2" strokeDasharray="1.5 1.5" />
      <circle cx="15" cy="12" r="1.6" fill={GOLD} />
    </>
  ),
  pin: (
    <>
      <path d="M12 22s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z" />
      <circle cx="12" cy="10" r="2.8" fill={GOLD} />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  chat: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A2.5 2.5 0 0 1 4 13.5z" />
      <circle cx="8.5" cy="9.5" r="1.1" fill={GOLD} /><circle cx="12" cy="9.5" r="1.1" fill={GOLD} /><circle cx="15.5" cy="9.5" r="1.1" fill={GOLD} />
    </>
  ),
  send: <path d="M3 11.5 20.5 3.5 15 20.5l-2.8-7.2z" />,
  close: <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M15.5 15.5 21 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  fan: (
    <>
      <path d="M12 20 3.5 9.5A11 11 0 0 1 20.5 9.5z" />
      <path d="M12 20 8 8.5M12 20l4-11.5M12 20V7.5" stroke={GOLD} strokeWidth="1" />
      <circle cx="12" cy="20" r="1.5" fill={GOLD} />
    </>
  ),
  knot: (
    <>
      <path d="M12 3l4.5 4.5L12 12 7.5 7.5zM12 12l4.5 4.5L12 21l-4.5-4.5zM7.5 7.5 3 12l4.5 4.5L12 12zM16.5 7.5 21 12l-4.5 4.5L12 12z" />
      <circle cx="12" cy="12" r="1.6" fill={GOLD} />
    </>
  ),
  scroll: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="1.5" />
      <rect x="4" y="2" width="16" height="2.4" rx="1.2" fill={GOLD} />
      <rect x="4" y="19.6" width="16" height="2.4" rx="1.2" fill={GOLD} />
      <path d="M9.5 8h5M9.5 11.5h5M9.5 15h5" stroke={GOLD} strokeWidth="1" strokeLinecap="round" />
    </>
  ),
  hand: (
    <>
      <path d="M7 11V5.5a1.5 1.5 0 0 1 3 0V11m0-7a1.5 1.5 0 0 1 3 0v7m0-5.5a1.5 1.5 0 0 1 3 0V11m0-2.5a1.5 1.5 0 0 1 3 0V15a7 7 0 0 1-14 0v-2.5a1.5 1.5 0 0 1 3 0" />
      <path d="M12 15.5v3" stroke={GOLD} strokeWidth="1.3" strokeLinecap="round" />
    </>
  ),
  handshake: (
    <>
      <path d="M2.5 9.5 7 6l4.5 1.5L15.5 6 21.5 9.5l-3 6-2 1.5-4.5 2.5-5.5-3.5-4-6z" />
      <path d="M11.5 7.5 8 11l2 1.5 3-2.5 4.5 4" stroke={GOLD} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  shop: (
    <>
      <path d="M3 9l1.5-5h15L21 9H3z" />
      <path d="M3 9c0 1.5 1.3 2.5 3 2.5s3-1 3-2.5c0 1.5 1.3 2.5 3 2.5s3-1 3-2.5c0 1.5 1.3 2.5 3 2.5s3-1 3-2.5" fill={GOLD} />
      <path d="M5 11.5V21h14v-9.5" />
      <rect x="10" y="15" width="4" height="6" fill={GOLD} />
    </>
  ),
  map: (
    <>
      <path d="M3 6.5 9 4l6 2.5 6-2.5v13l-6 2.5-6-2.5-6 2.5z" />
      <path d="M9 4v15M15 6.5v13" stroke={GOLD} strokeWidth="1.1" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" />
      <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" fill={GOLD} />
    </>
  ),
  hourglass: (
    <>
      <path d="M6 3h12v2.5c0 2.5-2.5 4.5-4 6.5 1.5 2 4 4 4 6.5V21H6v-2.5c0-2.5 2.5-4.5 4-6.5-1.5-2-4-4-4-6.5z" />
      <path d="M9 19h6l-3-4z" fill={GOLD} />
    </>
  ),
}

export const ICON_NAMES = Object.keys(ICONS)

export default function Icon({ name, className = 'h-5 w-5', label, ...rest }) {
  const body = ICONS[name]
  if (!body) return null
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`inline-block shrink-0 ${className}`}
      role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : 'true'} focusable="false" {...rest}>
      {body}
    </svg>
  )
}
