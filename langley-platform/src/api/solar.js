/**
 * Solar Assessment Engine
 * Uses UK-specific irradiance data (no API key needed)
 * 
 * UK average peak sun hours by region:
 *   - South England (London): ~3.8 hrs/day
 *   - Midlands: ~3.4 hrs/day
 *   - North England: ~3.0 hrs/day
 *   - Scotland: ~2.8 hrs/day
 */

const REGION_PSH = {
  'south': 3.8,
  'midlands': 3.4,
  'north': 3.0,
  'scotland': 2.8
};

// UK postcode → region mapping (first letter)
const POSTCODE_REGION = {
  'E': 'south', 'EC': 'south', 'N': 'south', 'NW': 'south',
  'SE': 'south', 'SW': 'south', 'W': 'south', 'WC': 'south',
  'BR': 'south', 'CR': 'south', 'DA': 'south', 'EN': 'south',
  'HA': 'south', 'IG': 'south', 'KT': 'south', 'RM': 'south',
  'SM': 'south', 'TN': 'south', 'UB': 'south', 'WD': 'south',
  'AL': 'midlands', 'B': 'midlands', 'CV': 'midlands', 'DE': 'midlands',
  'DY': 'midlands', 'LE': 'midlands', 'LN': 'midlands', 'MK': 'midlands',
  'NN': 'midlands', 'NG': 'midlands', 'OX': 'midlands', 'PE': 'midlands',
  'ST': 'midlands', 'TF': 'midlands', 'WR': 'midlands', 'WS': 'midlands',
  'WV': 'midlands',
  'BB': 'north', 'BD': 'north', 'BL': 'north', 'CA': 'north',
  'CH': 'north', 'CW': 'north', 'DH': 'north', 'DL': 'north',
  'DN': 'north', 'FY': 'north', 'HD': 'north', 'HG': 'north',
  'HU': 'north', 'HX': 'north', 'L': 'north', 'LA': 'north',
  'LS': 'north', 'M': 'north', 'NE': 'north', 'OL': 'north',
  'PR': 'north', 'S': 'north', 'SK': 'north', 'SR': 'north',
  'TS': 'north', 'WA': 'north', 'WF': 'north', 'WN': 'north',
  'YO': 'north',
  'AB': 'scotland', 'DD': 'scotland', 'DG': 'scotland', 'EH': 'scotland',
  'FK': 'scotland', 'G': 'scotland', 'HS': 'scotland', 'IV': 'scotland',
  'KA': 'scotland', 'KW': 'scotland', 'KY': 'scotland', 'ML': 'scotland',
  'PA': 'scotland', 'PH': 'scotland', 'TD': 'scotland', 'ZE': 'scotland'
};

/**
 * Get solar assessment for a commercial property
 * @param {number} roofAreaM2 - Available roof area in m²
 * @param {string} postcode - UK postcode for irradiance lookup
 * @returns {object} Solar assessment results
 */
function assessSolarPotential(roofAreaM2, postcode = '') {
  // Determine usable roof area (60-70% of floor area, accounting for obstructions/shading)
  const usableRoofArea = roofAreaM2 * 0.65;

  // Modern commercial panels: ~400Wp each, ~2m² each
  const panelWattage = 0.4; // kWp
  const panelArea = 2; // m²
  const maxPanels = Math.floor(usableRoofArea / panelArea);
  const maxKwp = maxPanels * panelWattage;

  // Cap at realistic commercial system sizes
  const kwp = Math.min(maxKwp, 500);

  // Get peak sun hours for the region
  const outcode = (postcode || '').trim().toUpperCase().split(' ')[0] || '';
  const regionKey = Object.entries(POSTCODE_REGION)
    .find(([prefix]) => outcode.startsWith(prefix));
  const region = regionKey ? regionKey[1] : 'midlands';
  const psh = REGION_PSH[region] || 3.4;

  // Annual generation (kWh)
  const annualKwh = kwp * psh * 365 * 0.82; // 82% system efficiency
  
  // Commercial electricity rate ~13p/kWh (avoids ~15p/kWh import)
  const electricityRate = 0.13; // £/kWh
  const annualSavings = Math.round(annualKwh * electricityRate);

  // Estimated installation cost: ~£900/kWp for commercial roof
  const installationCost = kwp * 900;
  
  // Payback period
  const paybackYears = installationCost / (annualSavings || 1);

  // CO₂ savings: ~0.193 kg CO₂/kWh (UK grid average)
  const co2Kg = annualKwh * 0.193;
  const co2Tonnes = Math.round(co2Kg / 1000);

  // 25-year generation
  const lifetimeGeneration = annualKwh * 25 * 0.85; // 0.5% annual degradation
  const lifetimeSavings = Math.round(lifetimeGeneration * electricityRate);

  return {
    roof_area_m2: Math.round(roofAreaM2),
    usable_roof_m2: Math.round(usableRoofArea),
    panel_count: maxPanels,
    estimated_kwp: Math.round(kwp * 10) / 10,
    peak_sun_hours: psh,
    region,
    annual_generation_kwh: Math.round(annualKwh),
    annual_savings_gbp: annualSavings,
    payback_years: Math.round(paybackYears * 10) / 10,
    co2_saved_tonnes: co2Tonnes,
    installation_cost_gbp: Math.round(installationCost),
    lifetime_savings_gbp: lifetimeSavings,
    lifetime_generation_kwh: Math.round(lifetimeGeneration)
  };
}

module.exports = { assessSolarPotential };
