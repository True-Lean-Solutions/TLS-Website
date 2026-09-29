# TLS Website v2: working rules

This repo is the redesigned marketing site for **True Lean Solutions (TLS)**, trueleansolutions.com. TLS is a consultative technology execution partner for growing small and mid-sized businesses. The site is a static Astro build deployed to GitHub Pages.

Himanshu owns this project. Hemang Dwivedi (Technical Lead) and Mack Akhani (CEO) guide it. Your first job is a complete, working **base**: every v1 page built, with real content and the approved brand. Himanshu iterates on it from there.

@docs/project-history.md

## Sources, in order of authority

1. **Brand: `docs/brand/TLS_Brand_Guide_v2.3.md`.** It is a pandoc export of the canonical `.docx`; read the `.md`. Tagline, colors, voice, imagery, CTAs and the claims policy all come from here. `TLS_Brand_Guide_v2.2_SUPERSEDED.docx` is an archive. Never use it.
2. **Page copy: the 2026-09-27 docs in `docs/sources.md` §1.** These are the **baseline**, not gospel. Draft from them, edit, tighten, restructure, and add connective copy; then Himanshu reviews and we iterate. The **claims policy still binds every draft** (see Hard rules): no invented metric, client, testimonial, or factual assertion about TLS. The Home doc's H1 "Solve the Right Problem. Build the Right Solution." is approved positioning copy, not a tagline, so keep it.
3. **Layout: the mock-ups in `docs/references/`.** Read `docs/references/README.md` first. It says what to take from each mock-up and what to ignore.
4. **Previous copy (`docs/sources.md` §2): reference only.** Never publish it.

When sources conflict, the brand guide wins on tagline, color, imagery and claims. The 2026-09-27 docs win on page copy. Tell Hemang about any conflict rather than resolving it silently. The same applies when a source contains a retired line such as "Build. Integrate. Automate. Deliver.": leave the line out and tell him.

## Hard rules

- **The tagline is "Lean Thinking. Real Results."** It is the only one, written exactly that way. It appears in the header lockup and the footer. No other line may sit in a tagline slot or be styled as one.
- **Publish no number, client, testimonial or claim that is not in a source.**
  - The only metrics are the verified ones in v2.3 §15: $3M annual savings; 73% less manual data entry; 15 hours of manual work removed weekly; client onboarding cut from 3 days to 4 hours; a critical architect placed in 3 weeks; 40% infrastructure cost reduction.
  - The "35% operational costs" and "45 → 22 days" claims are unverified. Never publish them.
  - Every number in the mock-ups is a placeholder. Never publish one.
  - Testimonials come from the reviews sheet, verbatim, attributed exactly as the sheet gives them.
- **No Google Docs, Sheets, Apps Script content or Drive hotlinks at build time or runtime.** Import content once into the repo. The contact form's Apps Script endpoint is the single exception, and it only receives data.
- **You may draft and revise page copy; you may not invent claims.** Writing and reworking marketing copy off the §1 baseline is expected — headings, transitions, section framing, calls to action drawn from v2.3 §09. What you must never fabricate is a *claim about TLS*: a metric, a client, a testimonial, a partnership, a capability, a date, or any specific factual assertion that no source supports. When a layout needs a fact you don't have, ask. UI micro-copy (for example "Read more", "Menu", "Search insights", form validation messages) is always fine.
- **No Tech Transpire branding.** No Tech Transpire logos, colors or visual world (mountains, paths, summits). **Exception, now settled:** the About page keeps its "True Lean Solutions and Tech Transpire" text section (Himanshu, 2026-09-28). That is a written section only — it introduces no Tech Transpire logo, color, or imagery, and no `@techtranspire.com` address appears anywhere on the site.
- **CTAs come from v2.3 §09.** The primary CTA is "Discuss Your Project". Never use "Get Started" or "Request a Quote".
- **Imagery follows v2.3 §13, with one reversal.**
  - Isometric system art, as in mock-ups 05 and 06, is allowed.
  - Real team photos are allowed on About.
  - **AI-generated people are now allowed on the website** (Himanshu, 2026-09-28), reversing decision 9 / v2.3 §13. Match the mock-ups, including their people imagery (e.g. the mock-up 01 hero photo, now shipped). See `docs/decisions.md`. Mountains, robots (Tali is v1.1 only), brains and circuit boards are still out.
