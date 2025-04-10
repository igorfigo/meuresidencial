FROM node:16 as build

# Diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências com suporte completo para binários nativos
RUN npm ci

# Configurar para forçar o uso de versões JS puras dos pacotes
ENV ROLLUP_SKIP_NODEJS=true
ENV SWC_SKIP_NODEJS=true
ENV NODE_ENV=production
ENV VITE_DISABLE_NATIVE=true

# Copiar o resto dos arquivos
COPY . .

# Modificar o rollup para forçar uso da versão JavaScript pura
RUN sed -i 's/require(\x27\.\/native\.js\x27)/null/g' node_modules/rollup/dist/es/rollup.js || true \
    && sed -i 's/requireWithFriendlyError/\/\/requireWithFriendlyError/g' node_modules/rollup/dist/native.js || true \
    && echo 'module.exports = null;' > node_modules/rollup/dist/native.js || true

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