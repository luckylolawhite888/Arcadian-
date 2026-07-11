const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.sftp((e, sftp) => {
    if (e) { console.log("SFTP Error:", e.message); conn.end(); return; }
    sftp.readFile("/var/www/html/index.html", (e2, data) => {
      if (e2) { console.log("Read Error:", e2.message); conn.end(); return; }
      let html = data.toString();
      let changes = 0;

      // Replace the fake chat messages block
      const oldChat = `          <div class="chat-body" id="chatBox">
            <div class="msg scarlett">
              <div class="bubble">Morning. Status report: <b>23 leads</b> in the queue, <b>3 approvals</b> waiting for you, and the "Spring Reactivation" sequence is performing 8% above baseline.</div>
              <div class="msg-time">08:45</div>
            </div>
            <div class="msg user">
              <div class="bubble">Thanks, Scarlett. Sort the queue by priority.</div>
              <div class="msg-time">08:46</div>
            </div>
            <div class="msg scarlett">
              <div class="bubble">Done — sorted by deal value and intent signals. Sofia Martín and James Bower are at the top. Want me to draft follow-ups for both?</div>
              <div class="msg-time">08:46</div>
            </div>
            <div class="typing" id="chatTyping"><i></i><i></i><i></i></div>
          </div>`;

      const newChat = `          <div class="chat-body" id="chatBox">
            <div class="typing" id="chatTyping"><i></i><i></i><i></i></div>
          </div>`;

      if (html.includes(oldChat)) {
        html = html.replace(oldChat, newChat);
        changes++;
        console.log("Cleared fake chat messages");
      }

      // Also handle calendar
      const oldCalEvents = `          <div class="cal-evt"><span class="time">10:30</span><span class="bar" style="background:var(--orange)"></span><div><div class="cell-name">Call — Sofia Martín</div><div class="cell-sub">Proposal discussion · Ibercon Group</div></div></div>
          <div class="cal-evt"><span class="time">09:00</span><span class="bar" style="background:var(--orange)"></span><div><div class="cell-name">Demo — James Bower</div><div class="cell-sub">Northgate Media · video call</div></div></div>`;

      if (html.includes(oldCalEvents)) {
        html = html.replace(oldCalEvents, "");
        changes++;
        console.log("Cleared fake calendar events");
      }

      if (changes === 0) {
        console.log("Nothing to change");
        sftp.end(); conn.end();
        return;
      }

      sftp.writeFile("/var/www/html/index.html", Buffer.from(html), (e3) => {
        if (e3) console.log("WRITE FAILED:", e3.message);
        else console.log("OK Chat + calendar cleared (" + changes + " changes)");
        sftp.end(); conn.end();
      });
    });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
