# Decisions

This file is append-only. Add new entries at the bottom. Never edit or delete an old entry. If a decision is reversed, append the reversal and mark the original `superseded`.

Log a decision here when it is **right for now and wrong in the long term**. That covers:

- an expedient;
- a guess made to keep moving;
- an abstraction skipped on purpose;
- a page built without a reference image;
- a dependency added on a trial basis.

Ordinary changes do not belong here. If you cannot say what would undo a decision, it does not belong here.

Entry format:

```
## YYYY-MM-DD — <decision in one line>

**Status:** interim | settled | superseded

**Decision.** What was done.

**Why.** The reason at the time.

**Cost we are accepting.** What this makes worse.

**Revisit when.** The concrete condition that undoes it.

**Where it lives.** Files.
```

---

## 2026-09-28 — Articles are Markdown files in the repo, not a CMS

**Status:** superseded (by the block content model + Sveltia CMS decision below)

**Decision.** Insights posts live in `src/content/insights/` as Markdown with a typed front-matter schema. Publishing a post takes a commit.

**Why.** The Google Docs backend was removed. Mack's call was "take it off". Choosing a CMS was deferred so v1 can ship.

**Cost we are accepting.** Only someone with repo access can publish or edit a post.

**Revisit when.** Someone who is not a developer needs to publish, or the post cadence outgrows commits. Because every page reads the posts through the content collection, only the collection's loader has to change.

**Where it lives.** `src/content.config.ts`, `src/content/insights/`.

---

## 2026-09-28 — Page copy is a baseline to draft from, not verbatim source

**Status:** settled

**Decision.** The 2026-09-27 Drive docs (`sources.md` §1) become the *baseline* for page copy. Claude drafts, edits, restructures, and adds connective copy off them; Himanshu reviews and iterates. The claims policy is unchanged: no invented metric, client, testimonial, partnership, capability, date, or factual assertion about TLS. This reverses the earlier "use the copy verbatim" rule.

**Why.** Himanshu's call (2026-09-28): the Drive copy is a starting point, and a review loop is faster than treating it as fixed.

**Cost we are accepting.** Copy can drift from what leadership last approved in the docs; every page must be reviewed against a source of *facts* even though the *wording* is open.

**Revisit when.** Leadership wants copy locked to an approved doc again, or a review reveals drafted copy is straying from approved positioning.

**Where it lives.** `CLAUDE.md` §Sources item 2, §Hard rules.

---

## 2026-09-28 — Privacy Policy and Terms of Service ship from a template, pending clause approval

**Status:** interim

**Decision.** Both legal pages are in v1, drafted from a standard boilerplate template with clearly marked placeholders (legal entity name, jurisdiction, the exact contact-form data collected). They do **not** publish until Himanshu approves every clause.

**Why.** Himanshu added them to v1 scope and chose template output. Claude will not invent binding legal/factual terms, so a reviewed template is the safe path.

**Cost we are accepting.** Template legal text is generic and not a substitute for counsel; it can misstate real data-handling or liability terms until reviewed.

**Revisit when.** Counsel supplies real legal copy, or the data the site collects changes.

**Where it lives.** `src/pages/privacy-policy.astro`, `src/pages/terms-of-service.astro` (to build); footer links.

---

## 2026-09-28 — Launch service URLs clean, no redirects

**Status:** interim

**Decision.** v1 uses `/services/<slug>/` for all four services with no redirects from old URLs (`/services/software`, `/enterprise-ai/`). Provisional until the current live Google Sites site and the Phase 1 port are reviewed for inbound links worth preserving.

**Why.** Himanshu's steer: "launch clean, probably" — confirm against the old sites first.

**Cost we are accepting.** Any existing inbound link or indexed old URL 404s until a redirect is added.

**Revisit when.** The old-site review (links pending from Himanshu) finds a URL with traffic or backlinks; then append a redirect decision.

**Where it lives.** `astro.config.mjs`, `src/pages/services/`.

---

## 2026-09-28 — Layout widths: 1200 px sections, 680 px reading

**Status:** settled

**Decision.** Full-width multi-column sections cap at 1200 px; running text caps at 680 px. This follows mock-up 13 over v2.3 §18's 900 px, which described the old single-column site (per CLAUDE.md § Design tokens).

**Why.** The redesign is multi-column; 900 px cannot hold the 3–4 column grids.

**Cost we are accepting.** A wider content measure than the old site; must hold reading text to 680 px separately so line length stays under ~80 characters.

**Revisit when.** A future design system sets different container widths.

**Where it lives.** `src/styles/tokens.css` (`--wrap`, `--reading`), used via `.wrap` / `.reading` in `src/styles/global.css`.

---

## 2026-09-28 — Deploy base defaults to "/" until the repo name is known

**Status:** interim

**Decision.** `astro.config.mjs` reads `base` from `SITE_BASE` (default `/`). Every internal link/asset goes through `href()` in `src/data/site.ts`, so switching the base later needs no code changes. `site` is the production canonical.

**Why.** The new GitHub repo name isn't set yet, so the GitHub Pages project path (`/<repo>/`) is unknown. Building against `/` unblocks local work.

**Cost we are accepting.** If deployed to a project path without setting `SITE_BASE`, links/assets 404. The deploy workflow must set it.

**Revisit when.** The repo is created — set `SITE_BASE` in the Actions workflow, or drop it once the custom domain serves from root.

**Where it lives.** `astro.config.mjs`, `src/data/site.ts`.

---

## 2026-09-28 — AI-generated people are allowed on the website (reverses decision 9)

**Status:** interim

**Decision.** The website may use AI-generated people imagery. The home hero now ships the mock-up 01 / 02 photo (a team at a laptop with tech overlays). This reverses settled decision 9 and Brand Guide v2.3 §13 ("no invented or AI-generated people").

**Why.** Himanshu's call (2026-09-28): the mock-ups are the source of truth for design and the site must match them, including their people imagery. He directed "for website ignore no AI generated people rule."

**Cost we are accepting.** Diverges from Mack's brand-guide imagery direction; Mack should be told. The shipped hero photo also carries baked-in "Strategy / Build / Integrate / Deliver" chips (a retired slogan) and a brain glyph — cosmetic, to be replaced with a cleaner shot later.

