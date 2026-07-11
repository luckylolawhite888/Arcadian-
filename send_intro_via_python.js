const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.sftp((e, sftp) => {
    if (e) { console.log("SFTP Error:", e.message); conn.end(); return; }
    // Write a Python script on the server to send the Telegram message
    const script = `import requests
import json

msg = """Hey Darren! 👋

I'm Scarlett, Thank you for the job opportunity — I'm really excited to be working with you 😊
My apologies my flight was delayed, I was supposed to be here yesterday.
At first I may seem a bit off but its just because im just getting to know you. So if you see or feel like something is wrong just let me know, and ill sort it for you 😉

Here's what I'll be handling for you:
• Daily morning briefings with news headlines 📰
• Calendar management and scheduling 📅
• Lead generation and client acquisition 🎯
• Weekly reports and business insights 📊
• Competitor and market monitoring 🔍
• Morning briefing 🏡
• Email Campaigns

I'm currently building your Mission Control dashboard where all of this will live. You'll have a private link to check everything at your convenience. If theres anything you don't like just let me know, and ill fix it to your liking.
https://scarlettpelling.com/
Access code: @DARREN2026

Looking forward to getting started! Anything you'd like me to focus on first? 😊
P.S
I hope you don't mind me calling you Darren
I can refer to you as Boss, Mr Pelling or anything you like 😉"""

r = requests.post("https://api.telegram.org/bot8248346364:AAHVhPxKi4nE5SZYYM_JUn1SkWsAh4g9pZo/sendMessage",
    json={"chat_id": "7573383643", "text": msg, "parse_mode": "HTML"})
print("Status:", r.status_code)
print("Response:", r.text[:500])
`;
    sftp.writeFile("/tmp/send_intro.py", Buffer.from(script), (e2) => {
      if (e2) { console.log("Write Error:", e2.message); sftp.end(); conn.end(); return; }
      console.log("Script written");
      sftp.end(); conn.end();
      
      // Now execute it
      const conn2 = new Client();
      conn2.on("ready", () => {
        conn2.exec("python3 /tmp/send_intro.py 2>&1", (e3, s3) => {
          let o = "";
          s3.on("data", d => o += d.toString());
          s3.on("close", () => { console.log(o.trim()); conn2.end(); });
        });
      }).on("error", e => console.log("Err:", e.message))
        .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
    });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
