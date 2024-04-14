FROM ghcr.io/bitnoize/node:20-bookworm

LABEL org.opencontainers.image.source=https://github.com/bitnoize/avito-speculant

ARG DEBIAN_FRONTEND=noninteractive

RUN set -eux; \
    # User home
    usermod -d /home/avito-speculant node; \
    mkdir -m 0750 /home/avito-speculant; \
    chown node:node /home/avito-speculant

WORKDIR /usr/src/avito-speculant

COPY package.json package*.json tsconfig*.json .

COPY libs/config/package*.json libs/config/tsconfig*.json libs/config/
COPY libs/logger/package*.json libs/logger/tsconfig*.json libs/logger/
COPY libs/common/package*.json libs/common/tsconfig*.json libs/common/
COPY libs/redis/package*.json libs/redis/tsconfig*.json libs/redis/
COPY libs/queue/package*.json libs/queue/tsconfig*.json libs/queue/

COPY apps/worker-throttle/package*.json apps/worker-throttle/tsconfig*.json apps/worker-throttle/

RUN set -eux; \
    npm install

COPY libs/config/ libs/config/
COPY libs/logger/ libs/logger/
COPY libs/common/ libs/common/
COPY libs/redis/ libs/redis/
COPY libs/queue/ libs/queue/

COPY apps/worker-throttle/ apps/worker-throttle/

RUN set -eux; \
    npm run -w @avito-speculant/config build; \
    npm run -w @avito-speculant/logger build; \
    npm run -w @avito-speculant/common build; \
    npm run -w @avito-speculant/redis build; \
    npm run -w @avito-speculant/queue build; \
    npm run -w @avito-speculant/worker-throttle build

COPY docker-entrypoint/ /lib/entrypoint/

CMD ["npm", "-w", "@avito-speculant/worker-throttle", "run", "start"]