**Revisit when.** Mack weighs in, or a cleaner/on-brand hero image replaces the placeholder.

**Where it lives.** `public/hero/hero-team.png`, `src/pages/index.astro` (hero); `CLAUDE.md` § Hard rules (imagery).

---

## 2026-09-28 — Pages without mock-ups are derived from the Home component system

**Status:** interim

**Decision.** Pages that have no reference image (Contact, Services, the four service detail pages, About, Insights, the referral pages, 404) are laid out by reusing the Home components and design language — header/footer, `SectionHeading`/`Eyebrow`, cards, pill buttons, the CTA band — rather than waiting for a per-page mock-up. Reference images may still be pulled from the design GPT where helpful. Contact is the first page built this way.

**Why.** Himanshu approved it (2026-09-28): "Proceed and derive each page's layout from the home components." Keeps the build moving without a mock-up per page.

**Cost we are accepting.** These pages are a reasonable interpretation, not a mock-approved design; each may be reworked when a reference or feedback arrives.

**Revisit when.** A reference image or review changes a specific page's layout.

**Where it lives.** `src/pages/` (each derived page), `src/components/`.

---

## 2026-09-28 — Insights use a block content model + Sveltia CMS (supersedes the Markdown-file decision)

**Status:** interim

**Decision.** Insights posts are **structured YAML** with an ordered `blocks` array (rich text, icon cards, stat groups, steps, callouts, quote, image), rendered by `BlockRenderer` into real components. Authoring is via **Sveltia CMS** at `/admin/` (a maintained Decap successor), which commits to `src/content/insights/` with a variable-type block list and an icon picker — so anyone with repo access can publish cards/stats/callouts without a developer. This **supersedes** the earlier "Articles are Markdown files, not a CMS" decision. Adds one dependency, `marked`, to render rich-text blocks.

**Why.** Himanshu: the cards/icons/callouts are important on the inside pages and the CMS must author them — "future-proof the CMS so that I am not required for it." Flat Markdown couldn't represent or author those blocks.

**Cost we are accepting.** More moving parts than Markdown (a block schema, a CMS config, and a GitHub OAuth worker to stand up — see `docs/cms-setup.md`). The `marked` dependency renders rich-text blocks.

**Revisit when.** A block type is missing, or a hosted CMS is preferred over the git-based one.

**Where it lives.** `src/content.config.ts` (block schema), `src/components/BlockRenderer.astro` + `src/components/blocks/`, `public/admin/` (CMS), `docs/cms-setup.md`.

---

## 2026-09-28 — UI/UX interaction layer: motion, glass icons, page transitions (extends "minimal JavaScript")

**Status:** interim

**Decision.** Added a site-wide interaction layer without changing content, layout, colors, or type: glass-material icons, card and CTA hover micro-interactions, an animated nav underline that glides between items on navigation, a glass dropdown that fades and drops in, scroll reveals with a subtle stagger, an editorial reveal for About › What We Believe, slow pulse rings on the About map pins, a very small magnetic pull on primary CTAs, a faint cursor light on cards and the CTA band, and cross-document page transitions. One stylesheet (`src/styles/motion.css`) defines the tokens and utilities; one small module (`src/scripts/motion.ts`, ~1 KB) runs the reveals, cursor light, and magnetic pull. No new dependencies. Also fixed two small bugs found on the way: the About "Our Global Presence" anchor navigated to Home (`href()` prefixed `#global-presence` with `/`), and the header's click-outside-to-close never ran (`document.currentScript` is null in bundled module scripts).

**Why.** Hemang's direction (2026-09-28): make the existing site feel more premium and interactive through restrained motion, not a redesign. CLAUDE.md's "Minimal JavaScript" list did not include this, so it is recorded here.

**Cost we are accepting.** A little more JS than CLAUDE.md's minimum. Scroll reveals hide below-the-fold content until it scrolls in (only on screen, with motion allowed, and only once JS is confirmed; a 3 s failsafe un-hides everything if the script never runs). Page transitions and the gliding nav underline only run in browsers with cross-document View Transitions (Chrome/Edge 126+, Safari 18.2+); others navigate normally. `backdrop-filter` is used only on the open dropdown — on the icons it switched Chromium to grayscale text anti-aliasing site-wide, so the icons get their glass look from layered gradients instead. The header's `view-transition-name` is set only while a transition runs, for the same reason.

**Revisit when.** Any motion reads as distracting in review, performance budgets are set, or the CMS adds content types that need their own reveal hooks.

**Where it lives.** `src/styles/motion.css`, `src/scripts/motion.ts`, `src/layouts/BaseLayout.astro` (head script), `src/components/{Header,Button,ServiceCard,ValueCard,StatInline,InfoCard,InsightCard,TeamCard,TestimonialCard,Footer,GlobalDelivery,CtaBand,CaseStudyBlock,SectionHeading,ContactForm}.astro`, `src/components/blocks/CardGrid.astro`, `data-reveal` attributes in `src/pages/**` and `src/layouts/ArticleLayout.astro`.

---

## 2026-09-28 — Services and Insights dropdowns become glass mega-menus; icon family redrawn as duotone

**Status:** interim

**Decision.** Both header dropdowns are now floating glass mega-menus (desktop): a two-column grid of items, each with a glass icon tile, its name, its existing one-line description and an arrow; a full-width footer link ("All Services" / "Explore All"); a notch that ties the panel to its trigger. Services items and blurbs come from `src/data/services.ts` (the Home "What We Do" copy); Insights items are the categories that have posts (descriptions from `categoryMeta`), and its footer adds CLAUDE.md's "Browse by Topic" as chips that deep-link to `/insights/?topic=…` (the Insights page now applies that parameter). On the mobile layout the same data renders as a plain expandable list with 48px rows. The icon family (`Icon.astro`) was redrawn once for the whole site: 1.75 rounded strokes plus a soft duotone fill, with more specific glyphs for the four services and new `book`, `megaphone`, `briefcase` icons for Insights categories. Labels stay "Services" and "Insights" — the reference's "Solutions" label was not adopted. No reference image was saved to the repo; the design follows the written brief.

**Why.** Hemang's direction (2026-09-28): premium SaaS-style navigation after a reference mega-menu, with the Insights menu matching Services instead of a plain list.

