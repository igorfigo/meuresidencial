FROM nginx:alpine

RUN npm run build
# Copiar os arquivos de build do projeto
COPY ./dist /usr/share/nginx/html

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