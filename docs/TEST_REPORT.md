# Test report (Thursday lab)

**Project:** Mid-South Lunar New Year Festival website · **Date:** October 6, 2026 · **Build:** `main` after the Tuesday lab review fixes
**Team:** Alex Orr, Dee Dee Gan, Gabrielle Richardson, Wang Liao · MIS 7623, University of Memphis

## 1. Summary

| Layer | Tool | Cases | Tests | Result |
|---|---|---|---|---|
| Unit | Vitest + Testing Library (jsdom) | UT-1 to UT-6 | 26 | 26 pass |
| Integration | Playwright, iPhone 13 and Desktop Chrome profiles, against the production build | IT-1, IT-2 | 7 x 2 devices = 14 | 14 pass |
| Performance | Lighthouse (mobile, throttled 4G), bundle budget, filter benchmark | PT-1, PT-2 | 19 checks | 19 pass |

Six defects were found during testing and fixed before this final run. Two AI-drafted test cases were wrong and were corrected during validation. Details in Sections 4 and 5.

Run everything with `npm test` (unit + integration) and `npm run test:perf`. Raw outputs are in `test-results/` (Lighthouse HTML reports, Playwright traces, `perf.json`).

## 2. Test environment

- Node 22, Vitest 4, Playwright 1.59, Lighthouse 13, Chromium (Playwright build).
- Unit tests import the pure modules in `src/lib/` and the i18n context directly. No browser.
- Integration tests run `npm run build` and serve `dist/` with `vite preview`, so they test the same files GitHub Pages serves. Each test runs twice: once with an iPhone 13 profile (touch, 390 px wide) and once with Desktop Chrome.
- Performance tests use Lighthouse's mobile emulation and simulated 4G throttling against the same preview server, then measure the built bundle and run the vendor filter over a 600-row synthetic dataset (20x the demo data).
- GitHub Actions runs the unit tests on every push before deploying, so a broken content edit by MCCC cannot reach the live site.

## 3. Test cases generated from the requirements document

The agent was prompted: *"From REQUIREMENTS.md generate at least two test cases each for unit, integration, and performance testing. Each must name the requirement it verifies and state the expected result."* The cases were then validated against our understanding of the project (Section 5) and implemented.

| ID | Type | Requirement | What it checks | Expected |
|---|---|---|---|---|
| UT-1 | Unit | FR-3 | `getEventState` at the exact boundaries: 09:59:59 and 10:00:00 on Feb 5, 21:00 on Feb 5, 03:00 on Feb 6, 21:00 on Feb 6 | before, open day1, between, between, after |
| UT-2 | Unit | FR-3, HO-10 | `festivalDate` resolves local times through `event.timezone`, not a fixed offset | Feb → UTC-6, July → UTC-5; negative durations clamp to zero |
| UT-3 | Unit | FR-4 | `filterSchedule` with no filter, with day+stage+type combined, with no match; does not mutate input | full sorted list; AND semantics; `[]`; source unchanged |
| UT-4 | Unit | FR-5 | `filterVendors` case/whitespace insensitive, matches Chinese while in English, matches description and booth, combines with category | correct ids; `[]` for no match |
| UT-5 | Unit | FR-9 | `.ics` body is RFC-shaped (CRLF, UTC stamps, escaped commas); Google Calendar link carries Chinese title and correct times | exact strings |
| UT-6 | Unit | FR-2 | Switcher changes strings, sets `<html lang>`, persists to localStorage, cycles through all five languages; every English key exists in zh, vi, ko, and ja with the same shape and no extras; every data label exists in all five languages | no missing keys |
| IT-1 | Integration | FR-1, FR-3, FR-6 | Home shows dates, venue, live countdown, Eventbrite link; every page reachable from nav on phone (hamburger) and desktop; `?now=` inside opening hours shows "Happening now" | all visible and correct |
| IT-2 | Integration | FR-2, FR-4, FR-5, FR-7 | Schedule filters narrow the list, update URL and count, show empty state and clear; vendor search finds "dumpling", combines with category, empties and clears; language persists across pages and reload and switches through vi, ko, ja; Get Involved links go to Google Forms | all behave as specified |
| PT-1 | Performance | NFR-2, NFR-3 | Lighthouse mobile scores for Home, Schedule, Vendors: performance, accessibility, best practices ≥ 90; LCP < 3000 ms on throttled 4G | pass thresholds |
| PT-2 | Performance | NFR-2 | Main bundle < 350 kB raw / 110 kB gzip; `filterVendors` over 600 rows < 100 ms worst case | pass thresholds |

## 4. Results

### Unit (26 tests)

All pass. Notable: UT-6 walks every key in `en.json` and asserts it exists in each of the other four dictionaries, and that every schedule item, vendor, and label has all five languages. This caught defect D-1 below and will catch any future content edit that forgets a language.

