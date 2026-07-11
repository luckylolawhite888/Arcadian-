#!/usr/bin/env node
/**
 * No-Auth API Bridge — quick calls to APIs we can use right now
 * Usage: node api-bridge.js <api> [args]
 *
 * APIs:
 *   postcode <postcode>     → lat/lng from Postcodes.io
 *   geocode <address>       → coords from Nominatim (OpenStreetMap)
 *   btc                     → Bitcoin price from CoinDesk
 *   uk-holidays [year]      → UK bank holidays
 *   quote                   → random inspirational quote
 *   word <word>             → dictionary definition
 *   space-news              → latest spaceflight news articles
 *   tfl-stops <lat> <lng>   → nearby TfL stops
 *   sunrise <lat> <lng>     → sunrise/sunset times
 *   holidays <country>      → public holidays (Nager.Date, 2-letter code)
 *   weather <city>          → wttr.in weather (JSON)
 *   brew <city>             → nearby breweries (Open Brewery DB)
 *   help                    → this
 */

const https = require('https');
const http = require('http');

async function fetch(url, opts = {}) {
  const mod = url.startsWith('https') ? https : http;
  return new Promise((resolve, reject) => {
    const options = { ...opts, headers: { 'User-Agent': 'lola-bridge/1.0', ...(opts.headers || {}) } };
    mod.get(url, options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(data); }
      });
    }).on('error', reject);
  });
}

