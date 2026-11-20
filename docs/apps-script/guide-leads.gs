/**
 * TLS field-guide lead form: Google Apps Script web app.
 *
 * Receives the site's guide form (src/components/GuideForm.astro), writes the
 * lead to the "Guide Leads" tab of the spreadsheet this script is bound to,
 * and emails the guide as a PDF attachment. Deploy steps: docs/guide-leads.md.
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
  SENDER_NAME: 'True Lean Solutions',
  /** Sent from this address when the deploying account has it as a Gmail alias. */
  SENDER_ADDRESS: 'success@trueleansolutions.com',
  SITE: 'https://www.trueleansolutions.com',
  CONTACT_URL: 'https://www.trueleansolutions.com/contact/',
  /** A human needs at least this long between page load and submit. */
  MIN_SECONDS: 3,
  /** A page left open longer than this is treated as stale. */
  MAX_AGE_DAYS: 7,
  /** Allowance for a visitor's clock running ahead of the server's. */
  CLOCK_SKEW_MINUTES: 10,
  /** One guide per address in this window; repeats are logged, not re-sent. */
  RESEND_HOURS: 24,
  /** Stop sending for the day at this many emails; leads are still recorded. */
  DAILY_SEND_CAP: 150,
  MAX_NAME: 120,
  MAX_EMAIL: 254,
  MAX_PAGE: 200,
});

/** Every guide the form may ask for. The PDF is fetched from the site itself. */
const GUIDES = Object.freeze({
  'field-guide-2027': {
    title: "Don't Carry That Problem Into 2027: The Field Guide",
    subject: "Your field guide: Don't Carry That Problem Into 2027",
    pdfUrl: CONFIG.SITE + '/resources/dont-carry-that-problem-into-2027-field-guide.pdf',
    fileName: 'Dont-Carry-That-Problem-Into-2027-Field-Guide.pdf',
  },
});

