import re

with open('/var/www/html/index.html', 'rb') as f:
    data = bytearray(f.read())

# Find the renderTasks function's Edit/Delete button lines
# Strategy: produce valid onclick using ONLY double quotes inside onclick
# and use data-* attributes to pass values

# The current line (after JS parsing): 
# onclick="editTask(\' + t.id + \')" 
# This produces onclick="editTask(' + t.id + ')" in HTML
# where ' is a JS string delimiter in the onclick handler

# The CORRECT approach:
# onclick="editTask(this.dataset.tk)" 
# with data-tk="UUID" attribute on the button

# Pattern to find in the raw bytes:
target = b'ghost-btn" onclick="editTask('
idx = data.find(target)
if idx < 0:
    print(f"ERROR: pattern not found")
    # Try with backslash-escaped version
    target2 = b'ghost-btn\\" onclick=\\"editTask('
    idx = data.find(target2)
    if idx >= 0:
        print(f"Found escaped version at {idx}")
    else:
        print("Neither pattern found")
        exit(1)

# Found it. Now let's construct the replacement.
# The exact bytes around this section (from the JS file) are:
# ...'<button class="ghost-btn" onclick="editTask(\' + t.id + \')" style=...
# In the raw HTML <script> tag, this is inside a template string.
# The \' is a JS escape for single-quote.

# APPROACH: Instead of fighting quotes, replace the entire renderTasks
# function's map callback with a version that uses createElement + dataset

# Actually, simplest fix: change the onclick to not use ' inside at all.
# Use `id` + `title` as onclick: `editTask(this.id, this.title)`
# And set id and title as... but title is already used for tooltip.

# BETTER: Use the onclick inline correctly by passing the id through a
# data attribute and using event.target.dataset

# Fix: replace the onclick to reference data attributes
# Current in JS file: onclick="editTask(\' + t.id + \')" 
# New in JS file: onclick="editTask(this.dataset.tk)"
# The data-tk attribute will be: data-tk="' + t.id + '"

# Let me do exact byte replacements
# The JS file has: onclick="editTask(\' + t.id + \')"
# After JS eval, HTML has: onclick="editTask(' + t.id + ')"

# I'll change to: onclick="editTask(this.dataset.tk)"
# and add: data-tk="' + t.id + '"

text = data.decode('utf-8')

# Replace editTask button
old_e = """'<button class="ghost-btn" onclick="editTask(\\\' + t.id + \\\')" style="font-size:13px;padding:2px 6px" title="Edit">Edit</button> ' +"""
new_e = """'<button class="ghost-btn" data-tk="' + t.id + '" onclick="editTask(this.dataset.tk)" style="font-size:13px;padding:2px 6px" title="Edit">Edit</button> ' +"""

if old_e in text:
    text = text.replace(old_e, new_e)
    print("editTask button fixed")
else:
    # Try without the backslashes
    old_e2 = """'<button class="ghost-btn" onclick="editTask(\' + t.id + \')" style="font-size:13px;padding:2px 6px" title="Edit">Edit</button> ' +"""
    if old_e2 in text:
        text = text.replace(old_e2, new_e)
        print("editTask button fixed (variant 2)")
    else:
        print("editTask button NOT FOUND")
        # Debug: find the editTask in the file
        idx = text.find('editTask')
        if idx >= 0:
            ctx = text[idx-20:idx+80]
            print(f"Context: {repr(ctx)}")

# Replace deleteTask button
old_d = """'<button class="ghost-btn" onclick="deleteTask(\\\' + t.id + \\\',\\\' + esc(t.title) + \\\')" style="font-size:13px;padding:2px 6px;color:var(--error)" title="Delete">Delete</button>' +"""
new_d = """'<button class="ghost-btn" data-tk="' + t.id + '" data-tktitle="' + esc(t.title) + '" onclick="deleteTask(this.dataset.tk,this.dataset.tktitle)" style="font-size:13px;padding:2px 6px;color:var(--error)" title="Delete">Delete</button>' +"""

if old_d in text:
    text = text.replace(old_d, new_d)
    print("deleteTask button fixed")
else:
    old_d2 = """'<button class="ghost-btn" onclick="deleteTask(\' + t.id + \',\' + esc(t.title) + \')" style="font-size:13px;padding:2px 6px;color:var(--error)" title="Delete">Delete</button>' +"""
    if old_d2 in text:
        text = text.replace(old_d2, new_d)
        print("deleteTask button fixed (variant 2)")
    else:
        print("deleteTask button NOT FOUND")
        idx = text.find('deleteTask')
        if idx >= 0:
            ctx = text[idx-20:idx+100]
            print(f"Context: {repr(ctx)}")

with open('/var/www/html/index.html', 'w') as f:
    f.write(text)

# Verify the JS is valid
import re
m = re.search(r'<script>(.*?)</script>', text, re.DOTALL)
if m:
    open('/tmp/final_data_attr.js', 'w').write(m.group(1))
    print(f"JS extracted: {len(m.group(1))} chars")

print("Done")
