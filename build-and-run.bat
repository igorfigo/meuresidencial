@echo off
echo Construindo a aplicacao...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Falha ao construir a aplicacao. Abortando.
    exit /b 1
)

if not exist "dist" (
    echo A pasta 'dist' nao foi criada. Verifique se o build foi concluido corretamente.
    exit /b 1
)

echo Construindo a imagem Docker de producao...
docker build -t meu-residencial-prod -f Dockerfile.prod .

echo Iniciando o container...
docker run -d -p 80:80 --name meu-residencial-container meu-residencial-prod

echo Aplicacao disponivel em http://localhost 