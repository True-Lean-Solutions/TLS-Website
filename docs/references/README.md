# Reference images

Mack's mock-ups (`mack-mockups-2026-09-27/`) are AI-generated **direction**. They are not designs to copy pixel by pixel, and never a source of copy.

## What to take from a mock-up

- Layout, section rhythm, and hierarchy.
- Component patterns: cards, stat rows, step rows, the CTA band, and the footer columns.
- The black header with the lockup at left.
- The light body, and the isometric system art style.

## What to never take from a mock-up

Brand Guide v2.3 overrides the mock-ups on all of these:

- **Text of any kind.** Page copy comes from the docs listed in `docs/sources.md`.
- **Numbers.** None of these appear anywhere on the site: 100+ projects, 50+ organizations, 20+ years, 90% retention, 30%/40%/25%, 35%/50%, 40%/99%, 2x/25%, "100% focus", "Proven", "End-to-End". The only publishable metrics are the verified ones in v2.3 §15.
- **Slogans styled as taglines.** Examples: "Practical Solutions. Real Business Impact.", "Real Challenges. Measurable Results.", and "Strategy / Build / Integrate / Deliver" chips.
- **People.** Mock-ups 01, 02 and 03 show AI-generated people, and v2.3 bans invented people.
- **The mountain path.** Mock-up 04 uses Tech Transpire's visual world.
- **"Get Started".** Use the CTA library in v2.3 §09.
- **A fifth "Technology Strategy" service.** TLS has four services on the site.
- **Understand → Simplify → Deliver.** The approved approach copy is the four steps in the Home doc.

## Mock-up index

| File | Shows | Use for |
|---|---|---|
| 01-home-hero-people-with-about-fold.png | Hero with people, services strip, about fold | Services strip and about-fold layout only |
| 02-hero-photo-raw-people.png | Raw hero photo | Nothing (invented people) |
| 03-home-hero-people-with-approach-fold.png | Hero plus approach fold | Approach step-row layout |
| 04-approach-mountain-variant.png | Approach on a mountain path | Nothing (Tech Transpire imagery) |
| 05-approach-isometric-logo-light.png | Approach fold with isometric logo art | **Home: Our Approach** layout; the hero art direction |
| 06-isometric-logo-art-light.png | Isometric platform with the TLS symbol | **Hero art** direction |
| 07-isometric-art-dark-no-logo.png | Dark isometric art | Only a dark emphasis band, if one is approved |
| 08-services-cards-with-photos.png | Service cards with image headers | Services overview (alternative) |
| 09-services-cards-icons.png | Service cards with icons | **Home: What We Do** and Services overview |
| 10-common-challenges.png | Challenges list plus art | Not in v1 (no approved copy block) |
| 11-results-and-case-studies.png | Stats and case-study carousel | **Home: Recent Results** layout (verified numbers only) |
| 12-why-choose-us.png | 2×2 value cards plus art | **Home: Why TLS** layout |
| 13-cta-band-and-footer.png | CTA band and full footer | **Home: closing CTA band** and **site footer** |

`tali-v1.1/` holds the assistant designs. They are out of scope for v1. Do not build Tali, and do not reserve UI space for it.

## Pages without a reference

These routes have no mock-up: About Us, the four service detail pages, Insights index and categories, Insights article, Contact, Referral Partner Program, Referral FAQ, and 404.

**Before building the layout of one of these pages, ask for a reference image.** Hemang or Himanshu supplies it. Save it as `docs/references/pages/<route>/<nn>-<what-it-shows>.png` and add a row to this index. If they tell you to proceed without one, derive the layout from the components already built for Home, and record that in `docs/decisions.md`.
