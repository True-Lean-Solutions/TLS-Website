# Project history and settled decisions

This file is loaded with every session through CLAUDE.md. It records how the redesign got here and which decisions are settled. Do not re-open a settled decision unless Hemang raises it. If a decision is reversed, append the reversal to `docs/decisions.md` and update the line here.

## Timeline

- **Before August 2026.** trueleansolutions.com ran on Google Sites. Pages were Google Docs, pulled into the Site through an Apps Script proxy.
- **August–September 2026, Phase 1.** A static build pipeline in the private repo `Hemang-Dwivedi/trueleansolutions-website` rendered Google Docs and Sheets into static HTML on GitHub Pages. It was a deliberate one-to-one port of the old site, with no redesign. It is deployed at `hemang-dwivedi.github.io/trueleansolutions-website/`. The domain was never cut over. That repo stays live and untouched until this one replaces it.
- **2026-09-27, copy rewrite.** Every page was rewritten into the `Website Update (2026-09-27)` Drive folder, aligned to Brand Guide v2.2 ("consultative technology execution partner"). The case-study metrics were confirmed as verified by TLS leadership on the same day.
- **2026-09-27, design review with Mack Akhani (CEO).** Two sessions: a local recording (transcript in `docs/meetings/`) and a Teams call recorded in Fireflies. Mack produced the mock-ups in `docs/references/mack-mockups-2026-09-27/` as direction.
- **2026-09-28, decisions by Hemang.** Recorded below. Brand Guide v2.3 was issued the same day.

## Settled decisions

1. **The tagline is "Lean Thinking. Real Results."** It is the only one, used exactly, everywhere. "Build. Integrate. Automate. Deliver." is retired. Mack called it a slogan TLS never created, and said repeating one line protects the identity people already hold. "Solve the right problem. Build the right solution. Create measurable value." survives as positioning copy only (v2.3 §01).
2. **Brand Guide v2.3 is the brand source of truth.** Its messaging is identical to v2.2 apart from the tagline change. Its colors are re-sampled from the logo: Build Blue `#1288CF`, Bridge Plum `#873662`. v2.2 is kept only as an archive.
3. **Black header.** The logo sits on Ink Black. Nav links are light gray, with a white hover state and a red underline. The page body stays light, as the mock-ups show. There is no dark mode.
4. **Wordmark.** "TRUE LEAN SOLUTIONS" is entirely Execution Red under a white "TLS" on dark surfaces, as in `public/brand/tls-lockup-on-dark-reference.png`. The old two-tone "True Lean / Solutions" split is gone.
5. **No Google Docs or Sheets behind the site.** Content is hardcoded in the repo. Pages are Astro components. Articles are a Markdown content collection, so a CMS can be added later without rewriting pages. A CMS for articles will be evaluated after v1.
6. **New repo, Astro, static output, GitHub Pages.** It does not branch from the Phase 1 repo.
7. **Himanshu owns the website end to end.** Hemang (Technical Lead) and Mack guide. Himanshu shows progress every few hours, so keep work in small, demoable steps.
8. **Tali, the "True Lean AI Assistant", ships in v1.1.** It is not part of v1. Designs are in `docs/references/tali-v1.1/`.
9. **Visual rules follow the v2.3 hybrid.**
   - Tali is the only illustrated character.
   - Isometric system visuals may carry a restrained red/blue edge light.
   - No invented or AI-generated people.
   - No mountain paths.
   - No brain or circuit-board clichés.
10. **Mock-up content is not approved.** Numbers, taglines and people in the mock-ups are placeholders. Only verified metrics are published (v2.3 §15).
11. **Insights information architecture.**
    - Insights opens a menu with Explore All, Perspectives, Case Studies, Guides and News. Each category gets a one-line description:
      - Perspectives: ideas, trends and expert thinking.
      - Case Studies: real challenges, real solutions.
      - Guides: practical frameworks and how-to resources.
      - News: company updates and announcements.
    - Mack rejected "Insights > Insights" as a label because the repetition isn't elegant.
    - Mack asked for Browse by Topic and search.
12. **News launches with company milestones for SEO:** the founding, the first client (NRI North America), and the Salesforce implementation. Hemang must supply the dates and approve the wording. Do not write these posts from inference.
13. **Stat copy leads with the part that lands.** For example, "every week" and "annual savings" carry the weight in "15 hours of manual work removed every week". Reorder words for punch, but never change a number or a claim.
14. **About page order: who we are, the team, our values, and our story last.** This is Mack's instruction. It reorders sections of the 2026-09-27 About doc and changes no copy.
15. **Brand strings live in one place** (`src/data/site.ts`) and are never typed inline. A hardcoded brand string leaked between brands once already in the Phase 1 forks.

## Open questions

The four questions below were resolved by Himanshu on 2026-09-28. They are kept here for the record; see `docs/decisions.md` for the interim ones. Do not re-open them unless Hemang raises them.

- **Tech Transpire on the About page.** ~~Confirm before publishing.~~ **Resolved: keep the section** (text only — no Tech Transpire logo, color, imagery, or `@techtranspire.com` address anywhere on the site).
- **Service URLs.** ~~Ask whether any old URL needs a redirect.~~ **Resolved: launch clean with no redirects, pending a review of the old sites.** Himanshu to send the current live site and Phase 1 port links; confirm nothing has inbound links worth preserving before this is final.
- **Legal pages.** ~~Leave out until Hemang provides text.~~ **Resolved: Privacy Policy and Terms of Service are in v1**, generated from a standard template. Nothing ships until Himanshu approves every clause.
- **Newsletter.** ~~Leave out unless a provider is named.~~ **Resolved: dropped from v1.** No "Stay Connected" capture ships.
