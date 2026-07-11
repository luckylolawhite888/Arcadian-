#!/usr/bin/env python3
"""Generate 8 PDF tool pages for pdfoomph.com"""
import os

BASE_CSS = """*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,system-ui,'Segoe UI',sans-serif;background:#f8fafc;color:#1a1a2e;min-height:100vh}
.top-bar{background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);color:#fff;padding:16px 0;text-align:center}
.top-bar h1{font-size:1.4em;font-weight:800;letter-spacing:-0.5px}
.top-bar h1 span{opacity:0.8;font-weight:400}
.top-bar a{color:#fff;text-decoration:none}
.hero{background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);color:#fff;padding:50px 20px;text-align:center}
.hero h2{font-size:2.2em;font-weight:800;margin-bottom:12px}
.hero p{font-size:1.05em;opacity:0.9;max-width:560px;margin:0 auto}
.container{max-width:900px;margin:0 auto 40px;padding:0 20px}
.content{background:#fff;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.08);margin:20px 0}
.content h2{font-size:1.5em;color:#f5576c;margin-bottom:15px}
.content h3{font-size:1.15em;color:#1a1a2e;margin:20px 0 10px}
.content p{line-height:1.7;margin-bottom:12px;color:#555}
.content ul{margin:10px 0 15px 20px}
.content li{line-height:1.7;color:#555;margin-bottom:6px}
.highlight{background:#fff5f7;border-left:4px solid #f5576c;padding:15px;margin:15px 0;border-radius:0 8px 8px 0}
.highlight strong{color:#f5576c}
.breadcrumb{font-size:0.85em;padding:10px 0;color:#888}
.breadcrumb a{color:#f5576c;text-decoration:none}
.breadcrumb a:hover{text-decoration:underline}
.tools-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin:20px 0}
.tool-card{background:#fff;border-radius:12px;padding:18px;box-shadow:0 2px 12px rgba(0,0,0,0.06);text-align:center;border:2px solid transparent;text-decoration:none;transition:all .2s;display:block}
.tool-card:hover{transform:translateY(-2px);box-shadow:0 4px 20px rgba(0,0,0,0.1);border-color:#f5576c}
.tool-card .icon{font-size:2em;margin-bottom:6px}
.tool-card h3{font-size:0.95em;font-weight:700;color:#1a1a2e}
.tool-card p{font-size:0.8em;color:#666}
.btn{display:inline-block;background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);color:#fff;padding:12px 28px;border-radius:10px;font-size:1em;font-weight:700;text-decoration:none;transition:all .2s;margin-top:10px}
.btn:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(245,87,108,0.4)}
.ad-wrap{max-width:728px;margin:20px auto;min-height:100px}
footer{text-align:center;padding:30px;color:#888;font-size:.85em;margin-top:40px;border-top:1px solid #e5e7eb}
footer a{color:#f5576c;text-decoration:none}
.back-link{display:inline-block;margin-top:20px;color:#f5576c;font-weight:600;text-decoration:none;border:2px solid #f5576c;padding:10px 20px;border-radius:8px;transition:all .2s}
.back-link:hover{background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);color:#fff}
@media(max-width:600px){.hero h2{font-size:1.6em}}"""

