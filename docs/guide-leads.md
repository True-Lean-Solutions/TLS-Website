# Field-guide lead form

The site offers one guide for a name and an email address (Hemang, 2026-11-21). This page is the operating manual: how the pieces fit, how to switch it on, and how to change the guide.

## How it fits together

| Piece | Where | What it does |
|---|---|---|
| Guide settings | `src/data/guide.ts` | Title, promise, the PDF's path, the last day the floating card shows, the pages where it never shows |
| Endpoint | `site.guideEndpoint` in `src/data/site.ts` | The Apps Script URL. **Empty means off:** no floating card, no footer link, and the post's download card keeps its direct download |
| Form | `src/components/GuideForm.astro` | Name and email. Sends the same way as the contact form (URLSearchParams, fire-and-forget, honeypot, time trap) |
| Floating card | `src/components/GuidePrompt.astro` | The liquid-glass card, bottom left, on every page |
| Post card | `src/components/blocks/Download.astro` | A download block whose file is the guide shows the form instead of a download button |
| Footer link | `src/components/Footer.astro` | "Free field guide" in the legal bar opens the card |
| Script | `docs/apps-script/guide-leads.gs` | Writes the lead to the sheet and emails the PDF |

## When the floating card shows

- After 30% of the page is scrolled or 20 seconds, whichever comes first, on any page a visitor lands on.
- As a short teaser first. The form opens only when the visitor chooses "Get the free guide".
- Never on Contact, the legal pages, 404, or a page that already has the guide's own card.
- Never over Tali: it waits while Tali's panel is open and, on narrow screens, while Tali's message bubble is showing.
- Never while the visitor is typing in another field.
- At most three times in 14 days. After a dismissal, not for 14 days. After the guide is sent, never again on that browser.
- Not after `guide.lastDay`. The footer link goes on that day too. The post's card keeps working.

## Switching it on

Do this from the Google account that should send the email. To send as `success@trueleansolutions.com`, either deploy from that account, or add that address to the deploying account in Gmail (Settings, Accounts, "Send mail as"). Without either, the email comes from the deploying account with `success@trueleansolutions.com` as the reply-to address.

1. Open the spreadsheet "TLS LEADS From Website". Choose Extensions, Apps Script. This makes a script bound to that spreadsheet.
2. Replace the editor's contents with `docs/apps-script/guide-leads.gs`. Save.
3. Choose the function `sendTestToMyself` and run it. Approve the permissions it asks for. Check that the guide arrives with the PDF attached.
4. Choose Deploy, New deployment, type Web app. Execute as: Me. Who has access: Anyone. Deploy and copy the URL ending in `/exec`.
5. Put that URL in `site.guideEndpoint`, open a pull request and merge it.
6. On the live site, ask for the guide with your own address. Check the "Guide Leads" tab for the row and "Sent" in its Email Status column.

The script creates the "Guide Leads" and "Guide Leads Rejected" tabs the first time it needs them.

To change the script later, use Manage deployments, Edit, New version, so the URL stays the same. Keep `docs/apps-script/guide-leads.gs` as the copy of record.

## What the sheet records

**Guide Leads:** Submitted At (UTC), Name, Email, Guide, Page, Source (`popup` or `post`), Notice Shown At (UTC), Email Status, Email Detail.

Email Status is one of:

- **Sent.** The detail column says which address it was sent from.
- **Skipped: already sent.** The same address asked for the same guide within 24 hours.
- **Held: daily limit.** 150 emails have gone out today, or Google's own quota is used up. The lead is recorded; send the guide by hand.
- **Failed.** The detail column has the error.

**Guide Leads Rejected:** submissions the script treated as spam, with the reason (honeypot, too fast, missing or stale time stamp, invalid email, a link in the name, an unknown guide).

There is no consent checkbox. The line under the button says what will be sent, and "Notice Shown At" records when that line was on the visitor's screen.

## Changing the guide

1. Put the new PDF in `public/resources/`.
2. Update `src/data/guide.ts` (give it a new `id`).
3. Add the same `id` to `GUIDES` in the script, with its title, subject, PDF URL and file name, and adjust the email text in `sendGuide_`. Publish a new version of the deployment.

The PDF is fetched from the live site when each email is sent, so the file must be deployed before the script can send it.
