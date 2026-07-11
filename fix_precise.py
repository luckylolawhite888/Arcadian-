import re

with open('/var/www/html/index.html', 'rb') as f:
    data = f.read()
c = data.decode('utf-8')

changes = 0

# FIX 1: nav() — add loadTasks for tasks tab
old_nav = """  if(id === 'sales-intel') loadIntel();
  if(id === 'approvals') loadApprovals();"""

new_nav = """  if(id === 'sales-intel') loadIntel();
  if(id === 'tasks') loadTasks();
  if(id === 'approvals') loadApprovals();"""

if old_nav in c:
    c = c.replace(old_nav, new_nav)
    changes += 1
    print('FIX 1: nav() now calls loadTasks for tasks tab')
else:
    print('WARN: nav pattern not found')

# FIX 2: New Task button — wire to showTaskModal
old_btn = "onclick=\"toast('New task form — wire to backend')\""
new_btn = 'onclick="showTaskModal()"'
if old_btn in c:
    c = c.replace(old_btn, new_btn)
    changes += 1
    print('FIX 2: New Task button wired to modal')
else:
    print('WARN: New Task button not found')

# FIX 3: Add E -> Edit and X -> Delete button text
old_e = '>E</button>'
new_edit = '>Edit</button>'
if old_e in c:
    c = c.replace(old_e, new_edit)
    changes += 1
    print('FIX 3a: E -> Edit')
else:
    print('WARN: E button not found')

old_x = '>X</button>'
new_del = '>Delete</button>'
if old_x in c:
    c = c.replace(old_x, new_del)
    changes += 1
    print('FIX 3b: X -> Delete')
else:
    print('WARN: X button not found')

# FIX 4: Tab filters — wire to setTaskFilter
old_tab_open = 'onclick="setTab(this)">Open</button>'
new_tab_open = "onclick=\"setTaskFilter('open',this)\">Open</button>"
count_open = c.count(old_tab_open)
if count_open:
    c = c.replace(old_tab_open, new_tab_open)
    changes += 1
    print(f'FIX 4a: Open tab wired (x{count_open})')

old_tab_comp = 'onclick="setTab(this)">Completed</button>'
new_tab_comp = "onclick=\"setTaskFilter('completed',this)\">Completed</button>"
if old_tab_comp in c:
    c = c.replace(old_tab_comp, new_tab_comp)
    changes += 1
    print('FIX 4b: Completed tab wired')

old_tab_all = 'onclick="setTab(this)">All</button>'
new_tab_all = "onclick=\"setTaskFilter('all',this)\">All</button>"
if old_tab_all in c:
    c = c.replace(old_tab_all, new_tab_all)
    changes += 1
    print('FIX 4c: All tab wired')

# FIX 5: The create task form modal - need to add it
# Check if taskModalOverlay already exists
if 'taskModalOverlay' not in c:
    # Find sheetsOverlay and insert before it
    sheets_idx = c.find('id="sheetsOverlay"')
    if sheets_idx >= 0:
        modal = """
    <!-- TASK MODAL -->
    <div id="taskModalOverlay" class="overlay" onclick="if(event.target===this)closeTaskModal()">
      <div class="overlay-content" style="max-width:500px">
        <div class="overlay-head">
          <div><span class="eyebrow">Mission Control</span><div id="taskModalHead" class="card-title">New Task</div></div>
          <button class="close-btn" onclick="closeTaskModal()">&times;</button>
        </div>
        <div class="overlay-body">
          <input type="hidden" id="taskIdField" value="">
          <div class="field">
            <label>Title</label>
            <input type="text" id="taskTitleField" placeholder="What needs doing?" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border,#333);background:var(--input-bg,#2a2d33);color:var(--text);font-size:14px">
          </div>
          <div class="field" style="margin-top:10px">
            <label>Details</label>
            <textarea id="taskDetailsField" rows="3" placeholder="Add details..." style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border,#333);background:var(--input-bg,#2a2d33);color:var(--text);font-size:14px"></textarea>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
            <div class="field">
              <label>Status</label>
              <select id="taskStatusField" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border,#333);background:var(--input-bg,#2a2d33);color:var(--text);font-size:14px">
                <option value="to do">To Do</option>
                <option value="in progress">In Progress</option>
                <option value="waiting">Waiting</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div class="field">
              <label>Priority</label>
              <select id="taskPriorityField" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border,#333);background:var(--input-bg,#2a2d33);color:var(--text);font-size:14px">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
            <div class="field">
              <label>Assigned To</label>
              <input type="text" id="taskAssignedField" placeholder="e.g. Darren, Scarlett" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border,#333);background:var(--input-bg,#2a2d33);color:var(--text);font-size:14px">
            </div>
            <div class="field">
              <label>Due Date</label>
              <input type="text" id="taskDueField" placeholder="e.g. Tomorrow, Jul 10" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border,#333);background:var(--input-bg,#2a2d33);color:var(--text);font-size:14px">
            </div>
          </div>
        </div>
        <div class="overlay-foot">
          <button class="ghost-btn" onclick="closeTaskModal()">Cancel</button>
          <button class="primary-btn" onclick="saveTask()">Save Task</button>
        </div>
      </div>
    </div>
"""
        c = c[:sheets_idx] + modal + c[sheets_idx:]
        changes += 1
        print('FIX 5: Task modal HTML added')
    else:
        print('WARN: sheetsOverlay not found, cannot add modal')

