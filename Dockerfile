# syntax=docker/dockerfile:1
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app

# Install dependencies with caching and bind mounts for deterministic builds
COPY --link package.json ./
RUN npm install
COPY . .

FROM node:${NODE_VERSION}-slim AS runner
WORKDIR /app

# Copy application source (excluding files via .dockerignore)
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/server.js ./server.js
COPY --from=base /app/testBuy.js ./testBuy.js
COPY --from=base /app/package-lock.json ./package-lock.json
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/public ./public
COPY --from=base /app/utils ./utils
COPY --from=base /app/handlers ./handlers
EXPOSE 4021

CMD ["node", "server.js"]
