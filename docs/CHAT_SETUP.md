# Optional protected AI chat

The built-in Yang Yang assistant remains available on the static website without credentials or a backend. Festival-address questions are answered directly from the website's canonical venue data. Optional live cultural answers use a separate Node server; GitHub Pages cannot run this server.

## Run locally

Use Node.js 22.12 or newer. Copy `.env.example` to `.env` and set `GEMINI_API_KEY` locally or in your server host's secret manager. Never send a key in chat, commit `.env`, put a key in a `VITE_` variable, or compile it into GitHub Pages JavaScript. If an old browser-embedded key was deployed, rotate it in the provider account.

Run `node --env-file=.env server/chat.mjs`. The default service is `http://127.0.0.1:8787`. `GET /api/chat/status` returns `{ "enabled": true }` only when a key exists; `POST /api/chat` accepts `{ question, lang, history }` and returns `{ text }`. History messages use `role: "user" | "bot"` and `text`. Configure the public frontend endpoint `VITE_CHAT_API_URL` to the service's `/api/chat` URL and restart/rebuild the website. This endpoint URL is public; credentials remain server-side.

The default model is `gemini-2.5-flash`, preserving the existing site's provider/model choice. The [official model page](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash) currently limits its availability for new accounts. An MCCC account owner should verify account access and set `GEMINI_MODEL` to an available model before activation. Real provider access was not verified during development; tests use mocked responses and make no billed API requests.

## Deploy the service

Deploy the `server/` files together with the current `src/data/` and `src/i18n/` JSON to an MCCC-controlled Node host supporting HTTPS. Keep that data in sync with each website deployment. Set `GEMINI_API_KEY`, `GEMINI_MODEL`, `CHAT_HOST=0.0.0.0` when required by the host, `CHAT_PORT`, and `ALLOWED_ORIGINS` to exact comma-separated website origins, for example `https://alexorr2142-sudo.github.io,https://midsouthlunar.org`. Do not include paths, trailing slashes or wildcards. Use the host's TLS proxy. Configure the public build variable `VITE_CHAT_API_URL` to the external HTTPS `/api/chat` endpoint. Remove the variable to return to fully static local mode.

This example service has a 20-second provider timeout, 24 KiB request-body limit, 1,200-character question limit, six history messages of at most 2,500 characters, four simultaneous requests, ten requests per connection IP per minute, and a global 200-request UTC-day allowance. Reservations happen before the request body is read. Failed/invalid requests still consume their reserved allowance. Missing keys return 503; upstream errors/timeouts cause the browser to fall back to local answers.

Origin checking is a browser access boundary, not authentication: nonbrowser clients can spoof an Origin header. Rate/budget limits and provider-account spending controls are necessary for a public endpoint. Counters live in process memory, reset when the service restarts, and are per instance. Use one instance or shared host-managed quotas for a larger deployment. The service deliberately ignores spoofable forwarded-IP headers; behind a proxy, visitors may share the connection-IP allowance. Configure trusted host-level per-visitor limiting rather than accepting arbitrary `X-Forwarded-For` values. Keep the global cap and provider spending controls enabled.

## Grounding and privacy

Server instructions include the current event, schedule, vendors, cultural guide and website/FAQ text. Festival answers must use those facts, preserve preliminary status and identify missing facts. For broader cultural questions the model may use general knowledge, distinguish legends from documented history, and identify uncertainty. The bot cannot buy tickets or accept payment details.

In live mode, the question, bounded recent history and website context are sent to Google. The service does not persist chat messages or log message bodies/API keys. Hosting and provider systems may keep their own logs; review the organization's account configuration and provider terms before launch. The [official generateContent REST schema](https://ai.google.dev/api/generate-content) supports a `store` boolean for request logging; the service sends `store: false`. This is not a promise of zero data retention or an exemption from provider terms. Local knowledge mode keeps chat content in the browser.

## Verification

Run `npm run test:unit` and `npm run build`. The server contract tests cover canonical venue/FAQ grounding, all seven request languages, payload bounds/roles, server-only credential transport, absent keys, provider failure/malformed output, timeout/abort, exact-origin CORS, body limits and rate/concurrency reservations. Before public activation, perform an account-owner-controlled live check for a festival question, a broader cultural question, outage fallback and account usage. No real API key is required for the automated suite.
