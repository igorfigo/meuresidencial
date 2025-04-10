FROM node:18 AS builder

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

# Instalar dependências e fix para o Rollup
RUN npm install --no-audit --no-update-notifier --force && \
    npm install @rollup/rollup-linux-x64-gnu @swc/core-linux-x64-gnu

# Patch para desabilitar dependências nativas
RUN echo 'process.env.ROLLUP_NATIVE = false;' > ./rollup-patch.js && \
    echo "module.exports = {};" > ./node_modules/@swc/core/binding.js

# Copiar código fonte
COPY src/ ./src/
COPY public/ ./public/

# Usar um servidor web simples
FROM node:18-slim

WORKDIR /app

# Instalar servidor HTTP simples
RUN npm install -g http-server

# Copiar arquivos do projeto
COPY --from=builder /app /app

# Expor a porta 8080
EXPOSE 8080

# Iniciar servidor HTTP
CMD ["npx", "http-server", "-p", "8080"] 