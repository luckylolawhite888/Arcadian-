/* ================= LEADS FIXES ================= */
// These replace the placeholder loadLeads/loadStats/findLeads functions
// and add a stacked card detail view.

function esc(t){ if(!t) return ''; const d=document.createElement('div'); d.appendChild(document.createTextNode(t)); return d.innerHTML; }

// Fix loadLeads to match real API fields
async function loadLeads(){
  const d = await apiGet(API.leads);
  if(!d || !Array.isArray(d) || !d.length){
    document.getElementById('leadsTableBody').innerHTML = '<tr><td class="empty-row" colspan="6">No leads yet — ask Scarlett to find some</td></tr>';
    return;
  }
  document.getElementById('leadsTableBody').innerHTML = d.map(function(l){
    let name = l.contact_name || l.company_name || 'Unknown';
    let company = l.company_name || '';
    // If contact_name exists, company is the subtext; if not, company_name is the main
    if(l.contact_name && l.company_name){
      name = l.contact_name;
      company = l.company_name;
    } else if(l.company_name && !l.contact_name){
      name = l.company_name;
      company = '';
    }
    const s = (l.status||'new').toLowerCase();
    // Parse priority from score or default to MED
    const score = l.score || 0;
    const priority = score >= 70 ? 'HIGH' : score >= 30 ? 'MED' : 'LOW';
    const priorityClass = priority === 'HIGH' ? 'high' : priority === 'MED' ? 'med' : 'low';
    // Last activity from updated_at
    const lastAct = l.updated_at ? timeAgo(l.updated_at) : '—';
    // Value from score (or null)
    const value = score > 0 ? '£' + (score * 100) : '—';
    // Store full lead data on the row for click handler
    const leadData = encodeURIComponent(JSON.stringify(l));
    return '<tr data-s="' + (PILL[s]||'new') + '" data-lead="' + leadData + '" onclick="showLeadDetail(this)" style="cursor:pointer">' +
      '<td><div class="cell-name">' + esc(name) + '</div><div class="cell-sub">' + esc(company) + '</div></td>' +
      '<td class="mono">' + esc(l.source||'Scarlett') + '</td>' +
      '<td><span class="pill ' + (PILL[s]||'new') + '">' + esc(l.status||'New') + '</span></td>' +
      '<td><span class="prio ' + priorityClass + '">' + priority + '</span></td>' +
      '<td class="mono">' + value + '</td>' +
      '<td class="mono">' + lastAct + '</td></tr>';
  }).join('');
}

