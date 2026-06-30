#!/usr/bin/env node
// run_backup.mjs — Direct backup runner, no LLM needed
// Called by cron, runs the backup script on the server via SSH, reports result.
import { Client } from 'ssh2';
import fs from 'fs';

const keyPath = '/home/node/.ssh/ionos_ubuntu';

async function runBackup() {
  const key = fs.readFileSync(keyPath);
  const conn = new Client();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('SSH_COMMAND_TIMEOUT')), 120000);

    conn.on('ready', () => {
      conn.exec('bash /root/full_lola_backup.sh', (err, stream) => {
        if (err) { clearTimeout(timeout); reject(err); return; }

        let stdout = '';
        let stderr = '';

        stream.on('data', (data) => { stdout += data.toString(); });
        stream.stderr.on('data', (data) => { stderr += data.toString(); });
        stream.on('close', (code) => {
          clearTimeout(timeout);
          conn.end();
          resolve({ code, stdout, stderr });
        });
      });
    });

    conn.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    conn.connect({
      host: '212.227.93.74',
      port: 22,
      username: 'root',
      privateKey: key,
      readyTimeout: 15000,
    });
  });
}

try {
  const result = await runBackup();
  process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  if (result.code === 0) {
    const match = result.stdout.match(/BACKUP_COMPLETE:([^:]+):(.+)/);
    const file = match?.[1] || 'unknown';
    const size = match?.[2] || 'unknown';
    console.log(`\n✅ Backup OK — ${file} (${size})`);
  } else {
    console.error(`\n❌ Backup FAILED (exit code ${result.code})`);
    process.exit(1);
  }
} catch (err) {
  console.error(`\n❌ Backup ERROR: ${err.message}`);
  process.exit(1);
}
