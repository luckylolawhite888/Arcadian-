// Nexus CRM — Supabase Integration Layer
// Injected into nexus.html to replace localStorage with Supabase backend
// Uses Supabase JS client v2

window.SUPABASE_URL = 'https://mdleurcenwmmenvkwjhl.supabase.co';
window.SUPABASE_ANON_KEY = 'sb_publishable_mPjat_GLHfK1TwzPxEa2tQ_OvutOgDL';

// ─── Auth State ───
let sbUser = null;
let sbSession = null;
let sbClient = null;

// ─── Init Supabase Client ───
function initSupabase() {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    script.onload = () => {
      const { createClient } = window.supabase;
      sbClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'nexus_sb_auth'
        }
      });
      resolve();
    };
    script.onerror = () => {
      console.error('Failed to load Supabase SDK');
      // Fall back to localStorage if CDN fails
      resolve();
    };
    document.head.appendChild(script);
  });
}

// ─── Auth UI ───
function showAuthUI() {
  // Create overlay if not exists
  let overlay = document.getElementById('nexusAuthOverlay');
  if (overlay) { overlay.style.display = 'flex'; return; }
  
  overlay = document.createElement('div');
  overlay.id = 'nexusAuthOverlay';
  overlay.innerHTML = `
    <style>
      #nexusAuthOverlay {
        position: fixed; inset: 0; z-index: 9999;
        background: var(--bg, #0d0f14);
        display: flex; align-items: center; justify-content: center;
        font-family: 'Inter', system-ui, sans-serif;
      }
      #nexusAuthOverlay .auth-card {
        background: var(--s1, #12151d);
        border: 1px solid var(--b1, rgba(255,255,255,0.06));
        border-radius: 14px;
        padding: 32px 28px;
        width: min(92vw, 380px);
        box-shadow: 0 20px 60px rgba(0,0,0,0.6);
      }
      #nexusAuthOverlay .auth-logo {
        display: flex; align-items: center; gap: 8px;
        font-size: 20px; font-weight: 800; color: #f0f4f8;
        margin-bottom: 24px; justify-content: center;
      }
      #nexusAuthOverlay .auth-logo-mark {
        width: 32px; height: 32px; border-radius: 8px;
        background: linear-gradient(135deg, #10b981, #14b8a6);
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 0 14px rgba(16,185,129,0.3);
      }
      #nexusAuthOverlay .auth-tab { display: flex; gap: 0; margin-bottom: 20px; background: #181c27; border-radius: 8px; }
      #nexusAuthOverlay .auth-tab button {
        flex: 1; padding: 8px; background: transparent; border: none;
        color: #4a5568; font-family: inherit; font-size: 13px; font-weight: 600;
        cursor: pointer; border-radius: 8px; transition: 0.15s;
      }
      #nexusAuthOverlay .auth-tab button.on { background: #10b981; color: #051a0e; }
      #nexusAuthOverlay .auth-field { margin-bottom: 14px; }
      #nexusAuthOverlay .auth-field label {
        display: block; font-size: 10px; font-weight: 700; letter-spacing: 0.6px;
        text-transform: uppercase; color: #8896aa; margin-bottom: 5px;
      }
      #nexusAuthOverlay .auth-field input {
        width: 100%; padding: 10px 12px; background: #181c27; border: 1px solid rgba(255,255,255,0.06);
        border-radius: 8px; color: #f0f4f8; font-family: inherit; font-size: 14px;
        outline: none; box-sizing: border-box;
      }
      #nexusAuthOverlay .auth-field input:focus { border-color: rgba(16,185,129,0.4); box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
      #nexusAuthOverlay .auth-btn {
        width: 100%; padding: 11px; border-radius: 8px; border: none;
        background: #10b981; color: #051a0e; font-family: inherit;
        font-size: 14px; font-weight: 700; cursor: pointer; margin-top: 6px;
        transition: 0.15s;
      }
      #nexusAuthOverlay .auth-btn:hover { background: #059669; }
      #nexusAuthOverlay .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      #nexusAuthOverlay .auth-error { color: #ef4444; font-size: 12px; margin-top: 8px; text-align: center; }
      #nexusAuthOverlay .auth-footer { font-size: 11px; color: #4a5568; text-align: center; margin-top: 16px; }
      #nexusAuthOverlay .auth-footer a { color: #38bdf8; text-decoration: none; cursor: pointer; }
    </style>
    <div class="auth-card">
      <div class="auth-logo">
        <div class="auth-logo-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" width="16" height="16">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        Nexus
      </div>
      <div class="auth-tab">
        <button id="authLoginTab" class="on" onclick="switchAuthTab('login')">Sign In</button>
        <button id="authRegisterTab" onclick="switchAuthTab('register')">Register</button>
      </div>
      <div id="authFormLogin">
        <div class="auth-field"><label>Email</label><input type="email" id="authLoginEmail" placeholder="you@email.com" autocomplete="email"></div>
        <div class="auth-field"><label>Password</label><input type="password" id="authLoginPass" placeholder="••••••••" autocomplete="current-password"></div>
        <button class="auth-btn" onclick="authLogin()">Sign In</button>
      </div>
      <div id="authFormRegister" style="display:none">
        <div class="auth-field"><label>Full Name</label><input type="text" id="authRegName" placeholder="Your name"></div>
        <div class="auth-field"><label>Email</label><input type="email" id="authRegEmail" placeholder="you@email.com" autocomplete="email"></div>
        <div class="auth-field"><label>Password (min 6 chars)</label><input type="password" id="authRegPass" placeholder="••••••••" autocomplete="new-password"></div>
        <button class="auth-btn" onclick="authRegister()">Create Account</button>
      </div>
      <div id="authError" class="auth-error"></div>
      <div class="auth-footer">Data stored securely. Your instance, your data.</div>
    </div>
  `;
  document.body.prepend(overlay);
}

