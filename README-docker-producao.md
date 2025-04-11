# Docker para Produção - Meu Residencial

Este documento explica como utilizar o Docker para implantar a aplicação em produção.

## Problema com o servidor de desenvolvimento

Ao tentar executar o servidor de desenvolvimento Vite no Docker, enfrentamos problemas com dependências nativas do Rollup/SWC que são difíceis de resolver em ambiente Linux.

## Solução para Produção

Para produção, a melhor abordagem é:

1. Construir a aplicação localmente no seu ambiente de desenvolvimento
2. Criar uma imagem Docker que simplesmente serve os arquivos estáticos gerados

## Instruções de Uso

### Método 1: Scripts Automatizados

Desenvolvemos scripts para automatizar todo o processo:

#### No Windows:
```
.\build-and-run.bat
```

#### No Linux/macOS:
```
chmod +x build-and-run.sh
./build-and-run.sh
```

### Método 2: Processo Manual

1. Construa a aplicação localmente:
   ```
   npm run build
   ```

2. Verifique se a pasta `dist` foi criada com sucesso.

3. Construa a imagem Docker:
   ```
   docker build -t meu-residencial-prod -f Dockerfile.prod .
   ```

4. Execute o contêiner:
   ```
   docker run -d -p 80:80 --name meu-residencial-container meu-residencial-prod
   ```

5. Acesse a aplicação em http://localhost

## Detalhes Técnicos

- A imagem Docker usa o **nginx:alpine** como base (leve e eficiente)
- A configuração do Nginx está otimizada para Single-Page Applications (SPA)
- O servidor responde na porta 80

## Limpeza

Para parar e remover o contêiner:
```
docker stop meu-residencial-container
docker rm meu-residencial-container
```

Para remover a imagem:
```
docker rmi meu-residencial-prod
``` 