- **US spelling throughout.**
- **Brand strings, contact details and URLs are defined once** in `src/data/site.ts` and imported everywhere.

## Ask before you build

Stop and ask Hemang or Himanshu, batching every question into one message, when:

- **A page has no reference image.** `docs/references/README.md` lists which pages lack one. Ask for a reference before laying out that page. Save what you receive under `docs/references/pages/<route>/`. If told to proceed without one, derive the layout from the Home components and log it in `docs/decisions.md`.
- **A reference conflicts with v2.3.** Examples: a headline slogan, invented stats, or people imagery.
- **You want a dependency beyond Astro itself.** Name the package, the reason and the alternative. Likely candidates to propose:
  - `@astrojs/sitemap`: sitemap.
  - Pagefind: static search for Insights, which Mack asked for.
  - `@fontsource/montserrat` and `@fontsource/roboto`: self-hosted fonts instead of Google Fonts.
- **A Drive fetch fails,** or a source is ambiguous or missing.
- **A decision could not be undone cheaply later.** Examples: URL structure, adding redirects, removing a page.

Where the answer would not change what you build, proceed and state the assumption in your summary.

## Stack and commands

- **Framework and language:** Astro (current stable, static output) with TypeScript in strict mode.
- **Styling:** plain CSS. Tokens in `src/styles/tokens.css`, global rules in `src/styles/global.css`, component styles scoped in `.astro` files. No Tailwind or CSS framework unless Hemang approves one.
- **Minimal JavaScript:**
  - nav dropdowns and the mobile menu;
  - Insights search and topic filter;
  - the contact form;
  - the interaction layer (`src/scripts/motion.ts` + `src/styles/motion.css`: scroll reveals, cursor light, magnetic CTAs; see `docs/decisions.md`, 2026-09-28). Reuse its utilities (`.glass-icon`, `.ix-card`, `.ix-light`, `data-reveal`) rather than adding one-off animations.
  - the scroll layer (`src/scripts/scroll/`: GSAP + ScrollTrigger + SplitText, Lenis smooth scrolling; see `docs/decisions.md`, 2026-09-29). It applies itself site-wide from existing hooks (`SectionHeading`, `data-reveal` groups, `.ix-card`, the hero components). New pages get it automatically; add a new *kind* of motion there, in the matching module, never inline on a page. Reveals use opacity only (never `visibility`), so content stays focusable.
  Everything else ships as static HTML.
- **Commands:**
  - `npm run dev`: local server.
  - `npm run build`: production build to `dist/`.
  - `npm run preview`: serve the build.
  - `npx astro check`: type and template check.
  Run `astro check` and `build` before every commit. Both must pass.
- **Deploy:** GitHub Actions with the official `withastro/action`, deploying to GitHub Pages on push to `main`. Until DNS moves, the site serves from the `*.github.io` project path. Set `site` and `base` in `astro.config.mjs` so every internal link and asset respects `base`. Canonical URLs always use `https://www.trueleansolutions.com`.
- **Frontend design:** if the `frontend-design` skill is available, apply it to every visual build step.

## Target structure

```
src/
  components/    Header, Lockup, NavDropdown, MobileNav, Footer, Button, SectionHeading, SolutionHero (every /services/ hero),
                 CommonChallenges, ServiceCard, StatBlock, CaseStudyCard, StepRow, ValueCard, ReviewReel, ReviewCard,
                 ClientLogos, ClientLogoItem, CtaBand, TeamCard, ContactForm, InsightCard, TopicFilter
  layouts/       BaseLayout.astro (head, SEO, header, footer), ArticleLayout.astro
  pages/         index, about-us, services/index, services/[4 detail pages], insights/index,
                 insights/[category], insights/[slug], contact, referral-partner-program,
                 referral-faq, 404
  content/       insights/*.md
  content.config.ts
  data/          site.ts, services.ts, team.ts, testimonials.ts, clients.ts, stats.ts, nav.ts
  styles/        tokens.css, global.css
public/          brand/, team/, clients/, insights/covers/
docs/            see below
```

Every data file and every Markdown post records where its content came from, as `source: <Drive ID>` in front matter or a comment. That lets any line be traced back to a source doc.

## Pages in v1