**Cost we are accepting.** The panels are larger than the old lists and rely on `backdrop-filter` while open (fallback: solid white). Hover-open now listens to pointer events (mouse/pen only) so tablets on the desktop layout don't double-toggle; triggers use `aria-controls` instead of `aria-haspopup` (disclosure pattern, since the panels are link lists, not ARIA menus).

**Revisit when.** Guides or News get posts (they appear in the grid automatically), the topic list grows past one row, or Mack/Himanshu review the menus.

**Where it lives.** `src/components/Header.astro`, `src/components/Icon.astro`, `src/components/iconTypes.ts`, `src/data/nav.ts`, `src/data/insights.ts`, `src/pages/insights/index.astro`.

---

## 2026-09-28 — "Services" is labeled "Solutions"; "Enterprise AI" is renamed "AI & Automation"

**Status:** interim

**Decision.** Every label that names the section now says "Solutions": the header nav item and its menu footer ("All Solutions"), the footer column, the overview page's eyebrow and `<title>` ("True Lean Solutions — Our Solutions"), the Home secondary button ("See Our Solutions"), and one word in the overview lead ("Each solution below…"). The first solution's name is "AI & Automation" everywhere it is used as a name: Home and overview cards, nav menu, footer, and the detail page's eyebrow and `<title>`. URLs are unchanged (`/services/`, `/services/enterprise-ai/`). Body copy on the AI page that uses "Enterprise AI" for the governed AI platform itself (e.g. "Enterprise AI is an intelligent layer…", the Wisebric paragraph) is unchanged.

**Why.** Hemang's direction (2026-09-28).

**Cost we are accepting.** The labels now differ from the 2026-09-27 source docs and the Website Pages sheet titles, and from Brand Guide v2.3's capability name "AI Solutions & Enterprise AI" — Mack should confirm. "See Our Solutions" is the Home doc's secondary button renamed, not an entry in the v2.3 §09 CTA library. URLs still say `services` and `enterprise-ai`; changing them would need redirects (ask first).

**Revisit when.** Mack confirms or changes the names, or the URLs are renamed to match.

**Where it lives.** `src/data/services.ts`, `src/data/nav.ts`, `src/data/site.ts`, `src/components/Footer.astro`, `src/pages/services/index.astro`, `src/pages/services/enterprise-ai.astro`, CLAUDE.md § Pages and § Header.

---

## 2026-09-28 — Home "Recent Results" metrics count up on scroll

**Status:** superseded (see "replays on every entry" below)

**Decision.** The three verified metrics on Home ($3M, 15 hrs, 3 weeks) count up from zero once, when the metrics row is ~30% in view (IntersectionObserver), over 1.8 s on the site easing curve, staggered 80 ms like the card reveals. "$3M" counts in tenths ($0 → $0.7M → … → $3M), units pluralize correctly (1 hr, 1 week), and each ends on the exact original string. Skipped entirely under reduced motion and without JS.

**Why.** Hemang's direction (2026-09-28).

**Cost we are accepting.** For under two seconds the screen shows intermediate figures that are not verified metrics. Mitigation, and why this stays within the claims policy: the published value never changes — the real text ("$3M") stays in the DOM throughout (transparent while counting), so crawlers, screen readers, copy/paste, and no-JS/reduced-motion visitors only ever get the verified figure; the counting overlay is `aria-hidden` and purely visual.

**Revisit when.** Leadership prefers static figures, or a metric changes format (the parser expects prefix + number + suffix).

**Where it lives.** `src/scripts/motion.ts` (`initCountUp`), `src/styles/motion.css` (count-up rules), `src/components/StatInline.astro` (`data-count-up`), `src/pages/index.astro` (`data-count-group`).

---

## 2026-09-28 — Recent Results count-up replays on every entry (supersedes "count up on scroll")

**Status:** interim

**Decision.** The count-up now runs every time the metrics row comes ≥25% into view and resets to "$0 / 0 hrs / 0 weeks" once the row has fully left the view (IntersectionObserver, thresholds 0 and 0.25). Duration is 3 s on the site curve, staggered 80 ms. One requestAnimationFrame loop per group, cancelled before any restart. The zero state shows from first paint: StatInline renders it into `data-count-live` at build time and CSS draws it over the real text; the real value stays the element's text throughout (crawlers, screen readers, copy/paste, no-JS and reduced-motion visitors get only "$3M", "15 hrs", "3 weeks"). The trigger watches the metrics row rather than the whole section: at 25% of the section, the numbers are still 84–144 px below the fold at every tested width.

**Why.** Hemang's direction (2026-09-28): slower, and replay on every visit.

**Cost we are accepting.** Same claims-policy consideration as before (intermediate figures on screen for ~3 s, never in the text). Parser and formatter live in `src/scripts/metric.ts`, shared by build and browser.

**Revisit when.** Leadership prefers static figures, or a metric changes format.

**Where it lives.** `src/scripts/metric.ts`, `src/scripts/motion.ts` (`initCountUp`), `src/styles/motion.css` (count-up rules), `src/components/StatInline.astro`, `src/pages/index.astro` (`data-count-group`).

---

## 2026-09-28 — Solutions expand from 4 to 8; the four new ones get short pages

**Status:** interim

**Decision.** Added Workflow Automation, Technology Strategy, Data & Analytics and Cyber Security after the original four, on the Solutions page (same 2-column card grid, now 4 rows) and in the Solutions mega-menu (a balanced 4 × 2 grid, widened to 760 px so descriptions wrap less, with an internal scroll only on desktop screens under 640 px tall). Each new solution has a short page (hero + closing band, one template: `src/pages/services/[solution].astro`) at `/services/workflow-automation/`, `/services/technology-strategy/`, `/services/data-analytics/`, `/services/cyber-security/`. New icons (`workflow`, `compass`, `analytics`, `security`) join the duotone family. Home ("What We Do") and the footer's Solutions column still list the original four.

**Why.** Hemang's direction (2026-09-28). Hemang confirmed Mack approved Technology Strategy and Cyber Security, although Brand Guide v2.3 says TLS is not "a strategy consulting firm" or "a cyber/SOC firm" and the About page assigns strategy to Tech Transpire — this entry records that change to the v2.3 positioning.

