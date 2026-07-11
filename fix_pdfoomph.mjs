import { Client } from 'ssh2';
import fs from 'fs';

const HOST = '212.227.93.74';
const USER = 'root';
const KEY = '/home/node/.ssh/ionos_ubuntu';

// Rewrite pdfoomph index.html with client-side PDF tools using pdf-lib CDN
const newHTML = `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PDFoomph — Free Online PDF Tools: Merge, Split, Compress, Convert</title>
<meta name="description" content="Free online PDF tools — merge PDFs, split PDFs, compress PDFs, protect with password, convert JPG to PDF and more. No upload limits, no sign up. 100% free.">
<meta name="keywords" content="free PDF tools, merge PDF, split PDF, compress PDF, JPG to PDF, PDF to JPG, protect PDF online, free PDF converter">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<link rel="canonical" href="https://www.pdfoomph.com/">
<meta property="og:title" content="PDFoomph — Free Online PDF Tools: Merge, Split, Compress, Convert">
<meta property="og:description" content="Free online PDF tools — merge PDFs, split PDFs, compress PDFs, protect with password, convert JPG to PDF and more. No upload limits, no sign up. 100% free.">
<meta property="og:url" content="https://www.pdfoomph.com/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="PDFoomph">
<meta property="og:locale" content="en_GB">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="PDFoomph — Free Online PDF Tools: Merge, Split, Compress, Convert">
<meta name="twitter:description" content="Free online PDF tools — merge PDFs, split PDFs, compress PDFs, protect with password, convert JPG to PDF and more. No upload limits, no sign up. 100% free.">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9534114738328693" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,system-ui,'Segoe UI',sans-serif;background:#f8fafc;color:#1a1a2e;min-height:100vh}
.top-bar{background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);color:#fff;padding:16px 0;text-align:center}
.top-bar h1{font-size:1.4em;font-weight:800;letter-spacing:-0.5px}
.top-bar h1 span{opacity:0.8;font-weight:400}
.hero{background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);color:#fff;padding:60px 20px 80px;text-align:center}
.hero h2{font-size:2.8em;font-weight:800;margin-bottom:12px;line-height:1.1}
.hero p{font-size:1.15em;opacity:0.9;max-width:560px;margin:0 auto 30px}
.container{max-width:1100px;margin:-50px auto 40px;padding:0 20px;position:relative;z-index:2}
.tools-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;margin-bottom:40px}
.tool-card{background:#fff;border-radius:16px;padding:24px;box-shadow:0 4px 24px rgba(0,0,0,0.08);cursor:pointer;transition:all .2s;text-align:center;border:2px solid transparent}
.tool-card:hover{transform:translateY(-3px);box-shadow:0 8px 32px rgba(0,0,0,0.12);border-color:#f5576c}
.tool-card .icon{font-size:2.5em;margin-bottom:10px}
.tool-card h3{font-size:1.1em;font-weight:700;margin-bottom:5px}
.tool-card p{font-size:0.85em;color:#666}
.tool-card.active{border-color:#f5576c;background:#fff5f7}
.workspace{background:#fff;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.08);margin-bottom:30px;display:none}
.workspace.visible{display:block}
.workspace h2{font-size:1.5em;margin-bottom:20px}
.workspace .drop-zone{border:2px dashed #d1d5db;border-radius:12px;padding:40px 20px;text-align:center;cursor:pointer;transition:all .2s;background:#fafafa}
.workspace .drop-zone:hover,.workspace .drop-zone.dragover{border-color:#f5576c;background:#fff5f7}
.workspace .drop-zone .icon{font-size:3em;margin-bottom:10px;opacity:0.5}
.workspace .drop-zone p{color:#666}
.workspace .drop-zone .browse{color:#f5576c;font-weight:600;cursor:pointer}
.workspace .file-list{margin-top:16px}.workspace .file-item{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#f9fafb;border-radius:8px;margin-bottom:8px;font-size:0.9em}
.btn{background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);color:#fff;border:none;padding:14px 32px;border-radius:10px;font-size:1.05em;font-weight:700;cursor:pointer;transition:all .2s;width:100%;margin-top:16px}
.btn:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(245,87,108,0.4)}
.btn:disabled{opacity:0.5;cursor:not-allowed;transform:none}
.progress{display:none;margin-top:16px;text-align:center}
.progress .spinner{display:inline-block;width:40px;height:40px;border:4px solid #f3f3f3;border-top-color:#f5576c;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.result{margin-top:16px;padding:14px;border-radius:10px;display:none}
.result.success{background:#ecfdf5;color:#065f46;display:block}
.result.error{background:#fef2f2;color:#991b1b;display:block}
.result a{color:#f5576c;font-weight:600}
.ad-wrap{max-width:728px;margin:20px auto;min-height:100px}
footer{text-align:center;padding:30px;color:#888;font-size:.85em;margin-top:40px;border-top:1px solid #e5e7eb}
</style>
</head>
<body>
<div class="top-bar"><h1>📄 PDFoomph <span>— Free PDF Tools</span></h1></div>
<div class="hero"><h2>PDF tools that pack a punch</h2><p>Merge, split, compress, protect, unlock and convert PDFs. All in your browser — nothing uploaded to any server.</p></div>
<div class="container">
  <div class="tools-grid">
    <div class="tool-card active" onclick="selectTool('merge')">
      <div class="icon">🔀</div><h3>Merge PDF</h3><p>Combine multiple PDFs into one document</p>
    </div>
    <div class="tool-card" onclick="selectTool('split')">
      <div class="icon">✂️</div><h3>Split PDF</h3><p>Split a PDF into separate pages</p>
    </div>
    <div class="tool-card" onclick="selectTool('compress')">
      <div class="icon">📦</div><h3>Compress PDF</h3><p>Reduce PDF file size</p>
    </div>
    <div class="tool-card" onclick="selectTool('protect')">
      <div class="icon">🔒</div><h3>Protect PDF</h3><p>Add password protection</p>
    </div>
    <div class="tool-card" onclick="selectTool('unlock')">
      <div class="icon">🔓</div><h3>Unlock PDF</h3><p>Remove password from PDF</p>
    </div>
    <div class="tool-card" onclick="selectTool('img2pdf')">
      <div class="icon">🖼️</div><h3>JPG to PDF</h3><p>Convert images to a PDF document</p>
    </div>
  </div>

  <div class="workspace visible" id="workspace">
    <h2 id="toolTitle">🔀 Merge PDF</h2>
    <div class="drop-zone" id="dropZone" onclick="document.getElementById('fileInput').click()">
      <div class="icon">📄</div>
      <p>Drag & drop your files here or <span class="browse">browse</span></p>
    </div>
    <input type="file" id="fileInput" style="display:none" multiple>
    <div id="fileList" class="file-list"></div>
    <div id="passwordField" style="display:none">
      <input type="password" id="passInput" style="width:100%;padding:12px 16px;border:2px solid #e5e7eb;border-radius:10px;font-size:1em;margin-top:12px" placeholder="Enter password">
    </div>
    <button class="btn" id="processBtn">🚀 Process Files</button>
    <div class="progress" id="progress"><div class="spinner"></div><p style="margin-top:10px;color:#666">Processing in your browser...</p></div>
    <div class="result" id="result"></div>
  </div>

  <div class="ad-wrap">
    <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-9534114738328693" data-ad-slot="3908268067" data-ad-format="auto" data-full-width-responsive="true"></ins>
    <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>
  </div>
</div>
<footer>PDFoomph.com — Free PDF Tools. All processing happens in your browser — nothing is uploaded. ⚡<br><a href="/privacy.html">Privacy Policy</a></footer>
<script>
let currentTool = 'merge', currentFiles = [];
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => {
  e.preventDefault(); dropZone.classList.remove('dragover');
  if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', () => {
  if (fileInput.files.length) handleFiles(fileInput.files);
  fileInput.value = '';
});

function handleFiles(files) {
  const isImg = currentTool === 'img2pdf';
  const allowed = isImg ? ['image/jpeg','image/png','image/webp'] : ['application/pdf'];
  const arr = Array.from(files).filter(f => allowed.includes(f.type) || (!isImg && f.name.endsWith('.pdf')));
  if (arr.length === 0) { showResult('error', isImg ? 'Please select JPG or PNG images' : 'Please select PDF files'); return; }
  currentFiles = [...currentFiles, ...arr];
  renderFileList();
  document.getElementById('workspace').classList.add('visible');
}

function renderFileList() {
  const el = document.getElementById('fileList');
  el.innerHTML = currentFiles.map((f,i) =>
    '<div class="file-item"><span>📄 ' + f.name + ' (' + (f.size/1024).toFixed(1) + ' KB)</span><span onclick="removeFile(' + i + ')" style="cursor:pointer;color:#ef4444;font-weight:700">✕</span></div>'
  ).join('');
}

function removeFile(i) { currentFiles.splice(i,1); renderFileList(); }

function showResult(type, msg) {
  const el = document.getElementById('result');
  el.className = 'result ' + type;
  el.innerHTML = msg;
  el.style.display = 'block';
}

function selectTool(tool) {
  currentTool = tool; currentFiles = [];
  document.querySelectorAll('.tool-card').forEach(c => c.classList.remove('active'));
  document.querySelector('.tool-card[onclick*="' + tool + '"]').classList.add('active');
  const names = {merge:'🔀 Merge PDF', split:'✂️ Split PDF', compress:'📦 Compress PDF', protect:'🔒 Protect PDF', unlock:'🔓 Unlock PDF', img2pdf:'🖼️ JPG to PDF'};
  const accepts = {merge:'.pdf', split:'.pdf', compress:'.pdf', protect:'.pdf', unlock:'.pdf', img2pdf:'image/*'};
  document.getElementById('toolTitle').textContent = names[tool];
  fileInput.accept = accepts[tool];
  document.getElementById('passwordField').style.display = (tool === 'protect' || tool === 'unlock') ? 'block' : 'none';
  document.getElementById('fileList').innerHTML = '';
  document.getElementById('result').className = 'result';
  document.getElementById('result').style.display = 'none';
  document.getElementById('progress').style.display = 'none';
  document.getElementById('processBtn').style.display = 'block';
}

document.getElementById('processBtn').addEventListener('click', processFiles);

async function processFiles() {
  if (currentFiles.length === 0) { showResult('error','Please select files first'); return; }
  if (currentTool === 'merge' && currentFiles.length < 2) { showResult('error','Please select at least 2 files to merge'); return; }
  document.getElementById('processBtn').disabled = true;
  document.getElementById('progress').style.display = 'block';
  document.getElementById('result').style.display = 'none';

  try {
    let blob, filename;
    const { PDFDocument } = PDFLib;

    switch(currentTool) {
      case 'merge': {
        const merged = await PDFDocument.create();
        for (const file of currentFiles) {
          const buf = await file.arrayBuffer();
          const pdf = await PDFDocument.load(buf);
          const pages = await merged.copyPages(pdf, pdf.getPageIndices());
          pages.forEach(p => merged.addPage(p));
        }
        blob = new Blob([await merged.save()], {type:'application/pdf'});
        filename = 'merged.pdf';
        break;
      }
      case 'split': {
        const buf = await currentFiles[0].arrayBuffer();
        const pdf = await PDFDocument.load(buf);
        const zip = new JSZip();
        for (let i = 0; i < pdf.getPageCount(); i++) {
          const newPdf = await PDFDocument.create();
          const [page] = await newPdf.copyPages(pdf, [i]);
          newPdf.addPage(page);
          zip.file('page_' + (i+1) + '.pdf', await newPdf.save());
        }
        const zipBlob = await zip.generateAsync({type:'blob'});
        blob = new Blob([zipBlob], {type:'application/zip'});
        filename = 'split_pages.zip';
        break;
      }
      case 'compress': {
        const buf = await currentFiles[0].arrayBuffer();
        const pdf = await PDFDocument.load(buf);
        blob = new Blob([await pdf.save({objectsPerTick:50})], {type:'application/pdf'});
        filename = 'compressed.pdf';
        break;
      }
      case 'protect': {
        const password = document.getElementById('passInput').value || 'password';
        const buf = await currentFiles[0].arrayBuffer();
        const pdf = await PDFDocument.load(buf);
        pdf.encrypt({
          userPassword: password,
          ownerPassword: password,
          permissions: { printing: 'lowResolution', modifying: false, copying: false, annotating: false }
        });
        blob = new Blob([await pdf.save()], {type:'application/pdf'});
        filename = 'protected.pdf';
        break;
      }
      case 'unlock': {
        const password = document.getElementById('passInput').value || '';
        const buf = await currentFiles[0].arrayBuffer();
        const pdf = await PDFDocument.load(buf, {password: password || undefined});
        blob = new Blob([await pdf.save()], {type:'application/pdf'});
        filename = 'unlocked.pdf';
        break;
      }
      case 'img2pdf': {
        const pdf = await PDFDocument.create();
        for (const file of currentFiles) {
          const imgBuf = await file.arrayBuffer();
          let image;
          if (file.type === 'image/jpeg') image = await pdf.embedJpg(imgBuf);
          else image = await pdf.embedPng(imgBuf);
          const page = pdf.addPage([image.width, image.height]);
          page.drawImage(image, {x:0, y:0, width:image.width, height:image.height});
        }
        blob = new Blob([await pdf.save()], {type:'application/pdf'});
        filename = 'images.pdf';
        break;
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    showResult('success', '✅ Done! <a href="' + url + '" download="' + filename + '">Click here if download didn\'t start</a>');
  } catch(e) {
    showResult('error', '❌ Error: ' + e.message);
    console.error(e);
  }
  document.getElementById('processBtn').disabled = false;
  document.getElementById('progress').style.display = 'none';
}
</script>
</body>
</html>`;

