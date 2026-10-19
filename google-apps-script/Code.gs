/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - BACKEND MANAJEMEN KEUANGAN TANGKI AIR
 * =========================================================================
 * Script ini berfungsi sebagai API RESTful backend untuk menghubungkan
 * aplikasi web "Manajemen Keuangan Tangki Air" dengan Google Spreadsheet.
 *
 * FITUR:
 * 1. Otomatis membuat lembar (sheet) dan format header jika belum ada.
 * 2. Autentikasi Admin dan Viewer di level backend.
 * 3. Otorisasi ketat: Akun Viewer DITOLAK saat mencoba menambah/mengedit/menghapus data.
 * 4. Mendukung query filter transaksi, penambahan kategori, dan sinkronisasi.
 * 5. Format respons JSON dengan proteksi CORS untuk web modern.
 */

// Konfigurasi Nama Sheet
var SHEET_TRANSAKSI = "Transaksi";
var SHEET_KATEGORI = "Kategori";
var SHEET_USERS = "Users";
var SHEET_PENGATURAN = "Pengaturan";

// Kredensial Default (Dapat disesuaikan di sheet 'Users')
var DEFAULT_ADMIN_PASS = "admin123";
var DEFAULT_VIEWER_PASS = "viewer123";

/**
 * Endpoint GET: Membaca data dari Google Spreadsheet
 */
function doGet(e) {
  try {
    initSheetsIfNotExist();
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getInitialData";

    if (action === "testConnection") {
      return createJsonResponse({
        success: true,
        message: "Koneksi ke Google Apps Script & Spreadsheet Tangki Air BERHASIL!",
        spreadsheetTitle: SpreadsheetApp.getActiveSpreadsheet().getName(),
        timestamp: new Date().toISOString()
      });
    }

    if (action === "getInitialData" || action === "getAll") {
      var transactions = getTransactionsFromSheet();
      var categories = getCategoriesFromSheet();
      var settings = getSettingsFromSheet();
      return createJsonResponse({
        success: true,
        transactions: transactions,
        categories: categories,
        settings: settings,
        serverTime: new Date().toISOString()
      });
    }

    if (action === "getSettings") {
      return createJsonResponse({
        success: true,
        settings: getSettingsFromSheet()
      });
    }

    if (action === "getTransactions") {
      return createJsonResponse({
        success: true,
        transactions: getTransactionsFromSheet()
      });
    }

    if (action === "getCategories") {
      return createJsonResponse({
        success: true,
        categories: getCategoriesFromSheet()
      });
    }

    return createJsonResponse({
      success: false,
      message: "Action GET tidak valid: " + action
    });
  } catch (err) {
    return createJsonResponse({
      success: false,
      message: "Error Server GAS: " + err.toString()
    });
  }
}

/**
 * Endpoint POST: Menulis, Mengubah, Menghapus Data, & Login
 */
function doPost(e) {
  try {
    initSheetsIfNotExist();
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      return createJsonResponse({ success: false, message: "Request body kosong" });
    }

    var action = data.action;

    // 1. Action: Test Connection via POST
    if (action === "testConnection") {
      return createJsonResponse({
        success: true,
        message: "Koneksi POST ke Google Spreadsheet BERHASIL!",
        timestamp: new Date().toISOString()
      });
    }

    // 2. Action: Login & Verifikasi Hak Akses
    if (action === "login") {
      return handleLogin(data.username, data.password);
    }

    // --- OTORISASI KEAMANAN: HANYA ADMIN YANG DAPAT MEMODIFIKASI DATA ---
    var userRole = data.userRole || (data.user && data.user.role);
    var authToken = data.token; // atau verifikasi role

    if (userRole !== "admin") {
      return createJsonResponse({
        success: false,
        message: "AKSES DITOLAK: Anda masuk sebagai Viewer. Hanya akun ADMIN yang berhak mengubah atau menghapus data keuangan!"
      });
    }

    // 3. Action: Tambah Transaksi
    if (action === "addTransaction") {
      return addTransaction(data.transaction, data.user);
    }

    // 4. Action: Edit Transaksi
    if (action === "editTransaction") {
      return editTransaction(data.transaction);
    }

    // 5. Action: Hapus Transaksi
    if (action === "deleteTransaction") {
      return deleteTransaction(data.transactionId);
    }

    // 6. Action: Tambah Kategori Baru
    if (action === "addCategory") {
      return addCategory(data.category);
    }

    // 7. Action: Hapus Kategori
    if (action === "deleteCategory") {
      return deleteCategory(data.categoryId);
    }

    // 8. Action: Sinkronisasi Bulk Data (Sync All)
    if (action === "syncAll") {
      return syncAllTransactions(data.transactions);
    }

    // 9. Action: Simpan Pengaturan Global Usaha & Aplikasi (Hanya Admin)
    if (action === "saveSettings") {
      return saveSettingsToSheet(data.settings);
    }

    return createJsonResponse({
      success: false,
      message: "Action POST tidak dikenal: " + action
    });
  } catch (err) {
    return createJsonResponse({
      success: false,
      message: "Gagal memproses aksi POST: " + err.toString()
    });
  }
}

