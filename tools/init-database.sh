#!/bin/sh
set -e

DIRNAME=$(dirname "$0")
BASEDIR=$(realpath "$DIRNAME")
ROOTDIR=$(realpath "$BASEDIR/..")

echo "Initializing database for $NODE_ENV"

echo "Creating admin user"
# Create admin user in empty test db
node "$ROOTDIR/dist/cli" users create-admin "$@"

echo "Creating empty database with defaults"
# Init empty db with default settings
node "$ROOTDIR/dist/cli" datastore reset-all-defaults "$@"

echo "Done"
