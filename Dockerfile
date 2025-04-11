
# Build stage
FROM node:16-alpine AS build

WORKDIR /app
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar o resto do código
COPY . .

# Construir a aplicação
RUN npm run build

# Production stage
FROM nginx:alpine

# Copiar os arquivos estáticos do build
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuração personalizada do Nginx
RUN echo 'server { \
  listen 80; \
  server_name _; \
  location / { \
    root /usr/share/nginx/html; \
    index index.html; \
    try_files $uri $uri/ /index.html; \
  } \
  # Aumentar timeout para evitar Gateway Timeout \
  proxy_connect_timeout 300; \
  proxy_send_timeout 300; \
  proxy_read_timeout 300; \
  send_timeout 300; \
}' > /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