PAGES = [
    {
        "file": "merge-pdf.html",
        "title": "Merge PDF Files Online Free | Combine PDFs — PDFoomph",
        "desc": "Free online PDF merger. Combine multiple PDF files into one document. No upload limits, no sign up. 100% free and secure in your browser.",
        "keywords": "merge PDF, combine PDFs, PDF merger, join PDF files, merge documents online",
        "tool": "Merge PDF",
        "icon": "🔀",
        "intro": "Need to combine multiple PDFs into one document? Our free Merge PDF tool lets you join PDF files together in seconds. Whether you're merging scanned documents, combining report chapters or stitching together multiple invoices, the process happens entirely in your browser — nothing is uploaded to any server. Your files stay private and secure.",
        "features": [
            "Combine up to 20 PDF files at once",
            "No file size limits — merge large documents",
            "All processing happens in your browser — 100% private",
            "No sign-up, no email required, no watermarks",
            "Works on Windows, Mac, Linux, iOS and Android",
            "Supports any PDF version — Acrobat, LibreOffice, scans",
        ],
        "steps": [
            "Click 'Choose Files' or drag & drop your PDFs onto the page",
            "Arrange them in the correct order using drag and drop",
            "Click 'Merge' and wait a few seconds",
            "Download your combined PDF instantly",
        ],
        "tools_list": [
            ("split-pdf", "✂️", "Split PDF"),
            ("compress-pdf", "📦", "Compress PDF"),
            ("jpg-to-pdf", "🖼️", "JPG to PDF"),
            ("pdf-to-word", "📝", "PDF to Word"),
            ("pdf-to-excel", "📊", "PDF to Excel"),
            ("password-protect-pdf", "🔒", "Protect PDF"),
            ("unlock-pdf", "🔓", "Unlock PDF"),
        ]
    },
    {
        "file": "split-pdf.html",
        "title": "Split PDF Files Online Free | Separate PDF Pages — PDFoomph",
        "desc": "Free online PDF splitter. Split large PDF files into separate pages or extract specific pages. No upload, no sign up. 100% free browser-based tool.",
        "keywords": "split PDF, separate PDF pages, extract PDF pages, PDF page extractor, divide PDF",
        "tool": "Split PDF",
        "icon": "✂️",
        "intro": "Our free Split PDF tool lets you separate PDF files into individual pages or extract specific pages. Perfect for splitting a large document into chapters, extracting single pages from a contract, or dividing a scanned booklet. All processing is done in your browser — your files never leave your device.",
        "features": [
            "Split PDF into individual pages",
            "Extract a specific page range (e.g. pages 1–5, 10–20)",
            "Split every N pages into separate documents",
            "No file size limits",
            "100% private and secure — no upload to servers",
            "Completely free with no watermarks or hidden charges",
        ],
        "steps": [
            "Upload your PDF file using drag & drop or file picker",
            "Choose your split mode: all pages, page range, or every N pages",
            "Click 'Split' and let your browser do the work",
            "Download the resulting pages as individual PDFs or a ZIP file",
        ],
        "tools_list": [
            ("merge-pdf", "🔀", "Merge PDF"),
            ("compress-pdf", "📦", "Compress PDF"),
            ("jpg-to-pdf", "🖼️", "JPG to PDF"),
            ("pdf-to-word", "📝", "PDF to Word"),
            ("pdf-to-excel", "📊", "PDF to Excel"),
            ("password-protect-pdf", "🔒", "Protect PDF"),
            ("unlock-pdf", "🔓", "Unlock PDF"),
        ]
    },
    {
        "file": "compress-pdf.html",
        "title": "Compress PDF Files Online Free | Reduce PDF Size — PDFoomph",
        "desc": "Free online PDF compressor. Reduce PDF file size without losing quality. No upload limits, no sign up. 100% free browser-based compression.",
        "keywords": "compress PDF, reduce PDF size, PDF compressor, shrink PDF, smaller PDF online",
        "tool": "Compress PDF",
        "icon": "📦",
        "intro": "Our free Compress PDF tool helps you reduce file size while maintaining quality. Perfect for making PDFs small enough to email, upload to websites, or share on messaging apps. All compression happens in your browser—no files uploaded, no privacy concerns.",
        "features": [
            "Reduce PDF size by up to 80% without noticeable quality loss",
            "Choose from multiple compression levels: low, medium, high",
            "No file size limits on input documents",
            "100% private — all processing is client-side",
            "Free to use with no registration or watermark",
            "Works on desktop and mobile browsers",
        ],
        "steps": [
            "Upload your PDF by dragging & dropping or clicking browse",
            "Select your desired compression level",
            "Click 'Compress' and wait for processing",
            "Download your smaller, optimised PDF",
        ],
        "tools_list": [
            ("merge-pdf", "🔀", "Merge PDF"),
            ("split-pdf", "✂️", "Split PDF"),
            ("jpg-to-pdf", "🖼️", "JPG to PDF"),
            ("pdf-to-word", "📝", "PDF to Word"),
            ("pdf-to-excel", "📊", "PDF to Excel"),
            ("password-protect-pdf", "🔒", "Protect PDF"),
            ("unlock-pdf", "🔓", "Unlock PDF"),
        ]
    },
    {
        "file": "jpg-to-pdf.html",
        "title": "JPG to PDF Converter Free | Convert Images to PDF — PDFoomph",
        "desc": "Free online JPG to PDF converter. Turn your images into a PDF document. Combine multiple photos into one PDF. No upload, no sign up. 100% free.",
        "keywords": "JPG to PDF, convert image to PDF, image to PDF converter, picture to PDF, photo to PDF",
        "tool": "JPG to PDF",
        "icon": "🖼️",
        "intro": "Convert your images to PDF quickly and easily with our free JPG to PDF converter. Whether you need to combine multiple photos into a single PDF, convert scanned images, or create a document from screenshots — our tool does it all in your browser. Nothing is uploaded, so your images stay private.",
        "features": [
            "Convert JPG, PNG, BMP, GIF and WEBP to PDF",
            "Combine multiple images into one PDF document",
            "Arrange images in any order before conversion",
            "Adjust page orientation: portrait or landscape",
            "No file or count limits",
            "100% free with no watermarks or sign-up",
        ],
        "steps": [
            "Upload your images by dragging & dropping or clicking browse",
            "Arrange them in the desired order",
            "Choose page size (A4, Letter, or auto-fit)",
            "Click 'Convert' and download your new PDF",
        ],
        "tools_list": [
            ("merge-pdf", "🔀", "Merge PDF"),
            ("split-pdf", "✂️", "Split PDF"),
            ("compress-pdf", "📦", "Compress PDF"),
            ("pdf-to-word", "📝", "PDF to Word"),
            ("pdf-to-excel", "📊", "PDF to Excel"),
            ("password-protect-pdf", "🔒", "Protect PDF"),
            ("unlock-pdf", "🔓", "Unlock PDF"),
        ]
    },
    {
        "file": "pdf-to-word.html",
        "title": "PDF to Word Converter Free | Convert PDF to DOCX — PDFoomph",
        "desc": "Free online PDF to Word converter. Turn PDF files into editable Word documents. No upload limits, no sign up. 100% free browser-based conversion.",
        "keywords": "PDF to Word, convert PDF to DOCX, PDF to Word converter, PDF to editable document, PDF converter free",
        "tool": "PDF to Word",
        "icon": "📝",
        "intro": "Need to edit a PDF but don't have the original source file? Our free PDF to Word converter extracts the text, formatting and images and creates a fully editable DOCX file. Perfect for editing contracts, resumes, reports or any PDF document. All processing happens in your browser for maximum privacy.",
        "features": [
            "Convert PDF to fully editable Word (DOCX)",
            "Preserves text formatting, fonts and layout where possible",
            "Extracts images from the original PDF",
            "No file size limits",
            "100% private — no server upload required",
            "Free to use with no registration or watermarks",
        ],
        "steps": [
            "Upload your PDF file",
            "Optionally select specific pages to convert",
            "Click 'Convert to Word'",
            "Download your editable DOCX file",
        ],
        "tools_list": [
            ("merge-pdf", "🔀", "Merge PDF"),
            ("split-pdf", "✂️", "Split PDF"),
            ("compress-pdf", "📦", "Compress PDF"),
            ("jpg-to-pdf", "🖼️", "JPG to PDF"),
            ("pdf-to-excel", "📊", "PDF to Excel"),
            ("password-protect-pdf", "🔒", "Protect PDF"),
            ("unlock-pdf", "🔓", "Unlock PDF"),
        ]
    },
    {
        "file": "pdf-to-excel.html",
        "title": "PDF to Excel Converter Free | Convert PDF to XLSX — PDFoomph",
        "desc": "Free online PDF to Excel converter. Extract tables and data from PDFs into editable Excel spreadsheets. No upload, no sign up. 100% free.",
        "keywords": "PDF to Excel, convert PDF to XLSX, PDF to spreadsheet, extract PDF tables, PDF data extraction",
        "tool": "PDF to Excel",
        "icon": "📊",
        "intro": "Extract tables, financial data and structured information from PDF files into editable Excel spreadsheets. Perfect for accountants, analysts and anyone working with PDF reports that contain tabular data. All conversion happens right in your browser — your sensitive documents never leave your device.",
        "features": [
            "Extract tables from PDF into Excel XLSX format",
            "Preserves column structure, rows and numeric formatting",
            "Works with scanned PDFs containing tables",
            "No file size or page count limits",
            "100% private and secure",
            "Completely free with no registration",
        ],
        "steps": [
            "Upload your PDF containing tables or structured data",
            "Select the pages you want to convert",
            "Click 'Convert to Excel'",
            "Download your XLSX spreadsheet with extracted data",
        ],
        "tools_list": [
            ("merge-pdf", "🔀", "Merge PDF"),
            ("split-pdf", "✂️", "Split PDF"),
            ("compress-pdf", "📦", "Compress PDF"),
            ("jpg-to-pdf", "🖼️", "JPG to PDF"),
            ("pdf-to-word", "📝", "PDF to Word"),
            ("password-protect-pdf", "🔒", "Protect PDF"),
            ("unlock-pdf", "🔓", "Unlock PDF"),
        ]
    },
    {
        "file": "password-protect-pdf.html",
        "title": "Password Protect PDF Free | Add Security to PDFs — PDFoomph",
        "desc": "Free online PDF password protector. Add password protection to your PDF files to keep them secure. No upload, no sign up. 100% free and private.",
        "keywords": "password protect PDF, add password to PDF, PDF security, lock PDF, encrypt PDF online",
        "tool": "Password Protect",
        "icon": "🔒",
        "intro": "Keep your sensitive documents safe with our free PDF password protector. Add strong password encryption to prevent unauthorised access, printing or editing. Whether you're sharing a confidential business document or protecting personal records, the encryption happens right in your browser.",
        "features": [
            "Add 128-bit AES password encryption",
            "Set permissions: restrict printing, editing and copying",
            "Strong encryption — no one can open without the password",
            "No file size limits",
            "100% private — no upload to servers",
            "Completely free with no registration",
        ],
        "steps": [
            "Upload the PDF you want to protect",
            "Enter a strong password (12+ characters recommended)",
            "Optionally set permission restrictions",
            "Click 'Protect' and download your secured PDF",
        ],
        "tools_list": [
            ("merge-pdf", "🔀", "Merge PDF"),
            ("split-pdf", "✂️", "Split PDF"),
            ("compress-pdf", "📦", "Compress PDF"),
            ("jpg-to-pdf", "🖼️", "JPG to PDF"),
            ("pdf-to-word", "📝", "PDF to Word"),
            ("pdf-to-excel", "📊", "PDF to Excel"),
            ("unlock-pdf", "🔓", "Unlock PDF"),
        ]
    },
    {
        "file": "unlock-pdf.html",
        "title": "Unlock PDF Free | Remove PDF Password Protection — PDFoomph",
        "desc": "Free online PDF unlocker. Remove password protection from PDF files. No upload, no sign up. 100% free browser-based tool to unlock your PDFs.",
        "keywords": "unlock PDF, remove PDF password, PDF password remover, decrypt PDF, unlock protected PDF",
        "tool": "Unlock PDF",
        "icon": "🔓",
        "intro": "Forgot the password on your own PDF? Need to remove restrictions from a PDF you have permission to edit? Our free Unlock PDF tool removes password protection and printing/editing restrictions. All processing is done in your browser — your files never leave your device.",
        "features": [
            "Remove password protection from PDF files",
            "Remove printing, editing and copying restrictions",
            "Works with owner-level passwords (you need the password)",
            "No file size limits",
            "100% private and secure",
            "Completely free with no registration or watermarks",
        ],
        "steps": [
            "Upload the password-protected PDF",
            "Enter the document password",
            "Click 'Unlock' to remove protection",
            "Download your unlocked, unrestricted PDF",
        ],
        "tools_list": [
            ("merge-pdf", "🔀", "Merge PDF"),
            ("split-pdf", "✂️", "Split PDF"),
            ("compress-pdf", "📦", "Compress PDF"),
            ("jpg-to-pdf", "🖼️", "JPG to PDF"),
            ("pdf-to-word", "📝", "PDF to Word"),
            ("pdf-to-excel", "📊", "PDF to Excel"),
            ("password-protect-pdf", "🔒", "Protect PDF"),
        ]
    },
]