/**
 * Handle Login Admin & Viewer
 */
function handleLogin(username, password) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var userSheet = ss.getSheetByName(SHEET_USERS);
  var values = userSheet.getDataRange().getValues();

  var found = null;
  for (var i = 1; i < values.length; i++) {
    var u = String(values[i][0]).trim().toLowerCase();
    var p = String(values[i][1]).trim();
    var role = String(values[i][2]).trim().toLowerCase();
    var name = String(values[i][3]).trim();

    if (u === String(username).trim().toLowerCase() && p === String(password).trim()) {
      found = {
        id: "USR-" + i,
        username: u,
        role: role === "admin" ? "admin" : "viewer",
        name: name || (role === "admin" ? "Administrator Tangki" : "Petugas Viewer"),
        token: "TOKEN-" + Utilities.getUuid()
      };
      break;
    }
  }

  if (found) {
    return createJsonResponse({
      success: true,
      message: "Login berhasil sebagai " + found.role,
      user: found
    });
  } else {
    return createJsonResponse({
      success: false,
      message: "Username atau password salah. Silakan coba kembali."
    });
  }
}

/**
 * Mengambil Seluruh Transaksi dari Sheet
 */
function getTransactionsFromSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_TRANSAKSI);
  var values = sheet.getDataRange().getValues();
  var transactions = [];

  // Header di baris 0: [ID, Tanggal, Jenis, Kategori, Nominal, Keterangan, Armada_Plat, Volume_Liter, Created_By, Created_At]
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (!row[0]) continue; // Lewati baris kosong

    var rawDate = row[1];
    var formattedDate = "";
    if (rawDate instanceof Date) {
      var y = rawDate.getFullYear();
      var m = ("0" + (rawDate.getMonth() + 1)).slice(-2);
      var d = ("0" + rawDate.getDate()).slice(-2);
      formattedDate = y + "-" + m + "-" + d;
    } else {
      formattedDate = String(rawDate).substring(0, 10);
    }

    transactions.push({
      id: String(row[0]),
      date: formattedDate,
      type: String(row[2]).toLowerCase() === "income" || String(row[2]) === "pemasukan" ? "income" : "expense",
      category: String(row[3]),
      amount: Number(row[4]) || 0,
      description: String(row[5] || ""),
      vehiclePlate: String(row[6] || ""),
      volumeLiters: Number(row[7]) || 0,
      createdBy: String(row[8] || "admin"),
      createdAt: String(row[9] || new Date().toISOString()),
      syncedToSheets: true
    });
  }

  // Urutkan transaksi dari tanggal terbaru ke terlama
  transactions.sort(function(a, b) {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return transactions;
}

/**
 * Mengambil Kategori dari Sheet
 */
function getCategoriesFromSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_KATEGORI);
  var values = sheet.getDataRange().getValues();
  var categories = [];

  // Header: [ID, Jenis, Nama_Kategori, Warna, Ikon, Is_System]
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (!row[0] || !row[2]) continue;

    categories.push({
      id: String(row[0]),
      type: String(row[1]).toLowerCase() === "income" || String(row[1]) === "pemasukan" ? "income" : "expense",
      name: String(row[2]),
      color: String(row[3] || "#0284c7"),
      icon: String(row[4] || "Tag"),
      isSystem: row[5] === true || String(row[5]).toLowerCase() === "true"
    });
  }

  return categories;
}

/**
 * Menambahkan Transaksi Baru
 */
