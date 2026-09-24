#!/bin/bash
set -e
DIRNAME=$(dirname "$0")

echo "This script will install rpi-nest-api on this system."

if [ "$EUID" -ne 0 ]
  then echo "Script needs to run as root"
  exit
fi

sudo "$DIRNAME/create-api-user-and-dirs.sh"

echo "Installing systemd services ..."
cp "$DIRNAME"/*.service /lib/systemd/system

systemctl daemon-reload

echo "System setup done."

echo "Building and copying application files"

"$DIRNAME/../deploy/post-deploy.sh" /var/rpi-nest-api
