#!/bin/bash

# ============================================================================
# EXEMPLOS DE REQUISIÇÕES CURL PARA TESTAR O CHATBOT
# ============================================================================
# 
# Antes de executar:
# 1. Certifique-se de que o servidor está rodando: npm run dev
# 2. Obtenha um JWT token válido fazendo login
# 3. Substitua {JWT_TOKEN} pelo seu token real
# 4. Substitua {BACKEND_URL} por http://localhost:4000
#
# Execução:
# chmod +x test_chatbot_api.sh
# ./test_chatbot_api.sh
#
# ============================================================================

BASE_URL="http://localhost:4000"
JWT_TOKEN="seu_token_jwt_aqui"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== TESTES DO CHATBOT API ===${NC}\n"

# ============================================================================
# 1. HEALTH CHECK
# ============================================================================

echo -e "${YELLOW}1. Verificando saúde do serviço...${NC}"
curl -X GET "${BASE_URL}/chat/health" \
  -H "Content-Type: application/json" \
  -s | jq '.'

echo -e "\n"

# ============================================================================
# 2. CHAT DO CLIENTE - Exemplo 1
# ============================================================================

echo -e "${YELLOW}2. Testando chat do cliente (marcar consulta)...${NC}"
curl -X POST "${BASE_URL}/chat/client" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"message": "Quero marcar uma consulta para meu cachorro Max"}' \
  -s | jq '.'

echo -e "\n"

# ============================================================================
# 3. CHAT DO CLIENTE - Exemplo 2
# ============================================================================

echo -e "${YELLOW}3. Testando chat do cliente (horários disponíveis)...${NC}"
curl -X POST "${BASE_URL}/chat/client" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"message": "Quais horários estão disponíveis amanhã com a Dra. Ana?"}' \
  -s | jq '.'

echo -e "\n"

# ============================================================================
# 4. CHAT DO ADMIN - Exemplo 1
# ============================================================================

echo -e "${YELLOW}4. Testando chat do admin (agendamentos de hoje)...${NC}"
curl -X POST "${BASE_URL}/chat/admin" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"message": "Quantas consultas temos hoje?"}' \
  -s | jq '.'

echo -e "\n"

# ============================================================================
# 5. CHAT DO ADMIN - Exemplo 2
# ============================================================================

echo -e "${YELLOW}5. Testando chat do admin (estatísticas)...${NC}"
curl -X POST "${BASE_URL}/chat/admin" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"message": "Qual veterinário tem mais consultas?"}' \
  -s | jq '.'

echo -e "\n"

# ============================================================================
# 6. HISTÓRICO DE CONVERSA
# ============================================================================

echo -e "${YELLOW}6. Obtendo histórico de conversa...${NC}"
curl -X GET "${BASE_URL}/chat/history?limit=10" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -s | jq '.'

echo -e "\n"

# ============================================================================
# TESTES SEM AUTENTICAÇÃO (devem falhar)
# ============================================================================

echo -e "${YELLOW}=== TESTES DE ERRO (esperado) ===${NC}\n"

echo -e "${YELLOW}7. Tentando acessar chat sem autenticação...${NC}"
curl -X POST "${BASE_URL}/chat/client" \
  -H "Content-Type: application/json" \
  -d '{"message": "Teste"}' \
  -s | jq '.'

echo -e "\n"

echo -e "${YELLOW}8. Tentando acessar com mensagem vazia...${NC}"
curl -X POST "${BASE_URL}/chat/client" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"message": ""}' \
  -s | jq '.'

echo -e "\n${GREEN}=== TESTES CONCLUÍDOS ===${NC}\n"
