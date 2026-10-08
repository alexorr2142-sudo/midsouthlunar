import { describe,it,expect } from 'vitest'
import { externalLink } from '../../src/lib/links'
describe('external ticket and application destinations',()=>{
  it('accepts specific Eventbrite listings and custom event domains',()=>{
    expect(externalLink('https://www.eventbrite.com/e/festival-tickets-123456789?aff=site','tickets')).toBeTruthy()
    expect(externalLink('https://midsouthlunar2027.eventbrite.com','tickets')).toBeTruthy()
  })
  it.each(['https://www.eventbrite.com/','https://www.eventbrite.com/signin','https://www.festival.eventbrite.com/','http://www.eventbrite.com/e/festival-tickets-123','https://eventbrite.com.evil.test/e/festival-tickets-123','https://user:secret@www.eventbrite.com/e/festival-tickets-123','https://www.eventbrite.com:8443/e/festival-tickets-123','javascript:alert(1)'])('rejects %s',value=>expect(externalLink(value,'tickets')).toBeNull())
  it('requires a specific Google Form rather than a service homepage',()=>{
    expect(externalLink('https://forms.gle/','vendorForm')).toBeNull()
    expect(externalLink('https://forms.gle/abc123','vendorForm')).toBeTruthy()
    expect(externalLink('https://docs.google.com/forms/d/e/abc123/viewform','volunteerForm')).toBeTruthy()
    expect(externalLink('https://docs.google.com/spreadsheets/d/abc123','vendorForm')).toBeNull()
  })
})
