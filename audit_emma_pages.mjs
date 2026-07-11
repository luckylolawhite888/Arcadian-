// Audit Emma dashboard — check every page section
import { readFileSync } from 'fs';

const html = readFileSync('/tmp/emma_dashboard.html', 'utf8');

// Sidebar nav items
const navMatch = html.match(/<nav[^>]*data-page[\s\S]*?<\/nav>/);
if (navMatch) {
  const nav = navMatch[1];
  // Extract nav labels
  const labels = [];
  const labelRe = /<span class="nav-label">([^<]+)<\/span>/g;
  let lm;
  while ((lm = labelRe.exec(nav)) !== null) labels.push(lm[1].trim());
  console.log("Nav sections:", labels.join(" | "));
  
  // Extract individual nav items with badges
  const items = [];
  const itemRe = /onclick="nav\('([^']+)'[^)]*\)[^>]*>([\s\S]*?)<\/a>/g;
  let im;
  while ((im = itemRe.exec(nav)) !== null) items.push(im);
  for (const m of items) {
    const pageName = m[1];
    const content = m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const badge = m[2].match(/<span class="badge[^"]*"[^>]*>([^<]+)<\/span>/);
    const badgeStr = badge ? ` (badge: ${badge[1]})` : "";
    console.log(`  → ${pageName}${badgeStr}`);
  }
}

// Check all page sections for their unique content
const pages = ["dashboard","leads","tasks","campaigns","projects","compliance","allocations","sales-intel","briefing","calendar","approvals","chat","vault","settings"];

console.log("\n--- Page Content Audit ---");

// Find each section by its container div
let pos = 0;
let count = 0;
while (count < 20) {
  const start = html.indexOf('data-page="', pos);
  if (start === -1) break;
  const endQuote = html.indexOf('"', start + 11);
  if (endQuote === -1) break;
  const pageName = html.substring(start + 11, endQuote);
  
  // Find the section start
  const sectionStart = html.lastIndexOf('<section', start);
  const divStart = html.lastIndexOf('<div', start);
  const blockStart = Math.max(sectionStart, divStart);
  
  // Try to find where this page section ends
  const nextPage = html.indexOf('data-page="', endQuote + 1);
  const sectionEnd = html.indexOf('</section>', endQuote);
  const closePattern = html.indexOf('<!-- /' + pageName + ' -->', endQuote);
  
  let endPos = nextPage > 0 ? nextPage : html.length;
  if (closePattern > 0 && closePattern < endPos) endPos = closePattern;
  if (sectionEnd > 0 && sectionEnd < endPos && pageName !== "dashboard") endPos = sectionEnd;
  
  const content = html.substring(endQuote + 1, endPos);
  
  // Extract headings, buttons, form elements
  const h2s = [...content.matchAll(/<h2[^>]*>([^<]{1,60})<\/h2>/g)].map(m => m[1].trim());
  const h3s = [...content.matchAll(/<h3[^>]*>([^<]{1,60})<\/h3>/g)].map(m => m[1].trim());
  const buttons = [...content.matchAll(/<button[^>]*>([^<]{1,40})<\/button>/g)].map(m => m[1].trim());
  const inputs = [...content.matchAll(/<input[^>]*placeholder="([^"]{1,40})"/g)].map(m => m[1].trim());
  const labels = [...content.matchAll(/<label[^>]*>([^<]{1,60})<\/label>/g)].map(m => m[1].trim());
  const selects = [...content.matchAll(/<select[^>]*>[\s\S]*?<\/select>/g)];
  const selLabels = [...content.matchAll(/<option[^>]*>([^<]{1,40})<\/option>/g)].map(m => m[1].trim());
  
  // Identify key content
  const keyElements = [...new Set([...h2s, ...h3s, ...labels, ...buttons.slice(0,5), ...inputs.slice(0,3)])];
  
  if (keyElements.length > 0 || pageName === "dashboard") {
    console.log(`\n${pageName}:`);
    if (h2s.length > 0) console.log(`  Headings: ${h2s.slice(0,3).join(" | ")}`);
    if (keyElements.length > 0) console.log(`  Elements: ${keyElements.slice(0,8).join(" | ")}`);
    if (inputs.length > 0) console.log(`  Inputs: ${inputs.slice(0,3).join(" | ")}`);
  }
  
  pos = endPos;
  count++;
}
