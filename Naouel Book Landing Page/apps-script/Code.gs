function doGet() {
  return ContentService.createTextOutput("ok");
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.openById(
      "1xAci7OpIULucmdyhZsxOMYJKEa1jF2002abNUl6SFlc"
    ); // from sheet URL
    var sh = ss.getSheetByName("Sheet1"); // change if needed

    var p = {};
    if (e && e.postData && e.postData.type === "application/json") {
      p = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      p = {
        fullName: e.parameter.fullName || "",
        phone: e.parameter.phone || "",
        address: e.parameter.address || "",
        timestamp: new Date().toISOString(),
      };
    }

    // Preserve leading zero in phone by writing as text (prefix apostrophe)
    var phoneText = "'" + String(p.phone || "");
    sh.appendRow([p.fullName, phoneText, p.address, p.timestamp]);
    return ContentService.createTextOutput("ok");
  } catch (err) {
    return ContentService.createTextOutput("error:" + err.message);
  }
}