function switchAuthTab(tab) {
  document.getElementById('authLoginTab').className = tab === 'login' ? 'on' : '';
  document.getElementById('authRegisterTab').className = tab === 'register' ? 'on' : '';
  document.getElementById('authFormLogin').style.display = tab === 'login' ? '' : 'none';
  document.getElementById('authFormRegister').style.display = tab === 'register' ? '' : 'none';
  document.getElementById('authError').textContent = '';
}

function showAuthError(msg) { document.getElementById('authError').textContent = msg; }

async function authLogin() {
  const email = document.getElementById('authLoginEmail').value.trim();
  const password = document.getElementById('authLoginPass').value;
  if (!email || !password) { showAuthError('Email and password required'); return; }
  const btn = document.querySelector('#authFormLogin .auth-btn');
  btn.disabled = true; btn.textContent = 'Signing in…';
  
  try {
    const { data, error } = await sbClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    sbUser = data.user;
    sbSession = data.session;
    hideAuthUI();
    await afterAuth();
  } catch(e) {
    showAuthError(e.message);
    btn.disabled = false; btn.textContent = 'Sign In';
  }
}

async function authRegister() {
  const name = document.getElementById('authRegName').value.trim();
  const email = document.getElementById('authRegEmail').value.trim();
  const password = document.getElementById('authRegPass').value;
  if (!name || !email || !password) { showAuthError('All fields required'); return; }
  if (password.length < 6) { showAuthError('Password must be at least 6 characters'); return; }
  
  const btn = document.querySelector('#authFormRegister .auth-btn');
  btn.disabled = true; btn.textContent = 'Creating…';
  
  try {
    const { data, error } = await sbClient.auth.signUp({ email, password, options: { data: { full_name: name } } });
    if (error) throw error;
    
    // Supabase auto-confirms by default in development
    // For production, user would need to confirm email
    sbUser = data.user;
    sbSession = data.session;
    
    if (data.user?.identities?.length === 0) {
      showAuthError('This email is already registered. Try signing in.');
      btn.disabled = false; btn.textContent = 'Create Account';
      return;
    }
    
    // Create user profile
    if (sbUser) {
      await sbClient.from('users').upsert({
        id: sbUser.id,
        email: email,
        name: name,
        created_at: new Date().toISOString()
      }, { onConflict: 'id' });
    }
    
    hideAuthUI();
    await afterAuth();
  } catch(e) {
    showAuthError(e.message);
    btn.disabled = false; btn.textContent = 'Create Account';
  }
}

