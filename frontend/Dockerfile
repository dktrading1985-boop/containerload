# frontend/Dockerfile -- Vite -> nginx multi-stage for production (serves on 3000)

# --- build stage (Debian/bullseye to match esbuild binary) ---
FROM node:18-bullseye AS frontend-builder
WORKDIR /usr/src/app

# copy package files first to use layer cache
COPY frontend/package*.json ./

# Install deps (unsafe-perm to avoid permission issues in container)
RUN npm ci --unsafe-perm --no-audit --no-fund

# Rebuild esbuild binary for this environment and make node_modules readable/executable
RUN npm rebuild esbuild --update-binary || true
RUN chmod -R a+rX node_modules || true

# copy source
COPY frontend/ .

# ensure any esbuild binary files are executable
RUN find node_modules -type f -path '*/@esbuild/*/bin/*' -exec chmod a+x {} \; || true

# compile TS (if present) and build with vite
RUN node ./node_modules/typescript/bin/tsc || true
RUN node ./node_modules/vite/bin/vite.js build

# --- production nginx stage ---
FROM nginx:stable-alpine AS runner

# install gettext (used for envsubst if you use templating)
RUN apk add --no-cache gettext

# remove default html
RUN rm -rf /usr/share/nginx/html/*

# copy static build from builder
COPY --from=frontend-builder /usr/src/app/dist /usr/share/nginx/html

# Provide nginx config (we assume nginx.conf exists in frontend/)
RUN mkdir -p /etc/nginx/conf.d
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
