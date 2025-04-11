
#!/bin/bash

# Construir a aplicação localmente
echo "Construindo a aplicação..."
npm run build

# Verificar se a build foi concluída com sucesso
if [ $? -ne 0 ]; then
  echo "Falha ao construir a aplicação. Abortando."
  exit 1
fi

# Verificar se a pasta dist existe
if [ ! -d "dist" ]; then
  echo "A pasta 'dist' não foi criada. Verifique se o build foi concluído corretamente."
  exit 1
fi

# Construir a imagem Docker de produção
echo "Construindo a imagem Docker de produção..."
docker build -t meu-residencial-prod .

# Iniciar o contêiner
echo "Iniciando o contêiner..."
docker run -d -p 80:80 --name meu-residencial-container meu-residencial-prod

echo "Aplicação disponível em http://localhost" 
