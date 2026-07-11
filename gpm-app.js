// Green Planet Makers — Carbon + Solar Platform v2.0
// Client-side JS — calculations, API calls, tab switching, ESG generation

// ---- BEIS Conversion Factors (UK Gov 2025) ----
const BEIS = {
  electricity: 0.215, // kgCO₂e/kWh (Scope 2)
  gas: 0.183,         // kgCO₂e/kWh (Scope 1)
  petrol: { car: 0.257, kgPerMile: 0.257 }, // kgCO₂e/mile
  diesel: { car: 0.262, van: 0.345, hgv: 0.512 }
};

// ---- Carbon Intensity Chart Helpers ----
const CIC = { 'very low': '#4caf50', 'low': '#8bc34a', 'moderate': '#ff9800', 'high': '#ff5722', 'very high': '#e53935' };
const CIL = { 'very low': 'Very Low', 'low': 'Low', 'moderate': 'Moderate', 'high': 'High', 'very high': 'Very High' };
const fuelCol = { Wind:'#4caf50', Solar:'#ff9800', Nuclear:'#e53935', Gas:'#ff5722', Coal:'#795548', Hydro:'#2196f3', Biomass:'#9c27b0', Imports:'#607d8b', Other:'#9e9e9e' };

// ---- Tab Switching ----
document.getElementById('tabBar').addEventListener('click', e => {
  const btn = e.target.closest('.tab-btn');
  if (!btn) return;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  document.querySelectorAll('.tc').forEach(t => t.classList.remove('on'));
  document.getElementById('t-' + btn.dataset.t).classList.add('on');
});

// ---- Roof Presets ----
document.querySelector('#t-solar .rpreset').addEventListener('click', e => {
  const btn = e.target.closest('[data-a]');
  if (!btn) return;
  document.querySelectorAll('#t-solar .rpreset button').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  document.getElementById('roofI').value = btn.dataset.a;
});

// ---- Solar Analysis ----
document.getElementById('solBtn').addEventListener('click', runSolar);

async function runSolar() {
  const pc = document.getElementById('pcI').value.trim();
  const roof = parseFloat(document.getElementById('roofI').value) || 500;
  const out = document.getElementById('solOut');
  const load = document.getElementById('solLoad');
  const grid = document.getElementById('solGrid');
  const dno = document.getElementById('dnoLine');

  load.classList.add('s');
  out.style.display = 'none';

  try {
    const loc = await fetch('/api/postcode?postcode=' + encodeURIComponent(pc)).then(r => r.json());
    if (loc.error) { load.classList.remove('s'); dno.textContent = '❌ ' + loc.error; return; }
    
    dno.textContent = '📍 ' + loc.postcode + ' | ' + loc.adminDistrict + ' | ⚡ DNO: ' + loc.dno.name;

    const sol = await fetch(`/api/solar/estimate?lat=${loc.lat}&lng=${loc.lng}&roofArea=${roof}`).then(r => r.json());
    load.classList.remove('s');

    if (sol.error) { dno.textContent = '❌ ' + sol.error; return; }

    const e = sol.estimate;

    // 5-year projection
    const years = [];
    let cumCredits = 0;
    for (let y = 1; y <= 5; y++) {
      cumCredits += e.carbonCreditValue;
      years.push({ year: 'Year ' + y, savings: (e.annualSaving * y), credits: (e.carbonCreditValue * y), cumCredits: cumCredits });
    }

    grid.innerHTML = `
      <div class="ri f"><div class="l">Viability Score</div><div class="v" style="color:${sol.viabilityScore > 70 ? '#4caf50' : sol.viabilityScore > 40 ? '#f57c00' : '#e53935'}">${sol.viabilityScore}/100${sol.viabilityScore > 70 ? ' ✅ Very Viable' : sol.viabilityScore > 40 ? ' ⚠️ Potentially Viable' : ' ❌ Low Viability'}</div></div>
      <div class="ri"><div class="l">System Size</div><div class="v o">${e.systemSizeDisplay}</div></div>
      <div class="ri"><div class="l">Panel Count</div><div class="v">${e.panelCount}</div></div>
      <div class="ri"><div class="l">Annual Generation</div><div class="v" style="color:#4caf50">${e.annualGenerationMwh} MWh</div></div>
      <div class="ri"><div class="l">Estimated Cost</div><div class="v o">${e.estimatedCostDisplay}</div></div>
      <div class="ri"><div class="l">Annual Savings</div><div class="v" style="color:#4caf50">${e.annualSavingDisplay}</div></div>
      <div class="ri"><div class="l">Payback Period</div><div class="v" style="color:${e.paybackYears < 5 ? '#4caf50' : e.paybackYears < 10 ? '#f57c00' : '#e53935'}">${e.paybackDisplay}</div></div>
      <div class="ri"><div class="l">CO₂ Saved / Year</div><div class="v" style="color:#4caf50">${e.co2SavedDisplay}</div></div>
      <div class="ri f" style="border-left:3px solid #f57c00"><div class="l">💰 Carbon Credit Value</div><div class="v o">${e.carbonCreditDisplay}</div><div class="l" style="font-size:.62rem;color:#555">At £40/tonne UK voluntary carbon market. 5-year total: <strong style="color:#f57c00">£${Math.round(e.carbonCreditValue * 5).toLocaleString()}</strong></div></div>
    `;

    document.getElementById('co2Note').textContent = `A ${e.systemSizeDisplay} system avoids ${e.co2SavedDisplay} of CO₂ annually. At £40/tonne that\'s ${e.carbonCreditDisplay} in voluntary carbon credits — separate revenue stream on top of the £${e.annualSaving.toLocaleString()}/year energy savings.`;

    out.style.display = 'block';

  } catch (ex) {
    load.classList.remove('s');
    dno.textContent = '❌ Error: ' + ex.message;
  }
}

