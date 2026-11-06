/*
  Free lead log: every lead becomes a row in a Google Sheet.

  1. Create a Google Sheet.
  2. Extensions → Apps Script. Delete what's there and paste this file.
  3. Deploy → New deployment → type "Web app".
     Execute as: Me. Who has access: Anyone. Click Deploy and allow access.
  4. Copy the Web app URL into Vercel as LEAD_WEBHOOK_URL, then redeploy the site.

  If you edit this script later, use Deploy → Manage deployments → Edit → New version,
  so the same URL keeps working.
*/
const HEADERS = [
  "Received", "Reference", "Type", "Name", "Business", "Email", "Phone", "Business type", "Profile",
  "Coverage", "Start timing", "Top quote", "Chosen carrier", "Plan", "Start date", "Annual premium",
  "Address", "Best time to call", "Demo prices",
];
const TYPES = { quote_request: "Quote request", callback: "Callback request", bind_request: "Policy request" };

function doPost(e) {
  const lead = JSON.parse(e.postData.contents);
  const book = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = book.getSheetByName("Leads") || book.insertSheet("Leads");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  const c = lead.contact || {};
  const a = lead.answers || {};
  const top = (lead.quotes || [])[0];
  const addr = lead.address || {};
  sheet.appendRow([
    lead.receivedAt || new Date().toISOString(),
    lead.id || "",
    TYPES[lead.stage] || lead.stage || "",
    c.name || "",
    c.business || "",
    c.email || "",
    c.phone || "",
    a.businessType || a.industry || "",
    lead.profile || "",
    (a.coverage || []).join(", "),
    a.timing || "",
    top ? top.carrier + " $" + top.monthly + "/mo" : "",
    lead.carrier || "",
    lead.plan || "",
    lead.startDate || "",
    lead.premium ? lead.premium.annual : "",
    [addr.street, addr.city, addr.state, addr.zip].filter(Boolean).join(", "),
    lead.bestTime || "",
    lead.demo ? "yes" : "no",
  ]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}
