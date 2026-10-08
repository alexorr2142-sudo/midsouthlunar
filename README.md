# Mid-South Lunar New Year Festival website

Website for the Mid-South Lunar New Year Festival, February 5 and 6, 2027, at Agricenter International in Memphis, organized by the Mid-South Chinese Chamber of Commerce (MCCC).

Built as the group project for MIS 7623 (AI-Assisted Application Development for Business) at the University of Memphis by Alex Orr, Dee Dee Gan, Gabrielle Richardson, and Wang Liao.

**Live site:** https://alexorr2142-sudo.github.io/midsouthlunar/ (will move to https://midsouthlunar.org)

## What it is

A fully static site in five languages (English, 简体中文, Tiếng Việt, 한국어, 日本語) with six pages: Home, Schedule, Vendors, Tickets & Visit, Get Involved, and About. There is no backend, database, sign-in, or analytics. Tickets link to Eventbrite and applications link to Google Forms. See `docs/requirements` for the full requirements document.

## Stack

- React 19 + Vite 8 + Tailwind CSS 4
- React Router (client-side routing with a `404.html` redirect for GitHub Pages)
- Content lives in JSON under `src/data/` (event facts, schedule, vendors) and `src/i18n/` (all UI strings, one file per language)
- Deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`
- Tests: Vitest (unit), Playwright (integration), Lighthouse (performance). See `docs/TEST_REPORT.md`.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the production build
npm test           # unit + integration tests
```

## Editing content (no code needed)

| What to change | File |
|---|---|
| Dates, hours, venue, ticket and form links, stage names | `src/data/event.json` |
| Schedule items | `src/data/schedule.json` |
| Vendors | `src/data/vendors.json` |
| English text | `src/i18n/en.json` |
| Chinese text | `src/i18n/zh.json` |
| Vietnamese, Korean, Japanese text | `src/i18n/vi.json`, `ko.json`, `ja.json` |

Every item in the data files has `en`, `zh`, `vi`, `ko`, and `ja` values. The unit tests fail if any language is missing, so run `npm run test:unit` after editing. Edit the file in GitHub's web editor, commit to `main`, and the site redeploys in about a minute.

The schedule and vendor lists are currently **preliminary demo data** drawn from the MCCC festival application. They will be replaced when MCCC provides the real lineup.

## Chatbot: Yang Yang (羊羊)

The goat button in the corner opens a chat that answers questions about the schedule, vendors, tickets, parking, accessibility, and Lunar New Year traditions, in whichever of the five languages the visitor writes in.

**Built-in mode (default).** Everything runs in the browser: a small intent engine (`src/lib/chat.js`) over the same JSON data the pages use, plus a curated knowledge base (`src/data/knowledge.json`, 12 topics in five languages). No key, no cost, no data leaves the browser. Edit the knowledge base like any other content file; the unit tests check that every topic has all five languages.

**Optional AI mode (Gemini free tier).** To enable AI answers, create a Gemini API key in [Google AI Studio](https://aistudio.google.com/apikey) and add it as the `GEMINI_API_KEY` repository secret under Settings → Secrets and variables → Actions. The deploy workflow passes it to the build as `VITE_GEMINI_API_KEY`. AI mode uses `gemini-2.5-flash-lite` by default; optionally set the `GEMINI_MODEL` repository variable to override the model. Gemini free-tier quotas, availability, and terms apply; free access is not guaranteed to be unlimited.

**Important key limitation:** this project is deployed as a static GitHub Pages site. A `VITE_` environment variable is compiled into browser JavaScript, so the API key is visible to visitors and must never be a personal or broadly privileged key. If enabling AI mode, use a key dedicated to this site and restrict it to the site's HTTP referrers (`midsouthlunar.org` and `alexorr2142-sudo.github.io`) where supported. This reduces casual misuse but is not equivalent to keeping a key secret on a backend. For stronger key protection, route Gemini requests through a server-side function instead. If no key is configured or Gemini fails, Yang Yang falls back to the built-in engine. Remove the secret to return to built-in-only mode.

## Previewing countdown states

The Home page countdown changes with the date. To preview a state, add `?now=` with an ISO timestamp:

- Happening now: `/?now=2027-02-05T15:00:00-06:00`
- Between days: `/?now=2027-02-05T22:00:00-06:00`
- After the festival: `/?now=2027-02-07T12:00:00-06:00`

## AI-assisted workflow

The course is about building with AI tools. `docs/PROMPTS.md` records the structured prompt used for each module, what the AI produced, and what a human changed. `docs/ARCHITECTURE.md` has the architecture diagram and the review that followed it.

## Handoff

This repo is designed to be handed to MCCC with nothing tied to the student team: no accounts, keys, paid services, or personal logins are needed to keep the site running. See the requirements document, Section 8.