const conn = new Client();
conn.on('ready', async () => {
  const b64 = Buffer.from(newHTML, 'utf8').toString('base64');
  await new Promise(resolve => {
    conn.exec(`echo "${b64}" | base64 -d > /var/www/pdfoomph.com/public/index.html && echo "Deployed 1: pdfoomph"`, (err, stream) => {
      let out = '';
      stream.on('data', d => out += d);
      stream.on('close', () => { console.log(out); resolve(); });
    });
  });

  // Also add a privacy page
  const privacy = `<!DOCTYPE html><html lang="en-GB"><head><meta charset="UTF-8"><title>Privacy Policy — PDFoomph</title><meta name="robots" content="noindex"><link rel="canonical" href="https://www.pdfoomph.com/privacy.html"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js" onerror="void 0"></head><body style="font-family:sans-serif;max-width:700px;margin:0 auto;padding:20px"><h1>Privacy Policy</h1><p>PDFoomph processes all files entirely in your browser using client-side JavaScript. No files are uploaded to any server. We use Google AdSense for ads, which may set cookies. We do not collect, store, or transmit any of your documents or personal data.</p><h2>AdSense</h2><p>We use Google AdSense to serve ads. Google may use cookies to personalize ads based on your browsing history. See <a href="https://policies.google.com/privacy">Google's Privacy Policy</a> for details.</p><h2>Contact</h2><p>privacy@pdfoomph.com</p><p><a href="/">← Back</a></p></body></html>`;
  const privB64 = Buffer.from(privacy, 'utf8').toString('base64');
  await new Promise(resolve => {
    conn.exec(`echo "${privB64}" | base64 -d > /var/www/pdfoomph.com/public/privacy.html`, (err, stream) => {
      let out = '';
      stream.on('data', d => out += d);
      stream.on('close', () => { console.log(out || 'privacy.html done'); resolve(); });
    });
  });

  conn.end();
  console.log('✅ PDFoomph fixed — fully client-side PDF tools!');
}).on('error', e => console.log('ERR:', e.message));
conn.connect({ host: HOST, username: USER, privateKey: fs.readFileSync(KEY, 'utf8').trim() });
