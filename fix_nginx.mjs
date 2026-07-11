import { Client } from 'ssh2';
import fs from 'fs';

const fixPy = `
import os, re

path = "/etc/nginx/sites-enabled/00-main-site-443.conf"
bak = "/etc/nginx/sites-enabled/00-main-site-443.conf.bak"

with open(bak) as f:
    data = f.read()

insert = """
    # Ad Farm Analytics API
    location /adfarm-analytics/ {
        proxy_pass http://127.0.0.1:5001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        add_header Access-Control-Allow-Origin *;
    }
"""

lines = data.split("\\n")
result = []
i = 0
while i < len(lines):
    result.append(lines[i])
    if "location /gpreg-api/" in lines[i]:
        i += 1
        while i < len(lines):
            result.append(lines[i])
            if lines[i].strip() == "}":
                for ins_line in insert.strip().split("\\n"):
                    result.append(ins_line)
                break
            i += 1
    i += 1

data = "\\n".join(result)

with open(path, "w") as f:
    f.write(data)

ec = os.system("nginx -t 2>&1")
if ec == 0:
    os.system("systemctl reload nginx 2>&1")
    print("OK - nginx reloaded")
else:
    os.system("cp " + bak + " " + path)
    os.system("systemctl reload nginx 2>&1")
    print("Restored original")
`;

const c = new Client();
c.on('ready', () => {
  const b64 = Buffer.from(fixPy.trim(), 'utf8').toString('base64');
  c.exec(`echo "${b64}" | base64 -d | python3`, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => { console.log(out); c.end(); });
  });
}).on('error', e => console.log('ERR:', e.message));
c.connect({ host: '212.227.93.74', username: 'root', privateKey: fs.readFileSync('/home/node/.ssh/ionos_ubuntu') });
