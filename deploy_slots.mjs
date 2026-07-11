import { Client } from 'ssh2';
import fs from 'fs';

const HOST = '212.227.93.74';
const USER = 'root';
const KEY = '/home/node/.ssh/ionos_ubuntu';

const pythonScripts = {
  'coupn.uk': 
`import re
with open("/var/www/coupn.uk/public/index.html") as f:
  html = f.read()
slots = ["7029255420", "8504468716", "5627023935"]
i = [0]
def r(m):
  idx = i[0]; i[0] += 1
  return 'data-ad-slot="' + slots[idx] + '"'
html = re.sub(r'data-ad-slot="[^"]*"', r, html)
with open("/var/www/coupn.uk/public/index.html","w") as f:
  f.write(html)
print("coupn.uk: replaced " + str(i[0]) + " slots")
`,

  'pdfoomph.com':
`import re
with open("/var/www/pdfoomph.com/public/index.html") as f:
  html = f.read()
slots = ["3908268067", "6893524050"]
i = [0]
def r(m):
  idx = i[0]; i[0] += 1
  return 'data-ad-slot="' + slots[idx] + '"'
html = re.sub(r'data-ad-slot="[^"]*"', r, html)
with open("/var/www/pdfoomph.com/public/index.html","w") as f:
  f.write(html)
print("pdfoomph.com: replaced " + str(i[0]) + " slots")
`,

  'isitdownrightnow.co.uk':
`import re
with open("/var/www/isitdownrightnow.co.uk/public/index.html") as f:
  html = f.read()
slots = ["1751358101", "7699643185"]
i = [0]
def r(m):
  idx = i[0]; i[0] += 1
  return 'data-ad-slot="' + slots[idx] + '"'
html = re.sub(r'data-ad-slot="[^"]*"', r, html)
with open("/var/www/isitdownrightnow.co.uk/public/index.html","w") as f:
  f.write(html)
print("isitdownrightnow.co.uk: replaced " + str(i[0]) + " slots")
`,

  'cheapfind.uk':
`import re
with open("/var/www/cheapfind.uk/public/index.html") as f:
  html = f.read()
slots = ["3525124687", "8125194764"]
i = [0]
def r(m):
  idx = i[0]; i[0] += 1
  return 'data-ad-slot="' + slots[idx] + '"'
html = re.sub(r'data-ad-slot="[^"]*"', r, html)
with open("/var/www/cheapfind.uk/public/index.html","w") as f:
  f.write(html)
print("cheapfind.uk: replaced " + str(i[0]) + " slots")
`,

  'toolstack.uk':
`import re
with open("/var/www/toolstack.uk/public/index.html") as f:
  html = f.read()
slots = ["5772014074"]
i = [0]
def r(m):
  idx = i[0]; i[0] += 1
  return 'data-ad-slot="' + slots[idx] + '"'
html = re.sub(r'data-ad-slot="[^"]*"', r, html)
with open("/var/www/toolstack.uk/public/index.html","w") as f:
  f.write(html)
print("toolstack.uk: replaced " + str(i[0]) + " slots")
`,

  'uk-cbdc.co.uk':
`import re
with open("/var/www/uk-cbdc.co.uk/public/index.html") as f:
  html = f.read()
slots = ["TO_BE_REPLACED"]
i = [0]
def r(m):
  idx = i[0]; i[0] += 1
  return 'data-ad-slot="' + slots[idx] + '"'
html = re.sub(r'data-ad-slot="[^"]*"', r, html)
with open("/var/www/uk-cbdc.co.uk/public/index.html","w") as f:
  f.write(html)
print("uk-cbdc.co.uk: replaced " + str(i[0]) + " slots - NEEDS REAL SLOT FROM MAYA")
`
};

const conn = new Client();
conn.on('ready', async () => {
  const domain = process.argv[2];
  if (!domain || !pythonScripts[domain]) {
    console.log('Deploying ALL sites...');
    for (const [d, script] of Object.entries(pythonScripts)) {
      const b64 = Buffer.from(script, 'utf8').toString('base64');
      await new Promise(resolve => {
        conn.exec(`echo "${b64}" | base64 -d > /tmp/${d.replace('.','_')}.py && python3 /tmp/${d.replace('.','_')}.py`, (err, stream) => {
          let out = '';
          stream.on('data', d => out += d);
          stream.on('close', () => { console.log(out); resolve(); });
        });
      });
    }
    conn.end();
    console.log('All done!');
  }
}).on('error', e => console.log('ERR:', e.message));
conn.connect({ host: HOST, username: USER, privateKey: fs.readFileSync(KEY, 'utf8').trim() });
