import re

with open('/var/www/html/index.html', 'rb') as f:
    data = f.read()
c = data.decode('utf-8')

bs = chr(92)  # backslash
q = chr(39)  # single quote

# The current line in the HTML file (after Python template wrote it):
# onclick="editTask('" + t.id + "')" 
# This is in a JS string literal delimited by single quotes.
# The JS parser sees: '...onclick="editTask('' 
# Because the ' in editTask(' terminates the JS string.
#
# Fix: onclick="editTask(\' + t.id + \')"
# The \' is backslash-escaped single quote in the JS string.
# In the HTML file, this needs to be: onclick="editTask(\' + t.id + \')"
# Where \' = chr(92) + chr(39)

# Replace editTask onclick
# Current string in file after my template wrote it:
# onclick="editTask('" + t.id + "')"
# The ' char is: q
# The " char is: chr(34) but that's fine because HTML attribute uses "
# Wait — the issue is that the JS parser sees the ' as string terminator.
# In the HTML file, the text is literally:
# onclick="editTask('" + t.id + "')"
# The ' is a single quote character in the HTML file.
# The JS parser reads the enclosing ' delimited string.
# So onclick="editTask(' -> the ' in editTask(' ends the JS string.

# I need the HTML file to contain \' instead of just '
# Where \ is the backslash character (chr(92))

# The old string in the file: onclick="editTask('" + t.id + "')"
old_e = 'onclick="editTask(' + q + chr(34) + ' + t.id + ' + chr(34) + q + ')"'
# The new string: onclick="editTask(\' + t.id + \')"
new_e = 'onclick="editTask(' + bs + q + ' + t.id + ' + bs + q + ')"'

if old_e in c:
    c = c.replace(old_e, new_e)
    print('edit onclick fixed')
else:
    print('EDIT NOT MATCHED')
    idx = c.find('editTask(')
    if idx >= 0:
        print(f'Actual: {repr(c[idx:idx+40])}')
        print(f'Expected: {repr(old_e[old_e.find("editTask"):old_e.find("editTask")+40])}')

# Replace deleteTask onclick
old_d = 'onclick="deleteTask(' + q + chr(34) + ' + t.id + ' + chr(34) + q + ',' + q + chr(34) + ' + esc(t.title) + ' + chr(34) + q + ')"'
new_d = 'onclick="deleteTask(' + bs + q + ' + t.id + ' + bs + q + ',' + bs + q + ' + esc(t.title) + ' + bs + q + ')"'

if old_d in c:
    c = c.replace(old_d, new_d)
    print('delete onclick fixed')
else:
    print('DELETE NOT MATCHED')
    idx = c.find('deleteTask(')
    if idx >= 0:
        print(f'Actual: {repr(c[idx:idx+50])}')
        print(f'Expected: {repr(old_d[old_d.find("deleteTask"):old_d.find("deleteTask")+50])}')

with open('/var/www/html/index.html', 'w') as f:
    f.write(c)

m = re.search(r'<script>(.*?)</script>', c, re.DOTALL)
open('/tmp/final_clean_check2.js', 'w').write(m.group(1))
print('JS extracted')
