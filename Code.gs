/**
 * MotionForge contact form endpoint.
 * Bind this Apps Script project to a Google Sheet (Extensions > Apps Script).
 * The web app URL goes in js/script.js.
 */
const SHEET_NAME = "Responses";
const HEADERS = ["Timestamp", "Name", "Email", "Phone", "Service", "Message", "Page"];

function doGet() {
  return jsonOutput({ success: true, message: "MotionForge contact API is online." });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No form data received.");
    }
    const data = JSON.parse(e.postData.contents);
    const name = String(data.name || "").trim();
    const email = String(data.email || "").trim();
    const message = String(data.message || "").trim();

    if (!name || !email || !message) {
      return jsonOutput({ success: false, message: "Name, email, and message are required." });
    }
    if (name.length > 120 || email.length > 200 || message.length > 5000) {
      return jsonOutput({ success: false, message: "One or more fields are too long." });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length)
        .setFontWeight("bold")
        .setBackground("#10212b")
        .setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }
    // Prefix user-controlled values that begin with formula characters to avoid sheet formulas.
    const safe = value => {
      const s = String(value || "").trim();
      return /^[=+\-@]/.test(s) ? "'" + s : s;
    };
    sheet.appendRow([
      new Date(),
      safe(name),
      safe(email),
      safe(data.phone || ""),
      safe(data.service || ""),
      safe(message),
      safe(data.page || "")
    ]);
    return jsonOutput({ success: true, message: "Enquiry saved." });
  } catch (err) {
    console.error(err);
    return jsonOutput({ success: false, message: "Unable to save enquiry." });
  }
}

function jsonOutput(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
