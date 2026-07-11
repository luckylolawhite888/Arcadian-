/**
 * Discovery Engine — SQLite version
 */
const db = require('../database/pool');
const crypto = require('crypto');
const osm = require('../api/osm');
const propertydata = require('../api/propertydata');
const companieshouse = require('../api/companieshouse');
const solar = require('../api/solar');

const COMMERCIAL_USE_CLASSES = ['B2', 'B8', 'E', 'C1', 'C2', 'B1', 'D1', 'D2', 'Sg', 'Su'];
const MIN_FLOOR_AREA_M2 = 150;
const KW_PER_SQM = 1 / 6;
const INSTALL_COST_PER_KWP = 1200;
const COMMERCIAL_RATE_PER_KWH = 0.25;
const SEG_RATE_PER_KWH = 0.08;
const CO2_PER_KWH = 0.212;
const CARBON_CREDIT_PER_TONNE = 40;

function uuid() { return crypto.randomUUID(); }

/**
 * Run a full discovery scan for a postcode district
 */
async function runScan(postcode) {
  const startTime = Date.now();
  const scanId = uuid();
  console.log(`\n🔍 SCANNING: ${postcode}`);
  console.log('═'.repeat(50));

  try {
    // Step 1: Geocode postcode
    const geo = await osm.geocodePostcode(postcode);
    
    // Step 2: Find commercial buildings via OpenStreetMap (FREE)
    const commercialProperties = await osm.findCommercialBuildings(geo.lat, geo.lon, 1500);
    console.log(`  🏢 Commercial properties found via OSM: ${commercialProperties.length}`);
    
    if (commercialProperties.length === 0) {
      logScan(scanId, postcode, 0, 0, 0, 'no_commercial', startTime);
      return [];
    }

    // Process each property
    const leads = [];
    for (let i = 0; i < commercialProperties.length; i++) {
      const prop = commercialProperties[i];
      console.log(`\n  📍 Property ${i + 1}/${commercialProperties.length}: ${prop.address || 'Unknown'}`);

      try {
        const lead = await processProperty(prop);
        if (lead) {
          leads.push(lead);
          console.log(`  ✅ Lead: ${lead.company_name || 'Unknown'} — Score: ${lead.score} [${lead.classification}]`);
          console.log(`     ${lead.kwp}kWp | £${lead.annual_savings.toLocaleString()}/yr savings | ${lead.payback_years}yr payback`);
        } else {
          console.log(`  ⏭️ No lead generated`);
        }
      } catch (e) {
        console.error(`  ❌ Error processing property: ${e.message}`);
      }
    }

    logScan(scanId, postcode, commercialProperties.length, leads.filter(l => l.company_name !== 'Unknown').length, leads.length, 'complete', startTime);

    console.log(`\n${'═'.repeat(50)}`);
    console.log(`🎯 SCAN COMPLETE: ${postcode}`);
    console.log(`   Properties: ${commercialProperties.length} → Leads: ${leads.length}`);
    
    const hot = leads.filter(l => l.classification === 'hot').length;
    const warm = leads.filter(l => l.classification === 'warm').length;
    console.log(`   🔥 HOT: ${hot} | 🔶 WARM: ${warm} | 🔵 COLD: ${leads.length - hot - warm}`);

    return leads;
  } catch (e) {
    console.error(`❌ Scan error for ${postcode}:`, e.message);
    logScan(scanId, postcode, 0, 0, 0, 'error', startTime, e.message);
    return [];
  }
}