# FIX 6: Add ALL_TASKS + renderTasks + editTask + deleteTask + showTaskModal + saveTask + setTaskFilter
# Replace the loadTasks function
old_load = """async function loadTasks(){
  const d = await apiGet(API.tasks);
  if(!d || !Array.isArray(d) || !d.length) return;
  document.getElementById('tasksTableBody').innerHTML = d.map(t => {
    const s = (t.status||'to do').toLowerCase();
    return `<tr>
      <td><div class="cell-name">${esc(t.title)}</div><div class="cell-sub">${esc(t.description||'')}</div></td>
      <td><span class="pill ${TPILL[s]||'todo'}">${esc(t.status||'To do')}</span></td>
      <td><span class="prio ${(t.priority||'').toLowerCase()==='high'?'high':(t.priority||'').toLowerCase()==='med'?'med':'low'}">${esc((t.priority||'LOW').toUpperCase())}</span></td>
      <td class="mono">${esc(t.due_date||'---')}</td>
      <td>${esc(t.assigned||'---')}</td></tr>`;
  }).join('');
}"""

new_load_full = """var ALL_TASKS = [];
var TASK_FILTER = 'all';

async function loadTasks(){
  try{
    var d = await apiGet(API.tasks);
    if(!d || !Array.isArray(d)) return;
    ALL_TASKS = d;
    renderTasks();
  }catch(e){
    var tb = document.getElementById('tasksTableBody');
    if(tb) tb.innerHTML = '<tr><td colspan=\"5\" style=\"text-align:center;color:var(--faint);padding:28px\">Failed to load</td></tr>';
  }
}

function renderTasks(){
  var tb = document.getElementById('tasksTableBody');
  if(!tb) return;
  var tasks = ALL_TASKS;
  if(TASK_FILTER === 'open') tasks = tasks.filter(function(t){ return t.status !== 'completed' && t.status !== 'done'; });
  else if(TASK_FILTER === 'completed') tasks = tasks.filter(function(t){ return t.status === 'completed' || t.status === 'done'; });
  if(!tasks.length){
    tb.innerHTML = '<tr><td colspan=\"5\" style=\"text-align:center;color:var(--faint);padding:28px\">No tasks found</td></tr>';
    return;
  }
  tb.innerHTML = tasks.map(function(t){
    var s = (t.status||'to do').toLowerCase();
    var dueField = t.due_date || t.due || '---';
    return '<tr>' +
      '<td><div class=\"cell-name\">' + esc(t.title) + '</div><div class=\"cell-sub\">' + esc(t.description||'') + '</div></td>' +
      '<td><span class=\"pill ' + (TPILL[s]||'todo') + '\">' + esc(t.status||'To do') + '</span></td>' +
      '<td><span class=\"prio ' + ((t.priority||'').toLowerCase()==='high'?'high':(t.priority||'').toLowerCase()==='medium'||(t.priority||'').toLowerCase()==='med'?'med':'low') + '\">' + esc((t.priority||'LOW').toUpperCase()) + '</span></td>' +
      '<td class=\"mono\">' + esc(dueField) + '</td>' +
      '<td>' + esc(t.assigned||'---') + '</td>' +
      '<td style=\"white-space:nowrap\">' +
        '<button class=\"ghost-btn\" onclick=\"editTask(\"' + t.id + '\')\" style=\"font-size:13px;padding:2px 6px\" title=\"Edit\">Edit</button> ' +
        '<button class=\"ghost-btn\" onclick=\"deleteTask(\"' + t.id + '\',\"' + esc(t.title) + '\')\" style=\"font-size:13px;padding:2px 6px;color:var(--error)\" title=\"Delete\">Delete</button>' +
      '</td></tr>';
  }).join('');
}

function setTaskFilter(key, el){
  TASK_FILTER = key;
  document.querySelectorAll('#page-tasks .tabs .tab').forEach(function(t){ t.classList.remove('active'); });
  if(el) el.classList.add('active');
  renderTasks();
}

function showTaskModal(task){
  var overlay = document.getElementById('taskModalOverlay');
  if(!overlay) return;
  document.getElementById('taskModalHead').textContent = task ? 'Edit Task' : 'New Task';
  document.getElementById('taskIdField').value = task ? (task.id||'') : '';
  document.getElementById('taskTitleField').value = task ? (task.title||'') : '';
  document.getElementById('taskDetailsField').value = task ? (task.description||task.detail||'') : '';
  document.getElementById('taskStatusField').value = task ? (task.status||'to do') : 'to do';
  document.getElementById('taskPriorityField').value = task ? (task.priority||'medium') : 'medium';
  document.getElementById('taskAssignedField').value = task ? (task.assigned||'') : '';
  document.getElementById('taskDueField').value = task ? (task.due_date||'') : '';
  overlay.classList.add('open');
}

function closeTaskModal(){
  var overlay = document.getElementById('taskModalOverlay');
  if(overlay) overlay.classList.remove('open');
}

async function saveTask(){
  var id = document.getElementById('taskIdField').value;
  var data = {
    title: document.getElementById('taskTitleField').value,
    description: document.getElementById('taskDetailsField').value,
    status: document.getElementById('taskStatusField').value,
    priority: document.getElementById('taskPriorityField').value,
    assigned: document.getElementById('taskAssignedField').value,
    due_date: document.getElementById('taskDueField').value
  };
  if(!data.title){ toast('Title is required'); return; }
  try{
    if(id){
      await fetch('/api/tasks/' + id, {
        method: 'PATCH',
        headers: {'Content-Type':'application/json','x-access-code':ACCESS_CODE},
        body: JSON.stringify(data)
      });
      toast('Task updated');
    } else {
      var r = await fetch('/api/tasks', {
        method: 'POST',
        headers: {'Content-Type':'application/json','x-access-code':ACCESS_CODE},
        body: JSON.stringify(data)
      });
      if(r.ok) toast('Task created');
      else toast('Error creating task');
    }
    closeTaskModal();
    loadTasks();
  }catch(e){
    toast('Error: ' + e.message);
  }
}

function editTask(id){
  if(!id) return;
  var task = null;
  for(var i=0; i<ALL_TASKS.length; i++){
    if(ALL_TASKS[i].id === id){ task = ALL_TASKS[i]; break; }
  }
  if(task) showTaskModal(task);
  else toast('Task not found');
}

function deleteTask(id, title){
  if(!id) return;
  if(!confirm('Delete task: ' + (title||'this task') + '?')) return;
  fetch('/api/tasks/' + id, {
    method: 'DELETE',
    headers: {'x-access-code':ACCESS_CODE}
  }).then(function(r){
    if(r.ok){ toast('Task deleted'); loadTasks(); }
    else { r.text().then(function(t){ toast('Delete failed: ' + t); }); }
  }).catch(function(e){ toast('Error: ' + e.message); });
}"""

if old_load in c:
    c = c.replace(old_load, new_load_full)
    changes += 1
    print('FIX 6: Task functions (loadTasks, renderTasks, editTask, deleteTask, showTaskModal, saveTask, setTaskFilter) added')
else:
    print('WARN: loadTasks not matched! Searching...')
    idx = c.find('async function loadTasks()')
    if idx >= 0:
        close_brace = c.find('}', idx)
        actual = c[idx:close_brace+1]
        print(f'Actual loadTasks at {idx}: {repr(actual[:200])}')
    else:
        print('loadTasks not found at all!')

print(f'\nTotal changes: {changes}')

with open('/var/www/html/index.html', 'w') as f:
    f.write(c)

# Validate
m = re.search(r'<script>(.*?)</script>', c, re.DOTALL)
open('/tmp/final_check.js', 'w').write(m.group(1))
print('JS extracted for validation')
