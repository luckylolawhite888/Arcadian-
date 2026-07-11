#!/bin/bash
# Regenerates and uploads the GPREG tracker HTML to the server
# Called automatically after each GP registration

WORKSPACE=/home/node/.openclaw/workspace
DATA_FILE=$WORKSPACE/public/gpreg_data.json
OUTPUT=$WORKSPACE/public/gpreg-tracker.html

# Read current data
if [ ! -f "$DATA_FILE" ]; then
  echo '{"error":"no data"}' 
  exit 1
fi

# Generate the tracker HTML
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('$DATA_FILE', 'utf8'));

const today = new Date().toISOString().slice(0,10);
const todayCount = data.filter(e => e.date && e.date.includes(today)).length;

const names = data.map(e => e.name);
const refs = data.map(e => e.gpreg || '—');

let html = \`<!DOCTYPE html>
<html>
<head>
<meta charset=\"UTF-8\">
<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no\">
<title>GPREG Tracker</title>
</head>
<body style=\"background:#ffffff;color:#111111;font-family:sans-serif;padding:16px;margin:0\">
<h2 style=\"margin:0 0 4px\">📊 Lola Sheets</h2>
<p style=\"font-size:13px;color:#666;margin:0 0 12px\">GP Registration Tracker</p>
<p style=\"font-size:16px;font-weight:bold;color:#333\">Total: \${data.length} &nbsp; Today: \${todayCount}</p>
<div id=\"items\"></div>
<div style=\"text-align:center;margin-top:16px;font-size:11px;color:#999\">🦊 Lola</div>
<script>
var strs = [\`;

data.forEach((e, i) => {
  const isToday = e.date && e.date.includes(today);
  const prefix = isToday ? '🔥 ' : '';
  const suffix = isToday ? ' (Today)' : '';
  html += \`  \"\${prefix}\${e.name} — \${e.gpreg || '—'} ✅\${suffix}\",
\`;
});

html += \`];
var h = '<a href=\"/launchpad.html\" style=\"color:#666;font-size:13px;display:block;margin-bottom:10px\">← Back</a>';
for(var i=0;i<strs.length;i++){
  h += '<div style=\"padding:10px;margin:4px 0;background:#f5f5f5;border-radius:8px;font-size:14px\">'+strs[i]+'</div>';
}
document.getElementById('items').innerHTML = h;
<\/script>
</body>
</html>\`;

fs.writeFileSync('$OUTPUT', html);
console.log('Generated ' + data.length + ' entries');
"
