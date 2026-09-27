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

**Status:** interim

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
