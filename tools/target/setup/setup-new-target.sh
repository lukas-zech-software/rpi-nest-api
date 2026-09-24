#!/bin/sh
set -e

RPI_TARGET="${RPI:-$1}"
DIRNAME=$(dirname "$0")

if [ ! "$RPI_TARGET" ]; then
  echo "rpi-nest target not provided"
  exit 1
fi

echo "Running setup script on $RPI_TARGET target ..."
rsync "$DIRNAME/create-api-user-and-dirs.sh" "pi@$RPI_TARGET:/tmp"
ssh "pi@$RPI_TARGET" "sudo /tmp/create-api-user-and-dirs.sh $TARGET_PATH"

echo "Installing systemd services ..."
rsync --update --rsync-path="sudo rsync" "$DIRNAME"/*.service "pi@$RPI_TARGET:/lib/systemd/system"
ssh "pi@$RPI_TARGET" "sudo systemctl daemon-reload"

echo "Done. $RPI_TARGET is now ready for deployment"
