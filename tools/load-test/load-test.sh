#!/bin/sh

PI_TARGET="${PI_TARGET:-$1}"
OA_GENERATOR="${OA_GENERATOR:-$2}"

if [ ! "$PI_TARGET" ]; then
  echo "No target host provided"
  exit 1
fi

if [ ! "$OA_GENERATOR" ]; then
  echo "No generator name provided"
  exit 1
fi

TIMESTAMP=$(date +"%s")
DIRNAME=$(dirname "$0")
BASEDIR=$(realpath "$DIRNAME")
ROOTDIR=$(realpath "$BASEDIR/..")
GENERATOR_LOG_DIR="$ROOTDIR/logs/$OA_GENERATOR"

if [ -f "$GENERATOR_LOG_DIR/.current" ]; then
  TIMESTAMP=$(cat "$GENERATOR_LOG_DIR/.current")
fi

GENERATOR_LOG_DIR="$GENERATOR_LOG_DIR/$TIMESTAMP"

if [ ! -d "$GENERATOR_LOG_DIR" ]; then
  mkdir -p "$GENERATOR_LOG_DIR"
fi

echo "Running load test against $PI_TARGET and write logs to $GENERATOR_LOG_DIR"
node ./load-test.js "$PI_TARGET" >> "$GENERATOR_LOG_DIR/load-test.json"
