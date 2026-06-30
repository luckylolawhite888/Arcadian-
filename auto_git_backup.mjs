#!/usr/bin/env node
// auto_git_backup.mjs — Daily auto-commit and push to GitHub
// No LLM involved — pure git operations
// Runs as cron, pushes workspace to GitHub

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const WORKSPACE = process.env.HOME + '/.openclaw/workspace';
const VAULT_FILE = WORKSPACE + '/.vault/github.json';

function loadVault() {
  try {
    const raw = fs.readFileSync(VAULT_FILE, 'utf8');
    const vault = JSON.parse(raw);
    // Try classic PAT first, fall back to fine-grained
    return vault.pat_classic || vault.pat_fine_grained || null;
  } catch {
    return null;
  }
}

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { cwd: WORKSPACE, stdio: 'pipe', timeout: 30000, ...opts }).toString().trim();
  } catch (e) {
    return null;
  }
}

async function main() {
  console.log(`[auto-git-backup] Starting at ${new Date().toISOString()}`);

  // 1. Check if we have a PAT
  const pat = loadVault();
  if (!pat) {
    console.log('[auto-git-backup] ❌ No GitHub PAT in vault');
    process.exit(1);
  }

  // 2. Setup remote with PAT
  const remoteUrl = `https://luckylolawhite888:${pat}@github.com/luckylolawhite888/Arcadian-.git`;
  run(`git remote set-url origin "${remoteUrl}"`);
  console.log('[auto-git-backup] Remote configured');

  // 3. Check for changes
  const status = run('git status --porcelain');
  if (!status || status.length === 0) {
    console.log('[auto-git-backup] ✅ No changes to commit');
    process.exit(0);
  }
  console.log(`[auto-git-backup] Changes detected:\n${status.slice(0, 500)}`);

  // 4. Add everything except sensitive dirs
  run('git add AGENTS.md SOUL.md TOOLS.md USER.md MEMORY.md HEARTBEAT.md IDENTITY.md');
  run('git add skills/ todo.md shopping.md memory/ run_backup.mjs .gitignore .learnings/');

  // 5. Commit
  const date = new Date().toISOString().split('T')[0];
  const result = run(`git commit -m "Daily backup ${date}"`);
  if (result) {
    console.log(`[auto-git-backup] ✅ Committed: ${result}`);
  } else {
    console.log('[auto-git-backup] Nothing to commit (no changes)');
    process.exit(0);
  }

  // 6. Push
  try {
    const pushResult = run('git push origin master');
    if (pushResult) {
      console.log(`[auto-git-backup] ✅ Pushed: ${pushResult}`);
    } else {
      console.log('[auto-git-backup] Push completed (no output)');
    }
  } catch (e) {
    console.log(`[auto-git-backup] ❌ Push failed: ${e.message}`);
    // Check if it's a secret scanning block
    if (e.message.includes('push declined') || e.message.includes('secret')) {
      console.log('[auto-git-backup] ⚠️ Secret scanner blocked push — check memory files');
    }
    process.exit(1);
  }
}

main().catch(e => {
  console.error(`[auto-git-backup] 💥 Fatal: ${e.message}`);
  process.exit(1);
});
