FROM node:16 as build

# Diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências com suporte completo para binários nativos
RUN npm ci

# Instalar explicitamente as dependências nativas para o Rollup e SWC
RUN npm install --no-save @rollup/rollup-linux-x64-gnu @rollup/rollup-linux-x64-musl \
    && npm install --no-save @swc/core-linux-x64-gnu @swc/core-linux-x64-musl

# Copiar o resto dos arquivos
COPY . .

# Configurar variáveis de ambiente para desabilitar otimizações nativas
ENV NODE_ENV=production
ENV VITE_DISABLE_NATIVE=true

# Construir o app com otimizações nativas desabilitadas
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