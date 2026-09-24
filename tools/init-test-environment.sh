#!/bin/sh
set -e

export NODE_ENV="testing"
DIRNAME=$(dirname "$0")
BASEDIR=$(realpath "$DIRNAME")
ROOTDIR=$(realpath "$BASEDIR/..")
ENV_FILE="$ROOTDIR/.env.$NODE_ENV"

# Create temporary directory for the database so every test run uses a fresh copy
TIMESTAMP=$(date +"%s")
TMPDIR=${TMPDIR:-/tmp}
TMPDIR="$TMPDIR/rpi-nest-api-$TIMESTAMP"

echo "Creating temp directory for $NODE_ENV at $TMPDIR"
mkdir -p "$TMPDIR"

echo "Creating $NODE_ENV file $ENV_FILE"
JWT_SECRET=$(head -c 20 /dev/random | base64)
echo "NODE_ENV=$NODE_ENV" >"$ENV_FILE"
echo "JWT_SECRET=$JWT_SECRET" >>"$ENV_FILE"
echo "DATA_DIR=$TMPDIR" >>"$ENV_FILE"

"$ROOTDIR/tools/init-database.sh"
