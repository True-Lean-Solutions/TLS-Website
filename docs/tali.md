# Tali — Your True Lean AI Assistant

**Status:** built 2026-10-03 and **live on `main` since 2026-10-05** (Hemang). This brings Tali forward from v1.1 (project-history decision 8, now updated; see `docs/decisions.md`, 2026-10-05). Himanshu and Mack have not yet reviewed it.

## Decisions (Hemang, 2026-10-03)

- **Answers come from the site, not an LLM.** The site is static (GitHub Pages): there is nowhere to keep an AI API key, and a key in the browser would be public. Tali runs entirely in the browser over approved copy, so it is instant, free, and cannot invent a claim. An LLM (for example Claude behind a serverless proxy) can replace the engine's `respond` later behind the same `Reply` shape.
- **Handoff is a link, not a form.** Tali points to `/contact/` and the booking link (`site.booking`). It collects no personal data, so the privacy policy is unaffected.

## Decisions (Hemang, 2026-10-05): conversational intelligence

- **Understand first, then decide how to answer.** Every message goes through an understanding layer before anything is looked up. Ordinary conversation (greetings, thanks, "okay cool", goodbyes, questions about Tali) is answered locally and never touches the knowledge base. TLS questions use `knowledge.ts`; general questions ("what is an API?") use a glossary of neutral definitions; a described business problem starts a short discovery conversation.
- **Still no LLM by default.** The "general AI" step is a seam (`provider.ts`) that stays off until `PUBLIC_TALI_AI_ENDPOINT` names a proxy endpoint at build time. It is only asked what Tali can't place (an unknown general question, or a message it couldn't follow) and never about TLS facts; any failure or timeout keeps Tali's own reply. Turning it on needs a serverless proxy that holds the API key, an approved system prompt, and an update to the privacy note (the panel's note changes automatically).
- **Honest by construction.** TLS facts only come from `knowledge.ts`. Tali says plainly when it has no confirmed answer (certifications, policies, counts, tools the site never names), never promises outcomes or rankings, never claims to have booked or sent anything, and refuses to reveal its instructions.

## How it fits together

| File | Role |
|---|---|
| `src/components/Tali.astro` | Launcher, welcome bubble and chat panel (markup and styles). Included once in `BaseLayout.astro`. |
| `src/scripts/tali/ui.ts` | Opens/closes, renders replies, composer, suggestions, session memory. Loads the engine on first use. |
| `src/scripts/tali/engine.ts` | Conversation manager and response router: picks the strategy for each message (memory → social → guards → actions → general → discovery → TLS → honest fallback), keeps conversation memory, composes the reply. Also page starters and as-you-type suggestions. |
| `src/scripts/tali/understand.ts` | Message understanding: social intent, TLS entities and the facet asked (pricing, process, details, audience, data control), general concepts, definitions and comparisons, "aimed at TLS?", references ("that", "it"), topic switches ("actually…"), prompt injection. |
| `src/scripts/tali/language.ts` | Text clean-up: emoji, slang ("u", "abt", "thx", "wanna"), typo correction toward Tali's own vocabulary only (everyday words are never "corrected"). |
| `src/scripts/tali/smalltalk.ts` | Greetings, thanks, goodbyes, reactions, questions about Tali. Short, varied, no chips where they'd be noise. |
| `src/scripts/tali/general.ts` | Neutral definitions of business and technology ideas, each pointing to the TLS solution that covers it. |
| `src/scripts/tali/discovery.ts` | Business-problem discovery: recognize the problem, ask one useful question, then recommend. |
| `src/scripts/tali/provider.ts` | Optional general-AI provider (off by default), with timeout and fallback. |
| `src/scripts/tali/prompts.ts` | Proactive prompts: welcome and scroll-prompt copy, per-page suggestions, all timings. |
| `src/scripts/tali/knowledge.ts` | **Everything Tali may say**, copied from approved page copy with the source page as `url`. |
| `src/pages/tali/insights.json.ts` | Insights posts (title, excerpt, category, topics, link), generated from the content collection at build time. |
| `public/tali/` | Avatar and waving figure, cut out of `docs/references/tali-v1.1/tali-character-hero.png`. |

**Changing an answer:** change the page copy first, then mirror it in `knowledge.ts`. Pricing appears only where the site publishes it (Meeting Intelligence, AI Visibility Growth Team — as on the Featured AI Solutions cards).

## Behavior

