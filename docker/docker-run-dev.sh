#!/bin/bash
set -e

CI_REGISTRY="${CI_REGISTRY:-ghcr.io}"
DEBIAN_RELEASE="${DEBIAN_RELEASE:-bookworm}"
ARCH="${ARCH:-arm64}"

IMAGE_REF="$CI_REGISTRY/lukas-zech-software/rpi-nest-api/rpi-nest-api/dev-$DEBIAN_RELEASE:$ARCH-latest"

CONTAINER_STATE=$(docker container inspect --format '{{json .State.Status}}' rpi-nest-api-dev || echo "not_running")

if [[ "$CONTAINER_STATE" == '"running"' ]]; then
  echo "rpi-nest-api-dev container already running. Attaching ..."
  docker attach rpi-nest-api-dev
  exit
fi

echo "Starting rpi-nest-api-dev container ..."

docker run \
  -d \
  --rm \
  --name rpi-nest-api-dev \
  -p 3000:3000 \
  -v ./src:/usr/app/src \
  -v ./test:/usr/app/test \
  --tmpfs /tmp \
  --tmpfs /run \
  --tmpfs /run/lock \
  --privileged \
  --cgroupns=host \
  -v /sys/fs/cgroup:/sys/fs/cgroup:rw \
  "$IMAGE_REF" \
  npm run start:dev:docker