| Route | Copy source | Reference | Notes |
|---|---|---|---|
| `/` | Home (2026-09-27) | Mock-ups 05, 06, 09, 11, 12, 13 | Fold order below |
| `/about-us/` | About Us (2026-09-27) | **Ask** | Reorder per decision 14: hero → Core Team → Advisors → What We Believe → Our Story → How We Evolved → TLS and Tech Transpire (settled: keep) → Today → CTA |
| `/services/` | Services - Overview | 09 (or 08) | Labeled **Solutions** on the site (2026-09-28). Four solutions, in the order AI & Automation (formerly Enterprise AI), Custom Software, System Integration, Technical Talent. URLs stay `/services/…` |
| `/services/enterprise-ai/` | Services - Enterprise AI | **Ask** | Wisebric partnership is approved for public use |
| `/services/software/` | Services - Custom Software Dev | **Ask** | |
| `/services/integrations/` | Services - System Integration | **Ask** | |
| `/services/technical-talent/` | Services - Technical Talent | **Ask** | |
| `/services/workflow-automation/`, `/services/technology-strategy/`, `/services/data-analytics/`, `/services/cyber-security/` | `docs/sources.md` §5 | Derive | Short pages (one template, `[solution].astro`) added 2026-09-28. Cyber Security is name-only until copy exists. Never publish the Data & Analytics draft's mock figures or partner claims. |
| `/insights/` | Index sheet and posts | **Ask** | Explore All: every post, newest first, with Browse by Topic and search |
| `/insights/<category>/` | Same | **Ask** | perspectives, case-studies, guides, news. A category with no published posts is hidden from menus and has no page. |
| `/insights/<slug>/` | Post files | **Ask** | Article layout, related posts |
| `/contact/` | Manifest meta; the form contract below | **Ask** | Form plus booking link |
| `/404` | None | **Ask** | Short, links home. UI copy only. |
| `/privacy-policy/` | Approved template | Derive | v1 (settled 2026-09-28). Generated from a standard template; **nothing ships until Himanshu approves every clause**. Draft with clearly marked placeholders for entity name, jurisdiction, and the exact contact-form data collected. |
| `/terms-of-service/` | Approved template | Derive | Same as above. |

Page `<title>` and meta description come from the `TLS: Website Pages (2026-09-27)` sheet. Every page gets an Open Graph title, description and image. The default OG image is the one the live site already uses: `https://lh3.googleusercontent.com/d/1GIBnKhaMw9o0COP_mmzSiIjK4_qqHLZv`. Download it into `public/` and do not hotlink it.

### Home fold order

1. **Hero.**
   - Copy: the H1, subcopy and both CTAs from the Home doc.
   - Art: the isometric platform with the TLS symbol and red/blue edge light (06 direction).
   - No people.
2. **Why TLS** (moved up from after What We Do, 2026-09-29).
   - Four value cards (12 layout), from the Home doc.
   - The section subhead "Consulting mindset. Lean thinking. Technical execution." is approved body copy.
3. **Common Business Challenges** (added 2026-09-29).
   - Layout and copy: the Fold 4 reference (`docs/references/pages/home/fold-4-common-challenges.png`). Copy verbatim as Hemang supplied it.
   - Four challenge cards, each linking to the solution that answers it.
   - Visual: the TLS isometric platform image Hemang supplied (not the reference image, and no new image). See `docs/decisions.md`.
4. **What We Do.** Four service cards with icons (09), from the Home doc's "What We Do" section. Each card links to its service page.
5. **Recent Results.**
   - The three verified stats from the Home doc (11 layout, verified numbers only).
   - Optional case-study cards linking to the three service-page case studies, using their verbatim headlines.
6. **Our Approach.** The four steps from the Home doc (01 Understanding, 02 Identifying, 03 Designing, 04 Implementing & Optimizing), in the 05 step-row layout.
7. **Clients, then testimonials** (one section since 2026-09-29). "Our Clients / Teams we work with" with the client logo strip (`ClientLogos`: a static row until there are 6+ real logos, then a slow marquee), then "What our clients say" as a continuous review reel (`ReviewReel`, since 2026-09-29: two rows drifting in opposite directions, influenced by scrolling; a still grid with reduced motion). The reviews sheet, verbatim. Mayank Pujara's position reads "CEO · TLS advisor"; keep it exactly as given.
8. **Closing CTA band.** "Not Sure Where to Start?" with both CTAs, in the 13 CTA band layout.

## Header, lockup, footer