- **Launcher** bottom-right, labeled "Chat with Tali". It lifts clear of the footer's back-to-top button. There is no "online" dot: Tali has no live service to be online or offline.
- **Proactive prompts** (Hemang, 2026-10-03). All copy, page suggestions and timings live in `src/scripts/tali/prompts.ts`.
  - **Welcome:** "Hi! 👋" plus a page-specific line and 2–3 suggestions, about 1.5 s after every page load. It hides after 10 s.
  - **Scroll prompt:** "Need any quick answers?" with that page's suggestions. It shows once per page load, after the visitor has scrolled 35% and paused, and hides after 7 s.
  - **Rules:** only one bubble at a time; a scroll prompt that comes due during the welcome waits for it. Nothing shows over the open chat, while a form field is focused or while a header menu is open. Once the visitor opens the chat, nothing more is offered on that page. Dismissing the welcome doesn't cancel the scroll prompt. Moving the pointer over a bubble restarts its countdown, and keyboard focus holds it.
  - **Suggestions:** go through the normal engine, exactly as if typed. Every suggestion is covered by the tests.
  - **Pages with their own wording:** Home, Solutions, Meeting Intelligence, AI Visibility Growth Team, Enterprise AI, Workflow Automation, Custom Software, System Integration, Technical Talent, About, Contact and Insights. Other pages get Home's.
  - **Avatar:** while available it gets a slow breathing ring (color only, no movement), and it floats twice when a bubble appears. On phones the bubble is narrower and shows two suggestions. With reduced motion there is no animation at all.
  - **Opening:** the panel never opens by itself. The one exception is following a link inside an answer, where the conversation continues on the next page.
- **Panel:** header (avatar, name, "True Lean AI Assistant", new conversation, minimize, close), conversation log, suggestions, composer (Enter sends, Shift+Enter adds a new line, 500 characters), privacy note. On phones it fills the screen and follows the visual viewport, so the composer stays above the keyboard. Esc minimizes.
- **Suggestions:** page-specific starters on an empty chat; follow-up chips under each answer; local as-you-type suggestions (no request per keystroke).
- **Memory:** the conversation lives in `sessionStorage` (this tab only), so it survives moving between pages. Minimize keeps it; Close clears it. The engine remembers the current solution, the last concept explained (so "does TLS do that?" resolves), the discovery state and the answer chips it offered, the visitor's apparent goal, and the last six messages; "start over" or Close resets all of it.
- **Conversation:** "hii" gets "Hiii! 👋", "thanks" gets "You're welcome! 😊" with no chips, "what is AI visibility?" gets a plain explanation, "does TLS do that?" then answers from the AI Visibility Growth Team, and "how much does it cost?" with nothing in play asks which solution rather than guessing. "Actually…" or "forget that" switches topic. A described problem ("we waste hours copying data between systems") gets one clarifying question, then a recommendation with links to the solutions; Contact is offered when the visitor asks about cost or a person.
- **While a conversation is under way** in the tab, page loads show no welcome or scroll prompt; they come back once the chat is closed.
- **Measurement hook:** `window` receives `tali:event` (`open`, `ask`, `answer` with its `intent`). No listener ships and nothing is sent; attach analytics here once a tool is chosen.

## Tests

The engine has a scripted conversation suite: 64 cases covering every starter, varied phrasings, typos, follow-ups, topic changes, off-topic questions and gibberish. A second pass asks every proactive-prompt suggestion on its own page and fails if any falls back; 62 suggestions are covered. An intelligence suite (2026-10-05) adds 195 checks: greetings, thanks, acknowledgements, goodbyes, identity, general knowledge, TLS knowledge, informal language, hybrid questions, context, topic switching, discovery, pricing, comparisons, out-of-scope, unsupported TLS facts, prompt injection, page context, memory, and the provider (success, error, timeout, empty and malformed answers; never asked about TLS facts). Browser runs cover the prompt timing rules and the conversation in the real panel (desktop, phone, reduced motion, provider down and up). They live in the session scratchpad and run with the repo's esbuild:
`node_modules/.bin/esbuild test.ts --bundle --platform=node --format=esm --outfile=test.mjs && node test.mjs`.
Move it into the repo if a test runner is adopted.

## Open items

- The brief was truncated at Phase 4.2. Knowledge, handoff, privacy and measurement follow the defaults above until the rest arrives.
- Insights "case studies" link to `/insights/case-studies/`: confirm that category page exists when it has posts.
