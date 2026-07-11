const { Client } = require("ssh2");
const fs = require("fs");
const conn = new Client();
conn.on("ready", () => {
  conn.sftp((e, sftp) => {
    if (e) { console.log("SFTP Error:", e.message); conn.end(); return; }
    sftp.readFile("/var/www/html/index.html", (e2, data) => {
      if (e2) { console.log("Read Error:", e2.message); conn.end(); return; }
      let html = data.toString();
      let changes = 0;

      // 1. Remove the fake chat bubbles (lines ~1280-1295)
      const fakeBubbles = `<div class="bubble">Morning. Status report: <b>23 leads</b> in the queue, <b>3 approvals</b> waiting for you, and the "Spring Reactivation" sequence is performing 8% above baseline.</div>
              <div class="msg-time">08:45</div>
            </div>
            <div class="msg">
              <div class="bubble user">Thanks, Scarlett. Sort the queue by priority.</div>
              <div class="msg-time">08:46</div>
            </div>
            <div class="msg">
              <div class="bubble">Done — sorted by deal value and intent signals. Sofia Martín and James Bower are at the top. Want me to draft follow-ups for both?</div>`;

      if (html.includes(fakeBubbles)) {
        html = html.replace(fakeBubbles, "");
        changes++;
        console.log("Removed fake chat bubbles");
      }

      // 2. Remove fake Sofia Martín lead row
      const sofiaLead = `<td><div class="cell-name">Sofia Martín</div><div class="cell-sub">Ibercon Group</div></td>`;
      const jamesLead = `<td><div class="cell-name">James Bower</div><div class="cell-sub">Northgate Media</div></td>`;

      // Replace Sofia Martín row
      const sofiaRow = `<tr data-s="followup"><td><div class="cell-name">Sofia Martín</div><div class="cell-sub">Ibercon Group</div></td><td class="mono">LinkedIn</td><td><span class="pill followup">Follow-up</span></td><td><span class="prio high">HIGH</span></td><td class="mono">€24,000</td><td class="mono">2h ago</td></tr>`;
      if (html.includes(sofiaRow)) {
        html = html.replace(sofiaRow, "");
        changes++;
        console.log("Removed Sofia Martín demo lead");
      }

      const jamesRow = `<tr data-s="qualified"><td><div class="cell-name">James Bower</div><div class="cell-sub">Northgate Media</div></td><td class="mono">Referral</td><td><span class="pill qualified">Qualified</span></td><td><span class="prio high">HIGH</span></td><td class="mono">€18,500</td><td class="mono">4h ago</td></tr>`;
      if (html.includes(jamesRow)) {
        html = html.replace(jamesRow, "");
        changes++;
        console.log("Removed James Bower demo lead");
      }

      // 3. Remove fake task (Sofia Martín call)
      const fakeTask = `<tr><td><div class="cell-name">Call Sofia Martín re: proposal</div><div class="cell-sub">Linked to lead · Ibercon Group</div></td><td><span class="pill todo">To do</span></td><td><span class="prio high">HIGH</span></td><td class="mono">Today 10:30</td><td>Darren</td></tr>`;
      if (html.includes(fakeTask)) {
        html = html.replace(fakeTask, "");
        changes++;
        console.log("Removed fake task");
      }

      // 4. Remove fake briefing text with Sofia Martín
      const fakeBriefing = `<p><b>Priorities:</b> Sofia Martín's call at 10:30 is your highest-value touchpoint today — she replied twice yesterday and her proposal window closes Friday. The win-back campaign copy is drafted and waiting for your approval before Monday's launch slot.</p>`;
      if (html.includes(fakeBriefing)) {
        html = html.replace(fakeBriefing, "");
        changes++;
        console.log("Removed fake briefing");
      }

      // 5. Remove fake calendar events (Sofia + James)
      const fakeCalEvents = `<div class="cal-evt"><span class="time">10:30</span><span class="bar" style="background:var(--orange)"></span><div><div class="cell-name">Call — Sofia Martín</div><div class="cell-sub">Proposal discussion · Ibercon Group</div></div></div>
          <div class="cal-evt"><span class="time">09:00</span><span class="bar" style="background:var(--orange)"></span><div><div class="cell-name">Demo — James Bower</div><div class="cell-sub">Northgate Media · video call</div></div></div>`;

      if (html.includes(fakeCalEvents)) {
        html = html.replace(fakeCalEvents, "");
        changes++;
        console.log("Removed fake calendar events");
      }

      // 6. Remove the feed entry about Sofia Martín reply
      const fakeFeed = `<div><div class="feed-txt"><b>Reply received</b> from Sofia Martín — flagged as high intent</div><div class="feed-time">08:42</div></div>`;
      if (html.includes(fakeFeed)) {
        html = html.replace(fakeFeed, "");
        changes++;
        console.log("Removed fake feed entry");
      }

      if (changes === 0) {
        console.log("No demo data found — already clean");
        sftp.end(); conn.end();
        return;
      }

      sftp.writeFile("/var/www/html/index.html", Buffer.from(html), (e3) => {
        if (e3) console.log("WRITE FAILED:", e3.message);
        else console.log("OK All demo data removed (" + changes + " changes)");
        sftp.end(); conn.end();
      });
    });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