### Integration (14 tests)

All pass on both device profiles. Notable: the phone profile exercises the hamburger menu and touch targets; the desktop profile exercises the inline nav. Playwright traces are kept on failure only.

### Performance (19 checks)

| Check | Home | Schedule | Vendors | Threshold |
|---|---|---|---|---|
| Lighthouse performance | 100 | 99 | 99 | ≥ 90 |
| Lighthouse accessibility | 100 | 100 | 100 | ≥ 90 |
| Lighthouse best practices | 100 | 100 | 100 | ≥ 90 |
| Largest contentful paint, throttled 4G | 1405 ms | 1688 ms | 1654 ms | < 3000 ms |
| First contentful paint, throttled 4G | 1405 ms | 1540 ms | 1500 ms | info |

| Budget | Actual | Threshold |
|---|---|---|
| Main JS bundle, raw | 308.7 kB (five dictionaries) | < 350 kB |
| Main JS bundle, gzip | 101.9 kB | < 110 kB |
| Lazy page chunks | 6 | info |
| `filterVendors`, 600 rows, worst of 18 query/category combinations | 1.6 ms | < 100 ms |

The filter benchmark says search will stay instant even if MCCC's vendor list grows well past the "100+" in the funding application.

## 5. Failures found and fixes applied

| ID | Found by | What was wrong | Fix | Commit |
|---|---|---|---|---|
| D-1 | UT-6 | Singular result strings (`resultsOne`) were added to `en.json` during the Tuesday walkthrough but not to `zh.json`, so the Chinese site would have shown an English fallback for "1 event" / "1 vendor" | Added both strings to `zh.json` | fix(i18n) |
| D-2 | IT-2 | After the architecture review moved Schedule into a lazy chunk, the test counted items before the chunk had loaded and got 0 | Test corrected to wait for the first item (a test defect, not a site defect, but caused by a real behavior change) | test(e2e) |
| D-3 | PT-1 | Accessibility scored 96: three muted-text styles (`text-ink/40`, `/50`, `/60`) fell below the 4.5:1 WCAG AA contrast ratio on the cream background (measured 2.45 and 4.36) | Raised to `/70` and `/75`; now 7.1:1 and 5.9:1 | fix(a11y) |
| D-6 | Live-site check | On GitHub Pages, a shared filtered link such as `/schedule?day=day2&type=performance` opened the Schedule page but dropped the filters: the `404.html` redirect carried the query string, but the decoder in `index.html` discarded everything after the path | Decoder rewritten to restore the query string (standard spa-github-pages pattern) | fix(pages) |
| D-5 | IT-1 (phone) | After the switcher grew to five languages, its width pushed the menu button off a 390 px screen in Vietnamese, so the mobile navigation could not be opened | Wordmark truncates and the switcher has a max width on small screens | fix(layout) |
| D-4 | PT-1 | The language button's `aria-label` ("Switch language to Chinese") did not contain its visible text ("中文"), which confuses voice-control users who say what they see | `aria-label` now reads "中文: Switch language to Chinese" | fix(a11y) |

D-3 and D-4 passed the 90 threshold but violate NFR-3 (WCAG AA is a Must), so they were fixed anyway. Accessibility is now 100 on all three audited pages.

### Test cases corrected during validation

| ID | AI draft said | Why it was wrong | Corrected to |
|---|---|---|---|
| UT-1 (last case) | "121 days from Oct 6 2026 10:00" | The number was read off a screenshot taken at 5 PM. From 10:00 CDT Oct 6 to 10:00 CST Feb 5 is 122 days plus the one-hour DST change | 122 days, 1 hour |
| PT-2 (draft) | "Filter 500 rows in under 100 ms in the browser via Playwright" | Measuring inside a browser with Playwright adds tens of milliseconds of automation overhead and would measure the harness, not the filter | Benchmark the pure `filterVendors` function in Node over 600 rows, worst case across 18 query/category combinations |

## 6. What was not tested, and why

- **Real devices and real network.** All phone results are emulated. The peer team round (Section 7) is where real phones come in.
- **Translation accuracy.** Tests prove every string exists in all five languages, not that the Chinese, Vietnamese, Korean, or Japanese is good. Chinese review is Dee Dee or Wang; the other three need native readers the team has not yet found.
- **External services.** Eventbrite and Google Forms links are placeholders until MCCC supplies real ones; tests check the link shape only.
- **The GitHub Pages redirect (`404.html`).** Only testable on the live site. Verified after deploy, which found D-6.

## 7. Peer feedback on the testing (Thursday item 3)

See `PEER_FEEDBACK.md`, questions 13 and 14. Pending the peer session.
