# 🚀 MISSION CRITICAL DEPLOYMENT: THE NEW WORLD ORDER

## **SITUATION**
Current site: Neo-Brutalist Bloomberg Terminal (live at thenewworldorder.io)
New site: "Let's face it, the old world is dead" landing page with phone collection

## **DEPLOYMENT PACKAGE CONTENTS**
- `index.html` - New landing page (12,576 bytes)
- `DEPLOY.sh` - Automated deployment script (run with sudo)
- `VERIFY.sh` - Verification script
- `README.md` - This file

## **IMMEDIATE DEPLOYMENT INSTRUCTIONS**

### **Option A: Automated Deployment (Recommended)**
```bash
cd /home/node/.openclaw/workspace/deployment_package
sudo ./DEPLOY.sh
```

### **Option B: Manual Deployment**
```bash
# 1. Backup existing site
sudo cp -r /var/www/thenewworldorder /var/www/thenewworldorder_backup_$(date +%Y%m%d_%H%M%S)

# 2. Deploy new landing page
sudo cp index.html /var/www/thenewworldorder/

# 3. Set permissions
sudo chown -R www-data:www-data /var/www/thenewworldorder/
sudo chmod -R 755 /var/www/thenewworldorder/

# 4. Restart web server
sudo systemctl restart nginx   # or apache2
```

### **Option C: Cloudflare Pages Deployment**
If site is on Cloudflare Pages:
1. Go to Cloudflare Dashboard → Workers & Pages
2. Select thenewworldorder.io project
3. Upload `index.html` as new deployment
4. Promote to production

## **VERIFICATION**
After deployment:
```bash
./VERIFY.sh
```

Expected results:
- ✅ Site accessible: HTTP 200 OK
- ✅ New landing page: "Let's face it, the old world is dead"
- ✅ JOIN NOW button present
- ✅ Countdown timer to May 8th
- ✅ Phone collection system ready

## **SITE FEATURES**
1. **Headline:** "Let's face it, the old world is dead"
2. **Button:** "JOIN NOW" (large, orange)
3. **Countdown:** Real-time timer to May 8th, 2026
4. **Phone Collection:** Input field with validation
5. **Storage:** Phone numbers saved to server
6. **Design:** All white background, dark orange text (#cc5500)
7. **Warning:** "Join the hunt or get eaten" (small orange text)

## **TROUBLESHOOTING**

### **Issue: Permission denied**
```bash
sudo chown -R $USER:$USER /home/node/.openclaw/workspace/deployment_package
```

### **Issue: Web server not found**
Check what's serving the site:
```bash
systemctl status nginx apache2 httpd
```

### **Issue: Old site still showing**
Clear Cloudflare cache:
1. Cloudflare Dashboard → Caching → Configuration → Purge Everything
2. Wait 30 seconds
3. Hard refresh browser (Ctrl+Shift+R)

## **ROLLBACK INSTRUCTIONS**
If needed, restore from backup:
```bash
sudo cp -r /var/www/thenewworldorder_backup_* /var/www/thenewworldorder/
sudo systemctl restart nginx
```

## **CONTACT**
- **Editor-in-Chief:** System Architect
- **Mission Status:** CRITICAL
- **Timestamp:** $(date)

**"The hunt begins May 8th. Join or get eaten."**