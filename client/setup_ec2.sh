#!/bin/bash

set -e  # exit on error

echo "Starting EC2 setup..."

# -------- VARIABLES --------
APP_DIR="/var/www/myapp"
NGINX_CONF="/etc/nginx/sites-available/myapp"
NGINX_ENABLED="/etc/nginx/sites-enabled/myapp"

# -------- UPDATE SYSTEM --------
echo "Updating system..."
sudo apt-get update -y

# -------- INSTALL NGINX --------
if ! command -v nginx &> /dev/null; then
  echo "Installing Nginx..."
  sudo apt-get install -y nginx
else
  echo "Nginx already installed"
fi

# -------- CREATE APP DIRECTORY --------
if [ ! -d "$APP_DIR" ]; then
  echo "Creating app directory..."
  sudo mkdir -p $APP_DIR
fi

# Ensure correct permissions
sudo chown -R $USER:$USER $APP_DIR

# -------- CONFIGURE NGINX --------
if [ ! -f "$NGINX_CONF" ]; then
  echo "Creating Nginx config..."

  sudo tee $NGINX_CONF > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    root $APP_DIR;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

  # Enable config
  sudo ln -sf $NGINX_CONF $NGINX_ENABLED

  # Remove default config (if exists)
  if [ -f "/etc/nginx/sites-enabled/default" ]; then
    sudo rm /etc/nginx/sites-enabled/default
  fi

else
  echo "Nginx config already exists"
fi

# -------- TEST NGINX --------
echo "esting Nginx config..."
sudo nginx -t

# -------- START / RESTART NGINX --------
echo "Restarting Nginx..."
sudo systemctl enable nginx
sudo systemctl restart nginx

echo "Setup complete!"
echo "App directory: $APP_DIR"