function timeAgo(dateStr){
  if(!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if(diff < 60) return 'Just now';
  if(diff < 3600) return Math.floor(diff/60) + 'm ago';
  if(diff < 86400) return Math.floor(diff/3600) + 'h ago';
  if(diff < 604800) return Math.floor(diff/86400) + 'd ago';
  return d.toLocaleDateString();
}

// Parse notes JSON safely
function parseNotes(lead){
  try {
    if(lead.notes && typeof lead.notes === 'string') return JSON.parse(lead.notes);
    if(lead.notes && typeof lead.notes === 'object') return lead.notes;
  } catch(e) {}
  return {};
}

// Show lead detail in an overlay
function showLeadDetail(row){
  const leadData = JSON.parse(decodeURIComponent(row.dataset.lead));
  const notes = parseNotes(leadData);
  
  // Build the reasoning/chat section
  let reasoningHtml = '';
  if(notes.reasoning){
    reasoningHtml = '<div class="lead-chat-bubble">' +
      '<div class="lead-chat-avatar">🦊</div>' +
      '<div class="lead-chat-msg">' + esc('Why this lead?') + '</div>' +
      '</div>' +
      '<div class="lead-chat-bubble scarlett">' +
      '<div class="lead-chat-msg">' + esc(notes.reasoning) + '</div>' +
      '</div>';
  }
  
  // Build summary
  let summaryHtml = '';
  if(notes.summary){
    summaryHtml = '<div class="lead-section"><h4>Summary</h4><div class="lead-summary-text">' + esc(notes.summary).replace(/\n/g, '<br>') + '</div></div>';
  }
  
  // Build info table
  let infoHtml = '<div class="lead-section"><h4>Lead Information</h4><table class="lead-info-table">';
  if(leadData.company_name) infoHtml += '<tr><td>Company</td><td>' + esc(leadData.company_name) + '</td></tr>';
  if(leadData.contact_name) infoHtml += '<tr><td>Contact</td><td>' + esc(leadData.contact_name) + ' <span class="lead-title">' + esc(leadData.contact_title||'') + '</span></td></tr>';
  if(leadData.email) infoHtml += '<tr><td>Email</td><td><a href="mailto:' + esc(leadData.email) + '">' + esc(leadData.email) + '</a></td></tr>';
  if(leadData.phone) infoHtml += '<tr><td>Phone</td><td>' + esc(leadData.phone) + '</td></tr>';
  if(leadData.website) infoHtml += '<tr><td>Website</td><td><a href="' + esc(leadData.website) + '" target="_blank">' + esc(leadData.website) + '</a></td></tr>';
  if(notes.linkedin) infoHtml += '<tr><td>LinkedIn</td><td><a href="' + esc(notes.linkedin) + '" target="_blank">View Profile</a></td></tr>';
  if(notes.employees) infoHtml += '<tr><td>Employees</td><td>' + notes.employees + '</td></tr>';
  if(notes.revenue) infoHtml += '<tr><td>Revenue</td><td>' + esc(notes.revenue) + '</td></tr>';
  if(leadData.location) infoHtml += '<tr><td>Location</td><td>' + esc(leadData.location) + '</td></tr>';
  if(leadData.industry) infoHtml += '<tr><td>Industry</td><td>' + esc(leadData.industry) + '</td></tr>';
  if(leadData.company_number) infoHtml += '<tr><td>Companies House</td><td><a href="https://find-and-update.company-information.service.gov.uk/company/' + esc(leadData.company_number) + '" target="_blank">' + esc(leadData.company_number) + '</a></td></tr>';
  infoHtml += '</table></div>';
  
  // Build people section
  let peopleHtml = '';
  if(notes.people && notes.people.length > 0){
    peopleHtml = '<div class="lead-section"><h4>Key People</h4>';
    notes.people.forEach(function(p){
      peopleHtml += '<div class="lead-person">' +
        '<div class="lead-person-name">' + esc(p.name||'Unknown') + '</div>' +
        '<div class="lead-person-title">' + esc(p.title||'') + '</div>' +
        (p.email ? '<div class="lead-person-email">' + esc(p.email) + '</div>' : '') +
        '</div>';
    });
    peopleHtml += '</div>';
  }
  
  // Build status actions
  let actionsHtml = '';
  if(leadData.status === 'new' || leadData.status === 'pending_approval'){
    actionsHtml = '<div class="lead-actions">' +
      '<button class="primary-btn" onclick="approveLeadDetail(\'' + leadData.id + '\')">Approve Lead</button>' +
      '<button class="ghost-btn" onclick="rejectLeadDetail(\'' + leadData.id + '\')">Reject</button>' +
      '</div>';
  }
  
  const html = '<div class="lead-detail-overlay" id="leadDetailOverlay" onclick="closeLeadDetail(event)">' +
    '<div class="lead-detail-card">' +
    '<div class="lead-detail-header">' +
    '<h2>' + esc(leadData.contact_name || leadData.company_name || 'Lead') + '</h2>' +
    '<button class="lead-close-btn" onclick="closeLeadDetail()">&times;</button>' +
    '</div>' +
    reasoningHtml +
    summaryHtml +
    infoHtml +
    peopleHtml +
    actionsHtml +
    '</div>' +
    '</div>';
  
  // Remove any existing overlay
  var existing = document.getElementById('leadDetailOverlay');
  if(existing) existing.remove();
  
  // Add to document
  document.body.insertAdjacentHTML('beforeend', html);
  document.getElementById('leadDetailOverlay').classList.add('show');
  document.getElementById('overlayDim').classList.add('show');
}

function closeLeadDetail(e){
  if(e && e.target !== e.currentTarget) return;
  var ov = document.getElementById('leadDetailOverlay');
  if(ov) ov.classList.remove('show');
  document.getElementById('overlayDim').classList.remove('show');
  setTimeout(function(){ var x = document.getElementById('leadDetailOverlay'); if(x) x.remove(); }, 300);
}

async function approveLeadDetail(id){
  const r = await apiPost(API.leads + '/' + id + '/approve', {});
  if(r && r.approved){
    toast('Lead approved! Email queued.');
    closeLeadDetail();
    loadLeads();
  } else {
    toast('Failed to approve lead');
  }
}

async function rejectLeadDetail(id){
  const r = await apiPost(API.leads + '/' + id + '/reject', {reason: 'Not interested'});
  if(r && r.status === 'rejected'){
    toast('Lead rejected');
    closeLeadDetail();
    loadLeads();
  } else {
    toast('Failed to reject lead');
  }
}

// Wire findLeads to actually call the pipeline
async function findLeads(){
  const btn = document.getElementById('findLeadsBtn');
  btn.disabled = true;
  btn.style.opacity = '.6';
  btn.innerHTML = 'Searching...';
  toast("Scarlett's lead engine running...");
  
  const r = await apiPost('/api/leads/find', {});
  if(r && r.status === 'started'){
    toast('Lead search started — results will appear soon');
    // Poll for updates
    setTimeout(function(){ loadLeads(); btn.disabled = false; btn.style.opacity = '1'; btn.innerHTML = 'Find Leads'; }, 3000);
  } else if(r && r.new_leads !== undefined){
    toast('Found ' + r.new_leads + ' new leads');
    loadLeads();
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.innerHTML = 'Find Leads';
  } else {
    // Fallback — try running locally
    toast('Triggering pipeline...');
    setTimeout(function(){
      loadLeads();
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.innerHTML = 'Find Leads';
    }, 5000);
  }
}

// Fix loadStats to show real lead counts
async function loadStats(){
  const d = await apiGet(API.stats);
  if(!d) return;
  if(d.leads !== undefined) document.getElementById('statLeads').textContent = d.leads;
  if(d.tasks !== undefined) document.getElementById('statTasks').textContent = d.tasks;
  if(d.campaigns !== undefined) document.getElementById('statCampaigns').textContent = d.campaigns;
  if(d.pending_approval !== undefined) document.getElementById('navLeadsCount').textContent = d.pending_approval || d.leads || 0;
}

// Override original functions after page load
(function() {
  // Replace the original findLeads
  window.findLeads = findLeads;
  window.loadLeads = loadLeads;
  window.loadStats = loadStats;
})();

