# Mid-South Lunar New Year Festival website

Website for the Mid-South Lunar New Year Festival, February 5 and 6, 2027, at Agricenter International in Memphis, organized by the Mid-South Chinese Chamber of Commerce (MCCC).

Built as the group project for MIS 7623 (AI-Assisted Application Development for Business) at the University of Memphis by Alex Orr, Dee Dee Gan, Gabrielle Richardson, and Wang Liao.

**Live site:** https://alexorr2142-sudo.github.io/midsouthlunar/ (will move to https://midsouthlunar.org)

## What it is

A fully static, bilingual (English / 简体中文) site with six pages: Home, Schedule, Vendors, Tickets & Visit, Get Involved, and About. There is no backend, database, sign-in, or analytics. Tickets link to Eventbrite and applications link to Google Forms. See `docs/requirements` for the full requirements document.

## Stack

- React 19 + Vite 8 + Tailwind CSS 4
- React Router (client-side routing with a `404.html` redirect for GitHub Pages)
- Content lives in JSON under `src/data/` (event facts, schedule, vendors) and `src/i18n/` (all UI strings in both languages)
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

Every item in the data files has an `en` and a `zh` value. Edit the file in GitHub's web editor, commit to `main`, and the site redeploys in about a minute.

The schedule and vendor lists are currently **preliminary demo data** drawn from the MCCC festival application. They will be replaced when MCCC provides the real lineup.

## Previewing countdown states

The Home page countdown changes with the date. To preview a state, add `?now=` with an ISO timestamp:

- Happening now: `/?now=2027-02-05T15:00:00-06:00`
- Between days: `/?now=2027-02-05T22:00:00-06:00`
- After the festival: `/?now=2027-02-07T12:00:00-06:00`

## AI-assisted workflow

The course is about building with AI tools. `docs/PROMPTS.md` records the structured prompt used for each module, what the AI produced, and what a human changed. `docs/ARCHITECTURE.md` has the architecture diagram and the review that followed it.

## Handoff

This repo is designed to be handed to MCCC with nothing tied to the student team: no accounts, keys, paid services, or personal logins are needed to keep the site running. See the requirements document, Section 8.