**Cost we are accepting.** Content is thin until real copy exists: Cyber Security is name-only (no source), Technology Strategy's line is drafted from existing positioning, Workflow Automation's from the v2.3 capability text, and Data & Analytics' from Mack's draft plan (whose mock figures and partner claims are excluded). The short pages are indexable but light. The new pages' `<title>`/meta are not in the Website Pages sheet. v2.3 still needs updating to match the new positioning.

**Revisit when.** Copy arrives for any of the four (replace its short page with a full one), Mack updates the brand guide, or leadership wants Home/footer to list all eight.

**Where it lives.** `src/data/services.ts` (`moreSolutions`, `solutions`), `src/data/nav.ts`, `src/pages/services/index.astro`, `src/pages/services/[solution].astro`, `src/components/ServiceCard.astro` (name-only cards), `src/components/Icon.astro`, `src/components/Header.astro` (menu sizing), `docs/sources.md` §5.

---

## 2026-09-28 — Header mega-menus made compact; menu uses one-line summaries

**Status:** interim

**Decision.** The Solutions menu keeps all eight items in a 4 × 2 grid but shrinks to 680 × ~380 px: horizontal rows (38 px glass icon with an 18 px glyph, 15 px/600 title, one 12.5 px summary line, a 14 px arrow on the title line), 72 px rows, a 50 px footer under a hairline, and a quieter panel gradient. The menu shows Hemang's one-line summaries (`summary` in `src/data/services.ts`, e.g. "Custom apps and internal tools"); cards and pages keep their full descriptions. The Insights menu uses the same compact rows for consistency. Mobile is unchanged (names only, 48 px rows).

**Why.** Hemang (2026-09-28): the eight-item panel (~650 px tall) was too large and too dense; target 380–450 px, scannable in 2–3 seconds.

**Cost we are accepting.** The menu summaries are Hemang-supplied copy, separate from the page copy, so two descriptions per solution now exist and must be kept in step. "Protect systems and information" is the only published line for Cyber Security; its card and page remain name-only.

**Revisit when.** A solution is added or renamed (add its `summary`), or page copy changes enough that a summary no longer matches it.

**Where it lives.** `src/components/Header.astro` (menu CSS, icon sizes), `src/data/services.ts` (`summary`), `src/data/nav.ts`.

---

## 2026-09-29 — Solutions page gets a cinematic hero; image retouched to remove its mock-up text

**Status:** interim

**Decision.** `/services/` now opens with a full-width hero over Mack's cinematic office/skyline image (red/blue wave along the bottom): eyebrow "Technology that turns", h1 "From Ideas to / Real Impact.", the supporting line, and a CTA — all real HTML, entering with a CSS-only stagger (60/200/350/500 ms, 700 ms; none under reduced motion). The existing "Our Solutions" introduction and the eight cards follow unchanged; its heading became an h2 (the hero holds the page's one h1) but keeps its previous size. The image's baked-in text and button were retouched out so no duplicate shows behind the HTML. Responsive art direction: text left on desktop, image focal point shifted on tablet, and on phones the copy sits above the meeting — verified at seven viewports that the text never overlaps the people and the wave stays in frame.

**Why.** Hemang's direction (2026-09-29). The CTA reads "Discuss Your Project", not the brief's "Get Started": Hemang chose the approved v2.3 §09 CTA when asked (CLAUDE.md forbids "Get Started").

**Cost we are accepting.** The hero copy ("Technology that turns…", "We help organizations strategize, build, integrate and optimize technology…") comes from Mack's mock-up, not the 2026-09-27 page docs, and leans on "strategize" (see the 2026-09-28 positioning entry). The image is an AI-generated scene with people (allowed since 2026-09-28) and was edited (text removal only). Text starts on the site grid (aligned with the header logo), which is ~9% from the left at 1440 px but further on very wide screens.

**Revisit when.** Mack supplies a text-free original, the hero copy is approved in a source doc, or other pages adopt the same hero pattern (extract a component then).

**Where it lives.** `src/pages/services/index.astro` (markup + styles), `public/solutions/hero-solutions.webp`, `docs/sources.md` §5.

---

## 2026-09-29 — One cinematic hero (`SolutionHero`) on the Solutions page and all eight solution pages

**Status:** interim

**Decision.** A single component, `src/components/SolutionHero.astro`, now renders the hero on `/services/` and on all eight solution pages: full-width image, dark left-side gradient, eyebrow, headline with a TLS-red second line, description, primary CTA plus "Email Us" (light-on-dark `ghost-light` button), and the shared CSS entrance stagger. Every page uses the same background image (Hemang, 2026-09-29, after confirming no solution-specific images exist and Bloom has no credits). Each page stays recognizable through its own copy plus its solution icon in a smoked-glass tile beside the eyebrow and a faint glow in its accent color. Copy: the four original pages keep their existing headline, intro and CTAs verbatim; Data & Analytics keeps its headline; Workflow Automation ("Turn friction into better workflows."), Technology Strategy ("Make technology work toward the right goal.") and Cyber Security ("Protect what your business depends on.") use Hemang's headlines in place of the bare solution name. Heights match across pages (684 px at 1440×900, 717 px on tablet). On phones the hero stacks the copy above a band of the image (meeting + wave), so long intros can't collide with the people. Body sections below the heroes are unchanged.

**Why.** Hemang's direction: one hero design language across the whole Solutions family, built once and configured per page.

**Cost we are accepting.** The brief asked for a different, solution-specific image per page; all pages share one until such images exist (the component takes an `image` prop, so each page can get its own later with no layout work). The three new headlines are Hemang-supplied copy, not from a source doc. Cyber Security's hero has no description (none exists yet).

**Revisit when.** Solution-specific images are available (pass `image` and, if needed, `position` per page), or Cyber Security copy arrives.

**Where it lives.** `src/components/SolutionHero.astro`, `src/pages/services/{index,enterprise-ai,software,integrations,technical-talent}.astro`, `src/pages/services/[solution].astro`.

---

## 2026-09-29 — Home client proof: logo strip + featured testimonial carousel

**Status:** interim