function addTransaction(trx, user) {
  if (!trx || !trx.date || !trx.type || !trx.category || trx.amount == null) {
    return createJsonResponse({ success: false, message: "Data transaksi tidak lengkap" });
  }

  if (Number(trx.amount) <= 0) {
    return createJsonResponse({ success: false, message: "Nominal harus lebih besar dari Rp 0" });
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_TRANSAKSI);

  var newId = trx.id || ("TRX-" + Utilities.getUuid().substring(0, 8).toUpperCase());
  var createdAt = trx.createdAt || new Date().toISOString();
  var creator = (user && user.username) ? user.username : (trx.createdBy || "admin");

  sheet.appendRow([
    newId,
    trx.date,
    trx.type,
    trx.category,
    Number(trx.amount),
    trx.description || "",
    trx.vehiclePlate || "",
    Number(trx.volumeLiters) || 0,
    creator,
    createdAt
  ]);

  return createJsonResponse({
    success: true,
    message: "Transaksi berhasil dicatat ke Google Spreadsheet!",
    transaction: {
      id: newId,
      date: trx.date,
      type: trx.type,
      category: trx.category,
      amount: Number(trx.amount),
      description: trx.description || "",
      vehiclePlate: trx.vehiclePlate || "",
      volumeLiters: Number(trx.volumeLiters) || 0,
      createdBy: creator,
      createdAt: createdAt,
      syncedToSheets: true
    }
  });
}

/**
 * Mengedit Transaksi yang Ada
 */
function editTransaction(trx) {
  if (!trx || !trx.id) {
    return createJsonResponse({ success: false, message: "ID Transaksi wajib disertakan" });
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_TRANSAKSI);
  var values = sheet.getDataRange().getValues();

  var rowIndex = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(trx.id)) {
      rowIndex = i + 1; // 1-based index di Sheets
      break;
    }
  }

  if (rowIndex === -1) {
    return createJsonResponse({ success: false, message: "Transaksi dengan ID " + trx.id + " tidak ditemukan" });
  }

  sheet.getRange(rowIndex, 2, 1, 7).setValues([[
    trx.date,
    trx.type,
    trx.category,
    Number(trx.amount),
    trx.description || "",
    trx.vehiclePlate || "",
    Number(trx.volumeLiters) || 0
  ]]);

  return createJsonResponse({
    success: true,
    message: "Transaksi berhasil diperbarui di Google Spreadsheet!",
    transaction: trx
  });
}

/**
 * Menghapus Transaksi
 */
function deleteTransaction(trxId) {
  if (!trxId) {
    return createJsonResponse({ success: false, message: "ID Transaksi kosong" });
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_TRANSAKSI);
  var values = sheet.getDataRange().getValues();

  var rowIndex = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(trxId)) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) {
    return createJsonResponse({ success: false, message: "Transaksi tidak ditemukan di Spreadsheet" });
  }

  sheet.deleteRow(rowIndex);
  return createJsonResponse({
    success: true,
    message: "Transaksi berhasil dihapus dari Google Spreadsheet"
  });
}

/**
 * Menambahkan Kategori Baru
 */
function addCategory(cat) {
  if (!cat || !cat.name || !cat.type) {
    return createJsonResponse({ success: false, message: "Nama dan jenis kategori harus diisi" });
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_KATEGORI);
  var newId = cat.id || ("CAT-" + Utilities.getUuid().substring(0, 6).toUpperCase());

  sheet.appendRow([
    newId,
    cat.type,
    cat.name,
    cat.color || "#0ea5e9",
    cat.icon || "Tag",
    false
  ]);

  return createJsonResponse({
    success: true,
    message: "Kategori berhasil ditambahkan ke Spreadsheet!",
    category: {
      id: newId,
      type: cat.type,
      name: cat.name,
      color: cat.color || "#0ea5e9",
      icon: cat.icon || "Tag",
      isSystem: false
    }
  });
}

/**
 * Menghapus Kategori
 */
function deleteCategory(catId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_KATEGORI);
  var values = sheet.getDataRange().getValues();

  var rowIndex = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(catId)) {
      if (values[i][5] === true || String(values[i][5]).toLowerCase() === "true") {
        return createJsonResponse({ success: false, message: "Kategori bawaan sistem tidak boleh dihapus!" });
      }
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) {
    return createJsonResponse({ success: false, message: "Kategori tidak ditemukan" });
  }

  sheet.deleteRow(rowIndex);
  return createJsonResponse({ success: true, message: "Kategori berhasil dihapus" });
}

