
# Instruções de Deploy via Coolify

Este documento contém instruções para fazer o deploy da aplicação Meu Residencial utilizando Coolify com Docker Compose.

## Pré-requisitos

- Acesso ao Coolify
- Repositório Git com o código da aplicação
- Variáveis de ambiente configuradas no Coolify

## Variáveis de Ambiente Necessárias

Certifique-se de configurar as seguintes variáveis de ambiente no Coolify:

- `VITE_SUPABASE_URL`: URL do seu projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave anônima do seu projeto Supabase

## Passos para Deploy

1. No Coolify, crie um novo serviço usando "Docker Compose"
2. Conecte ao seu repositório Git
3. Especifique o caminho do arquivo como `/docker-compose.yml`
4. Configure as variáveis de ambiente mencionadas acima
5. Inicie o deploy

## Solucionando Problemas

### Gateway Timeout

Se você ainda encontrar o erro "Gateway Timeout":

1. Verifique os logs do contêiner no Coolify
2. Aumente o valor do parâmetro `start_period` no healthcheck para dar mais tempo para a aplicação iniciar
3. Certifique-se de que a porta 80 não está bloqueada por firewall
4. Verifique se o Nginx está iniciando corretamente dentro do contêiner

## Monitoramento

Após o deploy, você pode monitorar a saúde da aplicação através do Coolify. O healthcheck configurado verificará se a aplicação está respondendo corretamente.
