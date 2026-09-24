## Install build toolchain, install dependencies and and compile native add-ons
FROM node:18-alpine as builder

RUN apk add --no-cache \
    python3 \
    make \
    g++

#WORKDIR /usr/app
#ENV CI_APP_DIR=/usr/app

COPY package.json .
COPY package-lock.json .

ENV HUSKY=0
RUN npm ci

FROM node:18-alpine
ARG ARCH
ARG DEBIAN_RELEASE
ARG COMMIT_SHA
ARG PACKAGE_LOCK_SHA
LABEL org.opencontainers.image.title="rpi-nest-api/ci"
LABEL org.opencontainers.image.description="CI image with dependencies for rpi-nest-api"
LABEL org.opencontainers.image.source="https://github.com/lukas-zech-software/rpi-nest-api.git"
LABEL org.opencontainers.image.revision=$COMMIT_SHA
LABEL org.opencontainers.image.revision-package-lock=$PACKAGE_LOCK_SHA
LABEL org.opencontainers.image.arch=$ARCH
LABEL org.opencontainers.image.os=$DEBIAN_RELEASE

## Copy built node modules and binaries without including the toolchain
COPY --from=builder . .
