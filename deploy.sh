#!/bin/bash
# ...existing code...

# ====== CONFIG ======
USER="opc"
HOST="170.9.254.152"
PORT="22"
SSH_KEY="$HOME/.ssh/github_deploy_key"   # set your private key path (leave empty to use ssh-agent)
REMOTE_TMP_DIR="/home/$USER/portfolio_tmp"
REMOTE_LIVE_DIR="/var/www/portfolio"
LOCAL_DIR="/Users/kofiarcher/Portfolio"

# Domain configuration (update these for your domain)
DOMAIN="kofiarcher.com"
USE_SUBDIRECTORY=true

echo "⚙️ Starting deployment to $USER@$HOST..."

# Build SSH options
if [ -n "$SSH_KEY" ]; then
  SSH_OPTS="-i $SSH_KEY -o IdentitiesOnly=yes -p $PORT"
  RSYNC_SSH="ssh $SSH_OPTS"
else
  SSH_OPTS="-p $PORT"
  RSYNC_SSH="ssh -p $PORT"
fi

# 1. Upload all files to temp folder
echo "📤 Uploading files..."
rsync -avz -e "$RSYNC_SSH" \
  --exclude='.git' \
  --exclude='DOMAIN_SETUP.md' \
  --exclude='README.md' \
  --exclude='.DS_Store' \
  "$LOCAL_DIR/" "$USER@$HOST:$REMOTE_TMP_DIR/"

# 2. Move uploaded files to live directory
echo "🚚 Moving files to live directory..."
ssh $SSH_OPTS "$USER@$HOST" "
  sudo rm -rf $REMOTE_LIVE_DIR && \
  sudo mkdir -p $REMOTE_LIVE_DIR && \
  sudo mv $REMOTE_TMP_DIR/* $REMOTE_LIVE_DIR/ && \
  sudo rm -rf $REMOTE_TMP_DIR && \
  sudo chown -R nginx:nginx $REMOTE_LIVE_DIR && \
  sudo chmod -R 755 $REMOTE_LIVE_DIR
"

# 3. Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
ssh $SSH_OPTS "$USER@$HOST" "sudo nginx -t"

# 4. Reload Nginx
echo "🔄 Reloading Nginx..."
ssh $SSH_OPTS "$USER@$HOST" "sudo systemctl reload nginx"

# 5. Display success message
echo "✅ Deployment complete!"
if [ -n "$DOMAIN" ]; then
  echo "🌐 Visit: https://$DOMAIN$([ \"$USE_SUBDIRECTORY\" = true ] && echo \"/portfolio\" || echo \"\")"
else
  echo "🌐 Visit: http://$HOST/portfolio"
fi

echo ""
echo "📋 Next steps if using a domain:"
echo "1. Update DOMAIN variable in this script"
echo "2. Configure DNS A records to point to $HOST"
echo "3. Set up SSL certificate with certbot"
echo "4. See DOMAIN_SETUP.md for detailed instructions"
# ...existing code...