def ad_block(slot, is_header=False):
    return f'''<div class="ad-wrap">
  <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-9534114738328693" data-ad-slot="{slot}" data-ad-format="auto" data-full-width-responsive="true"></ins>
  <script>(adsbygoogle=window.adsbygoogle||[]).push{{}});</script>
</div>'''

def generate(p):
    canonical = f"https://www.pdfoomph.com/{p['file']}"
    title = p["title"]
    meta_desc = p["desc"]
    meta_kw = p["keywords"]
    tool = p["tool"]
    icon = p["icon"]

    features_html = "\n".join([f"      <li>{f}</li>" for f in p["features"]])
    steps_html = "\n".join([f"      <li>{s}</li>" for s in p["steps"]])

    tools_html = ""
    for tfile, ticon, tname in p["tools_list"]:
        tools_html += f'''    <a href="https://www.pdfoomph.com/{tfile}" class="tool-card">
      <div class="icon">{ticon}</div>
      <h3>{tname}</h3>
    </a>
'''

    return f'''<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{meta_desc}">
<meta name="keywords" content="{meta_kw}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="{canonical}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{meta_desc}">
<meta property="og:url" content="{canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="PDFoomph">
<meta property="og:locale" content="en_GB">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{meta_desc}">
<script type="application/ld+json">{{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "{tool} — PDFoomph",
  "description": "{meta_desc}",
  "url": "{canonical}",
  "operatingSystem": "All",
  "applicationCategory": "UtilityApplication",
  "offers": {{
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "GBP"
  }}
}}</script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9534114738328693" crossorigin="anonymous"></script>
<style>{BASE_CSS}</style>
</head>
<body>

<div class="top-bar"><h1><a href="https://www.pdfoomph.com/">📄 PDFoomph <span>— Free PDF Tools</span></a></h1></div>

<div class="hero">
  <h2>{icon} {tool} — Free & Online</h2>
  <p>{p["intro"].split(".")[0]}.</p>
</div>

{ad_block("3908268067", True)}

<div class="container">
  <div class="breadcrumb">
    <a href="https://www.pdfoomph.com/">Home</a> › {tool}
  </div>

  <div class="content">
    <h2>{icon} About This {tool} Tool</h2>
    <p>{p["intro"]}</p>
  </div>

  <div class="content">
    <h3>✨ Key Features</h3>
    <ul>{features_html}
    </ul>
  </div>

  <div class="content">
    <h3>📋 How to Use</h3>
    <ol>{steps_html}
    </ol>
    <p style="margin-top:15px">That's it! No registration, no email, no watermark — just fast, free document processing.</p>
    <a href="https://www.pdfoomph.com/" class="btn">📄 Try the {tool} Tool</a>
  </div>

  <div class="content">
    <h3>🌐 More PDF Tools You Might Need</h3>
    <div class="tools-grid">
{tools_html}    </div>
  </div>

  <div class="content">
    <h3>❓ Frequently Asked Questions</h3>
    <h4>Is this tool really free?</h4>
    <p>Yes! PDFoomph tools are completely free to use. There's no hidden charge, no trial period and no watermark on your output files. Our tools are supported by minimal, non-intrusive ads.</p>
    <h4>Are my files secure?</h4>
    <p>Absolutely. All PDF processing happens in your browser using client-side JavaScript. Your files never leave your computer — we have no servers that receive your documents.</p>
    <h4>Do I need to sign up?</h4>
    <p>No registration or email is required. Just visit the page, upload your file and go.</p>
    <h4>What browsers are supported?</h4>
    <p>PDFoomph works on all modern browsers including Chrome, Firefox, Safari and Edge, on desktop and mobile devices.</p>
    <h4>Are there file size limits?</h4>
    <p>There are no hard limits, but very large files (500MB+) may be slower due to browser memory constraints.</p>
  </div>

  <a href="https://www.pdfoomph.com/" class="back-link">← Back to All PDF Tools</a>
</div>

{ad_block("6893524050")}

<footer>
  <p>© 2026 <a href="https://www.pdfoomph.com/">PDFoomph.com</a> — Free PDF Tools. All processing happens in your browser — nothing is uploaded. ⚡</p>
</footer>

</body>
</html>'''

os.makedirs('/tmp/pdfoomph_pages', exist_ok=True)
for p in PAGES:
    html = generate(p)
    path = f'/tmp/pdfoomph_pages/{p["file"]}'
    with open(path, 'w') as f:
        f.write(html)
    print(f"Generated {p['file']} ({len(html)} bytes)")

print("\nAll 8 pdfoomph.com pages generated in /tmp/pdfoomph_pages/")