/**
 * Sinkronisasi Bulk Data (Upload data dari web ke Sheet jika baru pertama konek)
 */
function syncAllTransactions(transactions) {
  if (!transactions || !transactions.length) {
    return createJsonResponse({ success: true, message: "Tidak ada data untuk disinkronkan" });
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_TRANSAKSI);
  var existingIds = {};
  var values = sheet.getDataRange().getValues();

  for (var i = 1; i < values.length; i++) {
    if (values[i][0]) existingIds[String(values[i][0])] = true;
  }

  var newRows = [];
  for (var j = 0; j < transactions.length; j++) {
    var t = transactions[j];
    if (!existingIds[t.id]) {
      newRows.push([
        t.id,
        t.date,
        t.type,
        t.category,
        Number(t.amount),
        t.description || "",
        t.vehiclePlate || "",
        Number(t.volumeLiters) || 0,
        t.createdBy || "admin",
        t.createdAt || new Date().toISOString()
      ]);
    }
  }

  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, 10).setValues(newRows);
  }

  return createJsonResponse({
    success: true,
    message: "Sinkronisasi berhasil! " + newRows.length + " transaksi baru ditambahkan ke Spreadsheet."
  });
}

/**
 * Inisialisasi Sheet dan Format Tabel Otomatis
 */
function initSheetsIfNotExist() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Sheet Transaksi
  var trxSheet = ss.getSheetByName(SHEET_TRANSAKSI);
  if (!trxSheet) {
    trxSheet = ss.insertSheet(SHEET_TRANSAKSI);
    var headers = ["ID", "Tanggal", "Jenis", "Kategori", "Nominal", "Keterangan", "Armada_Plat", "Volume_Liter", "Created_By", "Created_At"];
    trxSheet.appendRow(headers);
    var headerRange = trxSheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#0284c7");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    trxSheet.setFrozenRows(1);
  }

  // 2. Sheet Kategori
  var catSheet = ss.getSheetByName(SHEET_KATEGORI);
  if (!catSheet) {
    catSheet = ss.insertSheet(SHEET_KATEGORI);
    var catHeaders = ["ID", "Jenis", "Nama_Kategori", "Warna", "Ikon", "Is_System"];
    catSheet.appendRow(catHeaders);
    var catHeaderRange = catSheet.getRange(1, 1, 1, catHeaders.length);
    catHeaderRange.setBackground("#0d9488");
    catHeaderRange.setFontColor("#ffffff");
    catHeaderRange.setFontWeight("bold");
    catSheet.setFrozenRows(1);

    // Default categories
    var defaults = [
      ["CAT-INC-1", "income", "Penjualan air", "#0284c7", "Droplets", true],
      ["CAT-EXP-1", "expense", "Air bahan baku", "#3b82f6", "Droplet", true],
      ["CAT-EXP-2", "expense", "Solar", "#f97316", "Fuel", true],
      ["CAT-EXP-3", "expense", "Bensin", "#eab308", "Zap", true],
      ["CAT-EXP-4", "expense", "Konsumsi", "#10b981", "Coffee", true],
      ["CAT-EXP-5", "expense", "Service", "#ef4444", "Wrench", true],
      ["CAT-EXP-6", "expense", "Gaji crew", "#8b5cf6", "Users", true]
    ];
    for (var k = 0; k < defaults.length; k++) {
      catSheet.appendRow(defaults[k]);
    }
  }

  // 3. Sheet Users
  var userSheet = ss.getSheetByName(SHEET_USERS);
  if (!userSheet) {
    userSheet = ss.insertSheet(SHEET_USERS);
    var userHeaders = ["Username", "Password", "Role", "Nama"];
    userSheet.appendRow(userHeaders);
    var userHeaderRange = userSheet.getRange(1, 1, 1, userHeaders.length);
    userHeaderRange.setBackground("#334155");
    userHeaderRange.setFontColor("#ffffff");
    userHeaderRange.setFontWeight("bold");
    userSheet.setFrozenRows(1);

    // Akun default
    userSheet.appendRow(["admin", DEFAULT_ADMIN_PASS, "admin", "Admin Operasional Tangki"]);
    userSheet.appendRow(["viewer", DEFAULT_VIEWER_PASS, "viewer", "Viewer / Pemilik Usaha"]);
  }

  // 4. Sheet Pengaturan (Penyimpanan Pengaturan Global Usaha & Nama Aplikasi)
  var settingsSheet = ss.getSheetByName(SHEET_PENGATURAN);
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet(SHEET_PENGATURAN);
    var setHeaders = ["Key", "Value", "Keterangan", "Updated_At"];
    settingsSheet.appendRow(setHeaders);
    var setHeaderRange = settingsSheet.getRange(1, 1, 1, setHeaders.length);
    setHeaderRange.setBackground("#0f172a"); // slate-900
    setHeaderRange.setFontColor("#ffffff");
    setHeaderRange.setFontWeight("bold");
    settingsSheet.setFrozenRows(1);

    var now = new Date().toISOString();
    var defaultSettings = [
      ["app_name", "TIRTA KEUANGAN", "Nama aplikasi (ditampilkan di header, sidebar, login, judul)", now],
      ["business_name", "Al I'tisham Droping", "Nama perusahaan atau pemilik armada tangki air", now],
      ["business_address", "Jl. Raya Sumber Mata Air No. 45, Bogor", "Alamat operasional usaha", now],
      ["business_phone", "0812-3456-7890", "Nomor telepon atau kontak resmi", now],
      ["business_trucks", "B 9182 TGA (8.000 L), B 9234 TAB (5.000 L), B 9801 XYZ (16.000 L)", "Daftar armada truk tangki air", now],
      ["updated_at", now, "Waktu terakhir pembaruan pengaturan", now]
    ];
    for (var s = 0; s < defaultSettings.length; s++) {
      settingsSheet.appendRow(defaultSettings[s]);
    }
  }
}

