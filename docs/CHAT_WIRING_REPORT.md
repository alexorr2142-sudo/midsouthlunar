# Yang Yang live-mode wiring check — October 9, 2026

**Question asked:** is the Gemini API actually connected to Yang Yang, and does it work?
**Short answer:** it was not connected on the live site (finding D-12 below). Every link in the chain has now been verified except the one that needs a real key, which only the festival account owner can supply. The project now ships a Cloudflare Worker so the live site can use AI mode without anyone running a server.

## What was checked

| Step | Method | Result |
|---|---|---|
| Live site (`alexorr2142-sudo.github.io/midsouthlunar`) | Downloaded the deployed `ChatPanel` chunk and searched for a chat API URL or `fetch` call | **None present.** The Pages build ran without `CHAT_API_URL`, so the AI adapter was tree-shaken out. Yang Yang on the live site is built-in mode only. |
| Node service, no key | `node server/chat.mjs`, `GET /api/chat/status`, `POST /api/chat` | `{"enabled":false}`, then 503 `chat_unavailable`. Bad origin → 403. As designed. |
| Node service, dummy key | Same, with `GEMINI_API_KEY=AIza-not-a-real-key` | `{"enabled":true}`; POST → 502 `provider_unavailable` because Google replied 400 `API_KEY_INVALID`. Proves the request reaches Google with the right shape and only the key is missing. |
| Browser → site → service → Gemini | Production build with `VITE_CHAT_API_URL` set, the real `createChatHandler` with Google swapped for a stand-in that records the outgoing request, Playwright on phone and desktop | Pass. The panel POSTs `{question, lang, history}`; the service sends `systemInstruction` with the Yang Yang rules and the venue/schedule/vendor JSON (address `7777 Walnut Grove Rd` present); a Korean question yields "Reply in Korean"; the second call carries the first exchange as history; the address question is answered from site data and never sent to AI; the AI reply renders in the panel and the footer shows the AI note. |
| Cloudflare Worker (new) | `tests/unit/chat-worker.test.js` (UT-10, 8 tests) and `wrangler dev` with a dummy key | Bundles with `nodejs_compat` and JSON imports; status, preflight (204 with exact origin echo), bad origin (403) and POST (502 from Google's 400) all behave like the Node service. Bundled grounding is byte-for-byte equal to what the Node service reads from disk, for all seven languages. |
| Full suite after the change | `npm run test:unit`, `npm run build`, `npm run lint` | 111 unit tests pass (was 103); bundle unchanged at 308.7 kB / 99.1 kB gzip; lint has the same pre-existing warnings and no errors. |

## Finding

| ID | Found by | Problem | Fix | Status |
|---|---|---|---|---|
| D-12 | Live-site check | AI mode depends on a hosted chat service plus the repo variable `CHAT_API_URL`; neither existed, so the "optional Gemini mode" documented in the README was not reachable from the live site. Requirements Draft 3 forbids a server the team has to run, which is why nobody had deployed one. | Added `server/worker.mjs` + `wrangler.jsonc` + the `chat-worker` workflow so the same service runs on Cloudflare's free Workers tier under the festival's own accounts (no server to operate, nothing tied to a student). Requirements updated with HO-13 to allow exactly this. | Code and tests done; activation needs the three repository secrets and the `CHAT_API_URL` variable (see `CHAT_SETUP.md`). |

## What still needs a human

Creating the Cloudflare account and the Gemini key, and pasting them into GitHub secrets, must be done by the festival account owner. The key must never be sent in chat, committed, or placed in a `VITE_` variable. Once the secrets exist, the live end-to-end check is: run the Worker workflow, confirm `GET <worker>/api/chat/status` returns `{"enabled":true}`, set `CHAT_API_URL`, redeploy Pages, open the site, ask Yang Yang a cultural question in two languages and an address question, and confirm the footer shows the AI note while the address still comes from site data. Then set a spending cap in Google AI Studio.
