# Content sources

Every piece of copy, every photo, and every logo on the site comes from a file listed here. Import each one **once** into the repo (`src/content/`, `src/data/`, `public/`). The site never reads Google Drive at build time or at runtime.

The Drive folder `TLS Website` (`13aupzwH_jH3XuVFJj2HiXf6qzk_hKCwr`) is shared so that anyone with the link can view it. That lets the URLs below work without signing in. If a fetch returns 401/403 or a Google sign-in page, stop and ask Hemang to check sharing. Do not work around it, and never substitute text from another source.

## Fetch URLs

| Kind | URL pattern |
|---|---|
| Google Doc → Markdown | `https://docs.google.com/document/d/<ID>/export?format=md` |
| Google Doc → .docx (fallback; convert with `pandoc -t gfm`) | `https://docs.google.com/document/d/<ID>/export?format=docx` |
| Google Sheet → CSV (first tab) | `https://docs.google.com/spreadsheets/d/<ID>/export?format=csv` |
| Binary file in Drive (.docx, .png, .jpg) | `https://drive.google.com/uc?export=download&id=<ID>` |

In the About doc, a `GDRIVE: <ID>` token in a table cell is a Drive file ID. Fetch it with the binary URL.

## 1. Current page copy (2026-09-27): use these

Folder: `Website Update (2026-09-27)` (`18fb6Mq1jyC9Mpy5AfMFC9yC2XVekz_oQ`)

| Page | Source | Drive ID |
|---|---|---|
| Home | Home Page (2026-09-27) | `1zAjHl6Vc7BeO-ApXSVLrsyMmJ5TxOMqRXTaPWgfHAwE` |
| About Us | About Us (2026-09-27) | `17QpMfSbas3gC4XwfamL8SgRRytEN6Sj6UGkkwsEunKg` |
| Services overview | Services - Overview (2026-09-27) | `1adf8kbl7pTD1AGhmQZYNl4e9vMiNvL4QTugmMiteBBg` |
| Enterprise AI | Services - Enterprise AI (2026-09-27) | `1rUpXq5cu9aQArbtCwNOTdeIRuthGTUAMBx-LxWCy1J4` |
| Custom Software | Services - Custom Software Dev (2026-09-27) | `1jUJGXXC1gMkxGqpLYdiJY0ogGBGPaBi1eTSAmvgBzas` |
| System Integration | Services - System Integration (2026-09-27) | `18srqE5hhSz2JJCFAgPlOavMij2k26AvfdgcVVmJPpcI` |
| Technical Talent | Services - Technical Talent (2026-09-27) | `1nBusfLbQynnlO0-Eo2UBoPQCd7yEJSjLTQFaPwA4R-0` |
| Page titles and meta descriptions | TLS: Website Pages (2026-09-27), a sheet | `1w1w7ClLF7Ts7M-FSFJeopTP6Z_13FhXn_q9Qxy2hlT0` |
| Testimonials | TLS Client Reviews (2026-09-27), a sheet | `14l3c8EBTcWbMgiaQrEG1iVOcNndLP1iXntZTG2-hDp8` |

Two pages have no 2026-09-27 version. For those, the only source is the file below:

| Page | Source | Drive ID |
|---|---|---|
| Referral Partner Program | Referral Partner Program | `19wsWtdLRzWCwnCxyZtkZwP41CGFcrFG3GDyPHfmr6Eg` |
| Referral Partner FAQ | Referral Partner FAQ | `1P6CFGH0wVclwuDlZTAV8pbNCn303bgMREfJ8vxXOcsc` |

Do not use `SUPERSEDED — do not edit — TLS: Website Pages (2026-09-27 v1)` (`1gZs0SewCdeGd8DpA-QF1ovhsXbagqaTy-ColqcT1nC4`).

## 2. Previous page copy: reference only

