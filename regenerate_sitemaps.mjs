import { Client } from 'ssh2';
import fs from 'fs';

const c = new Client();
c.on('ready', () => {
  const script = `
import os, glob

domains = {
    "coupn": "www.coupn.uk",
    "toolstack": "www.toolstack.uk",
    "ukcbdc": "www.uk-cbdc.co.uk",
    "pdfoomph": "www.pdfoomph.com",
    "isitdownrightnow": "www.isitdownrightnow.co.uk",
    "cheapfind": "www.cheapfind.uk"
}

dir_map = {
    "coupn": ["/var/www/coupn.uk/public"],
    "toolstack": ["/var/www/toolstack.uk/public"],
    "ukcbdc": ["/var/www/uk-cbdc.co.uk/public"],
    "pdfoomph": ["/var/www/pdfoomph.com/public"],
    "isitdownrightnow": ["/var/www/isitdownrightnow.co.uk/public"],
    "cheapfind": ["/var/www/cheapfind.uk/public"]
}

for key, domain in domains.items():
    for base in dir_map[key]:
        if not os.path.isdir(base):
            continue
        pages = sorted(glob.glob(base + "/*.html"))
        with open(base + "/sitemap.xml", "w") as f:
            f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
            f.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
            for p in pages:
                name = os.path.splitext(os.path.basename(p))[0]
                if name == "index":
                    loc = "https://" + domain + "/"
                else:
                    loc = "https://" + domain + "/" + name
                f.write(f'  <url><loc>{loc}</loc><lastmod>2026-05-28</lastmod></url>\n')
            f.write('</urlset>\n')
        print(f"{domain}: {len(pages)} pages in sitemap")
`;
  
  // Base64 encode the Python script to avoid shell quoting nightmares
  const b64 = Buffer.from(script.trim(), 'utf8').toString('base64');
  c.exec(`python3 -c "$(echo '${b64}' | base64 -d)"`, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => { console.log(out); c.end(); });
  });
}).on('error', e => console.log('ERR:', e.message));
c.connect({ host: '212.227.93.74', username: 'root', privateKey: fs.readFileSync('/home/node/.ssh/ionos_ubuntu') });
