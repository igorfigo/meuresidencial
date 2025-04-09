# Ambiente Docker para Meu Residencial

Este repositório inclui configuração Docker para executar o projeto localmente.

## Requisitos

- Docker
- Docker Compose

## Configuração

1. Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

2. (Opcional) Edite o arquivo `.env` se necessário para personalizar as configurações.

## Iniciar o ambiente

Execute o seguinte comando para iniciar todos os serviços:

```bash
docker-compose up -d
```

Isso iniciará:
- Frontend React em http://localhost:5173
- Supabase em http://localhost:54321 (Studio: http://localhost:54321)

## Parar o ambiente

```bash
docker-compose down
```

Para remover volumes também (isso apagará o banco de dados):

```bash
docker-compose down -v
```

## Serviços

### Frontend

O frontend está configurado para usar hot-reloading para desenvolvimento, o que significa que as alterações que você fizer no código serão automaticamente refletidas no navegador.

### Supabase

O Supabase está configurado com valores padrão e inclui:
- Banco de dados PostgreSQL
- API RESTful
- Autenticação e autorização
- Supabase Studio (UI de administração)

Acesse o Supabase Studio em: http://localhost:54321

Credenciais padrão para o Supabase Studio:
- Email: admin@example.com
- Senha: postgres

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