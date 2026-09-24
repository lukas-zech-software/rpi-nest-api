#!/bin/bash
set -e

if [ "$EUID" -ne 0 ]
  then echo "Script needs to run as root"
  exit
fi

API_BRANCH="${1:-main}"
FE_BRANCH="${2:-main}"

echo "------------------------------------------------"
echo "Update starting: rpi-nest-api"
echo "Branch: $API_BRANCH"
echo "------------------------------------------------"

# Take ownership to avoid problems with git
# Ownership will be fixed again afterwards
chown -R root:root /var/rpi-nest-api
cd /var/rpi-nest-api
git config pull.rebase true
git fetch
git checkout "$API_BRANCH"
git pull

# Install new dependencies, if any were added
npm install
# Rebuild api
npm run build

# Post deploy script will copy polkit rules, fix ownership and restart the systemd service
echo "Executing post-deploy script ..."
/var/rpi-nest-api/tools/target/deploy/post-deploy.sh /var/rpi-nest-api

echo "------------------------------------------------"
echo "Update completed: rpi-nest-api"
echo "------------------------------------------------"


echo "------------------------------------------------"
echo "Update starting: rpi-nest-api-frontend"
echo "Branch: $FE_BRANCH"
echo "------------------------------------------------"

# Take ownership to avoid problems with git
# Ownership will be fixed again afterwards
chown -R root:root /var/rpi-nest-api-frontend

cd /var/rpi-nest-api-frontend
git config pull.rebase true
git checkout "$API_BRANCH"
git pull

# Install new dependencies, if any were added
# No need to rebuild as this happens everytime the frontend is started
npm install
# Fix ownership and restart
chown -R pi:pi /var/rpi-nest-api-frontend
systemctl restart rpi-nest-api-frontend

echo "------------------------------------------------"
echo "Update completed: rpi-nest-api"
echo "------------------------------------------------"

./service-status.sh