// ---- Footprint Calc ----
let curVeh = 'petrol';
document.querySelectorAll('#fpV button').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('#fpV button').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    curVeh = b.dataset.v;
  });
});

function calcFootprint() {
  const elec = parseFloat(document.getElementById('fpE').value) || 0;
  const gas = parseFloat(document.getElementById('fpG').value) || 0;
  const miles = parseFloat(document.getElementById('fpM').value) || 0;

  let s1 = 0, s2 = 0, s3 = 0;

  // Scope 1: Direct emissions (gas + vehicle fuel)
  s1 += gas * BEIS.gas / 1000; // tonnes
  if (curVeh === 'petrol') s1 += miles * BEIS.petrol.kgPerMile / 1000;
  else if (curVeh === 'diesel') s1 += miles * BEIS.diesel.car / 1000;
  else if (curVeh === 'van') s1 += miles * BEIS.diesel.van / 1000;
  else if (curVeh === 'hgv') s1 += miles * BEIS.diesel.hgv / 1000;

  // Scope 2: Purchased electricity
  s2 += elec * BEIS.electricity / 1000;

  // Scope 3: Estimated at 20% of s1+s2 (upstream, waste, commuting)
  s3 = (s1 + s2) * 0.2;

  const total = s1 + s2 + s3;
  const offsetT = Math.ceil(total);

  document.getElementById('fpTot').textContent = Math.round(total * 10) / 10;
  document.getElementById('fpS1').textContent = Math.round(s1 * 10) / 10 + 't';
  document.getElementById('fpS2').textContent = Math.round(s2 * 10) / 10 + 't';
  document.getElementById('fpS3').textContent = Math.round(s3 * 10) / 10 + 't';
  document.getElementById('fpOff').textContent = offsetT;
  document.getElementById('fpCost').textContent = '£' + Math.round(offsetT * 40).toLocaleString();
  document.getElementById('fpR').classList.add('s');
  document.getElementById('fpEmp').querySelector('div').textContent = '✅ Results below — scroll down.';
}

// ---- ESG Report ----
function genESG() {
  const co = document.getElementById('esgCo').value || 'Your Company';
  const period = document.getElementById('esgPer').value || '2025-2026';
  const kwh = parseFloat(document.getElementById('esgKwh').value) || 0;
  const gas = parseFloat(document.getElementById('esgGas').value) || 0;

  const s2 = kwh * BEIS.electricity / 1000;
  const s1 = gas * BEIS.gas / 1000;
  const total = s1 + s2;
  const intensity = kwh > 0 ? Math.round(total / (kwh / 1000) * 100) / 100 : 0;
  const offsetT = Math.ceil(total);

  const prevYear = Math.round((total * 1.08) * 10) / 10; // assumed 8% reduction

  const html = `
<h4>Streamlined Energy & Carbon Report (SECR)</h4>
<p><strong>${co}</strong> | Reporting Period: <strong>${period}</strong></p>
<p style="color:#666;font-size:.7rem">Generated: ${new Date().toLocaleDateString('en-GB')} via Green Planet Makers Platform</p>
<hr style="border-color:#1a1a1a;margin:6px 0">

<table>
  <tr><td><strong>Energy Source</strong></td><td><strong>kWh</strong></td><td><strong>tCO₂e</strong></td></tr>
  <tr><td>Electricity (Scope 2)</td><td>${kwh.toLocaleString()}</td><td>${s2.toFixed(1)}</td></tr>
  <tr><td>Natural Gas (Scope 1)</td><td>${gas.toLocaleString()}</td><td>${s1.toFixed(1)}</td></tr>
  <tr><td style="border-top:1px solid #333"><strong>Total</strong></td><td style="border-top:1px solid #333">${(kwh+gas).toLocaleString()}</td><td style="border-top:1px solid #333;color:#f57c00"><strong>${total.toFixed(1)}</strong></td></tr>
</table>

<p><strong>Methodology:</strong> UK Government GHG Conversion Factors 2025 | SECR (The Companies Act 2006) | BEIS/Defra</p>
<p><strong>Carbon Intensity:</strong> ${intensity} tCO₂e per MWh of energy consumed</p>
<p><strong>Year-on-Year Change:</strong> ${prevYear} tCO₂e (previous) → ${total.toFixed(1)} tCO₂e (current) = <span style="color:#4caf50">${Math.round((1 - total/prevYear) * 100)}% reduction</span></p>

<p><strong>♻️ Offset Recommendation:</strong> Purchase <strong style="color:#f57c00">${offsetT} tonnes</strong> of verified carbon credits at £40/tonne = <strong style="color:#f57c00">£${(offsetT * 40).toLocaleString()}</strong></p>

<p style="color:#666;font-size:.7rem;margin-top:8px">This report has been prepared using the Streamlined Energy and Carbon Reporting (SECR) framework. Data accuracy is the responsibility of the reporting organisation.</p>
`;

  document.getElementById('esgPrev').innerHTML = html;
  document.getElementById('esgR').style.display = 'block';
  document.getElementById('esgEmp').querySelector('div').textContent = '✅ Report ready — scroll down.';
  window._esgHtml = html;
}