async function processProperty(propData) {
  const prop = saveProperty(propData);
  if (!prop) return null;

  // Match to company
  const companyMatch = await matchToCompany(propData);
  let company = null;
  let ownershipScore = 40;

  if (companyMatch) {
    company = saveCompany(companyMatch);
    linkPropertyCompany(prop.id, company.id, 'owner-occupier', 70);
    ownershipScore = 80;
  }

  // Solar assessment
  const assessment = await assessSolar(prop, company);
  if (!assessment) return null;

  // Electricity estimate
  const electricity = estimateElectricity(company, db);

  // Financial assessment
  const financial = assessFinancial(company);

  // Composite score
  const score = calculateScore({
    ownershipScore,
    electricityScore: electricity.score,
    solarScore: assessment.solarScore,
    financialScore: financial.score,
    multisiteScore: 0,
    engagementScore: 0
  });

  // Save lead
  const lead = saveLead({
    propertyId: prop.id,
    companyId: company?.id || null,
    solarAssessmentId: assessment.id,
    score
  });

  return {
    id: lead?.id,
    property_address: prop.address_line_1,
    postcode: prop.postcode,
    company_name: company?.company_name || 'Unknown',
    score: score.final,
    classification: score.classification,
    kwp: Math.round(assessment.kwp),
    annual_savings: Math.round(assessment.annual_savings_gbp),
    payback_years: assessment.payback_years,
    co2_saved: Math.round(assessment.co2_saved_tonnes),
    estimated_value: score.estimatedProjectValue
  };
}

