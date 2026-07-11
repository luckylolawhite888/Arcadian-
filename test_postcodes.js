const { Client } = require('ssh2');
const fs = require('fs');
const key = fs.readFileSync('/home/node/.ssh/ionos_ubuntu');

// Test which London postcodes return address data for E84028
// by running the script with specific postcodes forced

const testPcs = [
  'NW10 8SB',  // Known good (Willesden)
  'NW6 1AA',   // Kilburn - close to NW10
  'NW2 1AA',   // Neasden - close
  'NW5 1AA',   // Kentish Town
  'E1 6AD',    // Whitechapel
  'N1 1AA',    // Islington  
  'SE1 0AA',   // Waterloo
  'SW1A 1AA',  // Westminster
  'W1A 1AA',   // Central
  'HA0 1AA',   // Wembley
  'UB1 1AA',   // Southall
  'TW3 1AA',   // Hounslow
  'DA1 1AA',   // Dartford
  'CR0 1AA',   // Croydon
  'RM1 1AA',   // Romford
];

const conn = new Client();
conn.on('ready', () => {
  // We can test via postcodes.io address lookup
  // The NHS form uses postcodes.io internally
  // Let me check what postcodes.io returns for these
  conn.exec(`
for pc in ${testPcs.join(' ')}; do
  result=$(curl -s "https://api.postcodes.io/postcodes/\\$pc" 2>/dev/null)
  status=$(echo "$result" | node -e "process.stdin.on('data',d=>{try{const j=JSON.parse(d);console.log(j.status)}catch(e){console.log('err')}})" 2>/dev/null)
  echo "$pc -> $status"
done
`, (err, stream) => {
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
