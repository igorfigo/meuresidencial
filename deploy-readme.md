
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
- `NODE_ENV`: Definido como "production"

## Passos para Deploy

1. No Coolify, crie um novo serviço usando "Docker Compose"
2. Conecte ao seu repositório Git
3. Selecione Docker Compose como Build Pack
4. Especifique o arquivo como `/docker-compose.yml` 
5. Configure todas as variáveis de ambiente mencionadas acima
6. Em configurações avançadas:
   - Aumente o tempo limite de build para pelo menos 10 minutos
   - Aumente os recursos alocados se disponíveis
7. Desative a opção "Auto Deploy" até que um deploy bem-sucedido seja confirmado
8. Inicie o deploy manualmente

## Solucionando Problemas

### Build Falha

Se o build falhar:

1. Verifique os logs do build no Coolify para identificar o erro específico
2. Certifique-se de que o servidor tem memória suficiente (pelo menos 2GB de RAM disponível)
3. Tente aumentar o timeout de build nas configurações avançadas do Coolify

### Gateway Timeout

Se você ainda encontrar o erro "Gateway Timeout" após um deploy bem-sucedido:

1. Verifique se a aplicação está realmente rodando com `docker ps`
2. Verifique os logs do container com `docker logs [container-id]`
3. Certifique-se de que as portas estão corretamente configuradas e expostas
4. Verifique se há algum firewall ou configuração de rede bloqueando as conexões

## Monitoramento e Manutenção

- Após o deploy inicial bem-sucedido, você pode habilitar o "Auto Deploy" para futuras atualizações
- Utilize o healthcheck configurado para monitorar a saúde da aplicação
- Configure alertas no Coolify para ser notificado sobre qualquer falha no serviço

## Ajuste de Recursos

Se o servidor VPS tiver recursos limitados, ajuste os limites de recursos no `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      memory: 512M  # Reduza para 512MB se necessário
```
