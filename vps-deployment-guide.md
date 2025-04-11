
# Guia de Implantação na VPS - Meu Residencial

Este guia fornece instruções para implantar corretamente a aplicação Meu Residencial em sua VPS.

## Requisitos
- Docker instalado na VPS
- Git instalado na VPS
- Acesso SSH à VPS

## Etapas de Implantação

### 1. Preparar a VPS
Certifique-se que o Docker está instalado e em execução:
```
sudo apt update
sudo apt install -y docker.io
sudo systemctl enable --now docker
```

### 2. Clonar o Repositório (Primeira vez)
```
git clone <seu-repositorio-git> meu-residencial
cd meu-residencial
```

### 3. Implantar a Aplicação
Dê permissão aos scripts e execute o script de implantação:
```
chmod +x deploy-vps.sh clear-nginx-cache.sh
./deploy-vps.sh
```

### 4. Verificar a Implantação
Acesse o site através do IP da VPS ou domínio configurado.

### 5. Resolução de Problemas

#### Se o título ainda não estiver atualizado:

1. **Limpar cache do navegador**:
   - Pressione Ctrl+F5 ou Cmd+Shift+R no navegador

2. **Limpar cache do Nginx**:
   ```
   ./clear-nginx-cache.sh
   ```

3. **Verificar se o arquivo index.html está correto no contêiner**:
   ```
   docker exec -it meu-residencial-container cat /usr/share/nginx/html/index.html | grep title
   ```

4. **Reiniciar completamente o contêiner**:
   ```
   docker restart meu-residencial-container
   ```

5. **Verificar logs para possíveis erros**:
   ```
   docker logs meu-residencial-container
   ```

## Notas Importantes
- Sempre execute o build na VPS para garantir compatibilidade
- O arquivo `index.html` deve conter "Meu Residencial" como título
- Considere configurar um domínio e SSL para a aplicação
