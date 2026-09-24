#!/bin/sh

export NODE_ENV=production

DIRNAME=$(dirname "$0")
BASEDIR=$(realpath "$DIRNAME")
ROOTDIR=$(realpath "$BASEDIR/..")
ENV_FILE="$ROOTDIR/.env"
DATA_DIR="$ROOTDIR/data"

if [ -f "$ENV_FILE" ]; then
  echo "There is already a $ENV_FILE file. Aborting..."
  exit 0
fi

if [ -d "$DATA_DIR" ]; then
  echo "There is already a $DATA_DIR directory. Aborting..."
  exit 0
fi

echo "Creating default file $ENV_FILE for $NODE_ENV"
JWT_SECRET=$(head -c 20 /dev/random | base64)

echo "NODE_ENV=$NODE_ENV" >"$ENV_FILE"
echo "DATA_DIR=$DATA_DIR" >>"$ENV_FILE"
echo "JWT_SECRET=$JWT_SECRET" >>"$ENV_FILE"
# TODO: Increase jwt timeout for partner day demo
echo "JWT_EXPIRE=7d" >>"$ENV_FILE"

"$ROOTDIR/tools/init-database.sh"
