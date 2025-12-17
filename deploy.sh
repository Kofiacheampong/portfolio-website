#!/bin/bash
set -e

# =======================
# CONFIG
# =======================
USER="opc"
HOST="170.9.254.152"
PORT="22"
SSH_KEY="$HOME/.ssh/github_deploy_key"   # leave empty to use ssh-agent

REMOTE_TMP_DIR="/home/$USER/portfolio_tmp"
REMOTE_LIVE_DIR="/var/www/portfolio"
LOCAL_DIR="/Users/kofiarcher/Portfolio"

DOMAIN="kofiarcher.com"
USE_SUBDIRECTORY=true

# =======================
# SSH OPTIONS
# =======================
if [ -n "$SSH_KEY" ]; then
  SSH_OPTS="-i $SSH_KEY -o IdentitiesOnly=yes -p $PORT"
  RSYNC_SSH="ssh $SSH_OPTS"
else
  SSH_OPTS="-p $PORT"
  RSYNC_SSH="ssh -p $PORT"
fi

echo "⚙️  Starting deployment to $USER@$HOST..."

# =======================
# 1. Upload files to temp dir
# =======================
echo "📤 Uploading files to temporary directory..."

rsync -avz -e "$RSYNC_SSH" \
  --delete \
  --exclude='.git' \
  --exclude='.DS_Store' \
  --exclude='README.md' \
  --exclude='DOMAIN_SETUP.md' \
  "$LOCAL_DIR/" "$USER@$HOST:$REMOTE_TMP_DIR/"

# =======================
# 2. Deploy to live directory (SELinux-safe)
# =======================
echo "🚚 Deploying to live directory..."

ssh $SSH_OPTS "$USER@$HOST" "
  sudo mkdir -p $REMOTE_LIVE_DIR && \
  sudo rsync -a --delete $REMOTE_TMP_DIR/ $REMOTE_LIVE_DIR/ && \
  sudo rm -rf $REMOTE_TMP_DIR && \
  sudo chown -R nginx:nginx $REMOTE_LIVE_DIR && \
  sudo find $REMOTE_LIVE_DIR -type d -exec chmod 755 {} \; && \
  sudo find $REMOTE_LIVE_DIR -type f -exec chmod 644 {} \; && \
  sudo restorecon -Rv $REMOTE_LIVE_DIR
"

# =======================
# 3. Test Nginx config
# =======================
echo "🧪 Testing Nginx configuration..."
ssh $SSH_OPTS "$USER@$HOST" "sudo nginx -t"

# =======================
# 4. Reload Nginx
# =======================
echo "🔄 Reloading Nginx..."
ssh $SSH_OPTS "$USER@$HOST" "sudo systemctl reload nginx"

# =======================
# 5. Success message
# =======================
echo ""
echo "✅ Deployment complete!"

if [ -n "$DOMAIN" ]; then
  if [ "$USE_SUBDIRECTORY" = true ]; then
    echo "🌐 Visit: https://$DOMAIN/portfolio"
  else
    echo "🌐 Visit: https://$DOMAIN"
  fi
else
  echo "🌐 Visit: http://$HOST/portfolio"
fi

echo ""
echo "🛡️  SELinux-safe | Nginx-safe | Re-deploy safe"
