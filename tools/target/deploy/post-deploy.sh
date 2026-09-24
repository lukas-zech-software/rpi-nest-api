#!/bin/bash
set -e
# This script is executed with sudo on the target after files were copied

TARGET_PATH=${1:-/var/rpi-nest-api}

if ! command -v node -v &> /dev/null
then
    echo "Node.js could not be found. Installing it now ... "
    sudo apt-get -y install nodejs
    sudo apt-get -y install npm
fi

# Check if node_modules have already been installed
if [ ! -d "$TARGET_PATH/node_modules"  ]; then
  echo "Installing node_modules (this will take some time) ..."
  cd  "$TARGET_PATH" || exit
  # remove husky install script
  npm pkg delete scripts.prepare
  npm install
fi

# Check if node_modules have already been installed
if [ ! -d "$TARGET_PATH/dist"  ]; then
  echo "No precompiled source found. Building ..."
  cd  "$TARGET_PATH" || exit
  npm run build
fi

# Check if environment has already been initialised
if [ ! -f "$TARGET_PATH/.env"  ]; then
  echo "Initialising environment ..."
  cd  "$TARGET_PATH" || exit
  npm run prod:init-environment
fi

if [ ! -f /etc/systemd/timesyncd.conf.d/rpi-nest-ntp.conf  ]; then
  # TODO: Empty timesyncd config file or directory with correct permission should be created during installation
  mkdir -p /etc/systemd/timesyncd.conf.d/
  touch /etc/systemd/timesyncd.conf.d/rpi-nest-ntp.conf
  chown api:rpi-nest /etc/systemd/timesyncd.conf.d/rpi-nest-ntp.conf
fi

echo "Deploying polkit rules ..."

RULES="$TARGET_PATH/dist/dbus/polkit/rules/*.js"
for f in $RULES
do
  mv "$f" "$f.rules"
done
cp "$TARGET_PATH"/dist/dbus/polkit/rules/*.rules /etc/polkit-1/rules.d

# Fix ownership of files after rsync
chown -R api:rpi-nest "$TARGET_PATH"

echo "Restarting rpi-nest-api service ..."
systemctl restart rpi-nest-api

echo "Done"
