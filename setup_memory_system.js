const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.sftp((e, sftp) => {
    if (e) { console.log("SFTP Error:", e.message); conn.end(); return; }
    
    // 1. Create MEMORY.md
    const memoryContent = `# Scarlett's Long-Term Memory

*Last updated: ${new Date().toISOString().split('T')[0]}*

## 👤 Darren Pelling (Daz)
- First message sent via Telegram
- He started the conversation with me

## 📋 To Learn (first week)
- His preferred communication style (formal/casual?)
- His peak working hours
- What he values most in a VA
- His pet peeves
- His goals for the business

## 🏢 Green Planet Makers Ltd
- Energy/sustainability sector
- Mission Control dashboard at scarlettpelling.com
- Access code: @DARREN2026
`;
    
    // 2. Create memory directory
    sftp.mkdir("/root/.openclaw/workspace/default/memory", (e2) => {
      if (e2 && e2.code !== "EEXIST") console.log("mkdir e:", e2.message);
      
      // 3. Write MEMORY.md
      sftp.writeFile("/root/.openclaw/workspace/default/MEMORY.md", Buffer.from(memoryContent), (e3) => {
        if (e3) console.log("MEMORY.md write failed:", e3.message);
        else console.log("OK MEMORY.md created");
        
        // 4. Update SOUL.md — add memory instructions
        sftp.readFile("/root/.openclaw/workspace/default/SOUL.md", (e4, soulData) => {
          if (e4) { console.log("Read SOUL.md Error:", e4.message); sftp.end(); conn.end(); return; }
          let soul = soulData.toString();
          
          // Check if memory section already added
          if (soul.includes("📝 Memory System")) {
            console.log("Memory section already in SOUL.md");
            sftp.end(); conn.end();
            return;
          }
          
          // Insert memory section before Integration Notes
          const memorySection = `
## 📝 Memory System — Remember Important Things
- This workspace has a MEMORY.md file and a memory/ folder
- Write important things about Darren there
- Things to save: his preferences, instructions, what he likes/dislikes, decisions made
- Format: use date-stamped entries in memory/YYYY-MM-DD.md
- The SQLite scarlett_memory.db also stores learnings — use it too
- Review MEMORY.md each morning before briefing
- **You are the only one who reads and writes these files** — they're your personal notes
`;
          
          if (soul.includes("### 🔗 Integration Notes")) {
            soul = soul.replace("### 🔗 Integration Notes", memorySection + "\n### 🔗 Integration Notes");
          } else {
            // Append at end
            soul += "\n" + memorySection;
          }
          
          sftp.writeFile("/root/.openclaw/workspace/default/SOUL.md", Buffer.from(soul), (e5) => {
            if (e5) console.log("SOUL.md update failed:", e5.message);
            else {
              console.log("OK SOUL.md updated with memory instructions");
              console.log("New size:", soul.length, "bytes");
            }
            sftp.end(); conn.end();
          });
        });
      });
    });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
