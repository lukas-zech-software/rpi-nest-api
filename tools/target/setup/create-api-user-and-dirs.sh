#!/bin/bash
set -e

echo "Creating group and user for rpi-nest-api..."

if getent group rpi-nest; then
  echo "Group rpi-nest already exists"
else
  echo "Adding group rpi-nest"
  sudo groupadd -r rpi-nest
fi

if getent passwd api; then
  echo "User api already exists"
else
  # create api system user that cannot login and add it to group rpi-nest
  sudo useradd -N -M -r -s /usr/sbin/nologin -d /var/rpi-nest-api -g rpi-nest api
  # Grant access to system journal
  sudo usermod -a -G systemd-journal api
fi

# add default pi user for easy access to api's folders
sudo usermod -a -G rpi-nest pi

echo "Creating directory /var/rpi-nest-api and setting permissions ..."

# create rpi-nest-api folder
sudo mkdir -p /var/rpi-nest-api
sudo chown -R api:rpi-nest /var/rpi-nest-api
sudo chmod -R 774 /var/rpi-nest-api

# create empty timesyncd config so that the api edit it later
mkdir -p /etc/systemd/timesyncd.conf.d
touch /etc/systemd/timesyncd.conf.d/rpi-nest-ntp.conf
sudo chown api:rpi-nest /etc/systemd/timesyncd.conf.d/rpi-nest-ntp.conf
