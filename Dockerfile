
# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY .npmrc ./

# Install dependencies with better error handling and verbose logging
RUN echo "Installing dependencies..." && \
    npm install --no-fund --no-audit --loglevel verbose || exit 1

# Copy the rest of the code
COPY . .

# Set production environment for build
ENV NODE_ENV=production

# Build the application with verbose logging
RUN echo "Building application..." && \
    npm run build --loglevel verbose || exit 1

# Production stage
FROM nginx:alpine

# Copy static files from build
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with increased timeouts
RUN echo 'server { \
  listen 80; \
  server_name _; \
  location / { \
    root /usr/share/nginx/html; \
    index index.html; \
    try_files $uri $uri/ /index.html; \
  } \
  client_max_body_size 50M; \
  # Increased timeouts to prevent Gateway Timeout \
  proxy_connect_timeout 300; \
  proxy_send_timeout 300; \
  proxy_read_timeout 300; \
  send_timeout 300; \
  keepalive_timeout 300; \
}' > /etc/nginx/conf.d/default.conf

# Copy health check script
RUN echo '#!/bin/sh \n\
wget -qO- http://localhost:80/ || exit 1 \n\
' > /healthcheck.sh && chmod +x /healthcheck.sh

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 CMD /healthcheck.sh

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
