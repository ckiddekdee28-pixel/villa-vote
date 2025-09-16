/**
 * Google Apps Script — บันทึกโหวตลง Google Sheet และอ่านผล
 * วิธีใช้: สร้างสคริปต์ วางโค้ดนี้ > Deploy เป็น Web App
 * - Execute as: Me
 * - Who has access: Anyone with the link
 * ได้ URL นำไปใส่ในไฟล์ index.html และ results.html
 */
const SHEET_NAME = 'votes';
const HEADERS = ['timestamp','name','contact','choice','note','ua','tz','ip','ts_client'];

function getSheet_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
  }
  return sh;
}

function doPost(e) {
  try {
    const sh = getSheet_();
    const body = JSON.parse(e.postData.contents);
    const ip = e?.parameter?.ip || (e?.headers?.['x-forwarded-for'] || '').split(',')[0] || '';
    const row = [
      new Date().toISOString(),
      body.name || '',
      body.contact || '',
      body.choice || '',
      body.note || '',
      body.ua || '',
      body.tz || '',
      ip,
      body.ts_client || ''
    ];
    sh.appendRow(row);
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    if (e.parameter.mode === 'list') {
      const sh = getSheet_();
      const values = sh.getDataRange().getValues();
      const idx = Object.fromEntries(HEADERS.map((h,i)=>[h,i]));
      const rows = values.slice(1).map(r => ({
        timestamp: r[idx.timestamp],
        name: r[idx.name],
        contact: r[idx.contact],
        choice: r[idx.choice],
        note: r[idx.note],
        ua: r[idx.ua],
        tz: r[idx.tz],
        ip: r[idx.ip],
        ts_client: r[idx.ts_client]
      }));
      return ContentService.createTextOutput(JSON.stringify({ ok: true, rows })).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput('OK');
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(ContentService.MimeType.JSON);
  }
}
