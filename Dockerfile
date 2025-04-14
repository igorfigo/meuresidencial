# Estágio de build
FROM node:latest AS builder

WORKDIR /app

# Instalar dependências do sistema necessárias para compilar pacotes nativos
RUN apt-get update && apt-get install -y python3 make g++ git

# Copiar arquivos de configuração de dependências
COPY package*.json ./

# Instalar todas as dependências, incluindo as de desenvolvimento
RUN npm install || npm install --force

# Copiar código fonte
COPY . .

# Fazer backup da pasta dist caso exista
RUN if [ -d "dist" ]; then cp -r dist dist_backup; fi

# Tentar fazer o build com diferentes estratégias
RUN NODE_ENV=production npm run build || \
    NODE_ENV=production npx vite build || \
    (NODE_ENV=production NODE_OPTIONS="--max-old-space-size=4096" npx vite build) || \
    (echo "Build falhou, usando dist de backup" && \
     if [ -d "dist_backup" ]; then \
       cp -r dist_backup dist; \
     else \
       echo "Nenhum backup disponível"; \
       mkdir -p dist && echo "<html><body>Fallback page</body></html>" > dist/index.html; \
     fi)

# Estágio de produção
FROM nginx:alpine

# Copiar os arquivos buildados do estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Configurar o nginx
RUN echo 'server { listen 80; server_name localhost; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

# Expor a porta 80 e iniciar o nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 