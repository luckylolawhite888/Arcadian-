const {Client}=require("ssh2");
const fs=require("fs");
const c=new Client();
c.on("ready",()=>{
  c.exec("cd /root/emma-workspace && git add -A && git commit -m \"Voice: 30/70 text/voice split (30% voice notes, randomised)\" 2>&1 && cd /var/www/api && git add -A && git commit -m \"Voice: 30% voice note probability added\" 2>&1 && cd /var/www/api && git push 2>&1",(e,s)=>{
    let o="";
    s.on("data",d=>o+=d.toString());
    s.on("close",()=>console.log(o)||c.end());
  });
}).connect({host:"212.227.38.78",port:22,username:"root",password:"3v3fUeTROhIl4n",readyTimeout:30000});
