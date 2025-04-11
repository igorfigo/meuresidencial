
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
- `VITE_DISABLE_NATIVE`: Definido como "true" (importante para evitar problemas com módulos nativos)

## Passos para Deploy

1. No Coolify, crie um novo serviço usando "Docker Compose"
2. Conecte ao seu repositório Git
3. Selecione Docker Compose como Build Pack
4. Especifique o arquivo como `/docker-compose.yml` 
5. Configure todas as variáveis de ambiente mencionadas acima
6. Em configurações avançadas:
   - Aumente o tempo limite de build para pelo menos 15 minutos
   - Aumente os recursos alocados se disponíveis (mínimo 2GB de RAM recomendado)
   - Desative a compilação em paralelo se disponível
7. Desative a opção "Auto Deploy" até que um deploy bem-sucedido seja confirmado
8. Inicie o deploy manualmente

## Solucionando Problemas

### Erro de Módulo Nativo

Se você encontrar erros relacionados a módulos nativos como:
```
MODULE_NOT_FOUND na pasta rollup/dist/native.js
```

Verifique se:
1. A variável `VITE_DISABLE_NATIVE=true` está configurada nas variáveis de ambiente
2. O servidor tem memória suficiente (pelo menos 2GB de RAM disponível)
3. As dependências de build foram instaladas (python3, make, g++)

### Build Falha

Se o build continuar falhando:

1. Acesse o servidor via SSH (se disponível no Coolify)
2. Execute o build manualmente no container temporário para ver logs detalhados:
   ```
   docker exec -it [container-id] sh -c "cd /app && VITE_DISABLE_NATIVE=true npm run build"
   ```
3. Considere aumentar os limites de memória no docker-compose.yml

### Gateway Timeout

Se você ainda encontrar o erro "Gateway Timeout" após um deploy bem-sucedido:

1. Verifique se o Nginx está executando corretamente: `docker exec -it [container-id] nginx -t`
2. Inspecione os logs do Nginx: `docker exec -it [container-id] cat /var/log/nginx/error.log`
3. Verifique se o aplicativo está sendo servido: `docker exec -it [container-id] curl -I http://localhost`

## Monitoramento e Manutenção

- Após o deploy inicial bem-sucedido, você pode habilitar o "Auto Deploy" para futuras atualizações
- Utilize o healthcheck configurado para monitorar a saúde da aplicação
- Configure alertas no Coolify para ser notificado sobre qualquer falha no serviço

## Logs e Depuração

Para acessar os logs do container:
```
docker logs [container-id]
```

Para entrar no container e inspecionar:
```
docker exec -it [container-id] sh
```

Para verificar os arquivos estáticos:
```
docker exec -it [container-id] ls -la /usr/share/nginx/html/
```
