/**
 * TLS field-guide lead form: Google Apps Script web app.
 *
 * Receives the site's guide form (src/components/GuideForm.astro) and writes
 * the lead to the "Guide Leads" tab of the spreadsheet this script is bound
 * to. It sends no email: the visitor's browser downloads the PDF from the
 * site itself. Deploy steps: docs/guide-leads.md.
 *
 * It always answers with the same success response, whatever it decided, so
 * a bot learns nothing from the reply. Rejections go to "Guide Leads Rejected".
 *
 * This file is the copy of record. Change the live script only through
 * Manage deployments > Edit > New version, so the URL stays the same.
 */

const CONFIG = Object.freeze({
  FORM: 'field-guide',
  LEADS_SHEET: 'Guide Leads',
  REJECTED_SHEET: 'Guide Leads Rejected',
  /** A human needs at least this long between page load and submit. */
  MIN_SECONDS: 3,
  /** A page left open longer than this is treated as stale. */
  MAX_AGE_DAYS: 7,
  /** Allowance for a visitor's clock running ahead of the server's. */
  CLOCK_SKEW_MINUTES: 10,
  MAX_NAME: 120,
  MAX_EMAIL: 254,
  MAX_PAGE: 200,
});

/** Every guide the form may ask for, by the id the site sends. */
const GUIDES = Object.freeze({
  'field-guide-2027': { title: "Don't Carry That Problem Into 2027: The Field Guide" },
});

const LEAD_HEADERS = [
  'Submitted At (UTC)', 'Name', 'Email', 'Guide', 'Page', 'Source',
  'Notice Shown At (UTC)', 'Asked Before',
];
const REJECT_HEADERS = [
  'Logged At (UTC)', 'Reason', 'Seconds To Submit', 'Name', 'Email', 'Guide',
  'Page', 'Source', 'website (honeypot)', 'form_ts', 'submitted',
];

function doPost(e) {
  try {
    handle_((e && e.parameter) || {});
  } catch (err) {
    console.error('guide-leads: ' + (err && err.stack ? err.stack : err));
  }
  return ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);
}

function doGet() {
  return ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);
}

function handle_(p) {
  const now = new Date();
  const lead = {
    name: clean_(p.name, CONFIG.MAX_NAME),
    email: clean_(p.email, CONFIG.MAX_EMAIL).toLowerCase(),
    guide: clean_(p.guide, 60),
    page: clean_(p.page, CONFIG.MAX_PAGE),
    source: clean_(p.source, 20),
    website: clean_(p.website, 200),
    formTs: clean_(p.form_ts, 20),
    submitted: clean_(p.submitted, 40),
    noticeShown: isoOrBlank_(p.notice_shown),
  };

  const verdict = judge_(p, lead, now);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const book = SpreadsheetApp.getActiveSpreadsheet();
    if (verdict.reason) {
      sheet_(book, CONFIG.REJECTED_SHEET, REJECT_HEADERS).appendRow([
        now.toISOString(), verdict.reason, verdict.seconds, lead.name, lead.email, lead.guide,
        lead.page, lead.source, lead.website, lead.formTs, lead.submitted,
      ].map(safeCell_));
      return;
    }

    const leads = sheet_(book, CONFIG.LEADS_SHEET, LEAD_HEADERS);
    const title = GUIDES[lead.guide].title;
    leads.appendRow([
      now.toISOString(), lead.name, lead.email, title, lead.page, lead.source,
      lead.noticeShown, askedBefore_(leads, lead.email, title) ? 'Yes' : '',
    ].map(safeCell_));
  } finally {
    lock.releaseLock();
  }
}

/** Returns { reason, seconds }; an empty reason means the lead is accepted. */
function judge_(p, lead, now) {
  let seconds = '';
  if (clean_(p.form, 40) !== CONFIG.FORM) return { reason: 'wrong_form', seconds };
  if (lead.website) return { reason: 'honeypot', seconds };
  if (!/^\d{10,16}$/.test(lead.formTs)) return { reason: 'form_ts_missing', seconds };
  const loaded = Number(lead.formTs);
  const submitted = Date.parse(lead.submitted);
  if (!isFinite(submitted)) return { reason: 'submitted_missing', seconds };
  seconds = Math.round((submitted - loaded) / 1000);
  if (seconds < CONFIG.MIN_SECONDS) return { reason: 'too_fast', seconds };
  const age = now.getTime() - loaded;
  if (age > CONFIG.MAX_AGE_DAYS * 86400000) return { reason: 'form_ts_stale', seconds };
  if (age < -CONFIG.CLOCK_SKEW_MINUTES * 60000) return { reason: 'form_ts_future', seconds };
  if (!GUIDES[lead.guide]) return { reason: 'unknown_guide', seconds };
  if (lead.name.length < 2) return { reason: 'name_missing', seconds };
  if (/https?:\/\/|www\./i.test(lead.name)) return { reason: 'name_has_link', seconds };
  if (!validEmail_(lead.email)) return { reason: 'email_invalid', seconds };
  return { reason: '', seconds };
}

function validEmail_(email) {
  if (!email || email.length > CONFIG.MAX_EMAIL) return false;
  // One address only: no separators that could add recipients or headers.
  if (/[\s,;<>()\[\]\\"]/.test(email)) return false;
  return /^[a-z0-9._%+\-]+@[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?)*\.[a-z]{2,24}$/.test(email);
}

/** True when this address already asked for this guide (last 2,000 rows). */
function askedBefore_(sheet, email, title) {
  const last = sheet.getLastRow();
  if (last < 2) return false;
  const count = Math.min(last - 1, 2000);
  const rows = sheet.getRange(last - count + 1, 2, count, 3).getValues();
  return rows.some(function (row) {
    return String(row[1]).toLowerCase() === email && row[2] === title;
  });
}

function sheet_(book, name, headers) {
  let sheet = book.getSheetByName(name);
  if (!sheet) {
    sheet = book.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function clean_(value, max) {
  return String(value == null ? '' : value).replace(/[\u0000-\u001F\u007F]+/g, ' ').trim().slice(0, max);
}
function isoOrBlank_(value) {
  const t = Date.parse(clean_(value, 40));
  return isFinite(t) ? new Date(t).toISOString() : '';
}
/** Text that a spreadsheet would read as a formula is stored as plain text. */
function safeCell_(value) {
  return typeof value === 'string' && /^[=+\-@\t\r]/.test(value) ? "'" + value : value;
}

/**
 * Run once from the editor after pasting this file: it asks for the one
 * permission the script needs (this spreadsheet) and writes a test row.
 */
function writeTestRow() {
  const now = new Date();
  handle_({
    form: CONFIG.FORM, guide: 'field-guide-2027', source: 'test', page: '/test/',
    name: 'Test Reader', email: 'test@example.com', website: '',
    form_ts: String(now.getTime() - 10000), submitted: new Date(now.getTime() - 1000).toISOString(),
    notice_shown: now.toISOString(),
  });
  console.log('Wrote a test row to "' + CONFIG.LEADS_SHEET + '". Delete it after checking.');
}
