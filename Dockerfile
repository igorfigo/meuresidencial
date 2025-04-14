# Estágio de produção - apenas copia os arquivos já buildados
FROM nginx:alpine

# Copiar os arquivos de dist diretamente
COPY ./dist /usr/share/nginx/html

# Configurar o nginx
RUN echo 'server { listen 80; server_name localhost; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

# Expor a porta 80 e iniciar o nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 