#!/bin/sh

DIRNAME=$(dirname "$0")
BASEDIR=$(realpath "$DIRNAME")
ROOTDIR=$(realpath "$BASEDIR/..")

echo "Resetting local environment"

echo "Removing file $ROOTDIR/.env"
rm "$ROOTDIR/.env"
echo "Removing database at $ROOTDIR/data"
rm -rf "$ROOTDIR/data"

"$ROOTDIR/tools/init-dev-environment.sh" --force
