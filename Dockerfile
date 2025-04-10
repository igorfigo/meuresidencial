FROM node:16-alpine as build

# Diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar o resto dos arquivos
COPY . .

# Construir o app
RUN npm run build

# Estágio de produção
FROM nginx:alpine

# Copiar os arquivos de build do projeto
COPY --from=build /app/dist /usr/share/nginx/html

# Configuração do Nginx para SPA
RUN echo 'server { \
  listen 80; \
  server_name localhost; \
  location / { \
    root /usr/share/nginx/html; \
    index index.html; \
    try_files $uri $uri/ /index.html; \
  } \
}' > /etc/nginx/conf.d/default.conf

# Expor a porta 80
EXPOSE 80

# Iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"] 