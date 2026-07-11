import re

# Fix world-clock
with open("/usr/share/nginx/html/world-clock.html", "r") as f:
    content = f.read()

back = """<div style="text-align:center;margin-bottom:16px;">
<a href="https://thenewworldorder.io/launchpad.html?token=f8570ed8ae686fffbdd00bf4f3ca1063"
   style="display:inline-block;padding:8px 20px;background:#1e1e2e;border:1px solid #2a2a3f;border-radius:10px;color:#e0e0f0;text-decoration:none;font-size:13px;">
   \u2190 Back to Launchpad
</a>
</div>"""

content = content.replace('<div class="container">', '<div class="container">\n' + back)
with open("/usr/share/nginx/html/world-clock.html", "w") as f:
    f.write(content)
print("world-clock done")

# Fix chats
with open("/usr/share/nginx/html/chats.html", "r") as f:
    content = f.read()

back2 = """<div style="text-align:center;padding-top:10px;padding-bottom:10px;border-bottom:1px solid #1e1e2e;">
<a href="https://thenewworldorder.io/launchpad.html?token=f8570ed8ae686fffbdd00bf4f3ca1063"
   style="display:inline-block;padding:8px 20px;background:#1e1e2e;border:1px solid #2a2a3f;border-radius:10px;color:#e0e0f0;text-decoration:none;font-size:13px;">
   \u2190 Back to Launchpad
</a>
</div>"""

content = content.replace('<div class="header">', back2 + '\n<div class="header">')
with open("/usr/share/nginx/html/chats.html", "w") as f:
    f.write(content)
print("chats done")
