const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`
    echo "=== 1. Webhook live? ===" && \
    curl -s "https://api.telegram.org/bot824834…9pZo/getWebhookInfo" | python3 -c "import sys,json; d=json.load(sys.stdin)['result']; print('URL:',d['url']); print('Pending:',d['pending_update_count'])" && \
    echo "=== 2. Scarlett API active? ===" && \
    systemctl is-active scarlett-api.service && \
    echo "=== 3. OpenClaw agent works? ===" && \
    openclaw --version 2>&1 && \
    echo "=== 4. DARREN.md exists? ===" && \
    wc -c /root/.openclaw/workspace/default/DARREN.md && \
    echo "=== 5. MEMORY.md exists? ===" && \
    wc -c /root/.openclaw/workspace/default/MEMORY.md && \
    echo "=== 6. Chat session clean ===" && \
    ls -la /root/.openclaw/agents/main/sessions/ | wc -l && \
    echo "=== 7. Supabase accessible? ===" && \
    curl -s -o /dev/null -w "%{http_code}" "https://ogkyhfdyssowaaloogsx.supabase.co/rest/v1/leads?select=id&limit=1" -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9na3loZmR5c3Nvd2FhbG9vZ3N4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTE1MzU4NywiZXhwIjoyMDY0NzI5NTg3fQ.7m5cz2vSMXkZhgBGBrBv9E7HJO5CJN2hHjjTkQIf_e4" && \
    echo ""
  `, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log(o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