function hideAuthUI() {
  const overlay = document.getElementById('nexusAuthOverlay');
  if (overlay) overlay.style.display = 'none';
}

// ─── After Auth Callback ───
async function afterAuth() {
  // Migrate localStorage data to Supabase if it exists
  try {
    const localData = localStorage.getItem('nx7');
    if (localData) {
      const parsed = JSON.parse(localData);
      await migrateLocalData(parsed);
      // Don't clear localStorage yet — keep as backup until first successful sync
    }
  } catch(e) { console.log('Migration check:', e.message); }
  
  // Load data from Supabase
  await loadDataFromSupabase();
  
  // Re-render current view
  const curView = document.querySelector('.view.on');
  if (curView) {
    const viewName = curView.id?.replace('v-', '');
    if (viewName) triggerRender(viewName);
  }
}

function triggerRender(view) {
  const fn = `render${view.charAt(0).toUpperCase() + view.slice(1)}`;
  window[fn]?.();
}

// ─── Supabase Data Layer ───
// Replaces the original load() and save() functions

const SB_TABLES = {
  contacts: 'id, name, email, phone, company, title, status, value, tags, linkedin, web, notes, created_at, updated_at',
  deals: 'id, name, contact_id, value, prob, stage, close_date, notes, created_at, updated_at',
  tasks: 'id, title, contact_id, priority, category, due, recur, notes, done, created_at',
  invoices: 'id, type, contact, amount, status, due, notes, created_at',
  automations: 'id, name, trigger_event, action, action_val, enabled, runs, created_at',
  notes: 'id, title, type, tags, body, starred, created_at',
  templates: 'id, name, stage, subject, body, created_at',
  activity: 'id, contact_id, type, body, created_at',
  events: 'id, title, date, type, contact_id, created_at',
  files: 'id, name, type, size, data_url, created_at',
  maps: 'id, name, nodes, created_at',
  webhooks: 'id, event, data, created_at'
};

async function sbFetch(table, options = {}) {
  if (!sbClient || !sbUser) return [];
  let query = sbClient.from(table).select(options.select || '*');
  
  if (options.eq) {
    for (const [col, val] of Object.entries(options.eq)) {
      query = query.eq(col, val);
    }
  }
  if (options.order) query = query.order(options.order, { ascending: options.ascending ?? true });
  if (options.limit) query = query.limit(options.limit);
  
  const { data, error } = await query;
  if (error) { console.error(`sbFetch ${table}:`, error); return []; }
  return data || [];
}

async function sbInsert(table, record) {
  if (!sbClient || !sbUser) return null;
  const { data, error } = await sbClient.from(table).insert({
    ...record,
    user_id: sbUser.id
  }).select().single();
  if (error) { console.error(`sbInsert ${table}:`, error); return null; }
  return data;
}

async function sbUpdate(table, id, updates) {
  if (!sbClient || !sbUser) return null;
  const { data, error } = await sbClient.from(table)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id).eq('user_id', sbUser.id)
    .select().single();
  if (error) { console.error(`sbUpdate ${table}:`, error); return null; }
  return data;
}

async function sbDelete(table, id) {
  if (!sbClient || !sbUser) return false;
  const { error } = await sbClient.from(table).delete().eq('id', id).eq('user_id', sbUser.id);
  if (error) { console.error(`sbDelete ${table}:`, error); return false; }
  return true;
}

