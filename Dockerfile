FROM node:22-bookworm-slim AS builder

ENV PUPPETEER_SKIP_DOWNLOAD=true

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-bookworm-slim

# APT installs Chromium's runtime dependencies automatically.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    chromium \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Use the system Chromium instead of downloading another browser.
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/index.js"]
