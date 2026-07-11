// Find London GP surgeries that use the NHS online registration system
// by testing known ODS codes

const LONDON_SURGERIES = [
  // NW London
  { code: 'E84028', name: 'Stonebridge Practice', area5: ['NW10'] },
  { code: 'E84021', name: 'Willesden Medical Centre', area5: ['NW10'] },
  { code: 'E84006', name: 'Harrow Road Health Centre', area5: ['W9','W10','NW10'] },
  { code: 'E84007', name: 'St Johns Wood Medical Practice', area5: ['NW8','NW1','NW6','NW3'] },
  
  // South London (SE, SW)
  { code: 'E85012', name: 'Brixton Hill Practice', area5: ['SW2','SW9','SE24'] },
  { code: 'E85003', name: 'Clapham Park Surgery', area5: ['SW4','SW12'] },
  { code: 'E85007', name: 'Streatham High Surgery', area5: ['SW16','SW2'] },
  { code: 'E85019', name: 'Lewisham Practice', area5: ['SE13','SE6','SE12'] },
  { code: 'E85034', name: 'Croydon Practice', area5: ['CR0','CR2','CR7'] },
  { code: 'E87004', name: 'Woolwich Health Centre', area5: ['SE18','SE28'] },
  { code: 'E87001', name: 'Greenwich Practice', area5: ['SE10','SE3','SE7'] },
  
  // West London (W, TW)
  { code: 'E86015', name: 'Ealing Practice', area5: ['W5','W13','W7'] },
  { code: 'E86001', name: 'Acton Health Centre', area5: ['W3','W4'] },
  { code: 'E86022', name: 'Greenford Practice', area5: ['UB6','UB5'] },
  { code: 'E84012', name: 'Kensington Park Medical Centre', area5: ['W11','W2','W8'] },
  { code: 'E84017', name: 'Paddington Green Health Centre', area5: ['W2','W9'] },
  { code: 'E84019', name: 'Marylebone Health Centre', area5: ['W1','W2'] },
  
  // North London (N)
  { code: 'E83025', name: 'Finsbury Park Practice', area5: ['N4','N5','N7'] },
  { code: 'E83009', name: 'Islington Central Surgery', area5: ['N1','EC1V'] },
  { code: 'E83015', name: 'Holloway Surgery', area5: ['N7','N19'] },
  { code: 'E83011', name: 'Stamford Hill Practice', area5: ['N16','N15'] },
  { code: 'E83023', name: 'Walthamstow Practice', area5: ['E17','E11'] },
  { code: 'E83017', name: 'Tottenham Practice', area5: ['N17','N15'] },
  { code: 'E83002', name: 'Hackney Practice', area5: ['E8','E9','N1'] },
  
  // East London (E, IG)
  { code: 'E81032', name: 'Barking Practice', area5: ['IG11','IG1'] },
  { code: 'E81018', name: 'East Ham Practice', area5: ['E6','E12'] },
  { code: 'E81040', name: 'Harold Hill Health Centre', area5: ['RM3'] },
  { code: 'E81023', name: 'Dagenham Medical Centre', area5: ['RM10','RM9'] },
  
  // Additional coverage
  { code: 'E84030', name: 'Wembley Practice', area5: ['HA9','HA0'] },
  { code: 'E84013', name: 'Kingsbury Practice', area5: ['NW9','HA3'] },
  { code: 'E84022', name: 'Harlesden Practice', area5: ['NW10','NW6'] },
  { code: 'E84024', name: 'Cricklewood Practice', area5: ['NW2','NW6'] },
  { code: 'E86014', name: 'Hounslow Practice', area5: ['TW3','TW4','TW5'] },
  { code: 'E85022', name: 'Catford Practice', area5: ['SE6','SE23'] },
];

async function checkSurgery(code, name) {
  const https = require('https');
  return new Promise((resolve) => {
    const url = `https://gp-registration.nhs.uk/${code}/gpregistration/landing`;
    
    const req = https.get(url, { timeout: 8000 }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        const status = res.statusCode;
        const hasForm = body.includes('nhsuk-form') || body.includes('patientDetails') || body.includes('GpRegistration');
        const hasError = body.includes('could not be found') || body.includes('page could not be found') || body.includes('not available');
        const title = body.match(/<title>([^<]+)<\/title>/)?.[1] || '';
        const valid = (status >= 200 && status < 400) && !hasError && title.includes('Register');
        resolve({ code, name, status, valid, hasForm, title: title.substring(0,80) });
      });
    });
    req.on('error', (err) => resolve({ code, name, status: 0, valid: false, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ code, name, status: 0, valid: false }); });
  });
}

async function main() {
  const https = require('https');
  console.log('Testing', LONDON_SURGERIES.length, 'London GP surgeries...\n');
  
  const valid = [];
  for (const s of LONDON_SURGERIES) {
    const r = await checkSurgery(s.code, s.name);
    const status = r.valid ? '✅' : '❌';
    console.log(`${status} ${s.code} - ${s.name} [${r.status}] ${r.valid ? '' : 'INVALID'}`);
    if (r.valid) valid.push(s);
    await new Promise(r => setTimeout(r, 400));
  }
  
  console.log(`\n✅ ${valid.length}/${LONDON_SURGERIES.length} valid surgeries\n`);
  
  console.log('ODS_CODES = [');
  for (const s of valid) {
    console.log(`  { code: '${s.code}', area5: ${JSON.stringify(s.area5)} },`);
  }
  console.log('];');
}

main().catch(console.error);
