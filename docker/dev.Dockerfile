# Use systemd enabled debian image for development
FROM jrei/systemd-debian:bookworm as nodejs-base

WORKDIR /usr/app

RUN apt-get update && \
    apt-get install -y \
    nodejs  \
    npm  \
    systemd \
    systemd-sysv \
    net-tools \
    procps  \
    network-manager \
    systemd-timesyncd \
    && \
    rm -rf /var/lib/apt/lists/*


## Install build toolchain, install dependencies and and compile native add-ons
FROM nodejs-base as builder

WORKDIR /usr/app

RUN apt-get update && \
    apt-get install -y \
    python3 \
    make \
    g++  \
    && \
    rm -rf /var/lib/apt/lists/*

COPY package.json .
COPY package-lock.json .

ENV HUSKY=0
RUN npm ci

FROM nodejs-base
ARG ARCH
ARG DEBIAN_RELEASE
ARG COMMIT_SHA
ARG PACKAGE_LOCK_SHA
LABEL org.opencontainers.image.title="lukas-zech-software/rpi-nest-api/dev"
LABEL org.opencontainers.image.description="Development image with prebuilt dependencies and systemd for rpi-nest-api"
LABEL org.opencontainers.image.source="https://github.com/lukas-zech-software/rpi-nest-api.git"
LABEL org.opencontainers.image.revision=$COMMIT_SHA
LABEL org.opencontainers.image.revision-package-lock=$PACKAGE_LOCK_SHA
LABEL org.opencontainers.image.arch=$ARCH
LABEL org.opencontainers.image.os=$DEBIAN_RELEASE

# Copy built node modules and binaries without including the toolchain
COPY --from=builder /usr/app /usr/app/
# Copy other files except src/ and test/ which will be mounted as volumes
COPY . .
