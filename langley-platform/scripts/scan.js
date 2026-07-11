#!/usr/bin/env node
/**
 * Quick scan runner
 * Usage: node scripts/scan.js E14 (single postcode)
 *        node scripts/scan.js      (runs demo on 3 postcodes)
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('../src/database/init');

const { runScan } = require('../src/engines/discovery');

const postcode = process.argv[2];

async function main() {
  if (postcode) {
    const leads = await runScan(postcode.toUpperCase());
    printResults(leads);
  } else {
    const targets = ['E14', 'UB3', 'RM9']; // Docklands, Heathrow industrial, Dagenham
    console.log(`\n🗺️ DEMO: Scanning ${targets.length} commercial areas...`);
    let all = [];
    for (const pc of targets) {
      const leads = await runScan(pc);
      all = all.concat(leads);
    }
    
    if (all.length > 0) {
      printResults(all);
      console.log(`\n🏁 TOTAL: ${all.length} leads`);
      console.log(`🏁 Portfolio: £${all.reduce((s, l) => s + (l.estimated_value || 0), 0).toLocaleString()}`);
      
      // Top 5
      console.log(`\n🥇 TOP LEADS:`);
      all.sort((a, b) => b.score - a.score).slice(0, 5).forEach((l, i) => {
        console.log(`  ${i+1}. [${l.score}pts] ${l.company_name} — ${l.property_address}`);
        console.log(`     ${l.kwp}kWp | £${l.annual_savings.toLocaleString()}/yr | ${l.payback_years}yr payback`);
      });
    }
  }
}

function printResults(leads) {
  const hot = leads.filter(l => l.classification === 'hot');
  const warm = leads.filter(l => l.classification === 'warm');
  const cold = leads.filter(l => l.classification === 'cold');
  console.log(`\n📊 ${leads.length} leads | 🔥${hot.length} 🔶${warm.length} 🔵${cold.length}`);
}

main().catch(console.error);
