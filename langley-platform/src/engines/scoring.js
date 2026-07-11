/**
 * Scoring Engine for Langley Solar Discovery
 * Separated from discovery.js for maintainability
 */
const crypto = require('crypto');
function uuid() { return crypto.randomUUID(); }

const COMMERCIAL_RATE_PER_KWH = 0.25;

function estimateElectricity(company, db) {
  if (!company) return { score: 40, estimated_kwh: 75000, estimated_spend: 18750 };

  const intensityMap = {
    manufacturing: { intensity: 0.25, category: 'Manufacturing', daytime: 75 },
    warehouse: { intensity: 0.12, category: 'Warehousing', daytime: 70 },
    retail: { intensity: 0.10, category: 'Retail', daytime: 80 },
    hospitality: { intensity: 0.09, category: 'Hospitality', daytime: 65 },
    office: { intensity: 0.05, category: 'Office', daytime: 60 },
    education: { intensity: 0.10, category: 'Education', daytime: 70 },
    healthcare: { intensity: 0.08, category: 'Healthcare', daytime: 70 },
    other: { intensity: 0.07, category: 'Other', daytime: 60 }
  };

  const sic = company.sic_code || '';
  let category = 'other';
  if (sic.match(/^(10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33)/)) category = 'manufacturing';
  else if (sic.match(/^52/)) category = 'warehouse';
  else if (sic.match(/^(55|56)/)) category = 'hospitality';
  else if (sic.match(/^(68|69|70|71|77|78|79|80|81|82)/)) category = 'office';
  else if (sic.match(/^85/)) category = 'education';
  else if (sic.match(/^(86|87|88)/)) category = 'healthcare';
  else if (sic.match(/^(45|46|47)/)) category = 'retail';

  const config = intensityMap[category];
  const turnover = company.turnover || 500000;
  const estimatedKwh = Math.round(turnover * config.intensity);
  const estimatedSpend = Math.round(estimatedKwh * COMMERCIAL_RATE_PER_KWH);

  let score = Math.min(100, Math.round(
    Math.min(estimatedSpend / 1500, 45) +
    (config.intensity > 0.12 ? 25 : config.intensity > 0.08 ? 18 : 10) +
    (category === 'manufacturing' || category === 'warehouse' ? 20 : 0)
  ));

  if (db) {
    try {
      const id = uuid();
      db.prepare(`
        INSERT OR REPLACE INTO electricity_estimates (id, company_id, sic_code, industry_category, estimated_annual_kwh, estimated_annual_spend_gbp, daytime_usage_pct, energy_intensity, score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, company.id, sic, config.category, estimatedKwh, estimatedSpend, config.daytime, config.intensity > 0.12 ? 'high' : 'medium', score);
    } catch (e) {}
  }

  return { score, estimated_kwh: estimatedKwh, estimated_spend: estimatedSpend };
}

function assessFinancial(company) {
  if (!company) return { score: 35, health: 'unknown' };
  
  const age = company.years_trading || 0;
  const type = (company.company_type || '').toLowerCase();
  const status = (company.company_status || '').toLowerCase();
  
  let score = 15;
  if (age >= 20) score += 35;
  else if (age >= 10) score += 28;
  else if (age >= 5) score += 20;
  else if (age >= 2) score += 12;
  
  if (type.includes('ltd') || type.includes('plc')) score += 10;
  if (type.includes('plc')) score += 5;
  if (status === 'active') score += 15;
  
  const name = (company.company_name || '').toLowerCase();
  if (name.includes('group') || name.includes('holdings') || name.includes('corporation')) score += 8;
  if (name.includes('limited')) score += 5;
  
  return {
    score: Math.min(100, score),
    health: score >= 65 ? 'strong' : score >= 45 ? 'good' : score >= 30 ? 'fair' : 'poor',
    age, type
  };
}

function calculateScore(scores) {
  const get = (v, def = 10) => (v !== undefined && v !== null) ? v : def;
  const final = Math.round(
    get(scores.ownershipScore) * 0.25 +
    get(scores.electricityScore, 25) * 0.25 +
    get(scores.solarScore) * 0.20 +
    get(scores.financialScore, 20) * 0.15 +
    (scores.multisiteScore || 0) * 0.10 +
    (scores.engagementScore || 0) * 0.05
  );

  let classification, estimatedProjectValue;
  if (final >= 65) {
    classification = 'hot';
    estimatedProjectValue = 75000 + Math.round(Math.random() * 100000);
  } else if (final >= 42) {
    classification = 'warm';
    estimatedProjectValue = 35000 + Math.round(Math.random() * 50000);
  } else {
    classification = 'cold';
    estimatedProjectValue = 15000 + Math.round(Math.random() * 20000);
  }

  return { final, classification, estimatedProjectValue, ...scores };
}

module.exports = { estimateElectricity, assessFinancial, calculateScore };
