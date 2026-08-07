# React frontend — Node 22 + Vite dev server
FROM node:22-alpine

# Run as the non-root `node` user (uid 1000, matches the host user) so the
# Vite cache and node_modules stay writable without root ownership.
RUN mkdir -p /app && chown node:node /app
WORKDIR /app
USER node

# Install dependencies at build time (used when running without a bind mount).
# --network=host: the VM sandbox blocks bridge-network egress during builds.
COPY --chown=node:node package.json package-lock.json ./
RUN --network=host npm ci

COPY --chown=node:node . .

EXPOSE 5173

# Bind to 0.0.0.0 so the Vite dev server is reachable from the host
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