async function sbUpsert(table, record) {
  if (!sbClient || !sbUser) return null;
  const { data, error } = await sbClient.from(table).upsert({
    ...record,
    user_id: sbUser.id,
    updated_at: new Date().toISOString()
  }, { onConflict: 'id' }).select().single();
  if (error) { console.error(`sbUpsert ${table}:`, error); return null; }
  return data;
}

// ─── Load all data from Supabase ───
async function loadDataFromSupabase() {
  // Initialize D with empty arrays
  const arrs = ['cards', 'contacts', 'deals', 'tasks', 'invoices', 'automations', 'activity', 'templates', 'webhooks', 'notes', 'files', 'maps', 'events'];
  arrs.forEach(k => { window.D[k] = []; });
  
  // Load each table in parallel
  const results = await Promise.allSettled([
    sbFetch('contacts').then(d => { window.D.contacts = d.map(mapContactFromSB); }),
    sbFetch('deals').then(d => { window.D.deals = d.map(mapDealFromSB); }),
    sbFetch('tasks').then(d => { window.D.tasks = d.map(mapTaskFromSB); }),
    sbFetch('invoices').then(d => { window.D.invoices = d.map(mapInvoiceFromSB); }),
    sbFetch('automations').then(d => { window.D.automations = d.map(mapAutomationFromSB); }),
    sbFetch('notes').then(d => { window.D.notes = d.map(mapNoteFromSB); }),
    sbFetch('templates').then(d => { window.D.templates = d.map(mapTemplateFromSB); }),
    sbFetch('activity').then(d => { window.D.activity = d.map(mapActivityFromSB); }),
    sbFetch('events').then(d => { window.D.events = d.map(mapEventFromSB); }),
    sbFetch('files').then(d => { window.D.files = d.map(mapFileFromSB); }),
    sbFetch('maps').then(d => { window.D.maps = d.map(mapMapFromSB); }),
    sbFetch('webhooks').then(d => { window.D.webhooks = d.map(mapWebhookFromSB); }),
  ]);
  
  // Init timelines on contacts
  window.D.contacts.forEach(c => { if (!Array.isArray(c.timeline)) c.timeline = []; });
  
  const errors = results.filter(r => r.status === 'rejected');
  if (errors.length > 0) console.warn('Supabase load errors:', errors.length);
}

