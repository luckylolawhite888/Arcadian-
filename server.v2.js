const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const email = require("./email");
const integrations = require("./integrations");
const memory = require("./scarlett_memory");
const leadEngine = require("./lead_engine");
const backup = require("./backup");
const osint = require("./osint");
const emailVerify = require("./email_verify");

const app = express();
const PORT = 3100;

const SUPABASE_URL = "https://ogkyhfdyssowaaloogsx.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9na3loZmR5c3Nvd2FhbG9vZ3N4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNjM2MywiZXhwIjoyMDk4MzkyMzYzfQ.Gsw6OGq6fPH0hjiPDoGS6wgxN8_Gh8qQl8W1Kd97Dlo";

let ACCESS_CODE = "@DARREN2026";

// ─── INITIALISE SCARLETT'S MEMORY ──────────────
try {
  memory.init();
  console.log("🧠 Scarlett's memory initialised (SQLite)");
} catch(e) {
  console.error("Memory init failed:", e.message);
}

app.use(cors());
app.use(express.json());

async function sbQuery(method, table, options = {}) {
  let url = SUPABASE_URL + "/rest/v1/" + table;
  if (options.select) url += "?select=" + options.select;
  if (options.order) url += (url.includes("?") ? "&" : "?") + "order=" + options.order;

  const res = await fetch(url, {
    method,
    headers: {
      "apikey": SB_KEY,
      "Authorization": "Bearer " + SB_KEY,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  if (method === "DELETE") return {};
  if (method === "HEAD") return res.ok;
  if (res.status === 204) return {};
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Supabase ${method} ${table} ${res.status}: ${errBody.substring(0,200)}`);
  }
  return res.json();
}

// ─── AUTH MIDDLEWARE ───────────────────────────
app.use("/api", (req, res, next) => {
  const freePaths = ["/auth", "/status", "/settings/code", "/briefing", "/news", "/weather", "/chat"];
  if (req.method === "OPTIONS" || freePaths.includes(req.path) || req.path.startsWith("/auth/") || req.path.startsWith("/settings/")) {
    return next();
  }
  if (req.headers["x-access-code"] !== ACCESS_CODE) {
    return res.status(401).json({ error: "Invalid access code" });
  }
  next();
});

app.get("/api/status", (req, res) => {
  res.json({ status: "online", version: "2.0.0", timestamp: new Date().toISOString(), memory: "sqlite", features: ["leads","tasks","email","calendar","chat","intel","briefing","backup","learning"] });
});

app.get("/api/auth", (req, res) => {
  res.json({ valid: req.headers["x-access-code"] === ACCESS_CODE });
});

// ═══════════════════════════════════════════════
// 🎯 LEADS
// ═══════════════════════════════════════════════
// Dashboard stats — real counts from Supabase
app.get("/api/stats", async (req, res) => {
  try {
    const [leadsData, campaignsData, tasksData, approvalsData] = await Promise.all([
      fetch(SUPABASE_URL + "/rest/v1/leads?select=id&status=neq.rejected", { headers: { "apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY } }).then(r => r.json()),
      fetch(SUPABASE_URL + "/rest/v1/email_campaigns?select=id", { headers: { "apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY } }).then(r => r.json()),
      fetch(SUPABASE_URL + "/rest/v1/tasks?select=id&status=neq.done", { headers: { "apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY } }).then(r => r.json()),
      fetch(SUPABASE_URL + "/rest/v1/leads?select=id&status=eq.email_ready", { headers: { "apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY } }).then(r => r.json())
    ]);
    res.json({
      leads: Array.isArray(leadsData) ? leadsData.length : 0,
      campaigns: Array.isArray(campaignsData) ? campaignsData.length : 0,
      tasks: Array.isArray(tasksData) ? tasksData.length : 0,
      approvals: Array.isArray(approvalsData) ? approvalsData.length : 0
    });
  } catch(e) {
    res.json({ leads: 0, campaigns: 0, tasks: 0, approvals: 0 });
  }
});

// Chat — relay to Scarlett via DeepSeek
app.post("/api/chat", async (req, res) => {
  try {
    const msg = req.body.message || '';
    const { execSync } = require('child_process');
    const out = execSync('openclaw agent --json --agent main --local --session-key scarlett-chat --message ' + JSON.stringify(msg), { timeout: 30000, maxBuffer: 1024 * 1024, env: { ...process.env, PATH: '/usr/local/bin:/usr/bin:/bin' } });
    const parsed = JSON.parse(out.toString());
    const reply = parsed.payloads && parsed.payloads[0] ? parsed.payloads[0].text || '' : '';
    res.json({ reply: reply || "I'm not sure how to respond to that." });
  } catch(e) {
    console.error('Chat error:', e.message);
    res.json({ reply: "Sorry — I'm having trouble right now." });
  }
});

// Get all leads (for leads dashboard table)
app.get("/api/leads", async (req, res) => {
  try {
    const data = await sbQuery("GET", "leads", { order: "created_at.desc" });
    res.json(data || []);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/leads", async (req, res) => {
  try {
    const lead = { ...req.body, source: req.body.source || "manual", status: req.body.status || "new" };
    const data = await sbQuery("POST", "leads", { body: lead });
    res.status(201).json(data);
  }
  catch(e) { res.status(500).json({ error: e.message }); }
});

app.patch("/api/leads/:id", async (req, res) => {
  try {
    const data = await sbQuery("PATCH", "leads?id=eq." + req.params.id, { body: req.body });
    res.json(data);
  }
  catch(e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/leads/:id", async (req, res) => {
  try { await sbQuery("DELETE", "leads?id=eq." + req.params.id); res.status(204).send(); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

// ─── APPROVAL WORKFLOW ─────────────────────────
// Leads that Scarlett found, waiting for Darren's approval
app.get("/api/leads/pending", async (req, res) => {
  try {
    const data = await sbQuery("GET", "leads", { select: "*,status" });
    const pending = (Array.isArray(data) ? data : []).filter(l => l.status === "pending_approval");
    res.json(pending);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Approve a lead → Scarlett sends the email
app.post("/api/leads/:id/approve", async (req, res) => {
  try {
    await sbQuery("PATCH", "leads?id=eq." + req.params.id, { body: { 
      status: "intel_pending"
    } });
    res.json({ approved: true, status: "intel_pending" });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Reject a lead
app.post("/api/leads/:id/reject", async (req, res) => {
  try {
    await sbQuery("PATCH", "leads?id=eq." + req.params.id, { body: { status: "rejected", rejected_at: new Date().toISOString(), rejection_reason: req.body.reason || "" } });
    res.json({ status: "rejected" });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════
// ✅ SALES INTEL
// ═══════════════════════════════════════════════

// Get leads ready for Sales Intel (new, approved, enriched)
app.get("/api/sales-intel", async (req, res) => {
  try {
    const data = await sbQuery("GET", "leads", { order: "created_at.desc" });
    const filtered = (data || []).filter(function(l) { 
      return ["new","intel_pending","enriched","email_ready","campaign"].indexOf(l.status) >= 0; 
    });
    res.json(filtered);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Enrich a specific lead with Apollo
app.post("/api/sales-intel/:id/enrich", async (req, res) => {
  try {
  try {
    var leadData = await sbQuery("GET", "leads?id=eq." + req.params.id);
    var lead = leadData[0];
    if (!lead) return res.status(404).json({ error: "Lead not found" });

    // Run full OSINT sweep
    var oresult = await osint.fullOSINT(lead);
    
    // Build update payload from OSINT results
    var updateData = { status: "enriched" };
    var notes = {};
    try { if(lead.notes) notes = JSON.parse(lead.notes); } catch(e) {}
    
    // Map OSINT results to lead fields
    if (oresult.enriched_contact_name) updateData.contact_name = oresult.enriched_contact_name;
    if (oresult.addresses && oresult.addresses.length > 0) updateData.location = oresult.addresses[0].city || oresult.addresses[0].locality;
    
    // Store full OSINT data in notes
    notes.company_number = oresult.company_number || notes.company_number;
    notes.address_line = oresult.address_line || notes.address_line;
    notes.sic_codes = oresult.sic_codes || notes.sic_codes;
    notes.company_status = oresult.company_status;
    notes.incorporated = oresult.incorporated;
    notes.company_type = oresult.company_type;
    notes.enriched_contact_name = oresult.enriched_contact_name;
    
    // Officers as people
    notes.people = [];
    if (oresult.officers && oresult.officers.length > 0) {
      notes.people = oresult.officers.map(function(o) {
        return { name: o.name, title: o.role, email: null, phone: null, linkedin: null, source: o.source || "companies_house" };
      });
    }
    // Add LinkedIn people (from web search)
    if (oresult.linkedin_people && oresult.linkedin_people.length > 0) {
      for (var li = 0; li < oresult.linkedin_people.length; li++) {
        notes.people.push({ name: "Unknown (LinkedIn)", title: null, email: null, phone: null, linkedin: oresult.linkedin_people[li], source: "web_search" });
      }
    }
    
    notes.websites = oresult.websites;
    notes.domain = oresult.domain;
    notes.linkedin = oresult.linkedin_company || notes.linkedin;
    notes.social_links = oresult.social_links;
    notes.email_guesses = oresult.email_guesses;
    notes.google_mentions = oresult.google_mentions.slice(0, 5);
    notes.osint_complete = true;
    notes.enriched_at = new Date().toISOString();
    
    // Set contact email/phone if we found any
    if (oresult.enriched_phone) updateData.phone = oresult.enriched_phone;
    
    updateData.notes = JSON.stringify(notes);
    await sbQuery("PATCH", "leads?id=eq." + req.params.id, { body: updateData });
    
    var updatedLead = (await sbQuery("GET", "leads?id=eq." + req.params.id))[0];
    res.json({ enriched: true, lead: updatedLead, osint: { officers: oresult.officers.length, websites: oresult.websites.length, email_guesses: oresult.email_guesses.length } });
  } catch(e) { 
    console.error("Enrich error:", e);
    res.status(500).json({ error: e.message }); 
  }
} catch(e) { 
    console.error("Enrich error:", e);
    res.status(500).json({ error: e.message }); 
  }
});

// ═══════════════════════════════════════════════
// ✅ APPROVALS
// ═══════════════════════════════════════════════

// Get email-ready leads
app.get("/api/approvals", async (req, res) => {
  try {
    const data = await sbQuery("GET", "leads", { order: "updated_at.desc" });
    const approvals = (data || []).filter(function(l) {
      return l.status === "email_ready" || l.status === "campaign";
    }).map(function(l) {
      var notes = {};
      try { if(l.notes) notes = JSON.parse(l.notes); } catch(e) {}
      return {
        id: l.id,
        name: l.contact_name || l.company_name || "Unknown",
        role: l.contact_title || "",
        company: l.company_name || "",
        domain: l.website || "",
        value: l.score ? "\u20ac" + (l.score * 500) : null,
        reason: l.notes ? (notes.summary || "Email ready for review") : "Email ready for review",
        initials: (l.contact_name || l.company_name || "?").split(" ").map(function(w){return w[0]}).join("").slice(0,2).toUpperCase(),
        status: l.status,
        email_draft: notes.email_draft || ""
      };
    });
    res.json(approvals);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Approve email draft
app.post("/api/approvals/:id/approve", async (req, res) => {
  try {
    await sbQuery("PATCH", "leads?id=eq." + req.params.id, { body: { 
      status: "campaign"
    } });
    const leadData = await sbQuery("GET", "leads?id=eq." + req.params.id);
    const lead = leadData[0];
    var notes = {};
    try{ if(lead.notes) notes = JSON.parse(lead.notes); }catch(e){}
    var draftEmail = notes.email_draft || {};
    
    const campaignData = {
      name: (lead.company_name || "Lead") + " Outreach",
      subject: draftEmail.subject || "Introduction",
      body: draftEmail.body || "",
      status: "draft",
      target_list: lead.email || "",
      created_at: new Date().toISOString()
    };
    await sbQuery("POST", "email_campaigns", { body: campaignData });
    res.json({ approved: true, campaign: campaignData, lead_name: lead.company_name });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Reject email draft
app.post("/api/approvals/:id/reject", async (req, res) => {
  try {
    await sbQuery("PATCH", "leads?id=eq." + req.params.id, { body: { 
      status: "rejected",

      rejection_reason: req.body.reason || ""
    } });
    res.json({ status: "rejected" });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Generate Scarlett email draft for a lead
app.post("/api/approvals/:id/draft-email", async (req, res) => {
  try {
    const leadData = await sbQuery("GET", "leads?id=eq." + req.params.id);
    const lead = leadData[0];
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    
    // Scarlett generates an intro email
    const template = (typeof memory.getBestTemplate === "function") 
      ? memory.getBestTemplate(lead.industry || "solar") 
      : { subject: "Introduction", body: "Hi {{company}}," };
    const emailDraft = (typeof leadEngine.generateEmail === "function")
      ? await leadEngine.generateEmail(lead, template)
      : { subject: "Quick question for {{company}}", body: "Hi there,\n\nI noticed {{company}} is growing fast and thought I\'d reach out…", template: "intro" };
    
    // Store draft in notes (no email_draft column in leads table)
    var notes = {};
    try { if(lead.notes) notes = JSON.parse(lead.notes); } catch(e) {}
    notes.email_draft = emailDraft;
    
    await sbQuery("PATCH", "leads?id=eq." + req.params.id, { body: { 
      status: "email_ready",
      notes: JSON.stringify(notes)
    } });
    
    res.json({ 
      id: lead.id,
      name: lead.contact_name || lead.company_name,
      company: lead.company_name,
      subject: emailDraft.subject || "Introduction",
      body: emailDraft.body || "",
      status: "email_ready"
    });
  } catch(e) { 
    console.error("Draft email error:", e);
    res.status(500).json({ error: e.message }); 
  }
});

// ═══════════════════════════════════════════════
// ✅ TASKS
// ═══════════════════════════════════════════════
app.get("/api/tasks", async (req, res) => {
  try { const data = await sbQuery("GET", "tasks", { order: "created_at.desc" }); res.json(data); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const allowed = ["title","description","status","priority","due_date","created_at","completed_at"];
    const body = {};
    for(const k of allowed) {
      if(req.body[k] !== undefined) body[k] = (req.body[k] === "") ? null : req.body[k];
    }
    const data = await sbQuery("POST", "tasks", { body });
    res.status(201).json(data);
  }
  catch(e) { res.status(500).json({ error: e.message }); }
});

app.patch("/api/tasks/:id", async (req, res) => {
  try {
    const allowed = ["title","description","status","priority","due_date","created_at","completed_at"];
    const body = {};
    for(const k of allowed) {
      if(req.body[k] !== undefined) body[k] = (req.body[k] === "") ? null : req.body[k];
    }
    const data = await sbQuery("PATCH", "tasks?id=eq." + req.params.id, { body });
    res.json(data);
  }
  catch(e) { res.status(500).json({ error: e.message }); }
});
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const data = await sbQuery("DELETE", "tasks?id=eq." + req.params.id);
    res.json(data);
  }
  catch(e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════
// 📧 CAMPAIGNS
// ═══════════════════════════════════════════════
app.get("/api/campaigns", async (req, res) => {
  try { const data = await sbQuery("GET", "email_campaigns", { order: "created_at.desc" }); res.json(data); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/campaigns", async (req, res) => {
  try { const data = await sbQuery("POST", "email_campaigns", { body: req.body }); res.status(201).json(data); }
  catch(e) { res.status(500).json({ error: e.message }); }
});


app.post("/api/campaigns/update", async (req, res) => {
  try {
    const { id, status } = req.body;
    if(!id || !status) return res.status(400).json({ error: "id and status required" });
    const data = await fetch(SUPABASE_URL + "/rest/v1/email_campaigns?id=eq." + id, {
      method: "PATCH",
      headers: {
        "apikey": SB_KEY,
        "Authorization": "Bearer " + SB_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
      },
      body: JSON.stringify({ status: status, updated_at: new Date().toISOString() })
    });
    if (!data.ok) {
      const errBody = await data.text();
      throw new Error("Supabase PATCH error: " + errBody.substring(0,200));
    }
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Delete a campaign
app.delete("/api/campaigns/:id", async (req, res) => {
  try {
    const data = await sbQuery("DELETE", "email_campaigns?id=eq." + req.params.id);
    res.json({ deleted: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════
// 📅 CALENDAR
app.get("/api/calendar", (req, res) => {
  try {
    const start = req.query.start || new Date().toISOString().split("T")[0];
    const end = req.query.end || new Date(Date.now() + 30*86400000).toISOString().split("T")[0];
    const events = memory.getEvents(start, end);
    res.json(events);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/calendar", (req, res) => {
  try {
    const ev = req.body;
    if (!ev || !ev.title || !ev.start_time) return res.status(400).json({ error: "title and start_time required" });
    const id = memory.addEvent({
      title: ev.title,
      description: ev.description || "",
      start_time: ev.start_time,
      end_time: ev.end_time || null,
      all_day: ev.all_day || 0,
      status: ev.status || "scheduled",
      lead_id: ev.lead_id || null,
      task_id: ev.task_id || null,
      color: ev.color || "#ff6600"
    });
    res.json({ ok: true, id });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/calendar/:id", (req, res) => {
  try {
    memory.deleteEvent(parseInt(req.params.id));
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ─── Lead outcomes (what worked, what didn't) ──
app.get("/api/lead-outcomes", (req, res) => {
  const data = memory.getLeadOutcomes(parseInt(req.query.limit) || 20);
  res.json(data);
});

app.post("/api/lead-outcomes", (req, res) => {
  const id = memory.recordLeadOutcome(req.body);
  res.status(201).json({ id });
});

// ─── Email templates (learning from best) ──────
app.get("/api/templates", (req, res) => {
  const data = memory.getTemplates(req.query.industry || null);
  res.json(data);
});

app.post("/api/templates", (req, res) => {
  if (!req.body.name || !req.body.subject_template || !req.body.body_template) {
    return res.status(400).json({ error: "name, subject_template, body_template required" });
  }
  memory.saveTemplate(req.body.name, req.body.subject_template, req.body.body_template, req.body.industry || "general");
  res.status(201).json({ saved: true });
});

// ═══════════════════════════════════════════════
// 🔍 SCARLETT'S LEAD ENGINE
// ═══════════════════════════════════════════════
app.get("/api/scarlett/find-leads", async (req, res) => {
  try {
    const result = await leadEngine.runLeadPipeline();
    // Save leads that don't exist yet to Supabase as "pending_approval"
    const saved = [];
    for (const lead of result.newLeads) {
      try {
        const newLead = await sbQuery("POST", "leads", {
          body: {
            company_name: lead.company_name,
            company_number: lead.company_number,
            address: lead.address,
            status: "pending_approval",
            source: "scarlett_auto",
            notes: JSON.stringify({
              source: lead.source,
              employees: lead.employees,
              phone: lead.phone,
              website: lead.website,
              found_at: new Date().toISOString()
            })
          }
        });
        saved.push(newLead);
      } catch(e) {
        console.error("Failed to save lead:", lead.company_name, e.message);
      }
    }
    res.json({ found: result.newLeads.length, saved: saved.length, follow_ups: result.followUps.length, leads: result.newLeads });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/scarlett/check-followups", async (req, res) => {
  try {
    const followUps = await leadEngine.checkFollowUps();
    res.json({ follow_ups: followUps });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════


// ═══════════════════════════════════════════════
// 🔐 VAULT
// ═══════════════════════════════════════════════
const vault = require('./vault');
vault.init();
const multer = require('multer');
const vaultStorage = multer.diskStorage({
  destination: function(req, file, cb) { cb(null, vault.VAULT_DIR); },
  filename: function(req, file, cb) { cb(null, vault.generateFilename(file.originalname)); }
});
const vaultUpload = multer({ storage: vaultStorage, limits: { fileSize: 200 * 1024 * 1024 } });

app.get('/api/vault', (req, res) => {
  try {
    const files = vault.listFiles();
    const totalSize = vault.getTotalSize();
    const pinSet = vault.getPin() !== '';
    res.json({ files, total_size: totalSize, pin_set: pinSet });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/vault/upload', vaultUpload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const id = vault.addFile(req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, req.body.notes || '');
    res.json({ ok: true, id, filename: req.file.filename });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/vault/:id', (req, res) => {
  try {
    const ok = vault.deleteFile(parseInt(req.params.id));
    res.json({ ok });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/vault/:id/download', (req, res) => {
  try {
    const file = vault.getFile(parseInt(req.params.id));
    if (!file) return res.status(404).json({ error: 'File not found' });
    res.download(vault.VAULT_DIR + '/' + file.filename, file.original_name);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/vault/pin', (req, res) => {
  try {
    const { pin } = req.body;
    vault.setPin(pin || '');
    res.json({ ok: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

\nconst vault = require("./vault");\nvault.init();\nconst multer = require("multer");\nconst vaultStorage = multer.diskStorage({\n  destination: function(req, file, cb) { cb(null, vault.VAULT_DIR); },\n  filename: function(req, file, cb) { cb(null, vault.generateFilename(file.originalname)); }\n});\nconst vaultUpload = multer({ storage: vaultStorage, limits: { fileSize: 200 * 1024 * 1024 } });\n\n// ═══════════════════════════════════════════════\n// 🔐 VAULT\n// ═══════════════════════════════════════════════\napp.get("/api/vault", (req, res) => {\n  try {\n    const files = vault.listFiles();\n    const totalSize = vault.getTotalSize();\n    const pinSet = vault.getPin() !== "";\n    res.json({ files, total_size: totalSize, pin_set: pinSet });\n  } catch(e) {\n    res.status(500).json({ error: e.message });\n  }\n});\n\napp.post("/api/vault/upload", vaultUpload.single("file"), (req, res) => {\n  try {\n    if (!req.file) return res.status(400).json({ error: "No file uploaded" });\n    const id = vault.addFile(req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, req.body.notes || "");\n    res.json({ ok: true, id, filename: req.file.filename });\n  } catch(e) {\n    res.status(500).json({ error: e.message });\n  }\n});\n\napp.delete("/api/vault/:id", (req, res) => {\n  try {\n    const ok = vault.deleteFile(parseInt(req.params.id));\n    res.json({ ok });\n  } catch(e) {\n    res.status(500).json({ error: e.message });\n  }\n});\n\napp.get("/api/vault/:id/download", (req, res) => {\n  try {\n    const file = vault.getFile(parseInt(req.params.id));\n    if (!file) return res.status(404).json({ error: "File not found" });\n    res.download(path.join(vault.VAULT_DIR, file.filename), file.original_name);\n  } catch(e) {\n    res.status(500).json({ error: e.message });\n  }\n});\n\napp.post("/api/vault/pin", (req, res) => {\n  try {\n    const { pin } = req.body;\n    vault.setPin(pin || "");\n    res.json({ ok: true });\n  } catch(e) {\n    res.status(500).json({ error: e.message });\n  }\n});\n\n
// 💾 BACKUP
// ═══════════════════════════════════════════════
app.post("/api/backup", (req, res) => {
  try {
    const result = backup.doBackup(memory.getDBPath());
    let gitResult = {};
    if (req.query.push === "true") {
      gitResult = backup.pushToGitHub();
    }
    res.json({ backup: result, github: gitResult });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════
// 🏢 COMPANIES HOUSE
// ═══════════════════════════════════════════════
app.get("/api/companies/search/:query", async (req, res) => {
  try { const data = await integrations.searchCompanies(req.params.query); res.json(data); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/companies/profile/:number", async (req, res) => {
  try { const data = await integrations.getCompanyProfile(req.params.number); res.json(data); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/companies/officers/:number", async (req, res) => {
  try { const data = await integrations.getCompanyOfficers(req.params.number); res.json(data); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════
// 🎯 APOLLO
// ═══════════════════════════════════════════════
app.post("/api/apollo/search", async (req, res) => {
  try {
    if (!req.body.domain) return res.status(400).json({ error: "domain required" });
    const data = await integrations.searchApollo(req.body.domain);
    res.json(data);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/apollo/enrich", async (req, res) => {
  try {
    if (!req.body.domain) return res.status(400).json({ error: "domain required" });
    const data = await integrations.enrichCompany(req.body.domain);
    res.json(data);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════
// ⚡ QUICK ENRICH
// ═══════════════════════════════════════════════
app.post("/api/enrich", async (req, res) => {
  try {
    const domain = req.body.domain || "";
    const companyName = req.body.company_name || "";
    const searchTerm = companyName || (domain ? domain.replace(/^www\./,"").split(".")[0] : "") || "";
    if (!searchTerm) return res.status(400).json({ error: "company_name or domain required" });
    // If domain provided, try Apollo first
    if (domain || (!companyName && searchTerm)) {
      try {
        const aq = domain || (searchTerm + ".co.uk");
        const apollo = await integrations.enrichCompany(aq);
        if (apollo && apollo.organization) {
          return res.json({ organization: apollo.organization, people: apollo.people || [] });
        }
      } catch(e) {}
    }

    const chResults = await integrations.searchCompanies(searchTerm);
    const companies = chResults.items || [];

    const enriched = [];
    for (const c of companies.slice(0, 3)) {
      const entry = {
        company_name: c.title,
        company_number: c.company_number,
        address: c.address_snippet,
        status: c.company_status,
        type: c.company_type,
        domain: null,
        apollo_data: null
      };
      try {
        const apollo = await integrations.enrichCompany(
          c.title.replace(/[^a-zA-Z0-9 ]/g, "").split(" ")[0].toLowerCase() + ".co.uk"
        );
        if (apollo && apollo.organization) {
          entry.domain = apollo.organization.domain;
          entry.apollo_data = apollo.organization;
        }
      } catch(e) { /* Apollo may not find it */ }
      enriched.push(entry);
    }

    let officers = [];
    if (companies[0]) {
      try {
        const offData = await integrations.getCompanyOfficers(companies[0].company_number);
        officers = (offData.items || []).slice(0, 10).map(o => ({
          name: o.name,
          role: o.officer_role,
          appointed_on: o.appointed_on
        }));
      } catch(e) { /* officers may not be available */ }
    }

    res.json({ companies: enriched, officers });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════
// 📰 NEWS
// ═══════════════════════════════════════════════

// ═══════════════════════════════════════════════
// 🌤️ WEATHER
// ═══════════════════════════════════════════════
app.get("/api/news", async (req, res) => {
  try {
    const apiKey = "pub_2f8aa390186e43cdbfa912a4cde68561";
    const cat = req.query.category || "business,technology";
    const url = "https://newsdata.io/api/1/news?apikey=" + apiKey + "&category=" + cat + "&language=en";
    const r = await fetch(url);
    const j = await r.json();
    const articles = (j.results || []).slice(0, 10).map(a => ({
      title: a.title,
      description: a.description,
      source: a.source_id || a.source_name || "NewsData",
      link: a.link,
      pubDate: a.pubDate
    }));
    res.json({ articles });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/weather", async (req, res) => {
  try {
    // London default (40.4168, -3.7038)
    const lat = req.query.lat || 51.5074;
    const lon = req.query.lon || -0.1278;
    const data = await integrations.getWeather(lat, lon);
    const current = data.current;
    const daily = data.daily;
    const forecast = (daily.time || []).map((date, i) => ({
      date, max: daily.temperature_2m_max[i], min: daily.temperature_2m_min[i],
      conditions: integrations.weatherEmoji(daily.weather_code[i])
    }));
    const wmo = current.weather_code || 0;
    const condition = {"0":"Clear","1":"Mostly clear","2":"Partly cloudy","3":"Overcast","45":"Foggy","48":"Foggy","51":"Light drizzle","53":"Drizzle","55":"Heavy drizzle","61":"Light rain","63":"Rain","65":"Heavy rain","71":"Light snow","73":"Snow","75":"Heavy snow","80":"Light showers","81":"Showers","82":"Heavy showers","95":"Thunderstorm","96":"Thunderstorm with hail","99":"Thunderstorm with hail"}[String(wmo)] || "Unknown";
    res.json({
      temp: current.temperature_2m,
      condition: condition,
      humidity: current.relative_humidity_2m,
      wind: Math.round(current.wind_speed_10m),
      feelsLike: current.apparent_temperature,
      high: daily.temperature_2m_max[0],
      low: daily.temperature_2m_min[0],
      uv: current.uv_index ?? null,
      city: "London",
      icon: integrations.weatherEmoji(wmo),
      forecast: forecast
    });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════
// 🎙 ELEVENLABS VOICE
// ═══════════════════════════════════════════════
app.get("/api/voice/voices", async (req, res) => {
  try {
    const data = await integrations.elevenLabsGetVoices();
    res.json(data);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/voice/speak", async (req, res) => {
  try {
    if (!req.body.text) return res.status(400).json({ error: "text required" });
    const audio = await integrations.elevenLabsSpeak(req.body.text, req.body.voice_id);
    res.set("Content-Type", "audio/mpeg");
    res.send(audio);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════
// 📋 BRIEFING
// ═══════════════════════════════════════════════
app.get("/api/briefing", async (req, res) => {
  try {
    const apiKey = "pub_2f8aa390186e43cdbfa912a4cde68561";
    const SB_URL = SUPABASE_URL + "/rest/v1";
    const SB_H = { "apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY };
    let city = "London";
    let lat = 51.5074, lon = -0.1278;
    const [newsData, weatherData, leadsData, tasksData, approvalsData] = await Promise.all([
      fetch("https://newsdata.io/api/1/news?apikey=" + apiKey + "&category=business,technology,top&language=en")
        .then(r => r.json()).catch(() => ({ results: [] })),
      fetch("https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto")
        .then(r => r.json()).catch(() => null),
      fetch(SB_URL + "/leads?select=id,status,created_at,company_name&order=created_at.desc", { headers: SB_H })
        .then(r => r.json()).catch(() => []),
      fetch(SB_URL + "/tasks?select=id,title,status,priority&order=created_at.desc&limit=5", { headers: SB_H })
        .then(r => r.json()).catch(() => []),
      fetch(SB_URL + "/leads?select=id,company_name,created_at&status=eq.email_ready&order=created_at.desc&limit=10", { headers: SB_H })
        .then(r => r.json()).catch(() => [])
    ]);
    let weather = null;
    if (weatherData && weatherData.current) {
      const wmo = weatherData.current.weather_code || 0;
      const condMap = {"0":"Clear","1":"Mostly clear","2":"Partly cloudy","3":"Overcast","45":"Foggy","48":"Foggy","51":"Light drizzle","53":"Drizzle","55":"Heavy drizzle","61":"Light rain","63":"Rain","65":"Heavy rain","71":"Light snow","73":"Snow","75":"Heavy snow","80":"Light showers","81":"Showers","82":"Heavy showers","95":"Thunderstorm","96":"Thunderstorm with hail","99":"Thunderstorm with hail"};
      const emojiMap = {"0":"☀️","1":"🌤️","2":"⛅","3":"☁️","45":"🌫️","48":"🌫️","51":"🌦️","53":"🌦️","55":"🌦️","61":"🌧️","63":"🌧️","65":"🌧️","71":"❄️","73":"❄️","75":"❄️","80":"🌦️","81":"🌧️","82":"🌧️","95":"⛈️","96":"⛈️","99":"⛈️"};
      weather = { temp: weatherData.current.temperature_2m, condition: condMap[String(wmo)] || "Unknown", icon: emojiMap[String(wmo)] || "☀️", wind: Math.round(weatherData.current.wind_speed_10m), humidity: weatherData.current.relative_humidity_2m, hi: weatherData.daily?.temperature_2m_max?.[0], lo: weatherData.daily?.temperature_2m_min?.[0], city: city };
    }
    const articles = (newsData.results || []).slice(0, 8).map(a => ({ title: a.title, source: a.source_id || a.source_name || "NewsData", link: a.link }));
    const totalLeads = Array.isArray(leadsData) ? leadsData.length : 0;
    const newLeadsToday = Array.isArray(leadsData) ? leadsData.filter(l => { const c = new Date(l.created_at); const t = new Date(); return c.toDateString() === t.toDateString(); }).length : 0;
    const pendingApprovals = Array.isArray(approvalsData) ? approvalsData.length : 0;
    const activeTasks = Array.isArray(tasksData) ? tasksData.filter(t => t.status !== "done" && t.status !== "completed").length : 0;
    const dateStr = new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const statsSummary = "Date: " + dateStr + "\nWeather: " + (weather ? weather.condition + ", " + weather.temp + "°C" : "Unknown") + "\nTotal leads: " + totalLeads + "\nNew leads today: " + newLeadsToday + "\nLeads ready for email: " + pendingApprovals + "\nActive tasks: " + activeTasks;
    let briefingContent = "";
    try {
      const { execSync } = require("child_process");
      const prompt = "You are Scarlett, Darren\'s sales assistant. Write a short, warm morning briefing (3-4 paragraphs).\nInclude: today\'s priorities, what happened yesterday (new leads, responses), what needs doing today, and any watch-outs. Keep it natural and direct, no fluff.\n\nContext:\n" + statsSummary;
      const out = execSync("openclaw agent --json --agent main --local --session-key scarlett-briefing --message " + JSON.stringify(prompt), { timeout: 30000, maxBuffer: 1024 * 1024, env: { ...process.env, PATH: "/usr/local/bin:/usr/bin:/bin" } });
      const parsed = JSON.parse(out.toString());
      briefingContent = parsed.payloads && parsed.payloads[0] ? parsed.payloads[0].text || "" : "";
      briefingContent = briefingContent.split("\n").filter(l => l.trim()).join("\n\n");
    } catch(e) {
      briefingContent = "Good morning Darren. Things are looking steady today - " + newLeadsToday + " new leads came in, " + pendingApprovals + " are ready for your review, and we have " + activeTasks + " active tasks on the go. Check your pipeline for what needs your attention.";
      console.error("Scarlett briefing error:", e.message);
    }
    const paragraphs = briefingContent.split("\n\n").filter(Boolean);
    const headlines = articles.map(a => ({ source: a.source, title: a.title, link: a.link }));
    res.json({ date: new Date().toISOString(), weather: weather || null, content: paragraphs.length ? paragraphs : ["The briefing is being prepared. Check back shortly."], headlines: headlines.length ? headlines : [{ source: "Note", title: "No headlines available right now" }], city: city, stats: { totalLeads, newLeadsToday, pendingApprovals, activeTasks } });
  } catch(e) { console.error("Briefing error:", e.message); res.status(500).json({ error: e.message }); }
});// ─── START ─────────────────────────────────────
// ─── SCARLETT LEAD FINDER ──────────────────────
app.post("/api/leads/find", async (req, res) => {
  try {
    console.log("Scarlett lead pipeline triggered via API");
    const leadEngine = require("./lead_engine");
    const result = await leadEngine.runLeadPipeline().catch(function(e) {
      console.error("Pipeline error:", e.message);
      return { newLeads: [], followUps: [] };
    });
    let inserted = 0;
    for (const lead of result.newLeads || []) {
      try {
        const leadData = {
          company_name: lead.company_name || "Unknown Company",
          website: lead.website || null,
          phone: lead.phone || null,
          email: lead.email || null,
          contact_name: lead.contact_name || null,
          contact_title: lead.contact_title || null,
          industry: lead.industry || "Solar/Heat Pump",
          location: [lead.city, lead.country].filter(Boolean).join(", ") || null,
          status: "new",
          source: lead.source || "scarlett_auto",
          notes: JSON.stringify({
            reasoning: lead.reasoning || "",
            summary: lead.summary || "",
            description: lead.description || "",
            company_number: lead.company_number || null,
            address_line: lead.address_line || null,
            employees: lead.employees || null,
            revenue: lead.revenue || null,
            city: lead.city || null,
            country: lead.country || null,
            linkedin: lead.linkedin || null,
            people: lead.people || [],
            apollo_id: (lead.apollo_data || {}).id || null,
            found_at: new Date().toISOString()
          }),
          score: lead.employees ? Math.min(lead.employees, 100) : 0
        };
        // Dedup: skip if company already exists in DB
        const existingCheck = await sbQuery("GET", "leads", { select: "id", company_name: "eq." + encodeURIComponent(leadData.company_name) }).catch(() => []);
        if (Array.isArray(existingCheck) && existingCheck.length > 0) {
          console.log("Skipping duplicate:", leadData.company_name);
          continue;
        }

        const data = await sbQuery("POST", "leads", { body: leadData });
        if (data && (Array.isArray(data) ? data.length > 0 : data.id)) {
          inserted++;
        } else {
          console.log("Supabase returned empty for", lead.company_name);
        }
      } catch(e) {
        console.error("Lead insert error:", lead.company_name, e.message || e);
      }
    }
    console.log("Inserted " + inserted + " of " + (result.newLeads||[]).length + " leads");
    res.json({ status: "started", new_leads: result.newLeads.length, follow_ups: result.followUps.length, inserted });
  } catch(e) {
    console.error("Lead find error:", e);
    res.status(500).json({ error: e.message });
  }
});



// ─── EMAIL VERIFICATION ───────────────────────────
app.post("/api/verify-emails", async (req, res) => {
  try {
    var emails = req.body.emails || [];
    if (!emails.length) return res.json({ verified: [] });
    var results = await emailVerify.verifyEmails(emails);
    res.json({ verified: results });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, "127.0.0.1", () => {
  console.log("🚀 Mission Control API v2.0 on port", PORT);
  console.log("🧠 Scarlett's memory active");
  console.log("📅 Calendar system active");
  console.log("🔍 Lead engine ready");
  console.log("💾 Backup system ready");
  console.log("✅ All integrations live");
});
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
    res.download(vault.VAULT_DIR + "/" + file.filename, file.original_name);
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