**Decision.** Home's testimonials and clients folds are one section, in this order: "Our Clients / Teams we work with" with a logo strip, then "What our clients say" as a single featured review in a glass card (large quote mark, 24 px text on desktop, real star rating, company logo + name + exact title; initials where there's no logo), with previous/next, dots, "01 / 03", and a pause button. Reviews switch with a 450 ms fade/slide; auto-advance every 7 s, paused on hover, focus, an open review, after the visitor navigates (12 s), when off-screen, or with the pause button; none under reduced motion. Long reviews clamp to five lines behind "Read full review" (the full verbatim text stays in the DOM). Without JS, all three reviews render in full. The logo strip is a static, muted row (grayscale only for NRI; UV Concepts keeps its colors; muting removed the same day, see "Client logos at full strength" below); it becomes a 30 s seamless marquee automatically once there are six or more real logos. The UV Concepts PNG's white background was made transparent so it sits cleanly on the page. `TestimonialCard.astro` was removed (its behaviour moved into the carousel); logos now come from `src/data/clients.ts`.

**Why.** Hemang's direction (2026-09-29): stronger, more premium client proof. The marquee is gated because only two real client logos exist — a marquee would have to repeat them five or six times across the screen, which the brief itself rules out ("do not duplicate logos excessively… never create fake clients").

**Cost we are accepting.** Only one review is visible at a time (the others are one click away and all are in the page for crawlers and screen readers). The "glass" card uses a translucent fill over a soft red/blue glow but no `backdrop-filter`: behind it is only smooth gradient, so blur would add nothing, and at rest it would cost Home its subpixel text rendering. A pause button was added beyond the brief because WCAG 2.2.2 requires one for auto-advancing content.

**Revisit when.** More client logos are approved (add them to `clients.ts`; the marquee turns on at six), a review is added (the carousel counts automatically), or leadership prefers a static grid.

**Where it lives.** `src/components/ClientLogos.astro`, `src/components/TestimonialCarousel.astro`, `src/data/clients.ts`, `src/pages/index.astro`, `public/clients/uv-concepts.png`.

## 2026-09-29 — Home gets a "Common Business Challenges" fold (Fold 4 reference)

**Status:** interim

**Decision.** A new section sits between the Home hero and "What We Do" (since the Why TLS move below: between Why TLS and What We Do). Its layout and copy come from the Fold 4 reference Hemang supplied (`docs/references/pages/home/fold-4-common-challenges.png`), and the copy is used verbatim:
- the eyebrow "Common Business Challenges";
- "Complex Challenges. Practical Solutions.", with "Practical" in Execution Red;
- the lede;
- four challenge cards: Inefficient Processes, Disconnected Systems, Scaling Teams, Underutilized Technology.

Each card links to the solution that answers it:
- Inefficient Processes → Workflow Automation;
- Disconnected Systems → System Integration;
- Scaling Teams → Technical Talent;
- Underutilized Technology → Technology Strategy.

The visual is the TLS isometric platform image Hemang supplied. It is not the reference image, and no new image was generated.
- **Desktop (≥ 1280 px).** A pre-composed "zoomed-out" version fills a panel from the end of a fixed 620 px copy column to the right edge of the viewport. Its left edge eases into the canvas over 150 px. Because of this, no text ever sits on the image.
- **Below 1280 px.** Intro, then the image as a full-width band, then the cards: 2 columns, and 1 column at ≤ 640 px.

Motion reuses the interaction layer:
- the intro and cards rise with the reveal stagger;
- the image settles in over 900 ms;
- the cards use `.ix-card` / `.ix-light` / `.glass-icon`, and on hover the card lifts 3 px and the arrow moves 5 px.

With reduced motion or no JS, everything is visible and nothing moves.

**Why.** It is Hemang's direction (2026-09-29). It overrides the earlier out-of-scope line for the mock-up 10 challenges fold, which was out only because it had no approved copy. Fold 4 supplies that copy.

**Cost we are accepting.**
- The card → solution mapping is our assumption; the reference has no links.
- The image's baked-in card labels ("Business Problem", "Measurable Results", …) are artwork, not copy, and they differ from the reference's art labels.
- There is no `backdrop-filter` on the cards: at rest it would cost Home its subpixel text rendering. The cards are 84% white instead.
- Between 1024 and 1279 px, the section stacks instead of showing a side panel. A narrower panel would crop the image's outer cards.

**Revisit when.**
- Leadership wants different card targets.
- A purpose-made image arrives. Regenerate the two WebPs from the master using the recipe in `docs/sources.md` §4.
- The Home fold order changes.

**Where it lives.** `src/components/CommonChallenges.astro`, `src/pages/index.astro`, `public/home/challenges-visual.webp`, `docs/references/pages/home/`.

## 2026-09-29 — Why TLS moves up, above Common Business Challenges

**Status:** interim

**Decision.** The Home "Why TLS" section is unchanged: the four value cards under "Consulting mindset. Lean thinking. Technical execution." It now comes straight after the hero. The Home order is: Hero → Why TLS → Common Business Challenges → What We Do → Recent Results → Our Approach → Client proof → CTA band. Common Business Challenges lost the top margin it had only to separate it from the hero; the standard section padding above it does that now.

**Why.** Hemang's direction (2026-09-29). He sent a screenshot of a "True Lean Approach" design (Understand → Simplify → Deliver) as the section to move. When asked, he chose to move the existing Why TLS section rather than build that design. Its copy stays unapproved (`docs/references/README.md`).

**Revisit when.** Leadership reorders Home again, or the "True Lean Approach" design is approved as copy.

**Where it lives.** `src/pages/index.astro`, `src/components/CommonChallenges.astro`, CLAUDE.md "Home fold order".

## 2026-09-29 — Common Business Challenges: the image blends into the page on every edge

**Status:** interim

**Decision.** The section's image no longer reads as a rectangle.
- **One image file** is used at every width. It is the supplied image at its own shape, sharp in the middle and softly blurred toward its edges.
- **CSS masks dissolve every edge into the canvas.** There is a wide left fade (about 21% of the image), eased fades at the top and bottom, and a soft right fade that only shows on very wide screens. The corners fade from sharp, to soft, to page.
- **A faint Build Blue / Bridge Plum glow** around the image makes the transition feel atmospheric.
- **Desktop (≥ 1280 px).** The image is vertically centered on the four cards, so the heading reads first and the cards and the platform read together. Its faded left tiles emerge from behind the cards' right ends; the cards are 84% white, so only a faint tint shows through. The platform starts 40 px right of the cards. The image is as large as that room allows, up to 920 px wide, so its fades stay inside the section.
- **Below 1280 px.** The image sits between the intro and the cards and dissolves on all four sides: edge to edge on phones, and up to 1000 px wide, centered, on tablets.

