// Darren's Vault — SQLite-backed file storage
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const VAULT_DIR = "/var/vault";
const DB_PATH = path.join(__dirname, "scarlett_vault.db");

let db;

function init() {
  if (db) return;
  if (!fs.existsSync(VAULT_DIR)) fs.mkdirSync(VAULT_DIR, { recursive: true });
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS vault_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT DEFAULT 'application/octet-stream',
      file_size INTEGER DEFAULT 0,
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (''),
      updated_at TEXT DEFAULT ('')
    );
    CREATE TABLE IF NOT EXISTS vault_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
  const row = db.prepare("SELECT value FROM vault_settings WHERE key=?").get("pin");
  if (!row) {
    db.prepare("INSERT OR IGNORE INTO vault_settings (key, value) VALUES (?, ?)").run("pin", "");
  }
  return db;
}

function getDb() {
  if (!db) init();
  return db;
}

function listFiles() {
  return getDb().prepare("SELECT id, original_name, mime_type, file_size, notes, created_at, updated_at FROM vault_files ORDER BY created_at DESC").all();
}

function getFile(id) {
  return getDb().prepare("SELECT * FROM vault_files WHERE id=?").get(id);
}

function addFile(filename, originalName, mimeType, fileSize, notes) {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const stmt = getDb().prepare(
    "INSERT INTO vault_files (filename, original_name, mime_type, file_size, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  const result = stmt.run(filename, originalName, mimeType || "application/octet-stream", fileSize || 0, notes || "", now, now);
  return result.lastInsertRowid;
}

function deleteFile(id) {
  const file = getFile(id);
  if (!file) return false;
  const filePath = path.join(VAULT_DIR, file.filename);
  try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch(e) {}
  getDb().prepare("DELETE FROM vault_files WHERE id=?").run(id);
  return true;
}

function getTotalSize() {
  const row = getDb().prepare("SELECT COALESCE(SUM(file_size), 0) as total FROM vault_files").get();
  return row ? row.total : 0;
}

function getPin() {
  const row = getDb().prepare("SELECT value FROM vault_settings WHERE key=?").get("pin");
  return row ? row.value : "";
}

function setPin(pin) {
  getDb().prepare("INSERT OR REPLACE INTO vault_settings (key, value) VALUES (?, ?)").run("pin", pin || "");
}

function generateFilename(originalName) {
  const ext = path.extname(originalName);
  const base = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 60);
  const ts = Date.now();
  return base + "_" + ts + ext;
}

module.exports = { init, listFiles, getFile, addFile, deleteFile, getTotalSize, getPin, setPin, generateFilename, VAULT_DIR };
