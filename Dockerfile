FROM node:16 as build

WORKDIR /app
COPY . .

# Instalar dependências incluindo as de desenvolvimento
RUN npm install --production=false

# Tentar instalar dependências nativas do Rollup, mas não falhar se não conseguir
RUN npm install --no-save @rollup/rollup-linux-x64-gnu @rollup/rollup-linux-x64-musl || true

# Modificar o Rollup para usar a versão JS pura
RUN sed -i 's/require(\x27\.\/native\.js\x27)/null/g' node_modules/rollup/dist/es/rollup.js || true \
    && sed -i 's/requireWithFriendlyError/\/\/requireWithFriendlyError/g' node_modules/rollup/dist/native.js || true \
    && echo 'module.exports = null;' > node_modules/rollup/dist/native.js || true

# Configurar variáveis de ambiente para desabilitar otimizações nativas
ENV VITE_DISABLE_NATIVE=true

# Agora compilar a aplicação
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
RUN echo 'server { listen 80; server_name localhost; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 