Folder: `Website Pages` (`1WZxHBCct1I8mLqG79O9B5naJmMMN-2rx`). These files fed the old site and the Phase 1 port. Read them only to answer "what did the old site say?" Never publish their copy where a current version exists.

| Source | Drive ID |
|---|---|
| Home Page | `1kl3p8l92-cR4XAAvU79aQrVu93CiNgvbidoR7WIFv-E` |
| Meet the Team | `1tY9jCA5hd02cgWbpIqHfWoPFA_lsDxK-0QTtoIOdXC4` |
| Services - Overview | `1wB052l9J_nKUARYnodzfyStae7mPKE-OcGxTxfdKtEM` |
| Services - Enterprise AI | `1vsbYZrpSGDn3mQ8kTGaUOdVcBKu_VAPXr3qeOAj9TEM` |
| Services - System Integrations | `1EvyRHUU6I4Avv6hAX-jIFpQydfzmQvIUFx3Us5k3e3s` |
| Services - Custom Software Dev | `1qKJK_Gt5zeACz3LurvX4CcoHYkLtbtS_nqO0j8eyAJo` |
| Services - IT Recruiting | `10JzZgherIOLkIvFrnj0AAn4OqGlVKGPumbrPBXHFUwc` |
| Services - Operational Efficiency (no longer a service) | `1HrtVRHe1fwoFg_pbPoOjfHQ_pB-GI7Rnk7vdcXIZ-LE` |
| Ideal Customer Profile (internal, never publish) | `1CzxHXkNgaffHx27CsWSIUAsd_EA4XpfrNeElU-J427I` |
| TLS: Website Pages (old manifest) | `1J6tAMJzNRuoA8Eeajj6ZZ0uN6Q--bDRIK0SEmf7doko` |

## 3. Insights (articles)

Index sheet: `TLS BLOGS` (`1_EqXTxFK-uhoubC-PUVGB1Q2-DTE4LoLeD6Xi_P1ZBA`). It holds each post's title, date, category, excerpt, and cover. Match sheet rows to post files by the link in the row, and fall back to the title. **Dates are day-first**: `10/08/2026` means 10 August 2026. This was confirmed on the live site. Store dates as ISO (`2026-08-10`).

Post files in the `TLS Blogs` folder (`1AdYKvtn8arISfcz3dpnDv_0YSwB-r6EP`), all .docx:

| File | Drive ID | Insights category |
|---|---|---|
| TLS_Blog1_Why_Implementations_Fail | `1pPBy56Ri9ZImtxMZ2RWwR9T3_UcZicfc` | Perspectives |
| TLS_Blog2_Hidden_Cost_Of_Good_Enough | `1a5dvzJLf0u4stOotd-k1FmD_l3rki45v` | Perspectives |
| TLS_Blog3_PeerToPeer_Architecture | `1LgdLcThQGeUPHtFxdVleWzWLjUFLDiMs` | Perspectives |
| TLS_Blog4_AI_Recruitment_Automation | `1vrogSrVTdhw2BrrhgHB17DldaQ--dYrC` | Perspectives |
| TLS_Blog5_Financial_Systems_Integration | `17k4rBaVJq5HBOBdMGlPF5OJ0PiIT84Ua` | Perspectives |
| TLS_Blog6_Salesforce_Modernization | `1cyunrOGtuZFNBWQbuBj52hWsEj7p4KH3` | Perspectives |
| TLS_Blog7_Go_Legacy_Refactor | `14NZRBiXe6DBGFHqvz6_-bSHNEiL6TVbk` | Perspectives |
| TLS_Blog8_HomeGrown_ERP | `1Xz8CDSHJgOHR-B9-V1nRTvUyESnNXyDA` | Perspectives |
| TLS_Blog9_Custom_Integrations | `1ScuD6IZFAhmxNcrD_s8k7QhaSOIV1-Ds` | Perspectives |
| TLS_Blog10_Go_Rust_Advanced_Languages | `1fr7LRp7ce3YIZRzrc-kcCzLT2twBTw96` | Perspectives |
| TLS_Blog11_One_Accountable_Owner | `1utEowNV-IhLp5mFaORQiMuaAlYGtCz19` | Perspectives |
| TLS_Blog12_Cheaper_Isnt_Better_Value | `15Dy14otbocRBcnbMVayUphqbKzNh-Nxw` | Perspectives |
| TLS_CaseStudy_Commission_Engine | `1idKy-3K0VQcA-xLmud-FQ9GPxQ-d2x9J` | Case Studies |
| TLS_CaseStudy_Multitenant_Platform | `1SS08H71zSHPgWGLlFMvMorJImvZVn99r` | Case Studies |

