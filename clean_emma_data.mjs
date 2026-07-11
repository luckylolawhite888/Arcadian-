// Clean test data from Emma's Supabase - only delete garbage test records
const SUPABASE_URL = 'https://psjlllkngrgwvmddwznj.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzamxsbGtuZ3Jnd3ZtZGR3em5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MDYyMjIsImV4cCI6MjA5OTA4MjIyMn0.LSgur4e7W-DeljKJ0QNxzfx4bHppY17WUA7anRBqma8';
const h = { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}`, 'Content-Type': 'application/json' };

// Projects: keep meaningful ones (Q3 Tenders, Gas Safe Cert, GDPR Review etc), delete test garbage
async function cleanProjects() {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/projects`, { headers: h });
  const data = await r.json();
  const testNames = ['fv s', 'Test Create', 'TEXT', 'testttyyy', 'User Test Project'];
  for (const p of data) {
    if (testNames.some(n => p.name === n)) {
      await fetch(`${SUPABASE_URL}/rest/v1/projects?id=eq.${p.id}`, { method: 'DELETE', headers: h });
      console.log(`DELETED project: ${p.name}`);
    } else {
      console.log(`KEPT project: ${p.name}`);
    }
  }
}

// Compliance: keep GDPR Review, H&S Audit, Gas Safe Cert - delete test garbage
async function cleanCompliance() {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/compliance`, { headers: h });
  const data = await r.json();
  const testNames = ['fdv', 'GFBDCVX', 'Test Compliance'];
  for (const c of data) {
    if (testNames.some(n => c.title === n)) {
      await fetch(`${SUPABASE_URL}/rest/v1/compliance?id=eq.${c.id}`, { method: 'DELETE', headers: h });
      console.log(`DELETED compliance: ${c.title}`);
    } else {
      console.log(`KEPT compliance: ${c.title}`);
    }
  }
}

// Work allocations: delete everything except Fire Check
async function cleanAllocations() {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/work_allocations`, { headers: h });
  const data = await r.json();
  for (const a of data) {
    if (a.task_name === 'Fire Check') {
      console.log(`KEPT allocation: ${a.task_name}`);
    } else {
      await fetch(`${SUPABASE_URL}/rest/v1/work_allocations?id=eq.${a.id}`, { method: 'DELETE', headers: h });
      console.log(`DELETED allocation: ${a.task_name || 'unnamed'}`);
    }
  }
}

// Approvals: check what's there
async function listApprovals() {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/approvals?order=created_at.desc&limit=20`, { headers: h });
  const data = await r.json();
  for (const a of data) {
    console.log(`Approval #${a.id}: ${a.name} @ ${a.company} - ${a.status} (${a.email})`);
  }
}

await cleanProjects();
await cleanCompliance();
await cleanAllocations();
await listApprovals();
