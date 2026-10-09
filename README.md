# Mid-South Lunar New Year Festival website

Website for the Mid-South Lunar New Year Festival, February 5 and 6, 2027, at Agricenter International in Memphis, organized by the Mid-South Chinese Chamber of Commerce (MCCC).

Built as the group project for MIS 7623 (AI-Assisted Application Development for Business) at the University of Memphis by Alex Orr, Dee Dee Gan, Gabrielle Richardson, and Wang Liao.

**Live site:** https://alexorr2142-sudo.github.io/midsouthlunar/ (will move to https://midsouthlunar.org)

## What it is

A static website in seven languages (English, 简体中文, 繁體中文, 日本語, 한국어, ไทย, Tiếng Việt) with six pages: Home, Schedule, Vendors, Tickets & Visit, Get Involved, and About. English is the default; language choice persists. There is no database, sign-in, or analytics. Local chatbot mode needs no server. An optional protected AI service supports broader cultural questions. See `docs/requirements` for the original requirements and `docs/COMPARISON_REVIEW.md` for the comparison improvements.

The confirmed 2027 Eventbrite listing and Google Forms URLs have not been supplied. Their fields are blank and the UI shows a pending message. Add specific event/form URLs in `event.json` when available; generic homepages are deliberately rejected.

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
| Simplified / Traditional Chinese text | `src/i18n/zh.json`, `zh-Hant.json` |
| Thai text | `src/i18n/th.json` |
| Vietnamese, Korean, Japanese text | `src/i18n/vi.json`, `ko.json`, `ja.json` |

Every item in the data files has `en`, `zh`, `zh-Hant`, `th`, `vi`, `ko`, and `ja` values. The unit tests fail if a language is missing, so run `npm run test:unit` after editing. Changes merged into `main` trigger deployment. Translations are drafts pending native-speaker review.

The schedule and vendor lists are currently **preliminary demo data** drawn from the MCCC festival application. They will be replaced when MCCC provides the real lineup.

## Chatbot: Yang Yang (羊羊)

The goat button in the corner opens a chat about the schedule, vendors, tickets, parking, accessibility and Lunar New Year traditions in all seven languages. Event-address questions always read `event.venue.name` and `event.venue.address`, including in AI mode; an activity's Food Hall is not the festival's street address.

**Built-in mode (default).** A local intent engine (`src/lib/chat.js`) uses the website's JSON data and curated knowledge (`src/data/knowledge.json`). Chat messages stay in the browser. It answers supported topics and gives a helpful fallback for other questions. Edit knowledge like other content; the tests check all seven languages.

**Optional AI mode (Gemini free tier).** The static website calls a separately hosted protected chat service; the browser only ever learns the service's public URL, never the Gemini key. The service ships in two interchangeable forms: `server/chat.mjs` for any Node host, and `server/worker.mjs` for Cloudflare Workers (free tier, no server to run). The Cloudflare path is the one the project uses: add the `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` and `GEMINI_API_KEY` repository secrets, run the **Deploy Yang Yang chat service** workflow, then set the repository Variable `CHAT_API_URL` to the Worker's `/api/chat` URL and redeploy Pages. Step-by-step instructions, including the handoff rule that the Cloudflare and Google accounts belong to the festival, are in [docs/CHAT_SETUP.md](docs/CHAT_SETUP.md).

**Important:** adding `GEMINI_API_KEY` to GitHub Actions secrets alone does not activate live AI. The Worker must be deployed (needs the two Cloudflare secrets) *and* `CHAT_API_URL` must point to it. Until both are in place, Yang Yang answers from its built-in knowledge engine, and the chat footer says so.

## Previewing countdown states

The Home page countdown changes with the date. To preview a state, add `?now=` with an ISO timestamp:

- Happening now: `/?now=2027-02-05T15:00:00-06:00`
- Between days: `/?now=2027-02-05T22:00:00-06:00`
- After the festival: `/?now=2027-02-07T12:00:00-06:00`

## AI-assisted workflow

The course is about building with AI tools. `docs/PROMPTS.md` records the structured prompt used for each module, what the AI produced, and what a human changed. `docs/ARCHITECTURE.md` has the architecture diagram and the review that followed it.

## Handoff

This repo is designed to be handed to MCCC with nothing tied to the student team: no accounts, keys, paid services, or personal logins are needed to keep the site running. See the requirements document, Section 8.
