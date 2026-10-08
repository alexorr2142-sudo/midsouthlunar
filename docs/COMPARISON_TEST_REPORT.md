# Comparison verification — October 8, 2026

Target repository: `alexorr2142-sudo/midsouthlunar`. Tested local source starts from `ad25bb7`; changes are on `codex/fix-chatbot-event-address`.

| Check | Result |
|---|---|
| `npm run test:unit` | 103 passing tests across 8 files. Includes all seven venue languages, live-mode venue bypass, clear/language cancellation, provider fallback, async locale restore/cache/races/failure, search, calendars, links and server boundaries. |
| `npm run lint` | Exit 0; 9 warnings for component-export conventions, effect state and the existing schedule dependency pattern. No lint errors. |
| `BASE_PATH=/midsouthlunar/ npm run build` | Pass. GitHub Pages production path. |
| Initial JavaScript bundle | 308.73 kB raw / 99.07 kB gzip, within the existing 350/110 kB budgets. Non-English dictionaries load on selection or restore. |
| Responsive browser checks | 126 combinations: 6 pages × 7 languages × 320/768/1440 px. Correct route headings and no horizontal overflow. Checked through the real site navigation after route content loads. |
| Production browser | Seven language selections and corresponding event-address questions pass under `/midsouthlunar/`; Japanese preference survives reload. Reported English question shows the canonical street address. |
| Calendar browser | Two Google Calendar menu links with separate February 5 and February 6 opening windows; both include the venue address and America/Chicago time zone. .ics content/folding verified by unit tests. |
| Missing-key service smoke | Actual Node HTTP service: `/api/chat/status` returns 200 `{enabled:false}`; allowed-origin chat request returns 503 `{error:"chat_unavailable"}` without contacting the provider. |
| External link handling | HTTPS Eventbrite listing and Google Forms validation tests pass; missing configuration shows pending UI. Actual 2027 checkout/signup destinations are not supplied. |

The responsive matrix used the development preview; production browser checks separately verify the built GitHub Pages path and lazy language chunks. Browser interaction was performed with the Codex browser controls. Updated Playwright specs are included for future CI/local use but that runner was not executed in this session. Historical Lighthouse scores in `TEST_REPORT.md` were not rerun or carried forward as current results.

No production deployment, checkout transaction or real model-account request was performed. Provider success/error bodies are mocked in automated tests. Live API activation and specific 2027 ticket/form destinations still require MCCC configuration. Translations need native-speaker review; completeness tests do not certify translation accuracy.
