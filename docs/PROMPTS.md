# AI prompt log

One structured prompt per module, following the Role / Context / Task / Constraints / Output format. Each entry records what the AI agent produced and what a human reviewed or changed. The agent used was Claude (Anthropic) working inside the Claude desktop app against this repository; the team's requirements document (Draft 3) was attached as context for every prompt.

---

## Module 0: Project scaffold and deploy pipeline

**Role:** You are a front-end developer setting up a small static website for a community festival, to be maintained later by non-developers.

**Context:** Requirements Draft 3. Static site, no backend. React + Vite + Tailwind. Hosted on GitHub Pages at a github.io project URL now and midsouthlunar.org later. The team wants nothing that needs a paid account or API key.

**Task:** Scaffold the project, configure Tailwind, add client-side routing that survives a page refresh on GitHub Pages, and add a GitHub Actions workflow that builds and deploys on every push to main.

**Constraints:** No secrets. The base path must switch automatically between `/midsouthlunar/` (github.io) and `/` (custom domain). Keep the dependency list short.

**Output:** package.json, vite.config.js, index.html, public/404.html, .github/workflows/deploy.yml.

**Result:** Produced as requested. The agent first wrote the button and card styles as plain CSS classes with `@apply`, which fails under Tailwind 4 ("Cannot apply unknown utility class btn"). **Human fix:** converted them to `@utility` definitions. The agent also had to be told that this session cannot create GitHub repos; Alex created the empty repo by hand.

---

## Module 1: Language toggle (FR-2)

**Role:** You are building internationalization for a bilingual public website.

**Context:** Every page must be available in English and Simplified Chinese with a switcher. The choice must persist as the visitor moves between pages. Data files (schedule, vendors) carry `{en, zh}` objects; UI strings live in dictionary files. A Chinese-reading teammate will review every string before launch.

**Task:** Create a LanguageProvider with a `t(key, vars)` function for UI strings and a `pick(obj)` helper for bilingual data, a toggle button, and en.json / zh.json with all site copy. Draft the Chinese.

**Constraints:** Persist in localStorage but never crash if storage is blocked. Set `<html lang>` so screen readers switch voices. Fall back to English when a key is missing. No i18n library.

**Output:** src/i18n/LanguageContext.jsx, src/i18n/en.json, src/i18n/zh.json, LangToggle component.

**Result:** Works as specified. zh.json is marked `"status": "AI draft, pending review"` in its `_meta` block. **Human review pending:** Dee Dee or Wang to approve the Chinese strings. **Human fix:** on phones the toggle text wrapped onto two lines; added `whitespace-nowrap`.

---

## Module 2: Home page with countdown (FR-3, FR-9)

**Role:** You are building the landing page of a festival site, mobile first.

**Context:** The festival runs Feb 5 and 6, 2027, 10 AM to 9 PM Central. The home page must show dates, venue, a ticket button, and a countdown that switches to "happening now" during opening hours and to a thank-you state afterward. Add-to-calendar is the site's reminder feature.

**Task:** Build the Home page and Countdown component. Put the date logic in a pure function with no React so it can be unit tested. Build an AddToCalendar menu offering Google Calendar and an .ics download.

**Constraints:** Festive red and gold styling with lantern accents. The countdown must handle four states: before, open, between days, after. Allow a `?now=` query parameter so reviewers can preview any state.

**Output:** src/lib/countdown.js, src/lib/calendar.js, src/components/Countdown.jsx, src/components/AddToCalendar.jsx, src/pages/Home.jsx.

**Result:** Produced with the four states and the preview parameter. **Human check:** verified the "between" state exists (after 9 PM on Feb 5 the site says "see you tomorrow" instead of counting down). No changes needed.

---

## Module 3: Schedule with filters (FR-4)

**Role:** You are building a filterable event schedule for a two-day festival.

**Context:** About 24 preliminary schedule items in src/data/schedule.json with day, start, end, stage, type, and bilingual title and description. Filters: day, area (stage), type.

**Task:** Build the Schedule page. Filtering logic must be a pure function. Filters should live in the URL so a filtered view can be shared. Show a count, a clear button, an empty state, and a per-item add-to-calendar button. Group results by day.