No JavaScript is involved. Text and card copy are unchanged.

**Why.** Hemang (2026-09-29): the image "looks like an external image inserted into the website", with hard edges. A first pass filled the section's height with a blurred, darkened copy of the image. He found it "too much blurred from the corners" and asked for smooth blur that blends with the site. He also found the image "not balanced with the content", because it was centered on the whole text block. It is now centered on the cards and larger.

**Cost we are accepting.**
- The image no longer fills the section's full height. Above and beside the heading there is only the faint glow.
- The masks are on a wrapper with 4 px of padding, not on the image itself. When a masked element's edge falls between pixels, Chromium lets a sliver of that edge pixel through. This showed as a 1 px line at the image's left edge.
- The worst measured contrast is 5.8:1 for the lede and 6.2:1 for card text. The test samples the real pixels behind the text at 1280–2560 px.

**Revisit when.** A purpose-made, wider or taller image arrives. The width formula (`--cc-img-w`, `--cc-img-x`) assumes the platform spans 0.203–0.855 of the image's width.

**Where it lives.** `src/components/CommonChallenges.astro`, `public/home/challenges-visual.webp`, `docs/sources.md` §4.

## 2026-09-29 — Site-wide scroll experience: GSAP + ScrollTrigger + Lenis

**Status:** interim

**Decision.** This is a motion-only upgrade across every page. Text, images, logos, colors, sections and structure are unchanged. The only markup additions are:
- a decorative progress-line element;
- the hero titles set as explicit line spans (same text, same look);
- a decorative spotlight element in `SolutionHero`.

**Dependencies.** `gsap` (3.15, free standard license; includes ScrollTrigger and SplitText) and `lenis` (1.3, MIT). Hemang named both in the brief (2026-09-29). Together with the site's own code they add about 58 KB gzipped of script.

**Architecture.** `src/scripts/scroll/` has one entry point and one `gsap.matchMedia()`. It reverts to the authored page whenever conditions change.

| Module | What it does |
|---|---|
| `core.ts` | Lenis, easing and timing scale. |
| `text.ts` | Headings reveal line by line out of a mask. SplitText is reverted once each reveal finishes. |
| `cards.ts` | Depth entrances for every card group, plus a faint per-column scroll drift on desktop. |
| `media.ts` | Hero parallax and controlled exits, clip reveals for large images, the Solutions-hero spotlight, the logo drift. |
| `story.ts` | The two scroll scenes. |
| `chrome.ts` | The progress line, the compact header and the footer reveal. |

**What moves, and where.**
- **Everywhere:**
  - smooth wheel/trackpad scrolling (touch stays native);
  - a 2px red progress line;
  - the header tucks 8px and gains a lift shadow after scrolling. It never hides, and stays solid ink: blur would cost the nav its subpixel text;
  - masked heading reveals and card depth entrances in place of fade-ups;
  - soft-edged gray section bands.
- **Home:**
  - the hero title rises line by line and the photo settles, then both exit with parallax;
  - the Common Business Challenges scene (wide desktop, mouse/trackpad, screens ≥ 820px tall): the section is held and the four challenges activate in turn;
  - the count-up now runs 2.4s (was 3s; the brief asks for 1.8–2.5s) and still replays on every entry;
  - the logo row drifts sideways with scroll. With two logos a marquee would repeat them across the screen, so the marquee stays gated at 6+ logos;
  - testimonials switch with a sequenced crossfade, and a sideways swipe changes review on touch screens (superseded the same day by the review reel, below).
- **Solutions:** the eight cards run as one horizontal sequence driven by vertical scroll (desktop, mouse/trackpad, when the scene fits the screen).
- **Solution pages:** parallax heroes, and a faint cursor spotlight on desktop.
- **About:** the map is unveiled through a clip and its pins start pulsing.
- **Insights:** covers ease out of a slight zoom and titles rise line by line as cards arrive; hovering a card draws an underline under its title.
- **Articles:**
  - the cover settles back as you read;
  - sub-headings, pull quotes and images reveal;
  - body text never moves.
- **Contact:** fields ease their focus states, and the confirmation and error panels settle in.
- **Page transitions:** about 550ms end to end.

**Why the less obvious choices.**
- *Scenes use native `position: sticky`, not ScrollTrigger pinning.* Fixed pinning registered as layout shift (CLS about 1.7 on Home). Transform pinning fixed CLS but cost roughly 300ms of main-thread work per screenful of scrolling. With sticky, the compositor holds the section, so there is no per-frame JS, no layout shift and no jitter.
- *Reveals fade with opacity only, never `visibility`.* With `visibility`, content waiting to be revealed couldn't be focused by keyboard or read by screen readers. Focusing anything unrevealed also reveals it at once.
- *The challenge story doesn't dim inactive cards with opacity.* That would pull their text below AA. Inactive cards go flatter, with a gray title and desaturated icon, at full contrast.
- *Scenes are off on touch devices, phones, short screens and with reduced motion.* Those get the normal layouts. Reduced motion also turns off smooth scrolling, parallax and all scroll effects.

**Verified.**
- `astro check` 0 errors.
- 102 page×width checks, all 31 pages at 1440–375: no overflow, nothing left hidden, no errors.
- Text is identical with and without motion.
- CLS 0.0006 while scrolling.
- Steady 60fps once a page is warm.
- Keyboard, anchors, and back/forward all work.

**Revisit when.** Leadership wants more or less motion, a sixth client logo arrives (the marquee takes over), or a new section needs its own scene. Add it in `story.ts`, sticky-based.

**Where it lives.** `src/scripts/scroll/*`, `src/scripts/motion.ts`, `src/styles/motion.css`, `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/components/{Header,SolutionHero,CommonChallenges,TestimonialCarousel,ContactForm,GlobalDelivery,InsightCard}.astro`, `src/pages/{index,services/index,services/enterprise-ai}.astro`.