// ─── Field mappers (Supabase DB columns ↔ Nexus App columns) ───
function mapContactToSB(c) {
  return { id: c.id, name: c.name, email: c.email || '', phone: c.phone || '', company: c.company || '', title: c.title || '', status: c.status || 'Lead', value: c.value || 0, tags: c.tags || [], linkedin: c.linkedin || '', web: c.web || '', notes: c.notes || '' };
}
function mapContactFromSB(r) {
  return { id: r.id, name: r.name, email: r.email, phone: r.phone, company: r.company, title: r.title, status: r.status, value: r.value, tags: r.tags || [], linkedin: r.linkedin, web: r.web, notes: r.notes, timeline: r.timeline || [] };
}
function mapDealToSB(d) {
  return { id: d.id, name: d.name, contact_id: d.contactId || '', value: d.value || 0, prob: d.prob || 0, stage: d.stage || 'Lead', close_date: d.close || null, notes: d.notes || '' };
}
function mapDealFromSB(r) {
  return { id: r.id, name: r.name, contactId: r.contact_id, value: r.value, prob: r.prob, stage: r.stage, close: r.close_date, notes: r.notes, ts: r.created_at };
}
function mapTaskToSB(t) {
  return { id: t.id, title: t.title, contact_id: t.contactId || '', priority: t.priority || 'Medium', category: t.category || 'Other', due: t.due || null, recur: t.rec || '', notes: t.notes || '', done: t.done || false };
}
function mapTaskFromSB(r) {
  return { id: r.id, title: r.title, contactId: r.contact_id, priority: r.priority, category: r.category, due: r.due, rec: r.recur, notes: r.notes, done: r.done, ts: r.created_at };
}
function mapInvoiceToSB(inv) {
  return { id: inv.id, type: inv.type || 'Invoice', contact: inv.contact || '', amount: inv.amount || 0, status: inv.status || 'Draft', due: inv.due || null, notes: inv.notes || '' };
}
function mapInvoiceFromSB(r) {
  return { id: r.id, type: r.type, contact: r.contact, amount: r.amount, status: r.status, due: r.due, notes: r.notes, ts: r.created_at };
}
function mapAutomationToSB(a) {
  return { id: a.id, name: a.name, trigger_event: a.trigger, action: a.action, action_val: a.actionVal || '', enabled: a.enabled !== false, runs: a.runs || 0 };
}
function mapAutomationFromSB(r) {
  return { id: r.id, name: r.name, trigger: r.trigger_event, action: r.action, actionVal: r.action_val, enabled: r.enabled, runs: r.runs, ts: r.created_at };
}
function mapNoteToSB(n) {
  return { id: n.id, title: n.title, type: n.type || 'Note', tags: n.tags || [], body: n.body || '', starred: n.star || false };
}
function mapNoteFromSB(r) {
  return { id: r.id, title: r.title, type: r.type, tags: r.tags || [], body: r.body, star: r.starred, ts: r.created_at };
}
function mapTemplateToSB(t) {
  return { id: t.id, name: t.name, stage: t.stage || '', subject: t.subject || '', body: t.body || '' };
}
function mapTemplateFromSB(r) {
  return { id: r.id, name: r.name, stage: r.stage, subject: r.subject, body: r.body, ts: r.created_at };
}
function mapActivityToSB(a) {
  return { id: a.id, contact_id: a.contactId || '', type: a.type || 'note', body: a.body || '' };
}
function mapActivityFromSB(r) {
  return { id: r.id, contactId: r.contact_id, type: r.type, body: r.body, ts: r.created_at };
}
function mapEventToSB(e) {
  return { id: e.id, title: e.title, date: e.date, type: e.type || 'event', contact_id: e.contactId || '' };
}
function mapEventFromSB(r) {
  return { id: r.id, title: r.title, date: r.date, type: r.type, contactId: r.contact_id, created_at: r.created_at };
}
function mapFileToSB(f) {
  return { id: f.id, name: f.name, type: f.type || 'file', size: f.size || 0, data_url: f.data || '' };
}
function mapFileFromSB(r) {
  return { id: r.id, name: r.name, type: r.type, size: r.size, data: r.data_url, created_at: r.created_at };
}
function mapMapToSB(m) {
  return { id: m.id, name: m.name || 'Untitled', nodes: m.nodes || [] };
}
function mapMapFromSB(r) {
  return { id: r.id, name: r.name, nodes: r.nodes || [], created_at: r.created_at };
}
function mapWebhookToSB(w) {
  return { id: w.id, event: w.event || 'webhook', data: w.data || {} };
}
function mapWebhookFromSB(r) {
  return { id: r.id, event: r.event, data: r.data, created_at: r.created_at };
}

// ─── Migrate localStorage data to Supabase ───
async function migrateLocalData(localD) {
  if (!sbClient || !sbUser) return;
  const tables = ['contacts', 'deals', 'tasks', 'invoices', 'automations', 'notes', 'templates', 'activity', 'events'];
  
  for (const table of tables) {
    const items = localD[table];
    if (!items || !items.length) continue;
    
    // Check if user already has data in this table
    const { data: existing } = await sbClient.from(table).select('id').eq('user_id', sbUser.id).limit(1);
    if (existing && existing.length > 0) continue; // Already has data, don't overwrite
    
    // Insert in batches
    const batchSize = 20;
    const mapper = window[`map${table.charAt(0).toUpperCase() + table.slice(1).replace(/s$/, '')}ToSB`];
    if (!mapper) continue;
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize).map(mapper);
      await sbClient.from(table).insert(batch.map(r => ({ ...r, user_id: sbUser.id })));
    }
  }
}