Skip `Example Blog` (`1K0E6sB8OsyzvQ0PzccOG_0TcPS-NLeUyXydf2UJW3fU`), which is a template. If the index sheet references a post that is not in this table, import it too and tell Hemang. If the sheet's category for a post disagrees with the table above, ask before choosing.

Cover images in the sheet are Drive links. Download each one into `public/insights/covers/`. Never hotlink `lh3.googleusercontent.com`: Drive rate-limits it, and every thumbnail on the old site broke when it returned 429.

## 4. Images

| Asset | Drive ID | Save as |
|---|---|---|
| Team: Sajeed Lakhani | `1Md63Yh4gWmEZFOtPoS7O85bOTEXVixlt` | `public/team/sajeed-lakhani.png` |
| Team: Mack Akhani | `1gjiIzkVCO5V2WoyctZ1Hxa8qCtx07iJw` | `public/team/mack-akhani.png` |
| Team: Hemang Dwivedi | `1s7POIfEJpRdZnt7r2ZZGMCR7cWJpq8H8` | `public/team/hemang-dwivedi.png` |
| Team: Kranthi Kumar Goli | `1JyDnCk1OO6BG0_b79wEy8peUfB_mVxV2` | `public/team/kranthi-kumar-goli.png` |
| Team: Shruti Shrivastava | `1l8XefGooEXfal7LMZO0EnHFYywBttFZH` | `public/team/shruti-shrivastava.png` |
| Advisor: Nirav Kambodi | `1ElMKnKcslNysfxyXZHMtuz2YpNOLZZoc` | `public/team/nirav-kambodi.png` |
| Advisor: Mayank Pujara | `1IoCEOZrk0CdWHsM5Co6_dvPjv65XqZ83` | `public/team/mayank-pujara.png` |
| Advisor: Sanket Thakkar | `14EBqwO6Tq4h3wpUqsfyWyGy5gP4bBdKn` | `public/team/sanket-thakkar.png` |
| Client logo: NRI | `1P70t_tSWD9Nxan-D1FuzjfYnxDOI7Jsh` | `public/clients/nri.png` |
| Client logo: UV Concepts | `1zUc-91l43ndozxNQy_QriQVxRdBYfUib` | `public/clients/uv-concepts.png` |

The TLS logo files are already in `public/brand/`:

| File | What it is |
|---|---|
| `tls-mark.png` | Symbol only, transparent background, 1024×1024. |
| `tls-lockup-mark-white-text.png` | Symbol above a white "TLS", transparent background. Use on dark surfaces only. |
| `tls-lockup-on-dark-reference.png` | A low-resolution screenshot of the full dark lockup: symbol, white TLS, red TRUE LEAN SOLUTIONS, tagline. **Reference only. Never ship it.** Build the lockup in HTML/SVG from `tls-mark.png` plus live text, or ask Hemang for a vector master. |

The `Website Images` folder (`15yCgSqOptLQgUsgDYIn3LTgWUu_9reS5`) holds other images, including `image1.png` to `image15.png`, uploaded by pratapsinghh29@gmail.com, with no stated purpose. Use them only where the index sheet or a page doc references them.
