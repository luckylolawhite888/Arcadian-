const { Client } = require('ssh2');
const fs = require('fs');
const key = fs.readFileSync('/home/node/.ssh/ionos_ubuntu');
const conn = new Client();

conn.on('ready', () => {
  const cmd = `for pc in "NW10 8SB" "NW6 5AD" "NW2 6NB" "E1 6AD" "SE1 0AA" "N1 1AA" "HA0 4AB" "UB1 1AA" "TW3 3BQ"; do echo -n "$pc -> "; curl -s "https://api.postcodes.io/postcodes/$(echo $pc|sed 's/ /%20/g')" 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); r=d.get('result'); print(f'{r[\"latitude\"]:.3f},{r[\"longitude\"]:.3f} | {r[\"region\"]}') if r else print('not found')"; done`;
  
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