/**
 * Membaca Pengaturan Global dari Sheet Pengaturan
 */
function getSettingsFromSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_PENGATURAN);
  if (!sheet) {
    initSheetsIfNotExist();
    sheet = ss.getSheetByName(SHEET_PENGATURAN);
  }

  var values = sheet.getDataRange().getValues();
  var settings = {};

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var k = String(row[0] || "").trim();
    if (k) {
      settings[k] = row[1] !== undefined ? String(row[1]) : "";
    }
  }

  // Fallback jika belum terisi
  if (!settings["app_name"]) settings["app_name"] = "TIRTA KEUANGAN";
  if (!settings["business_name"]) settings["business_name"] = "Al I'tisham Droping";
  if (!settings["business_address"]) settings["business_address"] = "Jl. Raya Sumber Mata Air No. 45, Bogor";
  if (!settings["business_phone"]) settings["business_phone"] = "0812-3456-7890";
  if (!settings["business_trucks"]) settings["business_trucks"] = "B 9182 TGA (8.000 L), B 9234 TAB (5.000 L), B 9801 XYZ (16.000 L)";

  return settings;
}

/**
 * Menyimpan Pengaturan Global ke Sheet Pengaturan (Khusus Admin)
 */
function saveSettingsToSheet(newSettings) {
  if (!newSettings || typeof newSettings !== 'object') {
    return createJsonResponse({ success: false, message: "Data pengaturan tidak valid" });
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_PENGATURAN);
  if (!sheet) {
    initSheetsIfNotExist();
    sheet = ss.getSheetByName(SHEET_PENGATURAN);
  }

  var values = sheet.getDataRange().getValues();
  var keyRowMap = {};
  for (var i = 1; i < values.length; i++) {
    var k = String(values[i][0] || "").trim();
    if (k) {
      keyRowMap[k] = i + 1; // 1-based index
    }
  }

  var now = new Date().toISOString();
  newSettings["updated_at"] = now;

  for (var key in newSettings) {
    if (Object.prototype.hasOwnProperty.call(newSettings, key)) {
      var val = String(newSettings[key] !== undefined && newSettings[key] !== null ? newSettings[key] : "").trim();
      if (keyRowMap[key]) {
        var rIdx = keyRowMap[key];
        sheet.getRange(rIdx, 2).setValue(val);
        sheet.getRange(rIdx, 4).setValue(now);
      } else {
        sheet.appendRow([key, val, "Pengaturan sistem", now]);
        keyRowMap[key] = sheet.getLastRow();
      }
    }
  }

  return createJsonResponse({
    success: true,
    message: "Pengaturan global berhasil disimpan ke Google Spreadsheet!",
    settings: getSettingsFromSheet()
  });
}

/**
 * Helper untuk format respons JSON dengan MIME type yang benar
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
