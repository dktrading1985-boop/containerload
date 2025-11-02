# builder stage: install dev deps and build
FROM node:18-bullseye AS builder
WORKDIR /usr/src/app

# copy package manifests and install ALL deps (including dev) for build
COPY package*.json ./
RUN npm ci

# copy source
COPY . .

# ensure tsc binary is executable (fixes "Permission denied")
RUN chmod +x node_modules/.bin/tsc || true

# compile TypeScript
RUN npx tsc -p tsconfig.json

# runtime stage: copy built artifacts and install only production deps
FROM node:18-bullseye-slim AS runtime
WORKDIR /usr/src/app

# copy built output from builder
COPY --from=builder /usr/src/app/dist ./dist
# copy prisma schema (if present) so runtime can generate client
COPY --from=builder /usr/src/app/prisma ./prisma
# copy package manifests and install production deps only
COPY package*.json ./
RUN npm ci --omit=dev

# generate Prisma client in runtime (ensures @prisma/client files exist)
RUN npx prisma generate || true

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

# run the built server entry (server.js is produced by your current build)
CMD ["node", "dist/server.js"]
