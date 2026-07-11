# 🌐 DEPLOYING TO THENEWWORLDORDER.IO

## Current Server Status:
- **IP Address:** `212.227.93.74`
- **Port:** `3000` (Node.js Express server)
- **Local Access:** `http://localhost:3000` ✅ Working
- **Public Access:** `http://212.227.93.74:3000` ❌ Blocked by firewall

## 🚀 Recommended Deployment Options:

### OPTION 1: Cloudflare Tunnel (Easiest, No Firewall Changes)
1. **Sign up for Cloudflare** (free)
2. **Add domain** `thenewworldorder.io` to Cloudflare
3. **Install Cloudflare Tunnel:**
   ```bash
   curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
   sudo dpkg -i cloudflared.deb
   ```
4. **Authenticate:**
   ```bash
   cloudflared tunnel login
   ```
5. **Create tunnel:**
   ```bash
   cloudflared tunnel create the-new-world-order
   ```
6. **Configure:**
   ```bash
   # Create config.yml
   tunnel: <tunnel-id>
   credentials-file: /root/.cloudflared/<tunnel-id>.json
   ingress:
     - hostname: thenewworldorder.io
       service: http://localhost:3000
     - service: http_status:404
   ```
7. **Run tunnel:**
   ```bash
   cloudflared tunnel run the-new-world-order
   ```

### OPTION 2: Open Firewall Port 3000
```bash
# If using ufw:
sudo ufw allow 3000/tcp
sudo ufw reload

# If using iptables:
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
sudo iptables-save

# Then test:
curl http://212.227.93.74:3000
```

### OPTION 3: Use Port 80/443 with Reverse Proxy
```bash
# Install nginx
sudo apt update
sudo apt install nginx -y

# Create nginx config
sudo nano /etc/nginx/sites-available/thenewworldorder.io

# Add:
server {
    listen 80;
    server_name thenewworldorder.io www.thenewworldorder.io;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/thenewworldorder.io /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### OPTION 4: Deploy to Vercel/Netlify (Static Version)
1. **Create static build:**
   ```bash
   # The current page is mostly static except for the signup API
   # We can deploy HTML/CSS/JS to Vercel
   # API would need to be hosted separately
   ```

## 🔧 DNS Configuration:
Once server is publicly accessible, update DNS records:

```
Type    Name                    Value
A       thenewworldorder.io     212.227.93.74
A       www.thenewworldorder.io 212.227.93.74
CNAME   @                       thenewworldorder.io
```

## 📦 Quick Static Alternative:
Since the landing page is mostly static, I can create a version that uses:
1. **Static HTML/CSS/JS** hosted on GitHub Pages/Vercel
2. **FormSubmit.co** or **Formspree** for phone collection
3. **Netlify Forms** for backend-free form handling

## 🚨 Immediate Action Items:

### 1. **Test Public Access First:**
```bash
# From another machine/network:
curl http://212.227.93.74:3000
# If this works, proceed with DNS
```

### 2. **Check Domain Ownership:**
- Who owns `thenewworldorder.io`?
- Where is DNS managed? (GoDaddy, Namecheap, Cloudflare)
- Can you access DNS settings?

### 3. **Choose Deployment Method:**
- **Easiest:** Cloudflare Tunnel (no firewall changes)
- **Standard:** Nginx reverse proxy (port 80/443)
- **Simplest:** Open port 3000 (if allowed)

## 📞 Current Working Setup:
- **Local URL:** `http://localhost:3000` ✅
- **Files:** `/home/node/.openclaw/workspace/landing-page/`
- **Signups:** `new-sign-ups/` folder
- **API:** `http://localhost:3000/api/signups`

## ⚡ Quick Fix - Use SSH Tunnel for Testing:
If you want to share the site temporarily:
```bash
# On your local machine:
ssh -R 80:localhost:3000 serveo.net
# Or
ssh -R thenewworldorder.io:80:localhost:3000 serveo.net
```

## 🎯 Recommended Path:
1. **Use Cloudflare Tunnel** (free, secure, no firewall config)
2. **Point DNS** to Cloudflare nameservers
3. **Enable SSL** automatically through Cloudflare

## 📋 To Get Live on thenewworldorder.io:
1. **Choose one deployment option above**
2. **Update DNS records** to point to server IP
3. **Test** `http://thenewworldorder.io`
4. **Monitor** signups in `new-sign-ups` folder

**Need me to implement one of these options or help with DNS configuration?**