**Constraints:** Accessible chip buttons with `aria-pressed`. Live region for the result count. Mobile first.

**Output:** src/lib/filter.js (filterSchedule), src/components/ChipGroup.jsx, src/pages/Schedule.jsx.

**Result:** Produced as specified. **Human fix:** "1 events" was grammatically wrong; added singular strings in both languages.

---

## Module 4: Vendor directory with search (FR-5)

**Role:** You are building a searchable vendor directory.

**Context:** 30 preliminary vendors in src/data/vendors.json with bilingual name and description, category (food, crafts, cultural), and booth number.

**Task:** Build the Vendors page with a text search and category chips, URL-backed state, count, clear, and empty state. Search must match either language so an English-page visitor can type Chinese and vice versa.

**Constraints:** Pure filtering function. Search must be case- and whitespace-insensitive.

**Output:** filterVendors in src/lib/filter.js, src/pages/Vendors.jsx.

**Result:** Produced as specified. **Human fix:** one vendor entry in the demo data had a stray character that broke the JSON; fixed and added a JSON validity check to the build.

---

## Module 5: Tickets & Visit, Get Involved, About (FR-6, FR-7, FR-8, FR-10, FR-11)

**Role:** You are completing the remaining informational pages of the site.

**Context:** Tickets link out to Eventbrite. Vendor and volunteer sign-up link to Google Forms. Visit needs a Google Map embed, parking and accessibility notes, and an FAQ. About needs the mission, organizer, cultural education cards, and contact.

**Task:** Build the three pages from the dictionary content. Use the keyless Google Maps embed (no API key). FAQ as native `<details>` elements.

**Constraints:** No API keys, no third-party scripts. Anchor links from Home (`/about#traditions`, `/get-involved#sponsor`) must scroll to the right section.

**Output:** src/pages/Visit.jsx, src/pages/GetInvolved.jsx, src/pages/About.jsx, ScrollManager in App.jsx.

**Result:** Produced as specified. **Human fix:** a copy-paste error in GetInvolved.jsx used the volunteer label for the vendor button; corrected.

---

## Walkthrough test (Tuesday item 1)

**Prompt:** Write a Playwright script that opens every page at phone and desktop widths, exercises the filters, the search, the language toggle, the empty states, and the "happening now" countdown state, and saves full-page screenshots as evidence.

**Result:** scripts/screenshots.mjs, output in docs/screenshots/. **Human fix:** the script found two language toggles in the DOM (desktop nav plus mobile header) and had to target the visible one. The screenshots revealed the phone header wrapping, fixed in Module 1.

---

## Module 6: Vietnamese, Korean, and Japanese (extends FR-2)

**Role:** You are extending the site's internationalization from two languages to five.

**Context:** The site already has English and Simplified Chinese with a toggle. The team wants Vietnamese, Korean, and Japanese added so the festival reaches more of the Mid-South's Asian communities. UI strings live in dictionaries; data items carry per-language objects.

**Task:** Add vi.json, ko.json, ja.json mirroring en.json exactly; add vi/ko/ja values to every schedule item, vendor, stage, type, category, and event label; replace the two-way toggle with a five-language switcher; set the right `<html lang>` and fonts per language; extend the tests so a missing key in any language fails the build.

**Constraints:** No i18n library. The switcher must work by keyboard and screen reader and fit a phone header. Mark every new dictionary as an AI draft pending review.

**Output:** src/i18n/{vi,ko,ja}.json, updated data files, LanguageContext.jsx with a LANGS table, LangToggle as a native `<select>`, updated unit and integration tests.

**Result:** Produced as specified; 26 unit tests and 14 integration tests pass. **Defect found by the integration test:** on a 390 px phone the wider switcher pushed the menu button off-screen in Vietnamese. **Human fix:** the wordmark now truncates and the switcher has a max width on small screens. Note on culture: the Japanese dictionary says 旧正月 (old new year) rather than 正月, since Japan celebrates the solar New Year; the Vietnamese uses Tết; the Korean uses 설날. All three remain pending review by native readers.
