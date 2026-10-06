**Mid-South Lunar New Year Festival Website**

**Requirements Specification, Draft 3**

MIS 7623: AI-Assisted Application Development for Business, University
of Memphis

Team: Alex Orr, Dee Dee Gan, Gabrielle Richardson, Wang Liao

Date: September 17, 2026. Status: draft for team review. Nothing gets
built until the team approves this document and the decisions in Section
10 are settled.

**What Changed Since Draft 2**

- The backend is discarded. There is no Supabase, no Google sign-in, no
  reminder emails, no admin view, and no subscriber data. The site is
  fully static again, as in Draft 1.

- Hosting goes back to GitHub Pages. Cloudflare Pages is dropped.

- The site still lives at midsouthlunar.org, served by GitHub Pages.

- New Section 8 covers the handoff to MCCC. The goal is that nothing
  depends on any teammate's personal account, phone, or payment method,
  so we can hand MCCC a website and walk away.

- All accounts are owned by a new festival Google account created before
  anything else.

- Reminders are handled without us holding any data: add-to-calendar
  buttons on the site, plus the emails Eventbrite already sends to
  ticket holders.

**1. Purpose and Background**

This document captures the requirements we gathered in our planning
interviews for the festival website. It turns the submitted project
description into specific, testable requirements so all four of us agree
on what we are building before any code is written.

The Mid-South Chinese Chamber of Commerce (MCCC) is organizing a two-day
Lunar New Year cultural fair for the Greater Memphis area. MCCC is a
real organization and one teammate has a loose line of contact with
them. They will supply content where they can, but they do not sign off
on our decisions and there is no commitment to launch the site.

| **Item**                | **Detail**                                                                          |
|-------------------------|-------------------------------------------------------------------------------------|
| **Event**               | Mid-South Lunar New Year Festival                                                   |
| **Organizer**           | Mid-South Chinese Chamber of Commerce (MCCC)                                        |
| **Dates**               | February 5, 2027 (Lunar New Year's Eve) and February 6, 2027 (Lunar New Year's Day) |
| **Hours**               | 10:00 AM to 9:00 PM both days                                                       |
| **Venue**               | Shelby County Agricenter International, 7777 Walnut Grove Rd, Memphis, TN 38120     |
| **Expected attendance** | More than 20,000, with a platform for 100+ local businesses and artists             |
| **Theme**               | Celebrating the Lunar New Year and Sharing Culture                                  |
| **Website address**     | midsouthlunar.org                                                                   |

One note on wording: the project description calls this a redesign, but
there is no existing festival website. We are building fresh from the
MCCC funding application and our own team input.

**2. Goals and Deliverable**

The graded deliverable is a deployed, working website at a public URL,
plus the GitHub repository behind it. The final due date is late
November or early December 2026 (exact date still to be confirmed). The
site should be modern, responsive, and easy to use, and the project
should show how a small team uses AI-assisted tools to analyze, design,
build, test, and improve a practical web application.

**3. Audiences**

General attendees are the priority audience: Memphis-area families of
all backgrounds who need the date, location, schedule, tickets, and
parking. Every design tradeoff gets decided in their favor. Vendors,
performers, volunteers, and sponsors are secondary audiences, and they
are served by a single Get Involved page that links out to forms.

**4. Site Structure**

We consolidated the ten pages in the project description down to six.
This keeps translation and testing manageable while still covering every
topic from the original list.

| **Page**              | **What it covers**                                                                                                            | **Notes**                                            |
|-----------------------|-------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------|
| **Home**              | Dates, venue, countdown, headline activities, ticket button, add-to-calendar button, sponsor strip, cultural education teaser | Replaces Home, Sponsors (display)                    |
| **Schedule**          | Two-day program of performances and activities with filters                                                                   | Replaces Event Schedule, Activities and Performances |
| **Vendors**           | Searchable directory of food, craft, and cultural vendors                                                                     | Replaces Vendors                                     |
| **Tickets and Visit** | Eventbrite link, Google Map, parking, accessibility notes, FAQ                                                                | Replaces Tickets, FAQ                                |
| **Get Involved**      | Vendor application, volunteer sign-up, sponsor information                                                                    | Replaces Volunteer, Sponsors (recruiting)            |
| **About and Contact** | MCCC, festival mission, cultural education section, contact details                                                           | Replaces About, Contact                              |

