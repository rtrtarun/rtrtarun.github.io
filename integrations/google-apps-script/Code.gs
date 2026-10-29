// Receives portfolio contact-form posts, appends a row to the bound Google Sheet and emails the owner.
// Deploy: Extensions > Apps Script > paste > Deploy > New deployment > Web app (Execute as: Me, Access: Anyone).
var CONFIG = {
  sheetName: "Contact requests",
  notifyEmail: "",          // empty = your own Google account
  maxPerEmailPerHour: 3,
  maxTotalPerHour: 30,
};
var FIELDS = ["firstName", "lastName", "email", "phone", "reason", "message"];
var MAX_LEN = { firstName: 60, lastName: 60, email: 120, phone: 30, reason: 120, message: 2000 };

function doPost(e) {
  var p = (e && e.parameter) || {};
  if (p.website) return reply("ok");                       // honeypot
  var v = {};
  FIELDS.forEach(function (k) { v[k] = String(p[k] || "").slice(0, MAX_LEN[k]).trim(); });
  if (!v.firstName || !v.lastName || !v.phone || !v.reason || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) return reply("invalid");

  var cache = CacheService.getScriptCache(), hour = Math.floor(Date.now() / 3600000);
  var keys = ["e:" + v.email.toLowerCase() + ":" + hour, "t:" + hour], limits = [CONFIG.maxPerEmailPerHour, CONFIG.maxTotalPerHour];
  for (var i = 0; i < keys.length; i++) {
    if (Number(cache.get(keys[i]) || 0) >= limits[i]) return reply("limited");
  }
  keys.forEach(function (k) { cache.put(k, String(Number(cache.get(k) || 0) + 1), 3700); });

  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(CONFIG.sheetName) || book.insertSheet(CONFIG.sheetName);
  if (sheet.getLastRow() === 0) sheet.appendRow(["Time"].concat(FIELDS));
  sheet.appendRow([new Date()].concat(FIELDS.map(function (k) { return neutralise(v[k]); })));

  MailApp.sendEmail({
    to: CONFIG.notifyEmail || Session.getEffectiveUser().getEmail(),
    replyTo: v.email,
    subject: "Portfolio enquiry: " + v.reason,
    body: FIELDS.map(function (k) { return k + ": " + v[k]; }).join("\n"),
  });
  return reply("ok");
}

// Stop spreadsheet formula injection: text starting with = + - @ is stored as plain text.
function neutralise(s) { return /^[=+\-@]/.test(s) ? "'" + s : s; }
function reply(s) { return ContentService.createTextOutput(s); }
