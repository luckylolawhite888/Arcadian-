with open('/var/www/html/index.html', 'r') as f:
    c = f.read()

# 1. Add overlay CSS if not there (before </style>)
if '.overlay.open{display:flex}' not in c and '.overlay{display:none' not in c:
    overlay_css = '\n/* Overlay base - hidden by default, shown with .open class */\n.overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:1000;justify-content:center;align-items:flex-start;padding-top:60px;overflow-y:auto;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}\n.overlay.open{display:flex}\n.overlay-content{background:var(--bg,#1a1d23);border-radius:12px;max-width:600px;width:90%;margin:0 auto;border:1px solid var(--border,#333)}\n.overlay-head{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border,#333)}\n.overlay-head h3{margin:0;font-size:16px;font-weight:600}\n'
    style_close = c.find('</style>')
    c = c[:style_close] + overlay_css + c[style_close:]
    print('Added overlay CSS')
else:
    print('Overlay CSS already exists')

# 2. Add task modal HTML before the toast div
if 'taskModalOverlay' not in c:
    modal_html = '\n<!-- ================= TASK MODAL ================= -->\n<div id="taskModalOverlay" class="overlay" onclick="if(event.target===this)closeTaskModal()">\n  <div class="overlay-content" style="max-width:500px">\n    <div class="overlay-head">\n      <h3 id="taskModalHead">New Task</h3>\n      <button class="ghost-btn" onclick="closeTaskModal()">&times;</button>\n    </div>\n    <input type="hidden" id="taskIdField">\n    <div style="padding:16px;display:flex;flex-direction:column;gap:8px">\n      <input type="text" id="taskTitleField" placeholder="Task title" style="padding:8px;font-size:14px;border-radius:6px;border:1px solid var(--border,#333);background:var(--input-bg,#222);color:var(--fg,#fff)">\n      <textarea id="taskDetailsField" placeholder="Details" rows="3" style="padding:8px;font-size:14px;border-radius:6px;border:1px solid var(--border,#333);background:var(--input-bg,#222);color:var(--fg,#fff);resize:vertical"></textarea>\n      <div style="display:flex;gap:8px">\n        <select id="taskStatusField" style="flex:1;padding:8px;font-size:14px;border-radius:6px;border:1px solid var(--border,#333);background:var(--input-bg,#222);color:var(--fg,#fff)">\n          <option value="to do">To Do</option>\n          <option value="in progress">In Progress</option>\n          <option value="completed">Completed</option>\n        </select>\n        <select id="taskPriorityField" style="flex:1;padding:8px;font-size:14px;border-radius:6px;border:1px solid var(--border,#333);background:var(--input-bg,#222);color:var(--fg,#fff)">\n          <option value="low">Low</option>\n          <option value="medium">Medium</option>\n          <option value="high">High</option>\n        </select>\n      </div>\n      <div style="display:flex;gap:8px">\n        <input type="text" id="taskAssignedField" placeholder="Assigned to" style="flex:1;padding:8px;font-size:14px;border-radius:6px;border:1px solid var(--border,#333);background:var(--input-bg,#222);color:var(--fg,#fff)">\n        <input type="date" id="taskDueField" style="flex:1;padding:8px;font-size:14px;border-radius:6px;border:1px solid var(--border,#333);background:var(--input-bg,#222);color:var(--fg,#fff)">\n      </div>\n      <button onclick="saveTask()" style="margin-top:8px;padding:10px;font-size:15px;font-weight:600;border:none;border-radius:8px;background:var(--accent,#ff8c00);color:#000;cursor:pointer">Save Task</button>\n    </div>\n  </div>\n</div>\n'
    toast_idx = c.find('<div class="toast"')
    c = c[:toast_idx] + modal_html + c[toast_idx:]
    print('Added task modal HTML')
else:
    print('Task modal already exists')

# 3. Save
with open('/var/www/html/index.html', 'w') as f:
    f.write(c)
print('Saved')
