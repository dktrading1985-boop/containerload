# frontend/Dockerfile -- Vite -> nginx multi-stage for production (serves on 3000)

# --- build stage ---
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

# copy only package manifests first for caching
COPY package*.json ./
RUN npm ci

# copy rest of the source and build
COPY . .
ENV NODE_ENV=production
RUN npm run build

# --- production nginx stage ---
FROM nginx:stable-alpine AS runner
# configure nginx to listen on 3000
RUN apk add --no-cache gettext

# remove default html
RUN rm -rf /usr/share/nginx/html/*

# copy static build from builder
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Provide a simple nginx config that listens on 3000 and serves static files
RUN mkdir -p /etc/nginx/conf.d
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