**5. Functional Requirements**

Priority uses Must (required for the graded release), Should (expected
unless time runs out), and Stretch (only if the core is finished early).

| **ID**    | **Requirement**                                                                                                                                                                                                                                                         | **Priority** |
|-----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| **FR-1**  | All six pages exist, are reachable from a persistent navigation menu, and work on phone, tablet, and desktop.                                                                                                                                                           | Must         |
| **FR-2**  | A language switcher toggles every page between English and Simplified Chinese. The choice persists as the visitor moves between pages.                                                                                                                                  | Must         |
| **FR-3**  | The Home page shows a countdown to February 5, 2027 at 10:00 AM Central. During event hours it switches to a 'happening now' state, and after the event it shows a thank-you state.                                                                                     | Must         |
| **FR-4**  | The Schedule page lists every performance and activity and can be filtered by day (Feb 5 or Feb 6), by stage or area, and by type (performance, food, market, family).                                                                                                  | Must         |
| **FR-5**  | The Vendors page offers a text search by name plus a category filter (food, crafts, cultural), with a clear empty state when nothing matches.                                                                                                                           | Must         |
| **FR-6**  | Tickets link out to Eventbrite. No payment is taken on our site.                                                                                                                                                                                                        | Must         |
| **FR-7**  | Vendor application and volunteer sign-up link out to Google Forms that our team creates and later hands to MCCC.                                                                                                                                                        | Must         |
| **FR-8**  | Tickets and Visit embeds a Google Map of Agricenter and lists parking, entrances, and accessibility information.                                                                                                                                                        | Must         |
| **FR-9**  | Visitors can add the festival, or an individual schedule item, to Google Calendar or download an .ics file for Apple and Outlook. This is the site's reminder feature, so the festival-wide button on Home is a Must and per-item buttons on the Schedule are a Should. | Must         |
| **FR-10** | A cultural education section explains Lunar New Year origins, customs, and the 2027 zodiac year, supporting MCCC's cultural mission.                                                                                                                                    | Should       |
| **FR-11** | An FAQ answers common attendee questions (hours, pricing, parking, food, accessibility, weather).                                                                                                                                                                       | Must         |
| **FR-12** | A venue zone or booth map beyond the Google Map.                                                                                                                                                                                                                        | Stretch      |

**6. Content and Data**

All content lives in the repository. Vendors, schedule items, sponsors,
FAQ entries, and translation strings are stored as JSON files, and the
team edits those files and redeploys to update the site. There is no
CMS, admin login, or database.

The site collects no personal data. Ticket buyer details stay in
Eventbrite, and vendor and volunteer applications stay in Google Forms
owned by the festival account.

Real content comes from our MCCC contact during the semester. Confirmed
facts from the funding application (dates, venue, hours, activity list)
can be used immediately. Where MCCC has not yet provided content, the
agreed fallback is a 'coming soon' treatment, which creates a conflict
covered in Section 10.

For Chinese copy, AI tools draft the Simplified Chinese translation and
a Chinese-reading teammate reviews and approves every string before
launch. No unreviewed AI translation goes live.

**7. Design and Quality Requirements**

| **ID**    | **Requirement**                                                                                                                                                                              | **Priority** |
|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| **NFR-1** | Festive traditional visual direction: red and gold palette, lanterns, paper-cut motifs, and 2027 zodiac art. We design the festival wordmark and palette ourselves since no branding exists. | Must         |
| **NFR-2** | Mobile-first. Layouts are designed for phones first and verified at phone, tablet, and desktop widths.                                                                                       | Must         |
| **NFR-3** | WCAG 2.1 AA accessibility: color contrast (watch red on gold), keyboard navigation, alt text, form and button labels, and correct lang attributes when the language switches.                | Must         |
| **NFR-4** | Chinese text renders with an appropriate font and does not break layouts, since Chinese and English strings differ in length.                                                                | Must         |
| **NFR-5** | Static site only. No backend, no database, no sign-in, no cookies that need a consent banner, and no personal data collected by the site.                                                    | Must         |
| **NFR-6** | No secrets, API keys, or paid services. The Google Map uses the free keyless embed, not the Maps API that requires a billing account.                                                        | Must         |

