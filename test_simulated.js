const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`
    # Test the webhook endpoint directly
    curl -s -X POST http://127.0.0.1:3100/api/telegram-webhook \
      -H "Content-Type: application/json" \
      -d '{"message":{"message_id":2,"from":{"id":7573383643,"first_name":"Daz","username":"Darren69696","language_code":"en"},"chat":{"id":7573383643,"first_name":"Daz","username":"Darren69696","type":"private"},"date":1717600000,"text":"Hi Scarlett 👋"}}' 2>&1
    echo ""
    echo "Exit: $?"
  `, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log(o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
