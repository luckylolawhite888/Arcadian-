const { Client } = require('ssh2');
const fs = require('fs');
const key = fs.readFileSync('/home/node/.ssh/ionos_ubuntu');
const conn = new Client();

// Pick a few real postcodes from our pool at varying distances from NW10
const testPcs = [
  "NW10 8SB",  // Willesden - known good
  "NW6 5LN",   // Kilburn - close
  "N1 9GU",    // Islington - central-ish
  "E1 1DU",    // Whitechapel
  "SE1 0TT",   // Waterloo
];

conn.on('ready', () => {
  const cmd = `python3 -c "
import urllib.request, json
pcs = ${JSON.stringify(testPcs)}
for pc in pcs:
    try:
        url = 'https://api.postcodes.io/postcodes/' + pc.replace(' ', '%20')
        resp = urllib.request.urlopen(url, timeout=5)
        d = json.loads(resp.read())
        if d['status'] == 200 and d.get('result'):
            r = d['result']
            print(f'{pc} -> {r[\"latitude\"]:.4f},{r[\"longitude\"]:.4f} | {r.get(\"region\",\"\")} | {r.get(\"admin_district\",\"\")} | {r.get(\"eastings\",0)}')
        else:
            print(f'{pc} -> NOT FOUND')
    except Exception as e:
        print(f'{pc} -> ERROR: {e}')
"`;
  
  conn.exec(cmd, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.stderr.on('data', d => out += d.toString());
    stream.on('close', () => {
      console.log(out);
      conn.end();
    });
  });
});
conn.on('error', e => { console.log('ERR:', e.message); conn.end(); });
conn.connect({ host: '212.227.93.74', port: 22, username: 'root', privateKey: key, readyTimeout: 15000 });
