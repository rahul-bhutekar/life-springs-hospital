/**
 * Life Springs Maternity Hospital — enquiries backend on Google Sheets.
 *
 * Paste this file into the Apps Script editor of your Google Sheet
 * (Extensions → Apps Script) and deploy it as a web app. Full steps:
 * docs/GOOGLE_SHEETS_SETUP.md in the website's repository.
 *
 * The website sends JSON in a POST body: { "action": "...", ...fields }.
 * Every reply is JSON: { "ok": true, ... } or { "ok": false, "error": "code", "message": "..." }.
 *
 * Public actions (website visitors):
 *   createEnquiry  — appointment form or assistant booking → new row in "Enquiries"
 *   logQuestion    — a question the assistant had no approved answer for → "Questions"
 * Admin actions (need the passcode set in Project Settings → Script properties → ADMIN_PASSCODE):
 *   listEnquiries  — latest enquiries and questions, for the admin board
 *   updateStatus   — change an enquiry's status
 */

var SHEETS = {
  enquiries: {
    name: 'Enquiries',
    headers: ['Reference', 'Received', 'Name', 'Phone', 'Preferred date', 'Slot', 'Appointment type', 'Source', 'Status', 'Notes', 'Updated'],
  },
  questions: {
    name: 'Questions',
    headers: ['Received', 'Question', 'Source'],
  },
};

var STATUSES = ['New', 'Called', 'Confirmed', 'Follow up', 'Closed'];
var SOURCES = ['Website', 'Assistant'];
var MAX_ENQUIRIES = 500;
var MAX_QUESTIONS = 50;

function doGet() {
  return json_({ ok: true, service: 'life-springs-enquiries' });
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '');
  } catch (x) {
    return json_(fail_('bad_request', 'The request was not valid JSON.'));
  }
  try {
    switch (body.action) {
      case 'createEnquiry':
        return json_(createEnquiry_(body));
      case 'logQuestion':
        return json_(logQuestion_(body));
      case 'listEnquiries':
        return json_(listEnquiries_(body));
      case 'updateStatus':
        return json_(updateStatus_(body));
      default:
        return json_(fail_('bad_request', 'Unknown action.'));
    }
  } catch (x) {
    console.error(x);
    return json_(fail_('server_error', 'Something went wrong on the server. Please try again.'));
  }
}

// ---------- Public actions ----------

function createEnquiry_(b) {
  // Spam trap: real visitors never see or fill the "website" field.
  if (b.website) return { ok: true, reference: 'LS-0000-0000' };

  var name = text_(b.name, 80);
  var digits = String(b.phone || '').replace(/\D/g, '');
  if (digits.length === 11 && digits.charAt(0) === '0') digits = digits.slice(1); // 098220 41736 → 9822041736
  if (!name || !/[A-Za-zऀ-ॿ]/.test(name)) return fail_('invalid', 'Please enter your name.');
  if (digits.length < 10 || digits.length > 13) return fail_('invalid', 'Please enter a 10-digit mobile number.');
  if (b.consent !== true) return fail_('invalid', 'We need your permission to call you back.');
  var source = SOURCES.indexOf(b.source) >= 0 ? b.source : 'Website';

  if (!allow_('enq_' + digits, 3, 600) || !allow_('enq_all', 100, 600)) {
    return fail_('rate_limited', 'We have already received your request. Our team will call you soon.');
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = sheet_(SHEETS.enquiries);
    var now = new Date();
    var reference = 'LS-' + String(now.getFullYear()).slice(-2) + pad_(now.getMonth() + 1, 2) + '-' + pad_(sheet.getLastRow(), 4);
    sheet.appendRow(
      [reference, now, name, '+' + (digits.length === 10 ? '91' + digits : digits), text_(b.date, 40), text_(b.slot, 20), text_(b.type, 80), source, 'New', '', now].map(safe_),
    );
    return { ok: true, reference: reference };
  } finally {
    lock.releaseLock();
  }
}

