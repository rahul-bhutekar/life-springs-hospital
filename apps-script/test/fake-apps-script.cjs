/**
 * Runs apps-script/Code.gs in Node with in-memory stand-ins for the Google
 * services it uses (SpreadsheetApp, CacheService, PropertiesService,
 * LockService, ContentService). Used by the tests and for local end-to-end
 * checks of the website against a fake backend.
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createFakeBackend({ passcode = 'test-passcode' } = {}) {
  const sheets = new Map();

  function makeSheet(name) {
    const rows = [];
    const sheet = {
      name,
      rows,
      getLastRow: () => rows.length,
      appendRow: (values) => {
        // Sheets stores a leading apostrophe as "show as text" and does not return it.
        rows.push(values.map((v) => (typeof v === 'string' && v.startsWith("'") ? v.slice(1) : v)));
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
