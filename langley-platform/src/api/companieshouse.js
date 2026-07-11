/**
 * Companies House API Client
 * https://developer.company-information.service.gov.uk/
 */
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const BASE = 'https://api.company-information.service.gov.uk';
const API_KEY = process.env.COMPANIES_HOUSE_KEY;

// Rate limiting: 600 requests per 5 minutes
let requestTimestamps = [];
const RATE_LIMIT = 600;
const RATE_WINDOW_MS = 5 * 60 * 1000;

async function rateLimitWait() {
  const now = Date.now();
  requestTimestamps = requestTimestamps.filter(t => now - t < RATE_WINDOW_MS);
  if (requestTimestamps.length >= RATE_LIMIT) {
    const oldest = requestTimestamps[0];
    const waitMs = RATE_WINDOW_MS - (now - oldest) + 100;
    console.log(`  ⏳ Rate limit: waiting ${Math.round(waitMs / 1000)}s...`);
    await new Promise(r => setTimeout(r, waitMs));
  }
  requestTimestamps.push(Date.now());
}

async function callAPI(path) {
  await rateLimitWait();
  
  const url = `${BASE}${path}`;
  const auth = Buffer.from(`${API_KEY}:`).toString('base64');
  
  const start = Date.now();
  const res = await fetch(url, {
    headers: { 'Authorization': `Basic ${auth}` }
  });
  const took = Date.now() - start;

  if (res.status === 404) {
    console.log(`  🔍 CH ${path} → 404 (not found)`);
    return null;
  }
  if (!res.ok) {
    console.error(`❌ CH ${path} → ${res.status}: ${res.statusText}`);
    return null;
  }

  const data = await res.json();
  console.log(`  📊 CH ${path} → ${took}ms`);
  return data;
}

/**
 * Search for companies by name
 */
async function searchCompanies(query, itemsPerPage = 20) {
  return callAPI(`/search/companies?q=${encodeURIComponent(query)}&items_per_page=${itemsPerPage}`);
}

/**
 * Get company profile by company number
 */
async function getCompany(number) {
  return callAPI(`/company/${number}`);
}

/**
 * Get company officers (directors/secretaries)
 */
async function getOfficers(number) {
  return callAPI(`/company/${number}/officers`);
}

/**
 * Get filing history (accounts, confirmation statements)
 */
async function getFilingHistory(number, category = 'accounts') {
  return callAPI(`/company/${number}/filing-history?category=${category}`);
}

/**
 * Search for companies at a specific address/postcode
 */
async function searchByAddress(postcode) {
  // Companies House doesn't have direct postcode search,
  // so we search by name patterns or use partial address
  return callAPI(`/search/companies?q=${encodeURIComponent(postcode)}&items_per_page=50`);
}

/**
 * Get persons with significant control
 */
async function getPSC(number) {
  return callAPI(`/company/${number}/persons-with-significant-control`);
}

module.exports = {
  searchCompanies,
  getCompany,
  getOfficers,
  getFilingHistory,
  searchByAddress,
  getPSC
};
