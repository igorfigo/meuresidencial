FROM node:18-alpine

WORKDIR /app

# Configurar o npm para não atualizar
RUN npm config set update-notifier false && \
    npm config set fund false

# Copiar arquivos de configuração
COPY package*.json ./
COPY bun.lockb ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY index.html ./
COPY components.json ./
COPY .eslintrc* ./

# Instalar dependências com configurações extras para melhorar estabilidade
RUN npm ci --no-audit --no-update-notifier --prefer-offline --legacy-peer-deps

# Copiar código fonte
COPY src/ ./src/
COPY public/ ./public/

# Expor a porta que o Vite usa
EXPOSE 5173

# Comando para iniciar o servidor de desenvolvimento
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 