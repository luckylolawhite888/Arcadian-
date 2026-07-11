const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  // Write the intro message to a file in Scarlett's workspace
  // The dashboard can read this or it appears via the Scarlett chat
  conn.exec(`cat > /root/.openclaw/workspace/default/intro_message.txt << 'SCARLETT_MSG'
Hey Darren! 👋

I'm Scarlett, Thank you for the job opportunity — I'm really excited to be working with you 😊
My apologies my flight was delayed, I was supposed to be here yesterday.
At first I may seem a be off but its just because im just geting to know you. So if you see or feel like something is wrong just let me know, and ill sort it for you 😉
Here's what I'll be handling for you:
• Daily morning briefings with news headlines 📰
• Calendar management and scheduling 📅
• Lead generation and client acquisition 🎯
• Weekly reports and business insights 📊
• Competitor and market monitoring 🔍
• Morning briefing 🏡
• Email Campaigns

I'm currently building your Mission Control dashboard where all of this will live. You'll have a private link to check everything at your convenience. If theres anything you dont like just let me know , and ill fix it to your liking.
https://scarlettpelling.com/
Access code : @DARREN2026

Looking forward to getting started! Anything you'd like me to focus on first? 😊
P.S
I hope you dont mind me calling you Darren
I can refer to you as Boss , Mr Pelling or anything you like 😉
SCARLETT_MSG
echo "saved"`, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => {
      console.log("File written:", o.trim());
      
      // Now fire it through Scarlett's chat engine so she "sends" it
      // and it registers in her context
      const c2 = new Client();
      c2.on("ready", () => {
        // Use the chat endpoint — this makes Scarlett aware of the message
        c2.exec(`curl -s -X POST http://127.0.0.1:3100/api/chat -H "Content-Type: application/json" -H "x-access-code: @DARREN2026" -d '{"message":"Please read the introductory message you wrote for Darren from the file /root/.openclaw/workspace/default/intro_message.txt and confirm you understand it. This is your first message to him."}' 2>&1`, (e2, s2) => {
          let o2 = "";
          s2.on("data", d => o2 += d.toString());
          s2.on("close", () => {
            console.log("Scarlett response:", o2.trim().substring(0, 300));
            c2.end();
          });
        });
      }).on("error", e => console.log("Err:", e.message))
        .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
      conn.end();
    });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