**8. Handoff to MCCC**

Our main concern after the project is the transition. We want to hand
MCCC a working website with nothing attached to the four of us: no
personal logins, no personal phone numbers on recovery settings, no
personal credit cards, and nothing that breaks if a teammate deletes an
account or graduates. The static design helps a lot here, because there
is no server, no database, and no keys that expire. These requirements
cover the rest.

| **ID**    | **Requirement**                                                                                                                                                                                                                                                                              | **Priority** |
|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| **HO-1**  | A new festival Google account (a shared mailbox such as a festival Gmail) is created before any other account. Every service is signed up with that address, never with a teammate's personal email.                                                                                         | Must         |
| **HO-2**  | The code lives in a GitHub organization owned by the festival account. Teammates are added as collaborators using their own GitHub logins and are removed at handoff, leaving the festival account as the only owner.                                                                        | Must         |
| **HO-3**  | midsouthlunar.org is held in a registrar account under the festival address, or transferred to one before handoff. The renewal date, yearly cost, and who pays are written down. No teammate's card is left on auto-renew.                                                                   | Must         |
| **HO-4**  | The vendor and volunteer Google Forms, and the response Sheets behind them, are created and owned by the festival account.                                                                                                                                                                   | Must         |
| **HO-5**  | The Eventbrite listing belongs to MCCC or the festival account. The site only holds the link, which is changed in one data file.                                                                                                                                                             | Must         |
| **HO-6**  | Account recovery does not depend on us. Two-step verification uses printed backup codes, and at handoff the recovery phone and email are switched to MCCC's. Passwords are changed by MCCC once they take over.                                                                              | Must         |
| **HO-7**  | Nothing in the running site depends on an AI or prototyping tool account (Lovable, Replit, Cursor, Claude). Those are used to build, and the finished code in GitHub stands alone.                                                                                                           | Must         |
| **HO-8**  | All fonts, icons, photos, and artwork are free to reuse or supplied by MCCC, and are stored in the repo. Nothing is hot-linked from a teammate's Canva, Drive, or similar personal storage.                                                                                                  | Must         |
| **HO-9**  | The site needs no upkeep to stay online. After the festival the countdown shows a thank-you state, and nothing expires except the domain renewal.                                                                                                                                            | Must         |
| **HO-10** | Year-specific details (dates, hours, schedule, vendors, ticket link, zodiac art) sit in data files, so MCCC can reuse the site for 2028 by editing content and not code.                                                                                                                     | Should       |
| **HO-11** | An owner's guide in plain language, in English and Chinese, explains how to edit a vendor or schedule item in GitHub's web editor, change the ticket and form links, renew the domain, and who to call if the site is down. It includes a one-page list of every account and what it is for. | Must         |
| **HO-12** | A handoff test: someone outside the team follows the owner's guide to change one vendor entry and sees it go live, with no help from us.                                                                                                                                                     | Should       |

One thing the handoff cannot remove is authorship. The GitHub history
will show which teammate made each change, which is normal and also
useful as evidence of our work for the class. It is a record of the past
and creates no ongoing tie. If the team would prefer the public repo not
show personal names, we can hand MCCC a fresh copy of the final code
with a clean history.

**9. Technical Approach**

| **Area**             | **Decision**                                                                                                                                                                 |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Pacing**           | Front-loaded. A deployed skeleton of all six pages goes live within 2 to 3 weeks, then we iterate on content, translation, and polish.                                       |
| **Front end**        | React with Vite and Tailwind CSS, built as a static site                                                                                                                     |
| **Backend**          | None. Anything that stores data is handled by Eventbrite and Google Forms.                                                                                                   |
| **Domain**           | midsouthlunar.org from the first deploy, pointed at GitHub Pages with HTTPS. The team has the registrar login and edits DNS directly. Nothing else runs on the domain today. |
| **Hosting**          | GitHub Pages, free, serving the repo in the festival GitHub organization. One fewer account to hand over, since the code and the hosting are the same place.                 |
| **Version control**  | GitHub repository. Pushing to the main branch triggers an automatic build and deploy through GitHub Actions.                                                                 |
| **Accounts**         | Three in total, all under the festival Google account: GitHub organization, domain registrar, and Google Forms. See Section 8.                                               |
| **Build model**      | One builder and three reviewers. Alex drives the repo with AI tools. Dee Dee, Gabrielle, and Wang own content, translation review, design feedback, and testing.             |
| **AI tools**         | Flexible. The tools named in the project description (Claude Code, Cursor, Replit, Lovable, VS Code) are suggestions and we can use others.                                  |
| **AI documentation** | A lightweight running log in the repo: date, tool, task, what worked, and what a human had to fix. This feeds the final report.                                              |
| **Human review**     | All AI-generated code and copy is reviewed and tested by a team member before it is used.                                                                                    |

