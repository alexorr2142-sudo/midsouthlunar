# Comparison improvements — October 8, 2026

Target: `alexorr2142-sudo/midsouthlunar`, starting at `ad25bb7`. Comparison reference: the earlier Lunar New Year 2027 prototype from this chat. Work is on `codex/fix-chatbot-event-address`. The repository's artwork, six-page structure, event facts and preliminary schedule/vendor data remain the foundation.

## Address defect

The reported question, “where is the address of the event”, selected a Friday cooking activity in the Food Hall. Substring matching treated “eve” inside “event” as New Year's Eve; broad activity matching then took precedence over the venue.

Latin keyword matching now checks word boundaries, and festival-address/location questions read `event.venue.name` and `event.venue.address` before activity lookup. The result is Agricenter International, **7777 Walnut Grove Rd, Memphis, TN 38120**, with a Tickets & Visit link. This deterministic answer also bypasses optional live AI. General venue questions in Japanese, Korean and Vietnamese are covered; named workshops and vendor lookups still work.

## Improvements carried over from the comparison

| Area | Result |
|---|---|
| Languages | English default plus Simplified Chinese, Traditional Chinese, Japanese, Korean, Thai and Vietnamese. All UI/data/chat text has the seven-language shape. Translations remain drafts for native-speaker review. |
| Search | Vendor search checks every translated name and description, as well as booth numbers. |
| Chat | Clear conversation; bounded input/history; visible live-service fallback; cancellation and suppression of stale answers after clear/language changes; preliminary schedule/vendor notice. |
| AI connection | Public frontend endpoint only. Server credentials stay in a separate Node service with exact-origin checks, timeouts, request-size limits, rate/concurrency caps and website grounding. See `CHAT_SETUP.md`. |
| Tickets and applications | Provider homepages are replaced with pending states. Configured links must be specific HTTPS Eventbrite listings or Google Forms. No checkout API or payments run on this website. |
| Calendar | Two separate 10 AM–9 PM daily entries; Google Calendar links per day; one .ics containing both days; current creation stamp and UTF-8 line folding. |
| Navigation | Scroll positioning runs after lazy route content commits, including direct section links. |

## Verification and handoff

Automated tests cover multilingual venue intent, live-mode venue bypass, provider failure, stale request cancellation, localized search, dictionary completeness, daily calendar windows, link validation and the server contract. Browser checks cover six pages in seven languages at 320, 768 and 1440 pixels, with route headings and horizontal overflow checked after content loads. The exact reported question is also verified visibly in the browser. See `COMPARISON_TEST_REPORT.md` for final results and scope.

The 2027 Eventbrite event URL and actual application form URLs are still required. No ticket checkout transaction was performed. Live provider access is prepared but no real API account/key was connected; provider-response tests use mocks. A separate MCCC-controlled HTTPS server and account are required for general live AI answers. Local knowledge mode works now.

The tested changes are prepared for review on a dedicated GitHub branch and draft pull request. Merging to `main` triggers the repository's Pages deployment. The local preview demonstrates the build before that deployment.