const LEAD_HEADERS = [
  'Submitted At (UTC)', 'Name', 'Email', 'Guide', 'Page', 'Source',
  'Notice Shown At (UTC)', 'Email Status', 'Email Detail',
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
    const guide = GUIDES[lead.guide];
    let status;
    let detail = '';
    if (sentRecently_(leads, lead.email, lead.guide, now)) {
      status = 'Skipped: already sent';
      detail = 'Same address and guide within ' + CONFIG.RESEND_HOURS + ' hours';
    } else if (sendsToday_(now) >= CONFIG.DAILY_SEND_CAP || MailApp.getRemainingDailyQuota() < 1) {
      status = 'Held: daily limit';
      detail = 'Send the guide by hand';
    } else {
      try {
        detail = sendGuide_(lead, guide);
        countSend_(now);
        status = 'Sent';
      } catch (err) {
        status = 'Failed';
        detail = String(err && err.message ? err.message : err).slice(0, 300);
      }
    }
    leads.appendRow([
      now.toISOString(), lead.name, lead.email, guide.title, lead.page, lead.source,
      lead.noticeShown, status, detail,
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

function sendGuide_(lead, guide) {
  const response = UrlFetchApp.fetch(guide.pdfUrl, { muteHttpExceptions: true, followRedirects: true });
  if (response.getResponseCode() !== 200) {
    throw new Error('Could not fetch the PDF (HTTP ' + response.getResponseCode() + ')');
  }
  const pdf = response.getBlob().setName(guide.fileName).setContentType('application/pdf');
  const first = firstName_(lead.name);
  const greeting = first ? 'Hi ' + first + ',' : 'Hello,';

  const text = [
    greeting,
    '',
    'Every December, one problem gets copied from this year\'s plan into the next. The attached field guide is a practical way to end that for one of them: define it, put a yearly cost on it, and choose the lightest fix that will hold.',
    '',
    'It has five steps and six printable worksheets. Most teams work through them in one sitting of about 90 minutes.',
    '',
    'If you would like a second pair of eyes on your worksheets, reply to this email or book a free 30-minute call: ' + CONFIG.CONTACT_URL,
    '',
    'True Lean Solutions',
    'Lean Thinking. Real Results.',
    CONFIG.SITE,
    '',
    'You are receiving this because you asked for the guide on our website. Reply "stop" and we will not email you again.',
  ].join('\n');

  const html =
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#0D0D0D;max-width:560px">' +
    '<p>' + esc_(greeting) + '</p>' +
    '<p>Every December, one problem gets copied from this year\'s plan into the next. The attached field guide is a practical way to end that for one of them: define it, put a yearly cost on it, and choose the lightest fix that will hold.</p>' +
    '<p>It has five steps and six printable worksheets. Most teams work through them in one sitting of about 90 minutes.</p>' +
    '<p>If you would like a second pair of eyes on your worksheets, reply to this email or ' +
    '<a href="' + CONFIG.CONTACT_URL + '" style="color:#0E6DAD">book a free 30-minute call</a>.</p>' +
    '<p style="margin-top:24px"><strong>True Lean Solutions</strong><br>Lean Thinking. Real Results.<br>' +
    '<a href="' + CONFIG.SITE + '" style="color:#0E6DAD">trueleansolutions.com</a></p>' +
    '<p style="font-size:12px;color:#5A5A72;margin-top:24px">You are receiving this because you asked for the guide on our website. ' +
    'Reply "stop" and we will not email you again.</p>' +
    '</div>';

  const options = {
    name: CONFIG.SENDER_NAME,
    replyTo: CONFIG.SENDER_ADDRESS,
    htmlBody: html,
    attachments: [pdf],
  };
  const me = Session.getEffectiveUser().getEmail().toLowerCase();
  const aliases = GmailApp.getAliases().map(function (a) { return a.toLowerCase(); });
  let from = me;
  if (me !== CONFIG.SENDER_ADDRESS && aliases.indexOf(CONFIG.SENDER_ADDRESS) !== -1) {
    options.from = CONFIG.SENDER_ADDRESS;
    from = CONFIG.SENDER_ADDRESS;
  }
  GmailApp.sendEmail(lead.email, guide.subject, text, options);
  return 'From ' + from;
}

/** True when this address already got this guide inside the resend window. */
function sentRecently_(sheet, email, guideId, now) {
  const last = sheet.getLastRow();
  if (last < 2) return false;
  const title = GUIDES[guideId].title;
  const count = Math.min(last - 1, 2000);
  const rows = sheet.getRange(last - count + 1, 1, count, LEAD_HEADERS.length).getValues();
  const cutoff = now.getTime() - CONFIG.RESEND_HOURS * 3600000;
  for (let i = rows.length - 1; i >= 0; i--) {
    const at = Date.parse(rows[i][0]);
    if (isFinite(at) && at < cutoff) break;
    if (String(rows[i][2]).toLowerCase() === email && rows[i][3] === title && rows[i][7] === 'Sent') return true;
  }
  return false;
}

function dayKey_(now) {
  return 'sends_' + Utilities.formatDate(now, 'UTC', 'yyyyMMdd');
}
function sendsToday_(now) {
  return Number(PropertiesService.getScriptProperties().getProperty(dayKey_(now))) || 0;
}
function countSend_(now) {
  const props = PropertiesService.getScriptProperties();
  const key = dayKey_(now);
  const all = props.getProperties();
  Object.keys(all).forEach(function (k) {
    if (k.indexOf('sends_') === 0 && k !== key) props.deleteProperty(k);
  });
  props.setProperty(key, String((Number(all[key]) || 0) + 1));
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
function firstName_(name) {
  const first = name.split(/\s+/)[0] || '';
  return /^[A-Za-zÀ-ɏ'\-]{2,30}$/.test(first) ? first : '';
}
function esc_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Run once from the editor after pasting this file: it asks for the
 * permissions the script needs and sends the guide to your own address.
 */
function sendTestToMyself() {
  const me = Session.getEffectiveUser().getEmail();
  const detail = sendGuide_({ name: 'Test Reader', email: me }, GUIDES['field-guide-2027']);
  console.log('Test sent to ' + me + '. ' + detail);
}