- **Header.**
  - Full-width Ink Black bar, sticky.
  - Lockup at left.
  - Nav: Home, About Us, Solutions ▾, Insights ▾, Contact Us. ("Solutions" replaced "Services" as the label on 2026-09-28; see `docs/decisions.md`.)
  - Search icon, which opens Insights search.
  - One Action Red button, "Discuss Your Project" → `/contact/`.
  - Nav links are Border Gray. Hover and current page are white with a 2 px Execution Red underline.
  - Dropdowns must work by keyboard: arrow keys, Esc to close, focus returns to the trigger. On touch, a tap toggles the menu without navigating.
- **Solutions menu:** AI & Automation, Custom Software, System Integration, Technical Talent, Workflow Automation, Technology Strategy, Data & Analytics, Cyber Security, plus "All Solutions" (8 solutions since 2026-09-28; Home lists the first four, the footer all eight).
- **Insights menu.**
  - Explore All, Perspectives, Case Studies, Guides and News, each with its one-line description.
  - Browse by Topic: topics from post front matter.
  - Search.
- **Lockup.** Built from `public/brand/tls-mark.png` and live text:
  - "TLS" in white, Montserrat 800.
  - "TRUE LEAN SOLUTIONS" in Execution Red, Montserrat 700, tracked.
  - "LEAN THINKING. REAL RESULTS." in Border Gray, small caps.
  - Do not ship `tls-lockup-on-dark-reference.png`. It is a low-resolution screenshot. If a vector master is needed, ask.
- **Footer.**
  - Light (Section Gray), laid out like mock-up 13.
  - Lockup in its light-surface variant: TLS in Ink Black, name in Execution Red.
  - Tagline.
  - The positioning statement "We help organizations turn business needs into practical technology solutions."
  - Columns (since 2026-09-29, Hemang's footer reference), separated by hairlines: brand (lockup, the approved statement "Solve the Right Problem. Build the Right Solution.", positioning, social circles), Quick Links (the header's navigation), Solutions (all eight), Latest Insights (three newest posts with their covers and categories, from the Insights collection), Contact (email, phone, the "Discuss Your Project" CTA). A back-to-top button sits in the legal bar.
  - Contact column: email `success@trueleansolutions.com`, phone (848) 777-5326, LinkedIn `https://www.linkedin.com/company/108455615/`, Facebook `https://www.facebook.com/profile.php?id=61585073567371`.
  - © with the build year computed at build time, alongside links to Privacy Policy (`/privacy-policy/`) and Terms of Service (`/terms-of-service/`).
  - No YouTube and no newsletter/"Stay Connected" capture in v1.

## Design tokens

These values come from v2.3 §11 and §18. If this list and the guide ever disagree, the guide wins; fix this file.

```css
--red:        #D94040; /* Execution Red: accents, large text, graphics, underlines, logo */
--red-text:   #C23636; /* Action Red: small red text on light, filled buttons (5.42:1 with white) */
--plum:       #873662; /* Bridge Plum: gradient midpoint, sparing accents */
--blue:       #1288CF; /* Build Blue: graphics, icons, large text, text on dark */
--blue-text:  #0E6DAD; /* Blue Text: small blue text and links on light (5.51:1) */
--bg:         #F8F8FC; /* Canvas */
--surface:    #FFFFFF;
--section:    #F0F0F7; /* Section Gray */
--ink:        #0D0D0D; /* text, header background */
--text-2:     #5A5A72;
--muted:      #94A3B8;
--border:     #E2E2EE; /* also nav text on the black header (15.1:1) */
--border-2:   #CBD5E1;
--grad:       linear-gradient(135deg, #D94040 0%, #873662 50%, #1288CF 100%);
--grad-h:     linear-gradient(90deg, #D94040, #1288CF);
--red-tint:   rgba(217, 64, 64, 0.10);  --red-edge:  rgba(217, 64, 64, 0.25);
--blue-tint:  rgba(18, 136, 207, 0.10); --blue-edge: rgba(18, 136, 207, 0.25);
--font-head:  'Montserrat', Arial, sans-serif;  /* 600, 700, 800 */
--font-body:  'Roboto', Arial, sans-serif;      /* 300, 400, 500 */
--radius: 12px; --radius-lg: 16px; --radius-xl: 24px;
--shadow:   0 2px 16px rgba(13, 13, 13, 0.07);
--shadow-m: 0 8px 32px rgba(13, 13, 13, 0.12);
/* layout: content max 1200px for full-width sections; reading width 680px;
   breakpoints ≤1024 / ≤768 / ≤480 / ≤360 */
```

