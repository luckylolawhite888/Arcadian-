/**
 * OpenStreetMap Overpass API — Free commercial property discovery
 * Queries OSM for commercial/industrial/retail buildings in an area
 */
const fetch = require('node-fetch');

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

/**
 * Find commercial buildings near a postcode area
 * Uses OSM's building/commercial/industrial tags
 */
async function findCommercialBuildings(lat, lon, radiusMeters = 1000) {
  const query = `
    [out:json][timeout:30];
    (
      way["building"~"commercial|industrial|retail|office|warehouse|hotel|school|hospital|civic|yes"](around:${radiusMeters},${lat},${lon});
      way["landuse"="commercial"](around:${radiusMeters},${lat},${lon});
      way["landuse"="industrial"](around:${radiusMeters},${lat},${lon});
      way["building:use"~"commercial|industrial|retail|office|storage"](around:${radiusMeters},${lat},${lon});
      way["industrial"~"warehouse|storage"](around:${radiusMeters},${lat},${lon});
    );
    out center 100;
  `;

  const start = Date.now();
  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: {
      'User-Agent': 'LangleySolarEngine/1.0 (commercial solar prospecting)',
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `data=${encodeURIComponent(query)}`
  });
  const text = await res.text();
  const took = Date.now() - start;
  let data;
  try {
    data = JSON.parse(text);
  } catch(e) {
    console.error(`OSM returned non-JSON (${took}ms, status ${res.status}): ${text.substring(0, 300)}`);
    return [];
  }
  
  const elements = data.elements || [];
  console.log(`  📊 OSM: ${lat},${lon} r=${radiusMeters}m → ${elements.length} features in ${took}ms`);
  
  // Extract properties from OSM elements
  const properties = elements.map(el => {
    const tags = el.tags || {};
    const center = el.center || (el.lat ? { lat: el.lat, lon: el.lon } : null);
    
    // Estimate building area from OSM data
    let area = 0;
    if (tags.area) {
      const parsed = parseFloat(tags.area);
      if (parsed > 50 && parsed < 100000) area = parsed;
    }
    if (!area && tags.building_levels) {
      const levels = parseFloat(tags.building_levels);
      if (levels > 1 && levels < 100) area = levels * 150; // 150m² per level average
    }
    if (!area) {
      // Check if it's a way (building polygon) — estimate area from geometry
      if (el.type === 'way' && el.nodes && el.nodes.length > 3) {
        // Rough bounding-box area
        const lats = [el.lat, ...(el.geometry || []).map(g => g.lat)].filter(Boolean);
        const lons = [el.lon, ...(el.geometry || []).map(g => g.lon)].filter(Boolean);
        if (lats.length > 1 && lons.length > 1) {
          const dlat = Math.max(...lats) - Math.min(...lats);
          const dlon = Math.max(...lons) - Math.min(...lons);
          area = (dlat * 111320) * (dlon * 111320 * Math.cos((lats[0] || 51.5) * Math.PI / 180));
        }
      }
    }
    if (!area || area < 100 || area > 50000) area = 300; // default for commercial building
    
    return {
      osm_id: el.id,
      osm_type: el.type,
      address: tags.address || tags['addr:full'] || tags.name || `${tags['addr:housenumber'] || ''} ${tags['addr:street'] || ''}`.trim() || 'Unknown',
      postcode: tags['addr:postcode'] || '',
      town: tags['addr:city'] || tags['addr:town'] || '',
      property_type: getBuildingType(tags),
      use_class: getUseClass(tags),
      floor_area_m2: Math.round(area),
      name: tags.name || tags.operator || '',
      building: tags.building || '',
      building_use: tags['building:use'] || '',
      landuse: tags.landuse || '',
      latitude: center?.lat || lat,
      longitude: center?.lon || lon
    };
  });
  
  // Deduplicate by address
  const seen = new Set();
  return properties.filter(p => {
    const key = `${p.latitude},${p.longitude}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getBuildingType(tags) {
  const building = tags.building || '';
  const use = tags['building:use'] || '';
  const landuse = tags.landuse || '';
  
  if (building === 'warehouse' || use === 'warehouse') return 'warehouse';
  if (building === 'retail' || building === 'retail' || landuse === 'retail') return 'retail';
  if (building === 'industrial' || landuse === 'industrial') return 'industrial';
  if (building === 'office' || use === 'office') return 'office';
  if (building === 'hotel' || building === 'motel') return 'hotel';
  if (building === 'school') return 'education';
  if (building === 'hospital' || building === 'clinic') return 'healthcare';
  if (building === 'commercial' || landuse === 'commercial') return 'commercial';
  if (building === 'civic' || building === 'public') return 'civic';
  if (building === 'yes') return 'commercial'; // Generic building tag
  return 'commercial';
}

function getUseClass(tags) {
  const type = getBuildingType(tags);
  const map = {
    'warehouse': 'B8',
    'industrial': 'B2',
    'retail': 'E',
    'office': 'E',
    'hotel': 'C1',
    'education': 'D1',
    'healthcare': 'C2',
    'commercial': 'E',
    'civic': 'D1'
  };
  return map[type] || 'E';
}

/**
 * Geocode a UK postcode to lat/lon using postcodes.io (FREE)
 */
async function geocodePostcode(postcode) {
  // Clean postcode
  const pc = postcode.toUpperCase().trim();
  
  // Try postcodes.io with full postcode first
  for (const attempt of [pc, `${pc} 1AA`, `${pc}0AA`]) {
    try {
      const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(attempt)}`);
      const data = await res.json();
      if (data.status === 200 && data.result) {
        const r = data.result;
        console.log(`  🌍 Geocoded ${pc} → ${r.latitude},${r.longitude} (${r.region || 'UK'})`);
        return { lat: r.latitude, lon: r.longitude, name: r.region || r.country || 'UK' };
      }
    } catch (e) {}
  }
  
  // Fallback to searching for the outcode
  try {
    const res = await fetch(`https://api.postcodes.io/postcodes?q=${encodeURIComponent(pc)}&limit=1`);
    const data = await res.json();
    if (data.status === 200 && data.result && data.result.length > 0) {
      const r = data.result[0];
      console.log(`  🌍 Geocoded ${pc} → ${r.latitude},${r.longitude} (${r.region || 'UK'}, approximate)`);
      return { lat: r.latitude, lon: r.longitude, name: r.region || r.country || 'UK' };
    }
  } catch (e) {}
  
  // Final fallback to UK centroid
  console.log(`  ⚠️ Could not geocode ${pc}, using London default`);
  return { lat: 51.5074, lon: -0.1278, name: 'London' };
}

module.exports = { findCommercialBuildings, geocodePostcode };