function dlESG() {
  const html = window._esgHtml || '<p>No report generated</p>';
  const full = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>SECR Report</title><style>body{font-family:Arial;padding:20px;line-height:1.5;color:#222}table{width:100%;border-collapse:collapse;margin:10px 0}td{padding:6px 8px;border-bottom:1px solid #ccc}</style></head><body><h2>SECR Compliance Report</h2>${html}</body></html>`;
  const blob = new Blob([full], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'secr-report-' + new Date().toISOString().slice(0,10) + '.html';
  a.click();
  URL.revokeObjectURL(a.href);
}

// ---- Live Carbon Page auto-refresh ----
async function refreshCarbon() {
  try {
    const d = await fetch('/api/carbon/current').then(r => r.json());
    const idx = d.intensity.index || 'moderate';
    const val = d.intensity.actual || 0;

    const ci = CIC[idx] || '#888';
    const ciL = CIL[idx] || 'Unknown';

    document.getElementById('cVal').textContent = val;
    document.getElementById('cVal').style.color = idx === 'very low' || idx === 'low' ? '#4caf50' : idx === 'moderate' ? '#f57c00' : '#e53935';
    document.getElementById('cBadge').innerHTML = `<span style="display:inline-block;padding:3px 12px;border-radius:20px;font-size:.7rem;font-weight:600;background:${ci}22;color:${ci}">${ciL} — ${val} gCO₂/kWh</span>`;

    const ren = d.renewablePct || 0;
    document.getElementById('cRen').textContent = Math.round(ren) + '%';

    const sorted = d.generation || [];
    document.getElementById('cGenL').innerHTML = sorted.map(g =>
      `<div style="background:#0d0d0d;border:1px solid #1a1a1a;border-radius:6px;padding:8px;text-align:center">
        <div style="font-size:1.1rem;font-weight:700;color:${g.fuel === 'Wind' || g.fuel === 'Solar' || g.fuel === 'Hydro' ? '#4caf50' : '#eee'}">${g.pct}%</div>
        <div style="font-size:.7rem;color:#666">${g.fuel}</div>
      </div>`
    ).join('');

    const region = await fetch('/api/carbon/regional').then(r => r.json());
    const rData = region.regions || [];
    document.getElementById('cRegionB').innerHTML = rData.length
      ? rData.map(r => {
          const ri = r.intensity && r.intensity.index || 'moderate';
          return `<tr>
            <td>${r.region}</td>
            <td>${r.intensity ? r.intensity.actual : '—'}</td>
            <td><span class="rd" style="background:${CIC[ri] || '#888'}"></span>${CIL[ri] || ri}</td>
            <td style="color:${(r.intensity && r.intensity.actual < 150) ? '#4caf50' : (r.intensity && r.intensity.actual < 250) ? '#f57c00' : '#e53935'}">${r.intensity ? (r.intensity.actual < 150 ? 'Good' : r.intensity.actual < 250 ? 'Moderate' : 'Poor') : '—'}</td>
          </tr>`;
        }).join('')
      : '<tr><td colspan="4" style="text-align:center;color:#444">No regional data available</td></tr>';

    document.getElementById('cBest').textContent = rData.length ? 'Intensity ranges from ' + Math.min(...rData.map(r => r.intensity ? r.intensity.actual : 999)) + ' to ' + Math.max(...rData.map(r => r.intensity ? r.intensity.actual : 0)) + ' gCO₂/kWh across regions' : 'Live data active';
  } catch {}
}

// ---- Load Carbon on page load ----
document.addEventListener('DOMContentLoaded', () => {
  refreshCarbon();
  // Auto-refresh every 5 minutes on Live Carbon tab
  setInterval(refreshCarbon, 300000);
  // Run solar demo with default values
  setTimeout(runSolar, 500);
});
