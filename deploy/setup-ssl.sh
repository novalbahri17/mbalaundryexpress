#!/bin/bash
# Setup SSL untuk API server (Express + MySQL) dengan Let's Encrypt

# Install Certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Dapatkan SSL certificate
sudo certbot --nginx -d api.mbalaundryexpress.com --non-interactive --agree-tos --email admin@mba-laundry.com

# Auto renew
sudo systemctl enable certbot.timer

echo "SSL setup selesai!"
echo "API sekarang bisa diakses via: https://api.mbalaundryexpress.com"
