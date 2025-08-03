# OCI Migration Plan - Portfolio Website

## Overview
Migration plan to move the personal portfolio website from local deployment to Oracle Cloud Infrastructure (OCI) for hands-on OCI learning experience and public hosting.

## Current Architecture
- **Application**: Static HTML/CSS/JS (no backend)
- **Frontend**: Custom HTML, CSS (with Bootstrap), JavaScript
- **Current Deployment**: Local development server (e.g., Python http.server)

## Target OCI Architecture

### Recommended Services
1. **Compute**: VM.Standard.E2.1.Micro (Always Free - 1 OCPU, 1GB RAM) for Nginx static file hosting
2. **Storage**: Block volumes for persistent storage (if needed)
3. **Networking**: Virtual Cloud Network (VCN) with public subnet
4. **Security**: OCI Secrets service for SSL certificates (if using HTTPS)
5. **(Optional)**: OCI Object Storage for static website hosting (alternative to Compute)

### Alternative Deployment Options
- **Object Storage**: Host static site directly from OCI Object Storage bucket (recommended for static sites)
- **Container Instance**: OCI Container Instance for containerized static site hosting

## Migration Strategy

### Phase 1: Infrastructure Setup (Day 1)
**Prerequisites:**
- OCI account setup
- Compartment creation
- IAM policies configuration

**Tasks:**
1. Create Virtual Cloud Network (VCN)
   - Regional VCN with CIDR 10.0.0.0/16
   - Public subnet: 10.0.1.0/24
   - Internet Gateway for public access
   - Route tables and security lists

2. Security Lists Configuration
   - Inbound: HTTP (80), HTTPS (443), SSH (22)
   - Outbound: All traffic allowed

3. Provision Compute Instance (if using Nginx)
   - Shape: VM.Standard.E2.1.Micro (Always Free)
   - Image: Ubuntu 20.04 or 22.04 LTS
   - SSH key pair generation and configuration

### Phase 2: Website Deployment (Day 2)
**Option 1: Nginx on Compute Instance**
1. **Server Setup**
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install nginx git -y
   ```

2. **Deploy Portfolio Files**
   ```bash
   # Copy your portfolio files to /var/www/portfolio
   sudo mkdir -p /var/www/portfolio
   sudo cp -r * /var/www/portfolio/
   sudo chown -R www-data:www-data /var/www/portfolio
   ```

3. **Nginx Configuration**
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
   - Test and reload Nginx:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **SSL Certificate (Recommended)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

**Option 2: OCI Object Storage (Static Website)**
1. Create an Object Storage bucket
2. Enable "Static Website Hosting" on the bucket
3. Upload all portfolio files (index.html, assets, styles, etc.)
4. Set index document to `index.html`
5. Make bucket public or use pre-authenticated requests

### Phase 3: DNS & Testing (Day 3)
1. **Update DNS records** at your registrar (e.g., Namecheap) to point to your OCI public IP or Object Storage endpoint
2. **Test website** via browser and DNS tools

### Phase 4: Optimization & Monitoring (Day 4)
1. **Performance Optimization**
   - Enable gzip in Nginx
   - Use browser caching headers

2. **Security Hardening**
   - Firewall configuration (OCI security lists)
   - SSL/TLS enforcement

3. **Monitoring & Logging**
   - Enable OCI Monitoring for instance health
   - Review Nginx access/error logs

4. **Backup**
   - Backup website files to OCI Object Storage

## Code/Config Changes Required

### Nginx Example Config
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

### config.js Example (for root domain)
```javascript
production: {
  base: '/',
  styles: '/styles/',
  scripts: '/scripts/',
  assets: '/'
}
```

## Cost Estimation (Always Free Tier)
- **Compute Instance**: VM.Standard.E2.1.Micro - Free
- **Block Storage**: 100GB total - Free
- **Object Storage**: 20GB - Free
- **Network**: 10TB outbound per month - Free

**Estimated Monthly Cost**: $0 (within Always Free limits)

## Migration Timeline
- **Day 1**: Infrastructure provisioning and networking setup
- **Day 2**: Website deployment and configuration
- **Day 3**: DNS setup and testing
- **Day 4**: Optimization, monitoring, and documentation

## Learning Objectives
Through this migration, you'll gain hands-on experience with:
- OCI Compute and Object Storage
- VCN configuration and security lists
- Nginx static site hosting
- DNS and SSL certificate management
- Monitoring and cost optimization

## Next Steps
1. Set up OCI account and explore the console
2. Provision Compute instance or Object Storage bucket
3. Upload and test your portfolio website
4. Configure DNS and SSL
5. Monitor and optimize

## Resources
- [OCI Documentation](https://docs.oracle.com/en-us/iaas/)
- [Oracle Always Free Resources](https://www.oracle.com/cloud/free/)
- [Nginx Static Site Guide](https://nginx.org/en/docs/http/ngx_http_core_module.html#root)
- [OCI Object Storage Static Website](https://docs.oracle.com/en-us/iaas/Content/Object/Tasks/usingstaticwebsite.htm)

---
*This migration plan serves as your roadmap to deploy your portfolio website on Oracle Cloud Infrastructure while maximizing learning opportunities with OCI services.*