// ─── Monkey-patch the original save/load functions ───
function patchOriginalFunctions() {
  // Store original if needed for fallback
  window._origLoad = window.load;
  window._origSave = window.save;
  
  // Replace load with Supabase-aware version
  window.origLoad = window.load;
  window.load = function() {
    // Don't load from localStorage anymore — Supabase handles it
    // But keep localStorage as fallback if offline
    if (!sbClient || !sbUser) {
      window.origLoad();
    }
  };
  
  // Replace save with Supabase write
  window.origSave = window.save;
  window.save = async function() {
    // Save to localStorage as backup
    try { localStorage.setItem('nx7', JSON.stringify(window.D)); } catch(e) {}
    
    // Then sync to Supabase
    if (!sbClient || !sbUser) return;
    
    // We don't auto-save everything — only individual CRUD operations
    // This function is called after each action so we keep it lightweight
  };
}

// ─── Patch individual save functions to use Supabase ───
function patchSaveFunctions() {
  const patches = [
    { fn: 'saveDeal', table: 'deals', map: mapDealToSB, after: 'renderPipeline' },
    { fn: 'saveContact', table: 'contacts', map: mapContactToSB, after: 'renderContacts' },
    { fn: 'saveTask', table: 'tasks', map: mapTaskToSB, after: 'renderTasks', extra: 'updateBadges' },
    { fn: 'saveInvoice', table: 'invoices', map: mapInvoiceToSB, after: 'renderInvoices' },
    { fn: 'saveAutomation', table: 'automations', map: mapAutomationToSB, after: 'renderAutomations' },
    { fn: 'saveNote', table: 'notes', map: mapNoteToSB, after: 'renderNotes' },
    { fn: 'saveTemplate', table: 'templates', map: mapTemplateToSB, after: 'renderTemplates' },
  ];
  
  for (const patch of patches) {
    const orig = window[patch.fn];
    if (!orig) continue;
    
    window[patch.fn] = async function() {
      // Call original to create the object and add it to D
      orig();
      
      // Now the object is in D — sync to Supabase
      if (!sbClient || !sbUser) return;
      
      // Find the last-added item of this type
      const items = window.D[patch.table];
      const last = items[items.length - 1];
      if (last) {
        const sbRecord = patch.map(last);
        await sbInsert(patch.table, sbRecord).catch(e => console.warn(`${patch.fn} sync:`, e.message));
      }
      
      // Trigger re-render
      if (patch.after) window[patch.after]?.();
      if (patch.extra) window[patch.extra]?.();
    };
  }
  
  // Patch delete functions
  const deletePatches = [
    { fn: 'deleteDeal', table: 'deals', after: 'renderPipeline' },
    { fn: 'deleteContact', table: 'contacts', after: 'renderContacts' },
    { fn: 'deleteTask', table: 'tasks', after: 'renderTasks' },
    { fn: 'deleteInvoice', table: 'invoices', after: 'renderInvoices' },
    { fn: 'deleteNote', table: 'notes', after: 'renderNotes' },
    { fn: 'deleteTemplate', table: 'templates', after: 'renderTemplates' },
    { fn: 'deleteFile', table: 'files', after: 'renderFiles' },
  ];
  
  for (const patch of deletePatches) {
    const orig = window[patch.fn];
    if (!orig) continue;
    
    window[patch.fn] = async function(id) {
      if (!sbClient || !sbUser) { orig(id); return; }
      
      // Delete from Supabase
      await sbDelete(patch.table, id);
      
      // Call original to update local state
      orig(id);
      
      // Re-render
      if (patch.after) window[patch.after]?.();
    };
  }
  
  // Patch: toggleTask (check/uncheck)
  if (window.toggleTask) {
    const origToggle = window.toggleTask;
    window.toggleTask = async function(id) {
      origToggle(id);
      if (!sbClient || !sbUser) return;
      const task = window.D.tasks.find(t => t.id === id);
      if (task) await sbUpdate('tasks', id, mapTaskToSB(task));
    };
  }
  
  // Patch: moveDeal (drag & drop)
  if (window.moveDeal) {
    const origMove = window.moveDeal;
    window.moveDeal = async function(dealId, newStage) {
      origMove(dealId, newStage);
      if (!sbClient || !sbUser) return;
      const deal = window.D.deals.find(d => d.id === dealId);
      if (deal) await sbUpdate('deals', dealId, mapDealToSB(deal));
    };
  }
  
  // Patch: toggleStar (notes)
  if (window.toggleStar) {
    const origStar = window.toggleStar;
    window.toggleStar = async function(id) {
      origStar(id);
      if (!sbClient || !sbUser) return;
      const note = window.D.notes.find(n => n.id === id);
      if (note) {
        const sbRecord = mapNoteToSB(note);
        sbRecord.starred = note.star;
        await sbUpdate('notes', id, sbRecord);
      }
    };
  }
  
  // Patch: toggleAuto
  if (window.toggleAuto) {
    const origAutoToggle = window.toggleAuto;
    window.toggleAuto = async function(id) {
      origAutoToggle(id);
      if (!sbClient || !sbUser) return;
      const auto = window.D.automations.find(a => a.id === id);
      if (auto) await sbUpdate('automations', id, mapAutomationToSB(auto));
    };
  }
  
  // Patch: updateInvoiceStatus
  if (window.updateInvoiceStatus) {
    const origInvStatus = window.updateInvoiceStatus;
    window.updateInvoiceStatus = async function(id, status) {
      origInvStatus(id, status);
      if (!sbClient || !sbUser) return;
      const inv = window.D.invoices.find(i => i.id === id);
      if (inv) await sbUpdate('invoices', id, mapInvoiceToSB(inv));
    };
  }
  
  // Patch: logActivity and saveActivityLog
  if (window.saveActivityLog) {
    const origLog = window.saveActivityLog;
    window.saveActivityLog = async function() {
      origLog();
      if (!sbClient || !sbUser) return;
      const items = window.D.activity;
      const last = items[items.length - 1];
      if (last) {
        const sbRecord = mapActivityToSB(last);
        sbRecord.contact_id = window.activeContactId || '';
        await sbInsert('activity', sbRecord).catch(e => console.warn('activity sync:', e.message));
      }
    };
  }
}