Mock-up 13 uses a 1200 px section width, not the 900 px in v2.3 §18. v2.3's 900 px was the old single-column site. Use 1200 px for multi-column sections and 680 px for reading text, and log the choice in `docs/decisions.md`.

## Accessibility and quality bar

- **Contrast.** WCAG 2.2 AA contrast on every text element, per the v2.3 contrast rules. Execution Red and Build Blue are for large text only on light surfaces.
- **Structure.** One `h1` per page. Landmarks: `header`, `nav`, `main`, `footer`. A skip link. Visible focus states. `prefers-reduced-motion` respected for every animation.
- **Images.** Every image has meaningful `alt`, or `alt=""` if it is decorative. Width and height are set, and below-the-fold images are lazy.
- **Responsive.** The layout works from 360 px up with no horizontal scroll. Test at 360, 768, 1024 and 1440.
- **Before calling a page done:**
  - build it;
  - open it at all four widths;
  - check every link;
  - compare the copy line by line against its source doc.

## Contact form contract

Keep this mechanism exactly. It was debugged three times in Phase 1, and replacing it was rejected each time.

- **Endpoint** (public, not a secret):
  `https://script.google.com/macros/s/AKfycbwPf3eXxyOC_5e9vMMX6bhX8cevN5j9ZHwdvsj36FzzrldTgMCnvH4GhP3LCSPjc7ZcTg/exec`
- **Method.** `POST` with a `URLSearchParams` body. Never JSON: JSON triggers a CORS preflight that Apps Script does not answer.
- **Fire-and-forget.** Call `fetch(url, { method: 'POST', body: params }).catch(() => {})`, then show success. Apps Script answers with a redirect the page cannot read.
- **Fields,** with these exact names:
  - `name` (required)
  - `email` (required)
  - `phone` (optional)
  - `company` (required)
  - `challenge` (required, max 1000 characters, live counter)
  - `timeline` (required select: "As soon as possible", "Within 1–3 months", "Within 3–6 months", "Just exploring for now")
  - `submitted` (ISO timestamp, set by script)
- **Honeypot.** A visually hidden `website` input. If it is filled, show success and send nothing.
- **Status panels.** The success panel uses `role="status"` and the error panel uses `role="alert"`. A `<noscript>` note gives the email address.
- **Booking link** for "Discuss Your Project": `https://calendar.app.google/4V1G48o4zR2NRFSA9`.

## Workflow

- Work on short-lived branches and open a PR to `main`. `main` deploys.
- Commit in small, demoable steps. Himanshu reviews every few hours.
- Record deliberately temporary choices in `docs/decisions.md`. That includes every page built without a reference image.
- Keep `docs/references/README.md` current when references are added.
- Out of scope for v1:
  - Tali (v1.1);
  - newsletter / "Stay Connected" capture (dropped 2026-09-28);
  - dark mode;
  - **Referral Partner Program / FAQ pages (dropped 2026-09-28** — handled externally at akhani.us, the referral partner portal).
  - (Privacy Policy and Terms of Service are now **in** v1 — see the Pages table.)
  - (A common challenges fold is now **in** v1, on Home, from the Fold 4 reference, not mock-up 10 — see the Home fold order, 2026-09-29.)
  - (An Insights authoring workflow / CMS is being chosen — see `docs/decisions.md`.)

## First session checklist

1. Read this file, `docs/project-history.md`, `docs/brand/TLS_Brand_Guide_v2.3.md`, `docs/sources.md` and `docs/references/README.md`.
2. Confirm that Drive fetches work by pulling one doc. Stop if they do not.
3. Batch your questions into one message:
   - the open questions in the project history;
   - dependencies you propose;
   - the reference images you need first.
4. Scaffold Astro, the tokens, the base layout, the header and the footer. Build Home against its mock-ups.
5. Import the content: pages, data files, the 14 posts, team photos, client logos and covers, each traced to its source ID.
6. Build the remaining pages one at a time, asking for each page's reference image before its layout.
7. Before handing the base to Himanshu, run `astro check` and `build`, and check every page at 360, 768, 1024 and 1440 px.
