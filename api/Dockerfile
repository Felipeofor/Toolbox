# syntax=docker/dockerfile:1
FROM node:14-alpine AS deps
WORKDIR /app
# Node 14 ships with npm 6 which cannot read lockfileVersion 3.
# Upgrade to npm 8 before installing.
RUN npm install -g npm@8
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:14-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY config ./config

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

CMD ["node", "src/index.js"]