// ─── Add logout button ───
function addLogoutButton() {
  // Add to sidebar after API Docs
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  
  const div = document.createElement('div');
  div.className = 'sb-div';
  div.style.marginTop = 'auto';
  sidebar.appendChild(div);
  
  const btn = document.createElement('button');
  btn.className = 'sbi';
  btn.innerHTML = `
    <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
    Sign Out
  `;
  btn.onclick = async () => {
    if (!sbClient) return;
    await sbClient.auth.signOut();
    sbUser = null;
    sbSession = null;
    showAuthUI();
    document.getElementById('nexusAuthOverlay').style.display = 'flex';
  };
  sidebar.appendChild(btn);
}

// ─── Boot ───
async function bootNexus() {
  await initSupabase();
  if (!sbClient) {
    // Supabase CDN failed — run in offline/localStorage mode
    console.warn('Supabase unavailable, running in localStorage mode');
    return;
  }
  
  // Check for existing session
  const { data: { session } } = await sbClient.auth.getSession();
  
  if (session) {
    sbUser = session.user;
    sbSession = session;
    showAuthUI(); // Shows briefly then hides
    await afterAuth();
    hideAuthUI();
    addLogoutButton();
  } else {
    showAuthUI();
  }
  
  // Patch functions
  patchOriginalFunctions();
  patchSaveFunctions();
}

// ─── Auto-start on page load ───
document.addEventListener('DOMContentLoaded', () => {
  // Wait a beat for the main app to initialize its D object
  setTimeout(bootNexus, 200);
});
