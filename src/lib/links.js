/** Event/application destinations only; provider homepages are not registrations. */
export function externalLink(value, kind) {
  if (!value) return null
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null
    const host = url.hostname.toLowerCase()
    if (kind === 'tickets') {
      const standard = ['eventbrite.com', 'www.eventbrite.com'].includes(host)
      const custom = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.eventbrite\.com$/.test(host) && !standard
      const listing = /^\/e\/(?:[^/]+-tickets-\d+|\d+)\/?$/.test(url.pathname)
      if (!standard && !custom || standard && !listing || custom && url.pathname !== '/' && !listing) return null
    } else if (['vendorForm', 'volunteerForm'].includes(kind)) {
      const short = host === 'forms.gle' && /^\/[a-zA-Z0-9_-]+\/?$/.test(url.pathname)
      const form = host === 'docs.google.com' && /^\/forms\/d\/(?:e\/)?[a-zA-Z0-9_-]+\/viewform\/?$/.test(url.pathname)
      if (!short && !form) return null
    } else return null
    return url.href
  } catch { return null }
}
