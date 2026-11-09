const SHEET_NAME = 'Réponses';

function doPost(event) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const data = JSON.parse(event.postData.contents || '{}');
    const name = safeCell(data.name, 120);
    const relationship = safeCell(data.relationship, 100);
    const attendance = data.attendance === 'oui' ? 'Présence confirmée' : 'Ne pourra pas venir';
    const guests = data.attendance === 'oui' ? safeCell(data.guests, 40) : '';
    const ceremony = data.attendance === 'oui' ? safeCell(data.ceremony, 100) : '';
    const message = safeCell(data.message, 1000);

    if (!name) {
      throw new Error('Le nom est obligatoire.');
    }

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Date et heure', 'Nom', 'Lien avec les mariés', 'Réponse', 'Nombre de personnes', 'Cérémonie', 'Message']);
    }

    sheet.appendRow([new Date(), name, relationship, attendance, guests, ceremony, message]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function safeCell(value, maxLength) {
  const text = String(value || '').trim().slice(0, maxLength);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}