function saveProperty(data) {
  try {
    const useClass = (data.use_class || '').toUpperCase().trim();
    const floorArea = parseFloat(data.floor_area_m2) || 200;
    const id = uuid();
    
    // Check if exists (by OSM id or address)
    const existing = db.prepare('SELECT id FROM properties WHERE uprn = ? OR (address_line_1 = ? AND postcode = ?) LIMIT 1').get(String(data.osm_id || ''), data.address || '', data.postcode || '');
    if (existing) return { id: existing.id, address_line_1: data.address, postcode: data.postcode, floor_area_m2: floorArea, latitude: data.latitude, longitude: data.longitude };

    db.prepare(`
      INSERT INTO properties (id, uprn, address_line_1, town, postcode, property_type, use_class, floor_area_m2, latitude, longitude, raw_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, String(data.osm_id || ''), data.address || null, data.town || null, data.postcode || null, data.property_type || 'commercial', useClass, floorArea, data.latitude || null, data.longitude || null, JSON.stringify(data));
    
    return { id, address_line_1: data.address, postcode: data.postcode, floor_area_m2: floorArea, latitude: data.latitude, longitude: data.longitude };
  } catch (e) {
    console.error(`  ❌ DB save property: ${e.message}`);
    return null;
  }
}

async function matchToCompany(propData) {
  const address = (propData.address || '').toLowerCase();
  const postcode = (propData.postcode || '').toLowerCase();
  if (!postcode) return null;

  try {
    const chResults = await companieshouse.searchByAddress(postcode);
    if (chResults?.items) {
      for (const item of chResults.items) {
        const regAddress = ((item.address?.premises || '') + ' ' + (item.address?.address_line_1 || '')).toLowerCase();
        const regPostcode = (item.address?.postal_code || '').toLowerCase();
        
        if (regPostcode === postcode && isSimilarAddress(address, regAddress)) {
          const company = await companieshouse.getCompany(item.company_number);
          if (company && company.company_status === 'active') {
            return company;
          }
        }
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

function isSimilarAddress(addr1, addr2) {
  const words1 = new Set(addr1.replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(addr2.replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 3));
  if (words1.size === 0 || words2.size === 0) return false;
  let matches = 0;
  for (const w of words1) { if (words2.has(w)) matches++; }
  return matches >= Math.min(words1.size, words2.size) * 0.5;
}

function saveCompany(chData) {
  try {
    const num = chData.company_number;
    const id = uuid();
    const existing = db.prepare('SELECT id FROM companies WHERE company_number = ?').get(num);
    if (existing) return { id: existing.id, company_name: chData.company_name, sic_code: chData.sic_codes?.[0], years_trading: 0 };

    const address = chData.registered_office_address
      ? `${chData.registered_office_address.premises || ''} ${chData.registered_office_address.address_line_1 || ''}, ${chData.registered_office_address.locality || ''}, ${chData.registered_office_address.postal_code || ''}`
      : null;

    const incorporationDate = chData.date_of_creation || null;
    const yearsTrading = incorporationDate ? Math.floor((Date.now() - new Date(incorporationDate).getTime()) / (365.25 * 86400000)) : 0;

    db.prepare(`
      INSERT INTO companies (id, company_number, company_name, registered_address, sic_code, incorporation_date, status, years_trading, raw_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, num, chData.company_name || null, address, chData.sic_codes?.[0] || null, incorporationDate, chData.company_status || 'unknown', yearsTrading, JSON.stringify(chData));

    return { id, company_name: chData.company_name, sic_code: chData.sic_codes?.[0], years_trading: yearsTrading };
  } catch (e) {
    console.error(`  ❌ DB save company: ${e.message}`);
    return null;
  }
}

function linkPropertyCompany(propId, companyId, type, confidence) {
  try {
    const id = uuid();
    db.prepare(`
      INSERT OR IGNORE INTO property_companies (id, property_id, company_id, relationship_type, confidence_score)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, propId, companyId, type, confidence);
  } catch (e) {}
}

async function assessSolar(prop, company) {
  try {
    const floorArea = parseFloat(prop.floor_area_m2) || 200;
    const postcode = prop.postcode || (company?.address_line_1 || '').split(', ').pop() || '';
    
    // Use the new static solar assessment
    const result = solar.assessSolarPotential(floorArea, postcode);
    const kwp = result.estimated_kwp;

    if (kwp < 15) {
      console.log(`  ⏭️ Too small: ${kwp.toFixed(1)} kWp (min 15kWp)`);
      return null;
    }
    
    const peakSunHours = result.peak_sun_hours;
    const annualKwh = result.annual_generation_kwh;
    const totalAnnualBenefit = result.annual_savings_gbp;
    const systemCost = result.installation_cost_gbp;
    const paybackYears = result.payback_years;
    const co2Saved = result.co2_saved_tonnes;
    const carbonValue = co2Saved * CARBON_CREDIT_PER_TONNE;
    const roi25 = ((totalAnnualBenefit * 25) - systemCost) / systemCost * 100;

    const solarScore = Math.min(100, Math.round(
      (kwp / 200) * 30 + (annualKwh / 500000) * 30 + Math.max(0, 40 - paybackYears * 3)
    ));

    const id = uuid();
    db.prepare(`
      INSERT INTO solar_assessments 
        (id, property_id, peak_sun_hours, estimated_kwp, annual_generation_kwh, self_consumption_pct,
         annual_savings_gbp, system_cost_gbp, payback_years, roi_25yr_pct, co2_saved_tonnes, carbon_credit_value_gbp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, prop.id, peakSunHours, kwp, Math.round(annualKwh), 70,
      totalAnnualBenefit, systemCost, paybackYears, Math.round(roi25 * 10) / 10, co2Saved, Math.round(carbonValue));

    return {
      id, kwp: Math.round(kwp),
      annual_savings_gbp: totalAnnualBenefit,
      payback_years: paybackYears,
      co2_saved_tonnes: co2Saved,
      solarScore
    };
  } catch (e) {
    console.error(`  ❌ Solar assessment: ${e.message}`);
    return null;
  }
}

const { estimateElectricity, assessFinancial, calculateScore } = require('./scoring');

function saveLead(data) {
  try {
    const id = uuid();
    db.prepare(`
      INSERT INTO leads (id, property_id, company_id, solar_assessment_id, lead_score,
        ownership_score, electricity_score, solar_score, financial_score,
        status, estimated_project_value_gbp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.propertyId, data.companyId, data.solarAssessmentId,
      data.score.final, data.score.ownershipScore, data.score.electricityScore,
      data.score.solarScore, data.score.financialScore, data.score.classification,
      data.score.estimatedProjectValue);
    return { id };
  } catch (e) {
    console.error(`  ❌ Save lead: ${e.message}`);
    return null;
  }
}

function logScan(id, postcode, found, matched, leads, status, startTime, error) {
  try {
    db.prepare(`
      INSERT INTO scan_logs (id, scan_type, postcode, properties_found, companies_matched, leads_generated, status, duration_seconds, error_message)
      VALUES (?, 'discovery', ?, ?, ?, ?, ?, ?, ?)
    `).run(id, postcode, found, matched, leads, status, Math.round((Date.now() - startTime) / 1000), error || null);
  } catch (e) {
    console.error('Log error:', e.message);
  }
}

module.exports = { runScan };
