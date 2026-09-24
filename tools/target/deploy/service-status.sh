#!/bin/sh
set -e

echo "------------------------------------------------"
echo "Service Status: rpi-nest-api"
echo "------------------------------------------------"
sudo systemctl status rpi-nest-api | head -n 4

echo "------------------------------------------------"
echo "Service Status: rpi-nest-api-frontend"
echo "------------------------------------------------"
sudo systemctl status rpi-nest-api-frontend | head -n 4