function logQuestion_(b) {
  var question = text_(b.question, 500);
  if (!question) return fail_('invalid', 'The question was empty.');
  if (!allow_('q_all', 200, 600)) return { ok: true };
  var source = SOURCES.indexOf(b.source) >= 0 ? b.source : 'Assistant';
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet_(SHEETS.questions).appendRow([new Date(), question, source].map(safe_));
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

// ---------- Admin actions ----------

function listEnquiries_(b) {
  var denied = checkPasscode_(b.passcode);
  if (denied) return denied;

  var enq = sheet_(SHEETS.enquiries);
  var rows = enq.getLastRow() > 1 ? enq.getRange(2, 1, enq.getLastRow() - 1, SHEETS.enquiries.headers.length).getValues() : [];
  var enquiries = rows
    .filter(function (r) { return r[0]; })
    .map(function (r) {
      return {
        reference: String(r[0]),
        received: iso_(r[1]),
        name: String(r[2]),
        phone: String(r[3]),
        date: String(r[4]),
        slot: String(r[5]),
        type: String(r[6]),
        source: String(r[7]),
        status: STATUSES.indexOf(String(r[8])) >= 0 ? String(r[8]) : 'New',
        notes: String(r[9]),
        updated: iso_(r[10]),
      };
    })
    .reverse()
    .slice(0, MAX_ENQUIRIES);

  var q = sheet_(SHEETS.questions);
  var qRows = q.getLastRow() > 1 ? q.getRange(2, 1, q.getLastRow() - 1, SHEETS.questions.headers.length).getValues() : [];
  var questions = qRows
    .filter(function (r) { return r[1]; })
    .map(function (r) { return { received: iso_(r[0]), question: String(r[1]), source: String(r[2]) }; })
    .reverse()
    .slice(0, MAX_QUESTIONS);

  return { ok: true, enquiries: enquiries, questions: questions };
}

function updateStatus_(b) {
  var denied = checkPasscode_(b.passcode);
  if (denied) return denied;
  if (STATUSES.indexOf(b.status) < 0) return fail_('invalid', 'Unknown status.');

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = sheet_(SHEETS.enquiries);
    var last = sheet.getLastRow();
    if (last < 2) return fail_('not_found', 'Enquiry not found.');
    var refs = sheet.getRange(2, 1, last - 1, 1).getValues();
    for (var i = 0; i < refs.length; i++) {
      if (String(refs[i][0]) === String(b.reference)) {
        sheet.getRange(i + 2, 9).setValue(b.status);
        sheet.getRange(i + 2, 11).setValue(new Date());
        return { ok: true };
      }
    }
    return fail_('not_found', 'Enquiry not found.');
  } finally {
    lock.releaseLock();
  }
}

/** Returns an error reply when the passcode is wrong, or null when it is right. */
function checkPasscode_(given) {
  var expected = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSCODE');
  if (!expected) return fail_('not_configured', 'Set ADMIN_PASSCODE in the script properties first.');
  var cache = CacheService.getScriptCache();
  var failures = Number(cache.get('auth_failures') || 0);
  if (failures >= 10) return fail_('locked', 'Too many wrong passcodes. Try again in 10 minutes.');
  if (!sameText_(String(given || ''), expected)) {
    cache.put('auth_failures', String(failures + 1), 600);
    return fail_('unauthorized', 'That passcode is not right.');
  }
  return null;
}

// ---------- Helpers ----------

function sheet_(def) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(def.name);
  if (!sheet) {
    sheet = ss.insertSheet(def.name);
    sheet.getRange(1, 1, 1, def.headers.length).setValues([def.headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Allows `limit` uses of `key` per `seconds`. */
function allow_(key, limit, seconds) {
  var cache = CacheService.getScriptCache();
  var count = Number(cache.get(key) || 0);
  if (count >= limit) return false;
  cache.put(key, String(count + 1), seconds);
  return true;
}

/** Trims, collapses whitespace and limits length. */
function text_(value, max) {
  return String(value == null ? '' : value).replace(/\s+/g, ' ').trim().slice(0, max);
}

/** Stops visitor text from running as a spreadsheet formula. */
function safe_(value) {
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(value)) return "'" + value;
  return value;
}

function sameText_(a, b) {
  if (a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function iso_(value) {
  return value instanceof Date ? value.toISOString() : String(value || '');
}

function pad_(n, width) {
  var s = String(n);
  while (s.length < width) s = '0' + s;
  return s;
}

function fail_(error, message) {
  return { ok: false, error: error, message: message };
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
