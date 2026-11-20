# Field-guide lead form

The site offers one guide for a name and an email address (Hemang, 2026-11-21). On submit the PDF downloads in the visitor's browser and the lead is written to a spreadsheet. No email is sent. This page is the operating manual: how the pieces fit, how to switch it on, and how to change the guide.

## How it fits together

| Piece | Where | What it does |
|---|---|---|
| Guide settings | `src/data/guide.ts` | Title, promise, the PDF's path, its Insights post, the last day the tab shows, the pages where it never shows |
| Endpoint | `site.guideEndpoint` in `src/data/site.ts` | The Apps Script URL. **Empty means off:** no tab, no footer link, and the post's download card keeps its direct download |
| Form | `src/components/GuideForm.astro` | Name and email, then the PDF downloads at once. Sends the lead the same way as the contact form (URLSearchParams, fire-and-forget, honeypot, time trap) |
| Tab and card | `src/components/GuidePrompt.astro` | The one-line glass tab, bottom left, and the liquid-glass card it opens |
| Post card | `src/components/blocks/Download.astro` | A download block whose file is the guide shows the form instead of a download button |
| Footer link | `src/components/Footer.astro` | "Free field guide" in the legal bar opens the card |
| Script | `docs/apps-script/guide-leads.gs` | Writes the lead to the sheet |

## When the tab shows

- After 30% of the page is scrolled or 20 seconds, whichever comes first, on any page a visitor lands on.
- As a one-line tab ("Free field guide"), never as a pop-up. The card with the form opens only when the visitor chooses it.
- Never on Contact, the legal pages, 404, or a page that already has the guide's own card.
- One voice at a time: it waits until Tali's panel and message bubble have been off screen for five seconds, at every screen width, and steps aside if Tali speaks up later.
- Never while the visitor is typing in another field.
- At most three times in 14 days. After a dismissal, not for 14 days. After the guide is downloaded, never again on that browser.
- Not after `guide.lastDay`. The footer link goes on that day too. The post's card keeps working.

## Switching it on

Use any Google account that can edit the spreadsheet. The script needs one permission: that spreadsheet.

1. Open the spreadsheet "TLS LEADS From Website". Choose Extensions, Apps Script. This makes a script bound to that spreadsheet.
2. Replace the editor's contents with `docs/apps-script/guide-leads.gs`. Save.
3. Choose the function `writeTestRow` and run it. Approve the permission it asks for. Check the "Guide Leads" tab for the test row, then delete that row.
4. Choose Deploy, New deployment, type Web app. Execute as: Me. Who has access: Anyone. Deploy and copy the URL ending in `/exec`.
5. Put that URL in `site.guideEndpoint`, open a pull request and merge it.
6. On the live site, ask for the guide. Check that the PDF downloads and that the row appears in "Guide Leads".

The script creates the "Guide Leads" and "Guide Leads Rejected" tabs the first time it needs them.

To change the script later, use Manage deployments, Edit, New version, so the URL stays the same. Keep `docs/apps-script/guide-leads.gs` as the copy of record.

## What the sheet records

**Guide Leads:** Submitted At (UTC), Name, Email, Guide, Page, Source (`popup` or `post`), Notice Shown At (UTC), Asked Before ("Yes" when the same address already asked for this guide).

**Guide Leads Rejected:** submissions the script treated as spam, with the reason (honeypot, too fast, missing or stale time stamp, invalid email, a link in the name, an unknown guide).

Because the download does not depend on the address, some rows will carry mistyped or made-up emails. Nothing checks them.

There is no consent checkbox. The line under the button says TLS may email to follow up, and "Notice Shown At" records when that line was on the visitor's screen.

## Changing the guide

1. Put the new PDF in `public/resources/`.
2. Update `src/data/guide.ts` (give it a new `id`).
3. Add the same `id` and its title to `GUIDES` in the script, and publish a new version of the deployment.
