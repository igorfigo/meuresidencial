
# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Set environment variable to disable native modules
ENV VITE_DISABLE_NATIVE=true
ENV NODE_ENV=production

# Install build dependencies
RUN apk add --no-cache python3 make g++ git

# Copy package files first for better caching
COPY package*.json ./
COPY .npmrc ./

# Install dependencies with specific flags to avoid native module issues
RUN npm install --no-audit --no-fund --legacy-peer-deps

# Copy the rest of the code
COPY . .

# Try to build with fallbacks for native modules
RUN npm run build || \
    # If first build fails, try with different NODE_OPTIONS
    (NODE_OPTIONS=--max_old_space_size=4096 npm run build) || \
    # If that fails too, try with additional env vars
    (DISABLE_ESLINT_PLUGIN=true NODE_OPTIONS=--openssl-legacy-provider npm run build)

# Production stage
FROM nginx:alpine

# Copy static files from build
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with increased timeouts
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

# Create healthcheck script
RUN echo '#!/bin/sh \n\
wget -qO- http://localhost:80/ || exit 1 \n\
' > /healthcheck.sh && chmod +x /healthcheck.sh

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 CMD /healthcheck.sh

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