const apis = {
  async postcode(code) {
    const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(code)}`;
    console.log(`📍 Postcode: ${code.toUpperCase()}`);
    const r = await fetch(url);
    if (r.status === 200 && r.result) {
      const { postcode, latitude, longitude, admin_district, region, country } = r.result;
      console.log(`   ${postcode} → ${latitude}, ${longitude}`);
      console.log(`   District: ${admin_district}, ${region}, ${country}`);
      return { lat: latitude, lng: longitude, postcode, admin_district };
    }
    console.log(`   ❌ ${r.error || 'Not found'}`);
    return null;
  },

  async geocode(query) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    console.log(`📍 Geocode: ${query}`);
    const r = await fetch(url);
    if (r && r.length > 0) {
      const { lat, lon, display_name } = r[0];
      console.log(`   → ${lat}, ${lon}`);
      console.log(`   ${display_name.split(', ').slice(0,3).join(', ')}`);
      return { lat: parseFloat(lat), lng: parseFloat(lon), name: display_name };
    }
    console.log(`   ❌ Not found`);
    return null;
  },

  async btc() {
    console.log(`💰 Bitcoin Price (CoinGecko)`);
    const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,gbp,eur');
    const { usd, gbp, eur } = r.bitcoin;
    console.log(`   $${usd.toLocaleString('en-US')} USD`);
    console.log(`   £${gbp.toLocaleString('en-GB')} GBP`);
    console.log(`   €${eur.toLocaleString('de-DE')} EUR`);
    return { usd, gbp, eur };
  },

  async holidays(year) {
    const y = year || new Date().getFullYear();
    console.log(`🇬🇧 UK Bank Holidays ${y}`);
    const r = await fetch('https://www.gov.uk/bank-holidays.json');
    const england = r['england-and-wales'].events;
    england.forEach(e => {
      const d = new Date(e.date);
      const dow = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
      console.log(`   ${e.date} (${dow}) — ${e.title}`);
    });
    return england;
  },

  async quote() {
    console.log(`💬 Random Quote`);
    const r = await fetch('https://zenquotes.io/api/random');
    if (r && r[0]) {
      console.log(`   "${r[0].q}"`);
      console.log(`   — ${r[0].a}`);
      return { quote: r[0].q, author: r[0].a };
    }
    return null;
  },

  async word(w) {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`;
    console.log(`📖 ${w}`);
    const r = await fetch(url);
    if (r && r[0]) {
      const { word, phonetic, meanings } = r[0];
      console.log(`   ${word}${phonetic ? ` [${phonetic}]` : ''}`);
      meanings.forEach(m => {
        m.definitions.slice(0, 2).forEach(d => {
          console.log(`   • ${d.definition}`);
          if (d.example) console.log(`     ↳ "${d.example}"`);
        });
      });
      return r[0];
    }
    console.log(`   ❌ Word not found`);
    return null;
  },

  async spaceNews() {
    console.log(`🚀 Spaceflight News (latest 5)`);
    const r = await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=5');
    r.results.forEach((a, i) => {
      const date = a.published_at.split('T')[0];
      const site = a.news_site || a.site || '?';
      console.log(`   ${i+1}. ${a.title}`);
      console.log(`      ${site} — ${date}`);
      console.log(`      ${a.url}`);
    });
    return r.results;
  },

  async sunrise(lat, lng) {
    const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`;
    console.log(`☀️ Sunrise/Sunset for ${lat}, ${lng}`);
    const r = await fetch(url);
    if (r.status === 'OK') {
      const { sunrise, sunset, day_length, civil_twilight_begin, civil_twilight_end } = r.results;
      const fmt = d => new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      const len = Math.floor(parseInt(day_length) / 3600) + 'h ' + Math.floor((parseInt(day_length) % 3600) / 60) + 'm';
      console.log(`   Sunrise: ${fmt(sunrise)}`);
      console.log(`   Sunset:  ${fmt(sunset)}`);
      console.log(`   Day:     ${len}`);
      return r.results;
    }
    console.log(`   ❌ Failed`);
    return null;
  },

  async tflStops(lat, lng) {
    const url = `https://api.tfl.gov.uk/StopPoint/?lat=${lat}&lon=${lng}&stopTypes=NaptanMetroStation,NaptanRailStation&radius=800`;
    console.log(`🚇 Nearby TfL Stops (${lat}, ${lng})`);
    const r = await fetch(url);
    if (r.stopPoints) {
      r.stopPoints.slice(0, 10).forEach(s => {
        const types = { NaptanMetroStation: '🚇', NaptanBusStopStation: '🚌', NaptanRailStation: '🚄' };
        const icon = types[s.stopType] || '📍';
        const dist = ((s.distance || 0) / 1000).toFixed(2);
        console.log(`   ${icon} ${s.commonName} (${dist}km)`);
      });
      console.log(`   Total nearby: ${r.stopPoints.length}`);
      return r.stopPoints;
    }
    console.log(`   ❌ Failed`);
    return null;
  },

  async weather(city) {
    const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
    console.log(`🌤️ Weather: ${city}`);
    const r = await fetch(url);
    if (r.current_condition) {
      const c = r.current_condition[0];
      console.log(`   ${c.weatherDesc[0].value} — ${c.temp_C}°C (feels ${c.FeelsLikeC}°C)`);
      console.log(`   Wind: ${c.winddir16Point} ${c.windspeedKmph}km/h | Humidity: ${c.humidity}%`);
      console.log(`   UV: ${c.uvIndex} | Visibility: ${c.visibility}km`);
      // Next few days
      r.weather.slice(0, 3).forEach((d, i) => {
        const label = i === 0 ? 'Today' : i === 1 ? 'Tomm' : d.date;
        console.log(`   ${label}: ${d.maxtempC}°C / ${d.mintempC}°C — ${d.hourly[0].weatherDesc[0].value}`);
      });
      return r;
    }
    console.log(`   ❌ Failed`);
    return null;
  },

  async brew(city) {
    const url = `https://api.openbrewerydb.org/breweries?by_city=${encodeURIComponent(city)}&per_page=10`;
    console.log(`🍺 Breweries near ${city}`);
    const r = await fetch(url);
    if (r.length > 0) {
      r.forEach(b => console.log(`   • ${b.name} — ${b.street || ''} ${b.phone ? '📞 '+b.phone : ''}`));
    } else {
      console.log(`   No breweries found`);
    }
    return r;
  },

  async help() {
    console.log(`
Usage: node api-bridge.js <api> [args]

Available APIs (all free, no auth):
  postcode <code>     → UK postcode lookup (lat/lng)
  geocode <address>   → address to coordinates
  btc                 → Bitcoin price (USD/GBP/EUR)
  uk-holidays [year]  → UK bank holidays for the year
  quote               → random inspirational quote
  word <word>         → dictionary definition + examples
  space-news          → latest 5 spaceflight articles
  tfl-stops <lat> <lng>  → nearby TfL tube/bus stops
  sunrise <lat> <lng> → sunrise/sunset times
  holidays <country>  → public holidays (2-letter code, e.g. GB)
  weather <city>      → current + 3-day forecast
  brew <city>         → breweries in a city
  help                → this screen

Examples:
  node api-bridge.js postcode SW1A1AA
  node api-bridge.js btc
  node api-bridge.js quote
  node api-bridge.js space-news
  node api-bridge.js tfl-stops 51.5 -0.12
  node api-bridge.js weather London
`);
  }
};

// --- Run ---
const rawCmd = process.argv[2];
const args = process.argv.slice(3);

// Convert kebab-case to camelCase for method lookup
const cmdAliases = {
  'uk-holidays': 'holidays',
};
const cmd = rawCmd ? (cmdAliases[rawCmd] || rawCmd.replace(/-([a-z])/g, (_, c) => c.toUpperCase())) : rawCmd;

if (!cmd || cmd === 'help') {
  apis.help();
  process.exit(0);
}

if (!apis[cmd]) {
  console.log(`❌ Unknown API: ${rawCmd}`);
  apis.help();
  process.exit(1);
}

apis[cmd](...args).catch(err => {
  console.error(`❌ Error: ${err.message}`);
  process.exit(1);
});