**10. Decisions Needed Before We Build**

**10.1 Empty directories at grading time**

We chose 'coming soon' sections as the fallback if MCCC content arrives
late. We also put a searchable vendor directory and a filterable
schedule in scope. If the vendor list is late, those features have
nothing to show when the professor grades the site. The suggested fix is
a demo dataset drawn from the activity list in the MCCC application,
shown behind a visible 'preliminary lineup' label and swapped for real
data when it arrives.

**10.2 How reviewers see work before it goes live**

GitHub Pages does not create a preview link for each change, and our
workflow has three reviewers checking work through links. The suggestion
is a second 'staging' repo in the same festival organization, published
at a github.io address. Alex pushes there first, reviewers check it, and
approved work moves to the live site. It stays inside GitHub, so it adds
no new account to hand over.

**10.3 Page URLs on GitHub Pages**

A direct link such as midsouthlunar.org/schedule breaks for a React app
on GitHub Pages unless we add a workaround. The two options are hash
URLs (midsouthlunar.org/#/schedule), which always work and look slightly
odd, or a small redirect file that makes clean URLs work. The suggestion
is the redirect file, since clean links are better for flyers and QR
codes.

**10.4 Registrar account**

We can edit DNS for midsouthlunar.org today, but we have not recorded
which registrar it is or whose account holds it. If it is a personal
account, HO-3 means moving it to the festival account, which can take a
few days, so it should start early.

**11. Out of Scope**

- No backend or database: no sign-in, user accounts, admin panel, or
  stored form submissions.

- No payments on the site. All ticket purchasing happens on Eventbrite.

- No email list, reminder emails, or analytics run by the site.
  Reminders come from calendar buttons and Eventbrite.

- No paid services or API keys of any kind.

- The booth map is a stretch goal only and is not part of the committed
  scope.

**12. Testing and Evaluation**

Testing follows the evaluation strategy in the project description.
Reviewers walk through these tasks in both languages and on a phone as
well as a desktop: finding the event date and location, viewing the
schedule, reaching ticket purchase, finding a vendor, reaching vendor or
volunteer registration, and completing each of those on a mobile device.
We also run an accessibility check against NFR-3 on every page.

For the handoff, we also run the HO-12 test and confirm the
add-to-calendar files open correctly on iPhone, Android, and Outlook.

Formal user testing with outside participants and performance scoring
were discussed and not selected, so they are optional.

**13. Open Items**

| **Open item**                                                                                             | **Who can close it**                           |
|-----------------------------------------------------------------------------------------------------------|------------------------------------------------|
| **Exact final due date and any rubric requirements**                                                      | Alex, from the syllabus or Professor Velichety |
| **Team role assignments, including MCCC liaison and Chinese translation reviewer**                        | Whole team                                     |
| **Create the festival Google account and decide who holds the password during the project**               | Whole team                                     |
| **Decisions 10.1, 10.2, and 10.3**                                                                        | Whole team                                     |
| **Registrar for midsouthlunar.org and whose account it is (10.4)**                                        | Whoever holds the login                        |
| **Named person at MCCC who will receive the accounts and the owner's guide**                              | MCCC contact                                   |
| **Who pays the domain renewal after handoff**                                                             | MCCC contact                                   |
| **Ticket pricing, or whether admission is free**                                                          | MCCC contact                                   |
| **Whether MCCC will create and run the Eventbrite listing**                                               | MCCC contact                                   |
| **Content delivery: vendor list, schedule times, sponsors, logos, photos, and a realistic date for each** | MCCC contact                                   |

*Once these are closed, the next step is a build plan with weekly
milestones for the team to approve. No building starts before that
approval.*
