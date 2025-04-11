
#!/bin/bash

echo "===== Iniciando implantação na VPS ====="
echo "Data e hora: $(date)"

# Certificando-se que estamos utilizando a versão mais recente do código
echo "Atualizando código fonte..."
git pull

# Garantindo que o arquivo index.html esteja atualizado
echo "Verificando título no index.html..."
grep -q "Meu Residencial" index.html || echo "AVISO: O título 'Meu Residencial' não foi encontrado no index.html!"

# Construindo a imagem Docker de produção com um novo timestamp para evitar problemas de cache
echo "Construindo imagem Docker de produção..."
docker build -t meu-residencial-prod:$(date +%s) -f Dockerfile.prod .

# Parando e removendo contêiner atual se existir
echo "Parando contêiner atual (se existir)..."
docker stop meu-residencial-container || true
docker rm meu-residencial-container || true

# Iniciando o novo contêiner
echo "Iniciando novo contêiner..."
docker run -d -p 80:80 --name meu-residencial-container --restart always meu-residencial-prod:$(date +%s)

# Verificando se o contêiner está executando
echo "Verificando status do contêiner..."
docker ps | grep meu-residencial-container

echo "===== Implantação concluída ====="
echo "Não esqueça de limpar o cache do navegador antes de testar!"
