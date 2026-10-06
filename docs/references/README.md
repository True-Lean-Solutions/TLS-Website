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
| 10-common-challenges.png | Challenges list plus art | Nothing: superseded by the Fold 4 reference below (2026-09-29) |
| 11-results-and-case-studies.png | Stats and case-study carousel | **Home: Recent Results** layout (verified numbers only) |
| 12-why-choose-us.png | 2×2 value cards plus art | **Home: Why TLS** layout |
| 13-cta-band-and-footer.png | CTA band and full footer | **Home: closing CTA band** and **site footer** |

`tali-v1.1/` holds the assistant designs. Tali is live since 2026-10-05 (Hemang brought it forward from v1.1); see `docs/tali.md`.

## Pages without a reference

These routes have no mock-up: About Us, the four service detail pages, Insights index and categories, Insights article, Contact, Referral Partner Program, Referral FAQ, and 404.

**Before building the layout of one of these pages, ask for a reference image.** Hemang or Himanshu supplies it. Save it as `docs/references/pages/<route>/<nn>-<what-it-shows>.png` and add a row to this index. If they tell you to proceed without one, derive the layout from the components already built for Home, and record that in `docs/decisions.md`.

## Page references received

| File | Shows | Use for |
|---|---|---|
| `pages/home/fold-4-common-challenges.png` | "Fold 4": Common Business Challenges, with copy on the left, four challenge cards, and isometric art on the right (Hemang, 2026-09-29) | **Home: Common Business Challenges** layout and copy (copy verbatim). Its header shows the retired "Services" label and the banned "Get Started" CTA, and its art labels ("Operational Efficiency", etc.) are not copy. Ignore all of that. Never ship the image itself. |
| `pages/home/challenges-image-original.png` | The TLS isometric platform image (1672×941) Hemang supplied as that section's visual | Not a layout reference: the **source master** for `public/home/challenges-visual.webp`. See `docs/sources.md` §4. |
| `pages/about/global-delivery-mockup.jpg` | Global delivery map fold | About: Global Delivery layout |
| `pages/services/meeting-intelligence/01-full-page.png` | Full-page Meeting Intelligence product page, eight folds (Hemang, 2026-10-02) | **`/services/meeting-intelligence/`** structure, copy and visual direction. Its interface text (names, dates, "Project Alpha" data) is illustration only. Its "AI brain" hologram is out (v2.3 §13): the page uses a knowledge network instead. Never ship the image itself. |
| `pages/services/meeting-intelligence/hero-image-original.png` | The meeting-workspace photo (1774×887) Hemang supplied for the Meeting Intelligence hero (2026-10-02) | Not a layout reference: the **source master** for `public/solutions/meeting-intelligence/hero.webp` and `hero-900.webp`. |
| `pages/services/ai-visibility-growth-team/01-…` to `08-…` | Hemang's AI Visibility reference set (2026-10-02, Drive folder `1QPB3crwJfK8spU34tSknnnmocDJC_ND4`): full page, hero, services panel, testimonials, consultation form, FAQ + CTA, blog + CTA, closing + footer | **`/services/ai-visibility-growth-team/`** visual direction (pink/lavender light, violet and blue accents, platform tiles, AI overview and citations panels). The page's photos are crops of 02, 03 and 06. **Do not use:** the testimonials (04: invented names and quotes), the "70%+" statistic (01), the blog cards (07), the FAQ answers (06), the consultation form and "Get Started" button (05), and the footer with newsletter / X / YouTube (08). The headers in these images use an unapproved logo treatment; ignore it. |
| `pages/services/technology-strategy/00-…` to `08-…` | Hemang's Technology Strategy fold references (2026-10-06, in chat): full page, hero, why strategy matters, how we help + approach, outcomes + case study + testimonials, CTA + FAQ, related solutions + insights + final CTA, testimonials + impact + logos, contact + footer | **`/services/technology-strategy/`** visual direction (dark cinematic hero, navy bands, red/blue/violet/green accents, glass chips). The hero photo (01) and the four How We Help card images (03) are cropped from these; card 2's misspelled "Possiblities" was repainted as "Possibilities"; the CTA band photo is cropped from 07. **Do not use:** the mountain/summit imagery (02, 05, 07: Tech Transpire visual world), the sample statistics ("40% faster decision-making", "30% reduction in operational costs", "2x productivity"), the invented testimonials and job titles, the Microsoft / IBM / AWS / Google Cloud / Oracle / SAP logos, the inline contact form with "within 24 hours", the "Strategic technology today…" banner (tagline-style line), and the footer with newsletter / X / Instagram / YouTube (08). |
