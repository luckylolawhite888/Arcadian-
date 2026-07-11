#!/usr/bin/env node
/**
 * Run Discovery Scan Script
 * 
 * Usage: node scripts/run-discovery.js [postcode]
 * Example: node scripts/run-discovery.js SW1A  (scans Westminster)
 *          node scripts/run-discovery.js         (scans default list)
 */

const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const { runScan } = require('../src/engines/discovery');

// Default postcode districts to scan (commercial-heavy areas)
const DEFAULT_POSTCODES = [
  'EC1A', 'EC2A', 'EC3A', 'EC4A',  // City of London financial
  'SW1A', 'SW1E', 'SW1P', 'SW1W',  // Westminster
  'W1B', 'W1D', 'W1F', 'W1G',      // West End
  'UB3', 'UB4', 'UB5',              // Heathrow area (industrial estates)
  'HA0', 'HA1', 'HA2', 'HA3',       // Harrow commercial
  'TW7', 'TW8',                      // Brentford/Isleworth industrial
  'WD6', 'WD7',                      // Borehamwood (film/TV studios)
  'RM9', 'RM10', 'RM11',            // Dagenham industrial
  'E14', 'E16',                      // Canary Wharf + Docklands
];

async function main() {
  const postcode = process.argv[2];
  
  if (postcode) {
    // Scan single postcode
    console.log(`\n🔦 Scanning single postcode: ${postcode}`);
    const leads = await runScan(postcode);
    printSummary(leads);
  } else {
    // Scan default list
    console.log(`\n🗺️ Scanning ${DEFAULT_POSTCODES.length} target postcodes...`);
    let allLeads = [];
    
    for (const pc of DEFAULT_POSTCODES) {
      try {
        const leads = await runScan(pc);
        allLeads = allLeads.concat(leads);
      } catch (e) {
        console.error(`\n❌ Fatal error scanning ${pc}:`, e.message);
      }
    }
    
    printSummary(allLeads);
    
    // Stats
    const hot = allLeads.filter(l => l.classification === 'hot');
    const warm = allLeads.filter(l => l.classification === 'warm');
    const cold = allLeads.filter(l => l.classification === 'cold');
    
    console.log(`\n🏁 ${'═'.repeat(50)}`);
    console.log(`🏁 FULL SCAN COMPLETE`);
    console.log(`🏁 Total leads generated: ${allLeads.length}`);
    console.log(`🏁 HOT: ${hot.length} | WARM: ${warm.length} | COLD: ${cold.length}`);
    console.log(`🏁 Est. total project value: £${allLeads.reduce((s, l) => s + l.estimated_value, 0).toLocaleString()}`);
    
    // Top leads
    console.log(`\n🥇 TOP 10 LEADS:`);
    allLeads.sort((a, b) => b.score - a.score).slice(0, 10).forEach((l, i) => {
      console.log(`  ${i + 1}. [${l.score}pts] ${l.company_name} — ${l.property_address}`);
      console.log(`     ${l.kwp}kWp | £${l.annual_savings.toLocaleString()}/yr savings | ${l.payback_years}yr payback`);
    });
  }
}

function printSummary(leads) {
  const hot = leads.filter(l => l.classification === 'hot');
  const warm = leads.filter(l => l.classification === 'warm');
  const cold = leads.filter(l => l.classification === 'cold');
  
  console.log(`\n📊 Results: ${leads.length} total`);
  console.log(`   🔥 HOT: ${hot.length}`);
  console.log(`   🔶 WARM: ${warm.length}`);
  console.log(`   🔵 COLD: ${cold.length}`);
  
  if (leads.length > 0) {
    const avgScore = leads.reduce((s, l) => s + l.score, 0) / leads.length;
    const totalValue = leads.reduce((s, l) => s + l.estimated_value, 0);
    console.log(`   📈 Avg score: ${avgScore.toFixed(1)}`);
    console.log(`   💰 Est. total value: £${totalValue.toLocaleString()}`);
  }
}

main().catch(console.error);
