import re

with open('/var/www/html/index.html', 'rb') as f:
    data = f.read()

c = data.decode('utf-8')

bs = chr(92)  # backslash
q = chr(39)  # single quote

# Fix editTask onclick
old = 'onclick="editTask(' + q + ' + t.id + ' + q + ')"'
new = 'onclick="editTask(' + bs + q + ' + t.id + ' + bs + q + ')"'
count = c.count(old)
print(f'edit onclick: found {count}')
if count:
    c = c.replace(old, new)

# Fix deleteTask onclick - line has '' + t.id + '','' + esc(t.title) + ''
old_del = 'onclick="deleteTask(' + q + q + ' + t.id + ' + q + q + ',' + q + q + ' + esc(t.title) + ' + q + q + ')"'
new_del = 'onclick="deleteTask(' + bs + q + ' + t.id + ' + bs + q + ',' + bs + q + ' + esc(t.title) + ' + bs + q + ')"'
count_del = c.count(old_del)
print(f'delete onclick: found {count_del}')
if count_del:
    c = c.replace(old_del, new_del)

with open('/var/www/html/index.html', 'w') as f:
    f.write(c)

m = re.search(r'<script>(.*?)</script>', c, re.DOTALL)
open('/tmp/fix_final_check.js', 'w').write(m.group(1))
print('JS extracted')
