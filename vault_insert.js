
const vault = require("./vault");
vault.init();
const multer = require("multer");
const vaultStorage = multer.diskStorage({
  destination: function(req, file, cb) { cb(null, vault.VAULT_DIR); },
  filename: function(req, file, cb) { cb(null, vault.generateFilename(file.originalname)); }
});
const vaultUpload = multer({ storage: vaultStorage, limits: { fileSize: 200 * 1024 * 1024 } });

// ═══════════════════════════════════════════════
// 🔐 VAULT
// ═══════════════════════════════════════════════
app.get("/api/vault", (req, res) => {
  try {
    const files = vault.listFiles();
    const totalSize = vault.getTotalSize();
    const pinSet = vault.getPin() !== "";
    res.json({ files, total_size: totalSize, pin_set: pinSet });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/vault/upload", vaultUpload.single("file"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const id = vault.addFile(req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, req.body.notes || "");
    res.json({ ok: true, id, filename: req.file.filename });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/vault/:id", (req, res) => {
  try {
    const ok = vault.deleteFile(parseInt(req.params.id));
    res.json({ ok });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/vault/:id/download", (req, res) => {
  try {
    const file = vault.getFile(parseInt(req.params.id));
    if (!file) return res.status(404).json({ error: "File not found" });
    res.download(path.join(vault.VAULT_DIR, file.filename), file.original_name);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/vault/pin", (req, res) => {
  try {
    const { pin } = req.body;
    vault.setPin(pin || "");
    res.json({ ok: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