## 2026-09-29 — Motion graphics: additive moments on top of the scroll experience

**Status:** interim

**Decision.** Hemang asked for motion graphics, adding to what exists and removing nothing. Each moment is a transient layer or a state that plays and then leaves the page exactly as designed. All of them are off with reduced motion and in print.
- **Solution pages: an arrival motion graphic.** A one-time light passes over the hero photo, under the text, and its movement follows what the solution does. It is keyed by the solution's icon in `SolutionHero`:
  - Cyber Security: a layered scan, top to bottom;
  - Data & Analytics: light streaming across;
  - System Integration: light from both sides meeting in the middle;
  - Workflow Automation: a light holding on each third of the image in turn;
  - Technology Strategy: a directional fill;
  - AI & Automation: rings radiating from the scene;
  - Technical Talent: a soft glow breathing in once;
  - Custom Software: two panels slotting into place.
  The Solutions overview hero is unchanged.
- **Home hero.** Once the photo has settled, a band of the brand's red-to-blue edge light crosses it once (soft-light blend, so it tints the photo rather than filming it).
- **The isometric illustration (`HeroArt`: Home › Our Approach, and the CTA band).** At Hemang's request it was replaced with an animated diagram of how TLS works, with the same four labels and the TLS mark.
  - **The platform is a colorful chip package:** brand-gradient sides (red → plum → blue), metal leads and a gradient-rimmed lid. The brand guide rules out circuit-board imagery, so it has no circuit traces.
  - **Its four tiles are the steps, in story order:** Business Problem → Lean Thinking → Right Solution → Measurable Results. Right Solution and Measurable Results swapped corners so the story runs clockwise.
  - **The chip assembles as it arrives.** A light then travels the loop. Each step lights its tile, connector and card, which checks off. Each tile's mark moves: a target ring pulses, a diamond draws, a cube slots in, bars rise. A wave runs along the leads. A halo closes each round.
  - **Hover (desktop):** hovering a card holds the story on that step.
  - **Performance and fallback:** it runs only while on screen. With reduced motion or without JS it is a still picture of the finished system.
- **Recent Results.** While each figure counts up, its icon tile charges with light, lifts a touch, and settles as the count lands. It replays with the count.
- **Our Approach and the solution pages' steps.** Steps arrive in sequence (01, 02, 03, 04): marker, rule, then text. Previously all four faded up together.
- **Insights cards.** Titles rise line by line as their card arrives. Hovering a card draws an underline under its title.
- **Testimonials.** On touch screens, a sideways swipe changes review; vertical scrolling stays native. (Superseded the same day: the carousel became the review reel, below.)
- **Fix.** The Insights card entrance left an inline transform on cover images, which cancelled their hover zoom, and the covers' own CSS transition fought the entrance. The entrance now pauses the transition and hands the cover back clean.

**Not done, and why.** The brief asks for a continuous logo marquee. CLAUDE.md keeps the client logos a static row until there are 6+ real logos; with two, a loop would repeat them across the screen. The row keeps its scroll drift, and this is flagged for Hemang.

**Where it lives.** `src/components/{SolutionHero,StatInline,InsightCard,TestimonialCarousel,HeroArt}.astro`, `src/pages/index.astro`, `src/scripts/motion.ts`, `src/scripts/scroll/{steps,cards,index}.ts`.

## 2026-09-29 — Contact page presented as a four-stage conversation

**Status:** interim

