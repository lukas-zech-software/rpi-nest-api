#!/bin/sh
set -e

RPI_TARGET="$RPI"
SRC_ONLY=$1
TARGET_PATH="/var/rpi-nest-api"
DIRNAME=$(dirname "$0")
BASEDIR=$(realpath "$DIRNAME")
ROOTDIR=$(realpath "$BASEDIR/../../..")


if [ ! "$RPI_TARGET" ]; then
  echo "rpi-nest target not provided. Set environment variable RPI to IP or hostname of target"
  exit 1
fi

echo "Deploying to $RPI_TARGET ..."

echo "Changing dir to $ROOTDIR"
cd "$ROOTDIR"

echo "Cleaning..."

echo "Building..."
npm run build

echo "Copying files to target..."
ssh "pi@$RPI_TARGET" "sudo mkdir -p $TARGET_PATH/"

rsync --rsync-path="sudo rsync" -u package* "pi@$RPI_TARGET:$TARGET_PATH/"
rsync --rsync-path="sudo rsync" -azv --update dist/ "pi@$RPI_TARGET:$TARGET_PATH/dist"
rsync --rsync-path="sudo rsync" -auz tools/ "pi@$RPI_TARGET:$TARGET_PATH/tools"

if [ "$SRC_ONLY" ]; then
  echo "Skipping post deploy script"
  echo "Restarting rpi-nest-api on target ..."
  ssh "pi@$RPI_TARGET" "sudo systemctl restart rpi-nest-api"
  exit 0
fi

echo "Executing post-deploy script on target ..."
ssh "pi@$RPI_TARGET" "sudo $TARGET_PATH/tools/target/deploy/post-deploy.sh $TARGET_PATH"

