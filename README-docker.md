# Ambiente Docker para Meu Residencial

Este repositório inclui configuração Docker para executar o frontend do projeto localmente.

## Requisitos

- Docker
- Docker Compose
- Acesso a um projeto Supabase na web

## Configuração

1. Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

2. Edite o arquivo `.env` para incluir as credenciais corretas do seu projeto Supabase:
   - `VITE_SUPABASE_URL`: URL do seu projeto Supabase (ex: https://abcdefghijklm.supabase.co)
   - `VITE_SUPABASE_ANON_KEY`: Chave anônima do seu projeto Supabase

## Iniciar o ambiente

Execute o seguinte comando para iniciar o frontend:

```bash
docker-compose up -d
```

Isso iniciará:
- Frontend React em http://localhost:5173

## Parar o ambiente

```bash
docker-compose down
```

## Serviços

### Frontend

O frontend está configurado para usar hot-reloading para desenvolvimento, o que significa que as alterações que você fizer no código serão automaticamente refletidas no navegador.

O frontend se conecta ao seu projeto Supabase hospedado na web usando as variáveis de ambiente configuradas no arquivo `.env`.

## Solução de problemas

Se encontrar erros ao iniciar os serviços:

1. Verifique se as portas não estão sendo usadas por outros serviços
2. Tente reconstruir as imagens:
   ```bash
   docker-compose build --no-cache
   ```
3. Verifique os logs:
   ```bash
   docker-compose logs -f
   ```
4. Certifique-se de que as credenciais do Supabase estão corretas no arquivo `.env`

### Erros comuns

#### Erro com npm ci durante a construção

Se encontrar erros como:
```
ERROR: process "/bin/sh -c npm ci" did not complete successfully: exit code: 1
```

Tente as seguintes soluções:

1. Limpe os contêineres e imagens Docker existentes:
   ```bash
   docker-compose down
   docker system prune -a
   ```

2. Remova a pasta node_modules local (se existir) e deixe o Docker gerenciar as dependências:
   ```bash
   rm -rf node_modules
   ```

3. Verifique se há problemas de compatibilidade no seu package.json entre as versões das dependências.

4. Caso continue com problemas, tente usar uma versão específica do Node.js no Dockerfile, alterando a primeira linha para:
   ```
   FROM node:16-alpine
   ``` 