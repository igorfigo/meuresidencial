FROM node:16 as build

WORKDIR /app
COPY . .

# Usar --production=false para garantir que devDependencies sejam instaladas
RUN npm install --production=false

# Agora compilar a aplicação
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
RUN echo 'server { listen 80; server_name localhost; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 