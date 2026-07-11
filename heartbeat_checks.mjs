import { Client } from 'ssh2';
import fs from 'fs';

const c = new Client();
c.on('ready', async () => {
  function run(cmd) {
    return new Promise((resolve) => {
      c.exec(cmd, (err, stream) => {
        let out = '';
        stream.on('data', d => out += d);
        stream.on('close', () => resolve(out));
      });
    });
  }

  const [wsAlerts, wsApprovals, momBriefing, lsAnalytics] = await Promise.all([
    run('cat /tmp/whatsapp_alert.json 2>/dev/null || echo "no_alerts"'),
    run('cat /tmp/whatsapp_approval.json 2>/dev/null || echo "no_approvals"'),
    run('ls /tmp/morning_briefing* /tmp/today_* 2>/dev/null || echo "no_briefing_files"'),
    run('ls -la /var/www/thenewworldorder.io/html/adfarm-analytics.html 2>/dev/null || echo "no_analytics_html"'),
  ]);

  console.log('=== WHATSAPP ALERTS ===');
  console.log(wsAlerts);
  console.log('=== WHATSAPP APPROVALS ===');
  console.log(wsApprovals);
  console.log('=== BRIEFING FILES ===');
  console.log(momBriefing);
  console.log('=== ANALYTICS HTML ===');
  console.log(lsAnalytics);
  c.end();
}).on('error', e => console.log('ERR:', e.message));
c.connect({ host: '212.227.93.74', username: 'root', privateKey: fs.readFileSync('/home/node/.ssh/ionos_ubuntu') });
