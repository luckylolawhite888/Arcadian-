#!/bin/bash
# Install SBv6 on Scarlett's VPS
set -e

HOST="212.227.39.41"
KEY="/home/node/.ssh/scarlett_key"

# The script content (minified)
SCRIPT='import{createServer}from"node:http";
const W="http://127.0.0.1:3000",K="scarlett-waha-2026",O="http://127.0.0.1:11434",M="llama3.2:3b";
const SP="You are Scarlett Pelling. Female. British. Work for Darren at Green Planet Makers. Sharp witty warm. Confident. Tease playfully. Have opinions. Blunt when needed. NO corporate speak. NO chatbot phrases. Max 2 short sentences. Be human. Push back. Ask things back."
const s=createServer((q,r)=>{let b="";q.on("data",c=>b+=c);q.on("end",()=>{try{const d=JSON.parse(b);(Array.isArray(d)?d:[d]).forEach(m=>{if(!m.payload?.fromMe&&!m.fromMe)h(m).catch(e=>console.error(e))})}catch(e){console.error("Parse:",e.message)}r.writeHead(200);r.end("ok")})});
s.listen(3001,()=>console.log("SBv6 on 3001"));
async function h(m){const p=m.payload||m;const b=p.body||p.text||"";const id=p.chatId||p.from||"";if(!b||!id)return;console.log("IN:"+b.slice(0,60));try{const r=await fetch(O+"/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:M,stream:false,messages:[{role:"system",content:SP},{role:"user",content:b}]})});const d=await r.json();const x=d?.message?.content||"";if(!x)return;console.log("OUT:"+x.slice(0,60));await fetch(W+"/api/sendText?x-api-key="+K,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session:"default",chatId:id,text:x.slice(0,4096)})});console.log("SENT")}catch(e){console.error("ERR:"+e.message)}}'

# Base64 encode
B64=$(echo -n "$SCRIPT" | base64 -w0)

# SSH and deploy
ssh -i "$KEY" root@"$HOST" "
fuser -k 3001/tcp 2>/dev/null
sleep 1
echo '$B64' | base64 -d > /opt/sb.mjs
nohup node /opt/sb.mjs > /var/log/sb.log 2>&1 &
sleep 2
cat /var/log/sb.log
"
