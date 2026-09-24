#!/bin/bash
set -e

if [ ! "$CI_DEPLOY_USER" ]; then
  echo "deploy user not provided"
  exit 1
fi

if [ ! "$CI_DEPLOY_PASSWORD" ]; then
  echo "deploy password not provided"
  exit 1
fi

IMAGE_TYPE="$1"
if [[ ! $IMAGE_TYPE =~ ^(ci|dev)$ ]]; then
  echo "Must provide image type 'ci' or 'dev' as argument"
  exit 1
fi

DIRNAME=$(dirname "$0")
BASEDIR=$(realpath "$DIRNAME")
ROOTDIR=$(realpath "$BASEDIR/..")

CI_REGISTRY="${CI_REGISTRY:-ghcr.io}"
DEBIAN_RELEASE="${DEBIAN_RELEASE:-bookworm}"
ARCH="${ARCH:-arm64}"

SRC_LABEL="$ARCH-latest"
TARGET_IMAGE="$CI_REGISTRY/lukas-zech-software/rpi-nest-api/rpi-nest-api/$IMAGE_TYPE-$DEBIAN_RELEASE"
TARGET_IMAGE_REF="$TARGET_IMAGE:$SRC_LABEL"

COMMIT_SHA=$(git rev-parse --short HEAD )
PACKAGE_LOCK_SHA=$(git ls-files -s --abbrev package-lock.json | awk '{ print $2 }')

if [ ! "$BUILDX_USE_LOCAL_CACHE" ]; then
  echo "Using registry build cache"
  CACHE_FROM="type=registry,ref=$TARGET_IMAGE:buildcache"
  CACHE_TO="type=registry,ref=$TARGET_IMAGE:buildcache"
else
  echo "Using local build cache"
  CACHE_FROM="type=local,src=$BASEDIR/.cache"
  CACHE_TO="type=local,dest=$BASEDIR/.cache,mode=max,compression=uncompressed"
fi

echo "Building $IMAGE_TYPE image with current dependencies"
echo "Target image: $TARGET_IMAGE_REF"

cd "$ROOTDIR"
docker login -u "$CI_DEPLOY_USER" -p "$CI_DEPLOY_PASSWORD" "$CI_REGISTRY"
docker buildx create --use
docker buildx build \
  --file "$BASEDIR/$IMAGE_TYPE.Dockerfile" \
  --platform linux/arm64/v8 \
  --cache-from "$CACHE_FROM" \
  --cache-to "$CACHE_TO" \
  --push \
  --tag "$TARGET_IMAGE_REF" \
  --provenance=false \
  --build-arg ARCH="$ARCH" \
  --build-arg DEBIAN_RELEASE="$DEBIAN_RELEASE" \
  --build-arg COMMIT_SHA="$COMMIT_SHA" \
  --build-arg PACKAGE_LOCK_SHA="$PACKAGE_LOCK_SHA" \
  .
