#!/bin/sh

NODE_ENV_DEFAULT="development"
export NODE_ENV="${NODE_ENV_DEFAULT:-$1}"

DIRNAME=$(dirname "$0")
BASEDIR=$(realpath "$DIRNAME")
ROOTDIR=$(realpath "$BASEDIR/..")
TESTING_ENV_FILE="$ROOTDIR/.env.testing"
ENV_FILE="$ROOTDIR/.env"

if [ -f "$TESTING_ENV_FILE" ]; then
  echo "Removing file $TESTING_ENV_FILE"
  rm "$TESTING_ENV_FILE"
fi

if [ -f "$ENV_FILE" ]; then
  echo "There is already a $ENV_FILE file. Aborting..."
  exit 0
fi

echo "Creating default file $ENV_FILE for $NODE_ENV"
JWT_SECRET=$(head -c 20 /dev/random | base64)

echo "NODE_ENV=$NODE_ENV" >"$ENV_FILE"
echo "DATA_DIR=$ROOTDIR/data" >>"$ENV_FILE"
echo "JWT_SECRET=$JWT_SECRET" >>"$ENV_FILE"

"$ROOTDIR/tools/init-database.sh"
