# frontend/Dockerfile -- Vite -> nginx multi-stage for production (serves on 3000)

# --- build stage ---
FROM node:18-bullseye AS frontend-builder
WORKDIR /usr/src/app

# install deps (use unsafe-perm in CI/container)
COPY package*.json ./
RUN npm ci --unsafe-perm --no-audit --no-fund

# Ensure esbuild binary can be updated later (rebuild may be run again after copying source)
RUN npm rebuild esbuild --update-binary || true
RUN chmod -R a+rX node_modules || true

# Copy source (build context)
COPY . .

# After copying, rebuild esbuild and ensure the binary is executable (fixes EACCES during build)
RUN npm rebuild esbuild --update-binary || true
RUN chmod -R a+rX node_modules || true
RUN find node_modules -type f -path '*/@esbuild/*/bin/*' -exec chmod a+x {} \; || true

# Transpile TypeScript (if present) and build with Vite
RUN node ./node_modules/typescript/bin/tsc || true
RUN node ./node_modules/vite/bin/vite.js build

# --- production nginx stage ---
FROM nginx:stable-alpine AS runner
# configure nginx (gettext used for envsubst if needed)
RUN apk add --no-cache gettext

# remove default html
RUN rm -rf /usr/share/nginx/html/*

# copy static build from builder
COPY --from=frontend-builder /usr/src/app/dist /usr/share/nginx/html

# Provide a simple nginx config that listens on 3000 and serves static files
RUN mkdir -p /etc/nginx/conf.d
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
