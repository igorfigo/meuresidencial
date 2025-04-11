
# Build stage
FROM node:16-alpine AS build

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY .npmrc ./

# Install dependencies with better error handling
RUN npm ci --quiet || npm install --no-fund --no-audit

# Copy the rest of the code
COPY . .

# Build the application with fallback to production mode if needed
RUN npm run build || npm run build -- --mode production

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
  # Increased timeouts to prevent Gateway Timeout \
  proxy_connect_timeout 300; \
  proxy_send_timeout 300; \
  proxy_read_timeout 300; \
  send_timeout 300; \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
