/**
 * Runs apps-script/Code.gs in Node with in-memory stand-ins for the Google
 * services it uses (SpreadsheetApp, CacheService, PropertiesService,
 * LockService, ContentService). Used by the tests and for local end-to-end
 * checks of the website against a fake backend.
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/**
 * What Google Sheets does with a value written by appendRow:
 * - a leading apostrophe means "keep as text"; it is stored and returned without the apostrophe;
 * - text that looks like a date (e.g. "Sat 14 Nov", "14 Nov", "2026-11-14") is turned into a Date.
 */
function asSheetsStores(v) {
  if (typeof v !== 'string') return v;
  if (v.startsWith("'")) return v.slice(1);
  const dayMonth = /^(?:(?:mon|tue|wed|thu|fri|sat|sun)[a-z]*,?\s+)?(\d{1,2})\s+([a-z]{3})[a-z]*$/i.exec(v.trim());
  if (dayMonth && MONTHS.includes(dayMonth[2].toLowerCase())) {
    return new Date(new Date().getFullYear(), MONTHS.indexOf(dayMonth[2].toLowerCase()), Number(dayMonth[1]));
  }
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v.trim());
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  return v;
}

function createFakeBackend({ passcode = 'test-passcode' } = {}) {
  const sheets = new Map();

  function makeSheet(name) {
    const rows = [];
    const sheet = {
      name,
      rows,
      getLastRow: () => rows.length,
      appendRow: (values) => {
        rows.push(values.map(asSheetsStores));
      },
      setFrozenRows: () => sheet,
      getRange: (row, col, numRows = 1, numCols = 1) => {
        const range = {
          getValues: () =>
            Array.from({ length: numRows }, (_, i) =>
              Array.from({ length: numCols }, (_, j) => (rows[row - 1 + i] || [])[col - 1 + j] ?? ''),
            ),
          setValues: (values) => {
            values.forEach((r, i) =>
              r.forEach((v, j) => {
                rows[row - 1 + i] = rows[row - 1 + i] || [];
                rows[row - 1 + i][col - 1 + j] = v;
              }),
            );
            return range;
          },
          setValue: (v) => range.setValues([[v]]),
          setFontWeight: () => range,
        };
        return range;
      },
    };
    return sheet;
  }

  const cacheStore = new Map();
  const context = {
    console,
    Date,
    JSON,
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({
        getSheetByName: (n) => sheets.get(n) || null,
        insertSheet: (n) => {
          const s = makeSheet(n);
          sheets.set(n, s);
          return s;
        },
      }),
    },
    CacheService: {
      getScriptCache: () => ({
        get: (k) => (cacheStore.has(k) ? cacheStore.get(k) : null),
        put: (k, v) => cacheStore.set(k, String(v)),
      }),
    },
    PropertiesService: {
      getScriptProperties: () => ({ getProperty: (k) => (k === 'ADMIN_PASSCODE' ? passcode : null) }),
    },
    LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) },
    Session: { getScriptTimeZone: () => 'Asia/Kolkata' },
    Utilities: {
      // Supports the one pattern Code.gs uses: 'EEE d MMM' → "Sat 14 Nov".
      formatDate: (d, tz, pattern) => {
        if (pattern !== 'EEE d MMM') throw new Error('fake formatDate: unsupported pattern ' + pattern);
        return new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'short', day: 'numeric', month: 'short' })
          .format(d)
          .replace(',', '');
      },
    },
    ContentService: {
      MimeType: { JSON: 'application/json' },
      createTextOutput: (text) => ({ text, setMimeType() { return this; }, getContent() { return this.text; } }),
    },
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'Code.gs'), 'utf8'), context, { filename: 'Code.gs' });

  return {
    /** Sends a request body (object) the way the website does and returns the parsed reply. */
    post(body) {
      const out = context.doPost({ postData: { contents: typeof body === 'string' ? body : JSON.stringify(body) } });
      return JSON.parse(out.getContent());
    },
    get() {
      return JSON.parse(context.doGet().getContent());
    },
    sheet: (name) => sheets.get(name),
    clearCache: () => cacheStore.clear(),
  };
}

module.exports = { createFakeBackend };
