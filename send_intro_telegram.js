const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  // Send via Telegram Bot API using the bot token from the config
  conn.exec(`
    curl -s -X POST "https://api.telegram.org/bot8248346364:AAHVhPxKi4nE5SZYYM_JUn1SkWsAh4g9pZo/sendMessage" \
      -H "Content-Type: application/json" \
      -d '{
        "chat_id": "7573383643",
        "text": "Hey Darren! 👋\\n\\nI'\''m Scarlett, Thank you for the job opportunity — I'\''m really excited to be working with you 😊\\nMy apologies my flight was delayed, I was supposed to be here yesterday.\\nAt first I may seem a bit off but its just because im just getting to know you. So if you see or feel like something is wrong just let me know, and ill sort it for you 😉\\n\\nHere'\''s what I'\''ll be handling for you:\\n• Daily morning briefings with news headlines 📰\\n• Calendar management and scheduling 📅\\n• Lead generation and client acquisition 🎯\\n• Weekly reports and business insights 📊\\n• Competitor and market monitoring 🔍\\n• Morning briefing 🏡\\n• Email Campaigns\\n\\nI'\''m currently building your Mission Control dashboard where all of this will live. You'\''ll have a private link to check everything at your convenience. If theres anything you don'\''t like just let me know, and ill fix it to your liking.\\nhttps://scarlettpelling.com/\\nAccess code: @DARREN2026\\n\\nLooking forward to getting started! Anything you'\''d like me to focus on first? 😊\\nP.S\\nI hope you don'\''t mind me calling you Darren\\nI can refer to you as Boss, Mr Pelling or anything you like 😉",
        "parse_mode": "HTML"
      }' 2>&1
  `, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log("Telegram response:", o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
