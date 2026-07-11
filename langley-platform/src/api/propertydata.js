/**
 * PropertyData API Client v2 — fixed endpoint list
 */
const fetch = require('node-fetch');

const BASE = 'https://api.propertydata.co.uk';
const API_KEY = process.env.PROPERTYDATA_KEY;
let lastCall = 0;

async function callEndpoint(endpoint, params = {}) {
  // Rate limit: max 4 calls per 10 seconds
  const now = Date.now();
  const wait = Math.max(0, 2000 - (now - lastCall));
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastCall = Date.now();

  const url = new URL(`${BASE}${endpoint}`);
  url.searchParams.set('key', API_KEY);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });

  const start = Date.now();
  const res = await fetch(url.toString());
  const data = await res.json();
  const took = Date.now() - start;

  if (data.status === 'error') {
    console.error(`  ❌ PropertyData ${endpoint}: ${data.message || data.code}`);
    return null;
  }

  console.log(`  📊 PropertyData ${endpoint} → ${took}ms`);
  return data;
}

/**
 * Get sold prices for area (gives indication of commercial activity)
 */
async function getSoldPrices(postcode) {
  return callEndpoint('/sold-prices', { postcode });
}

/**
 * Get commercial property valuation
 */
async function getCommercialValuation(postcode, propertyType = 'office') {
  return callEndpoint('/valuation-commercial-sale', { postcode, property_type: propertyType });
}

/**
 * Get floor areas for a full postcode
 */
async function getFloorAreas(postcode) {
  return callEndpoint('/floor-areas', { postcode });
}

/**
 * Get title info for a specific UPRN
 */
async function getTitle(uprn) {
  return callEndpoint('/title', { uprn });
}

/**
 * Get energy efficiency data
 */
async function getEnergyEfficiency(postcode) {
  return callEndpoint('/energy-efficiency', { postcode });
}

/**
 * Get demographics for an area
 */
async function getDemographics(postcode) {
  return callEndpoint('/demographics', { postcode });
}

module.exports = {
  getSoldPrices,
  getCommercialValuation,
  getFloorAreas,
  getTitle,
  getEnergyEfficiency,
  getDemographics
};
