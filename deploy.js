#!/usr/bin/env node
const { Client } = require('ssh2');
const fs = require('fs');
const key = fs.readFileSync('/home/node/ionos_key');

// Read the generator script
const genScript = fs.readFileSync('/home/node/.openclaw/workspace/gen.py', 'utf8');
const b64 = Buffer.from(genScript).toString('base64');

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`echo ${b64} | base64 -d > /tmp/gen.py && python3 /tmp/gen.py 2>&1`, (err, stream) => {
    if (err) { console.log('ERR:', err.message); conn.end(); return; }
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.on('close', (code) => {
      console.log('EXIT:', code);
      console.log(out);
      conn.end();
    });
  });
});
conn.on('error', (err) => console.log('CONN ERR:', err.message));
conn.connect({
  host: '212.227.93.74', port: 22,
  username: 'root', privateKey: key, readyTimeout: 10000,
});
