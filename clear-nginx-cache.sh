
#!/bin/bash

echo "Entrando no contêiner Nginx..."
docker exec -it meu-residencial-container sh -c "rm -rf /var/cache/nginx/*"
docker exec -it meu-residencial-container sh -c "nginx -s reload"
echo "Cache do Nginx limpo e serviço reiniciado!"