**Decision.** Hemang's brief turned the Contact page from a form into the start of a consulting conversation, changing presentation only. The one form now reads as four stages: 01 About you (Name, Email, Company, Phone, two columns on desktop), 02 Timeline, 03 The problem (the textarea as the centerpiece), and 04 Let's talk (Send message).
- **Unchanged:** every word of existing copy, every field (names, types, labels, required states, the 1000-character limit), validation, and the whole form contract. That covers the URLSearchParams POST, fire-and-forget sending, the honeypot, the success and error panels (role=status and role=alert), the noscript note, the booking link, email, phone and LinkedIn. A review confirmed the POST body is byte-identical to before, apart from the timestamp.
- **New UI micro-copy, from the brief:** the stage labels (01–04, About you, Timeline, The problem, Let's talk), "Sending…" and the step list's accessible name "Form steps". Labels live in `src/data/contact.ts`.
- **Hero:** a larger headline that rises line by line; the red phrase catches the light once. On desktop the supporting paragraph sits in the right-hand column, over the contact panel (Hemang confirmed this position), at its original size and color.
- **States:** focus warms the field, and filled fields show a small check. The counter has a hairline meter that turns red near the limit. After a failed submit, invalid fields are marked (aria-invalid) as well as getting the browser's own message. Send shows "Sending…" for 420ms, then the existing confirmation, which takes focus. The confirmation's space is reserved at submit, so nothing shifts later.
- **Timeline:** where the browser supports a styleable `<select>` (`appearance: base-select`, current Chrome and Edge), the list opens as a soft panel and the chevron turns. Elsewhere it is the native control. It is the same element with the same options.
- **Step indicator:** it follows scroll position: the last stage whose top has passed 42% of the viewport. The stage holding focus stays current until the visitor scrolls by hand.
  - Desktop: a step list at the top of the contact panel. The panel is sticky on screens at least 760px tall and releases at the end of the form.
  - Phones and tablets, and desktop whenever that list is out of view: a compact pill that sticks under the header through stages 01–03 and lets go before 04. It is decorative (aria-hidden), and taps pass through it.
- **Motion** (`src/scripts/scroll/contact.ts`): the card rises while its clip opens; each stage's head and fields arrive in turn; the panel settles in; the ambient light drifts. Entrances play once per page view, a resize or rotation never re-hides the form, and focusing the form finishes them at once. With reduced motion, everything is static and visible.

**Verified.**
- A 5-dimension review with adversarial verification (content and contract, accessibility, responsive, motion and performance, code). Its 21 confirmed findings were fixed and re-tested.
- The step indicator is correct after step links, Home/End and wheel scrolling.
- Shift+Tab never leaves focus under the header or strip (1366×768, 390×844).
- The phone strip never covers Send, and short laptop screens get the strip.
- A resize keeps the reader's place (a site-wide fix in `scroll/index.ts`).
- Keyboard (Space) submit causes no layout shift.
- Nothing is clipped at 320px, and focus stays clear in forced colors.

**Revisit when.** Himanshu reviews the stage labels, or the form gains fields.

**Where it lives.** `src/components/ContactForm.astro`, `src/pages/contact.astro`, `src/data/contact.ts`, `src/scripts/scroll/{contact,index,core}.ts`, `src/styles/motion.css` (scroll margins for focus).

## 2026-09-29 — Client reviews become a continuous review reel

**Status:** interim

**Decision.** At Hemang's request, the Home "What our clients say" carousel (one featured review at a time) is replaced by a reel. Two rows of review cards drift in opposite directions, endlessly, and the visitor's scrolling influences them. The reviews are unchanged: the same three, verbatim, attributed exactly (Mayank Pujara's "CEO · TLS advisor" included), with the same logos or initials and star ratings.
- **Loop.** Each row repeats its set of reviews to make the loop seamless: the offset wraps by exactly one set's width, and a copy always extends past both edges. Row 2 runs the list in reverse order, so the two streams never read the same. The repeats are hidden from assistive tech and the tab order; only the three originals are read.
- **Speed.** Row 1 drifts left at 32 px/s and row 2 right at 40 px/s. Scrolling down carries them faster (at most 1.35x). Scrolling up counteracts them and, when fast, gently reverses them. The influence is smoothed, so the reel eases up and settles rather than jumping. The page's scroll is never taken over.
- **Presence.** Cards are slightly more present in the middle of the screen (scale 0.96 to 1, opacity 0.88 to 1 at the edges). The rows enter from opposite sides and, on desktop, part slightly in depth as the page scrolls. A faint red cursor light shows on desktop.
- **Control.** A pause button (WCAG 2.2.2) is provided. Hovering, pressing (touch) or focusing a row eases it to a stop, and a focused review glides to the middle.
- **Long reviews.** Greg Hackbart's letter and Mayank Pujara's review are clamped in the card, never shortened: the full text stays in the page. "Read full review" opens the whole review in a dialog.
- **Phones.** One row. With reduced motion, or without JS, the reviews are a still grid (full text without JS).

**Known trade-off.** There are three reviews, so each appears more than once on screen at a time (in both rows). Showing one row on desktop too would reduce the repetition; a two-line change in `ReviewReel.astro`.

**Verified.** Seamless loop (no gaps over 24s including a wrap, at 1024–2560); 60fps at 1440 and 1024; no horizontal overflow; three exposed reviews; dialog, pause and hover all work; still grid under reduced motion.

**Where it lives.** `src/components/{ReviewReel,ReviewCard}.astro`, `src/scripts/scroll/reel.ts`, `src/pages/index.astro`. `TestimonialCarousel.astro` was removed.

## 2026-09-29 — Client logos at full strength, in a clean rail

**Status:** interim

**Decision.** At Hemang's request, "Teams we work with" shows the client logos as bold brand marks, using the exact assets with no recoloring. The muted look is gone: no grayscale on NRI, no 65% opacity on either logo, and nothing ever filters or fades them, whether at rest, on hover or in motion.
- **Sizing.** Each logo sits in the same visual zone (a reusable `ClientLogoItem`: about 250×96 px on desktop, 42vw×80 on phones), vertically centered, at its natural aspect ratio (`object-fit: contain`), never cropped or stretched. Optical size comes from `displayHeight` in `clients.ts`, shown 1.25× in the rail: NRI renders about 215×43, UV Concepts 65×65.
- **Rail.** Hairlines above and below that fade at both ends, generous spacing, and a thin divider between logos.
- **Hover (desktop).** A 1.05× lift and nothing else.
- **Motion.** The row keeps its scroll drift. The marquee still switches on automatically at six or more real logos, and `ClientLogoItem` is used in both.
- The unused `muted` field was removed from `clients.ts`.

**Known limit.** The UV Concepts asset is a 66×66 px pale outlined mark with no wordmark, and the Drive original is the same size. So it stays at 65 px (native: larger would blur), and its pale gray is its real color. To make it as strong as NRI's, we need a larger or vector logo, ideally with the "UV Concepts" wordmark, from the client.

**Where it lives.** `src/components/{ClientLogos,ClientLogoItem}.astro`, `src/data/clients.ts`.

## 2026-09-29 — About › Global Delivery: location cards with skylines

**Status:** interim

**Decision.** The six location cards follow Hemang's reference design: a 3 × 2 grid (2 columns on tablets, 1 on phones) of compact white cards, each with:
- a numbered circle, and a status pill (solid Action Red for Headquarters, blue tint for Active, plum tint for Expanding);
- the place name and its line;
- a line-art skyline of the place along the bottom, over a bar in the status color.

Expanding uses the brand's Bridge Plum rather than the reference image's violet, to stay on-palette. Hemang asked for the cards to be smaller after the first pass; the compact sizes are the result.
- **Text unchanged.** Hemang chose to keep the current text over the reference image's: "Dallas–Fort Worth" (not "USA") with "Global Headquarters · Prosper, Texas", and Mexico keeps "· Guadalajara". Status words, order and the CTA are unchanged.
- **Skylines** are cut from the reference image itself (AI-generated line art: Reunion Tower and Dallas; India Gate; Westminster, Big Ben and the London Eye; the Burj Khalifa and Burj Al Arab; the Sydney Opera House and Harbour Bridge; Mexico City's cathedral and the Angel of Independence). See `docs/sources.md`. They are decorative (`alt=""`); the place names are real HTML.
- **Motion** (`scroll/places.ts`): each skyline rises out of a mask from the ground up as its card arrives, the status and name settle, and the bar draws across. On desktop the skylines drift slightly with scroll. On hover the card lifts, the skyline eases forward and the bar glows. With reduced motion the cards are still and complete.

**Considered and set aside.** An earlier pass from Hemang's brief drew each place as a real geographic silhouette instead: Natural Earth outlines of Texas, India (official boundary), the UK, UAE, Australia and Mexico, with markers. They were animated SVG. Shown the skyline reference, Hemang chose skylines.

**Where it lives.** `src/components/GlobalDelivery.astro`, `src/scripts/scroll/places.ts`, `public/about/skylines/`.

