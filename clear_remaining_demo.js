const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.sftp((e, sftp) => {
    if (e) { console.log("SFTP Error:", e.message); conn.end(); return; }
    sftp.readFile("/var/www/html/index.html", (e2, data) => {
      if (e2) { console.log("Read Error:", e2.message); conn.end(); return; }
      let html = data.toString();
      let count = 0;

      // Remove Sofia Martín calendar event
      const sofiaCal = `<div class="cal-evt"><span class="time">10:30</span><span class="bar" style="background:var(--orange)"></span><div><div class="cell-name">Call — Sofia Martín</div><div class="cell-sub">Proposal discussion · Ibercon Group</div></div></div>`;
      if (html.includes(sofiaCal)) {
        html = html.replace(sofiaCal, "");
        count++;
      }

      // Remove James Bower calendar event
      const jamesCal = `<div class="cal-evt"><span class="time">09:00</span><span class="bar" style="background:var(--orange)"></span><div><div class="cell-name">Demo — James Bower</div><div class="cell-sub">Northgate Media · video call</div></div></div>`;
      if (html.includes(jamesCal)) {
        html = html.replace(jamesCal, "");
        count++;
      }

      // Remove fake briefing pipeline text
      const fakePipe = `<p><b>Pipeline:</b> 23 leads in queue, 3 newly qualified overnight. Reply rate is holding at 26%, driven mostly by referrals. The Q3 Madrid sequence sends its next step at 16:00.</p>`;
      if (html.includes(fakePipe)) {
        html = html.replace(fakePipe, "");
        count++;
      }

      // Remove fake feed entry "Sequence step 2 sent to 41 contacts in Spring Reactivation"
      const fakeFeed2 = `<div><div class="feed-txt"><b>Sequence step 2 sent</b> to 41 contacts in "Spring Reactivation"</div><div class="feed-time">06:30</div></div>`;
      if (html.includes(fakeFeed2)) {
        html = html.replace(fakeFeed2, "");
        count++;
      }

      // Fix the calendar placeholder - generic it
      html = html.replace('placeholder="e.g. Call — Sofia Martín"', 'placeholder="e.g. Client meeting"');
      count++;

      // Remove Spring Reactivation campaign - it's fake
      const fakeCampaign = `<tr><td><div class="cell-name">Spring Reactivation</div><div class="cell-sub">Sequence · 3 steps · step 2 sending</div></td><td><span class="pill live">Live</span></td><td class="mono">412</td><td class="mono">61%</td><td class="mono">14%</td><td class="mono">Tomorrow 07:00</td></tr>`;
      if (html.includes(fakeCampaign)) {
        html = html.replace(fakeCampaign, "");
        count++;
      }

      sftp.writeFile("/var/www/html/index.html", Buffer.from(html), (e3) => {
        if (e3) console.log("WRITE FAILED:", e3.message);
        else console.log("OK Cleaned " + count + " remaining demo references");
        sftp.end(); conn.end();
      });
    });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
