#!/usr/bin/env node
/* Deploy generated pages to all 4 ad farm sites via SSH */
const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const key = fs.readFileSync('/home/node/.ssh/ionos_ubuntu');

const HOST = '212.227.93.74';

const sites = [
  { name: 'coupn.uk', dir: '/var/www/coupn.uk/public/', pages: [
    'argos-vouchers.html', 'asda-discounts.html', 'currys-promo-codes.html',
    'boots-offers.html', 'sainsburys-vouchers.html', 'nike-discounts.html',
    'booking-com-promos.html', 'just-eat-vouchers.html'
  ]},
  { name: 'pdfoomph.com', dir: '/var/www/pdfoomph.com/public/', pages: [
    'merge-pdf.html', 'split-pdf.html', 'compress-pdf.html', 'jpg-to-pdf.html',
    'pdf-to-word.html', 'pdf-to-excel.html', 'password-protect-pdf.html', 'unlock-pdf.html'
  ]},
  { name: 'isitdownrightnow.co.uk', dir: '/var/www/isitdownrightnow.co.uk/public/', pages: [
    'spotify-down.html', 'netflix-down.html', 'whatsapp-down.html', 'instagram-down.html',
    'youtube-down.html', 'twitter-down.html', 'google-down.html', 'gmail-down.html',
    'reddit-down.html', 'facebook-down.html'
  ]},
  { name: 'cheapfind.uk', dir: '/var/www/cheapfind.uk/public/', pages: [
    'asda-deals.html', 'tesco-deals.html', 'amazon-prime-deals.html', 'currys-deals.html',
    'argos-deals.html', 'aldi-deals.html', 'boots-deals.html', 'next-deals.html',
    'ikea-deals.html', 'sports-direct-deals.html'
  ]}
];

const srcDirs = {
  'coupn.uk': '/tmp/coupn_pages',
  'pdfoomph.com': '/tmp/pdfoomph_pages',
  'isitdownrightnow.co.uk': '/tmp/isitdown_pages',
  'cheapfind.uk': '/tmp/cheapfind_pages'
};

function sftpUpload(conn, site) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      const srcdir = srcDirs[site.name];
      const destdir = site.dir;
      let remaining = site.pages.length;
      let ok = 0, fail = 0;

      site.pages.forEach(page => {
        const src = path.join(srcdir, page);
        const dest = path.join(destdir, page);
        sftp.fastPut(src, dest, err => {
          if (err) {
            console.log(`  ✗ ${site.name}/${page}: FAILED - ${err.message}`);
            fail++;
          } else {
            console.log(`  ✓ ${site.name}/${page}: uploaded`);
            ok++;
          }
          remaining--;
          if (remaining === 0) resolve({ ok, fail, total: site.pages.length });
        });
      });
    });
  });
}

(async () => {
  console.log('Connecting via SSH...\n');
  const conn = new Client();
  
  try {
    await new Promise((resolve, reject) => {
      conn.on('ready', resolve);
      conn.on('error', reject);
      conn.connect({ host: HOST, port: 22, username: 'root', privateKey: key, readyTimeout: 15000 });
    });
    console.log('SSH connected!\n');

    for (const site of sites) {
      console.log(`\n📦 Uploading to ${site.name} (${site.pages.length} pages)`);
      const result = await sftpUpload(conn, site);
      console.log(`  Result: ${result.ok}/${result.total} uploaded${result.fail > 0 ? `, ${result.fail} failed` : ''}`);
    }

    console.log('\n✅ All uploads complete!');
    conn.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    conn.end();
    process.exit(1);
  }
})();
