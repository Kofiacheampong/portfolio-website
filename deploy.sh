#!/bin/bash

# ====== CONFIG ======
USER="kofiarcher"
HOST="192.168.1.172"
PORT="64295"
REMOTE_TMP_DIR="/home/$USER/portfolio_tmp"
REMOTE_LIVE_DIR="/var/www/portfolio"
LOCAL_DIR="/Users/kofiarcher/Portfolio"

# Domain configuration (update these for your domain)
DOMAIN="kofiarcher.com"  # Set your domain here, e.g. "yourdomain.com"
USE_SUBDIRECTORY=true  # Set to false if using root domain

echo "⚙️ Starting deployment to $USER@$HOST..."

# 1. Upload all files to temp folder
echo "📤 Uploading files..."
rsync -avz -e "ssh -p $PORT" \
  --exclude='.git' \
  --exclude='DOMAIN_SETUP.md' \
  --exclude='README.md' \
  --exclude='.DS_Store' \
  "$LOCAL_DIR/" "$USER@$HOST:$REMOTE_TMP_DIR/"

# 2. Move uploaded files to live directory
echo "🚚 Moving files to live directory..."
ssh -p "$PORT" "$USER@$HOST" "
  sudo rm -rf $REMOTE_LIVE_DIR && \
  sudo mkdir -p $REMOTE_LIVE_DIR && \
  sudo mv $REMOTE_TMP_DIR/* $REMOTE_LIVE_DIR/ && \
  sudo rm -rf $REMOTE_TMP_DIR && \
  sudo chown -R www-data:www-data $REMOTE_LIVE_DIR && \
  sudo chmod -R 755 $REMOTE_LIVE_DIR
"

# 3. Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
ssh -p "$PORT" "$USER@$HOST" "sudo nginx -t"

# 4. Reload Nginx
echo "🔄 Reloading Nginx..."
ssh -p "$PORT" "$USER@$HOST" "sudo systemctl reload nginx"

# 5. Display success message
echo "✅ Deployment complete!"
if [ -n "$DOMAIN" ]; then
  echo "🌐 Visit: https://$DOMAIN$([ "$USE_SUBDIRECTORY" = true ] && echo "/portfolio" || echo "")"
else
  echo "🌐 Visit: http://$HOST/portfolio"
fi

echo ""
echo "📋 Next steps if using a domain:"
echo "1. Update DOMAIN variable in this script"
echo "2. Configure DNS A records to point to $HOST"
echo "3. Set up SSL certificate with certbot"
echo "4. See DOMAIN_SETUP.md for detailed instructions"
