# Domain Setup Guide

## Setting up your Namecheap domain with your portfolio

### Option 1: Direct Domain (yourdomain.com)
If you want your portfolio at the root of your domain:

1. **Update Nginx configuration on your server:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    root /var/www/portfolio;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

2. **Update config.js for root domain:**
```javascript
production: {
  base: '/',
  styles: '/styles/',
  scripts: '/scripts/',
  assets: '/'
}
```

### Option 2: Subdirectory (yourdomain.com/portfolio)
Keep current setup - no changes needed to config.js

### Namecheap DNS Configuration

1. **Login to Namecheap → Domain Management → Advanced DNS**

2. **Add A Records:**
```
Type: A Record
Host: @
Value: 192.168.1.172
TTL: Automatic

Type: A Record  
Host: www
Value: 192.168.1.172
TTL: Automatic
```

3. **Remove default parking records** (if any exist)

### SSL Certificate Setup (Recommended)

1. **Install Certbot on your server:**
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

2. **Get SSL certificate:**
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

3. **Auto-renewal (add to crontab):**
```bash
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

### Updated Deploy Script
Your deploy.sh will be updated to handle domain deployment.

### Testing
1. **Local testing:** `python3 -m http.server 8080`
2. **After DNS propagation (24-48hrs):** Visit your domain
3. **Check DNS:** Use `nslookup yourdomain.com` or online DNS checker

### Troubleshooting
- **DNS not propagating:** Wait 24-48 hours, try different DNS servers
- **502/503 errors:** Check Nginx configuration and restart service
- **SSL issues:** Ensure port 443 is open, check certificate validity

### Quick Commands
```bash
# Check Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Check SSL certificate
sudo certbot certificates

# Test Nginx config
sudo nginx -t
```