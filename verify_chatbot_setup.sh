#!/bin/bash

# ============================================================================
# CHATBOT - CHECKLIST DE VERIFICAÇÃO PRÉ-PRODUÇÃO
# ============================================================================
# Este script verifica se tudo está configurado corretamente
# Executar antes de colocar em produção
# ============================================================================

echo "🔍 CHATBOT - VERIFICAÇÃO DE SETUP"
echo "=================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Counters
PASSED=0
FAILED=0

# Função para verificar
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ $1${NC}"
        ((FAILED++))
    fi
}

# ============================================================================
# VERIFICAÇÃO DE ARQUIVOS
# ============================================================================

echo -e "${YELLOW}📁 VERIFICANDO ARQUIVOS...${NC}"
echo ""

[ -f "server/.env" ]
check "✓ server/.env existe"

[ -f "server/src/modules/chatbot/controllers/chatbotController.ts" ]
check "✓ chatbotController.ts existe"

[ -f "server/src/modules/chatbot/services/openAIChatService.ts" ]
check "✓ openAIChatService.ts existe"

[ -f "server/src/modules/chatbot/services/clientChatService.ts" ]
check "✓ clientChatService.ts existe"

[ -f "server/src/modules/chatbot/services/adminChatService.ts" ]
check "✓ adminChatService.ts existe"

[ -f "server/src/modules/chatbot/routes/chatbotRoutes.ts" ]
check "✓ chatbotRoutes.ts existe"

[ -f "client/src/components/chatbot/ChatWindow.tsx" ]
check "✓ ChatWindow.tsx existe"

[ -f "client/src/components/chatbot/ChatInput.tsx" ]
check "✓ ChatInput.tsx existe"

[ -f "client/src/components/chatbot/MessageBubble.tsx" ]
check "✓ MessageBubble.tsx existe"

[ -f "client/src/components/chatbot/useChat.ts" ]
check "✓ useChat.ts existe"

[ -f "server/prisma/schema.prisma" ]
check "✓ schema.prisma existe"

echo ""

# ============================================================================
# VERIFICAÇÃO DE DEPENDÊNCIAS
# ============================================================================

echo -e "${YELLOW}📦 VERIFICANDO DEPENDÊNCIAS...${NC}"
echo ""

grep -q "openai" server/package.json
check "✓ openai instalado no backend"

grep -q "axios" client/package.json
check "✓ axios instalado no frontend"

grep -q "react" client/package.json
check "✓ react instalado no frontend"

grep -q "@prisma/client" server/package.json
check "✓ @prisma/client instalado"

echo ""

# ============================================================================
# VERIFICAÇÃO DE CONFIGURAÇÃO
# ============================================================================

echo -e "${YELLOW}⚙️  VERIFICANDO CONFIGURAÇÃO...${NC}"
echo ""

grep -q "OPENAI_API_KEY" server/.env
check "✓ OPENAI_API_KEY definida no .env"

grep -q "DATABASE_URL" server/.env
check "✓ DATABASE_URL definida no .env"

grep -q "JWT_SECRET" server/.env
check "✓ JWT_SECRET definida no .env"

grep -q "PORT" server/.env
check "✓ PORT definida no .env"

echo ""

# ============================================================================
# VERIFICAÇÃO DE CÓDIGO
# ============================================================================

echo -e "${YELLOW}🔧 VERIFICANDO CÓDIGO...${NC}"
echo ""

# Backend TypeScript
cd server
npx tsc --noEmit 2>/dev/null
check "✓ Nenhum erro TypeScript no backend"

# Verificar imports nas rotas
grep -q "import chatbotRoutes" src/index.ts
check "✓ chatbotRoutes importado em index.ts"

grep -q "app.use(\"/chat\"" src/index.ts
check "✓ Rotas /chat registradas"

cd ..

echo ""

# ============================================================================
# VERIFICAÇÃO DE MIGRAÇÕES
# ============================================================================

echo -e "${YELLOW}🗄️  VERIFICANDO MIGRAÇÕES...${NC}"
echo ""

[ -d "server/prisma/migrations" ]
check "✓ Pasta migrations existe"

[ -f "server/data/database.sqlite" ]
check "✓ Banco SQLite criado"

echo ""

# ============================================================================
# VERIFICAÇÃO ADICIONAL
# ============================================================================

echo -e "${YELLOW}🎯 VERIFICAÇÕES ADICIONAIS...${NC}"
echo ""

# Verificar se há models no Prisma
grep -q "model ChatMessage" server/prisma/schema.prisma
check "✓ ChatMessage model adicionado"

# Verificar se há relação no User
grep -q "chatMessages" server/prisma/schema.prisma
check "✓ Relação chatMessages em User"

# Verificar componentes exportados
grep -q "export { ChatWindow }" client/src/components/chatbot/index.ts
check "✓ ChatWindow exportado"

grep -q "export { useChat }" client/src/components/chatbot/index.ts
check "✓ useChat exportado"

echo ""

# ============================================================================
# RESUMO
# ============================================================================

echo -e "${YELLOW}📊 RESUMO${NC}"
echo "=================================="
echo -e "Passou: ${GREEN}$PASSED${NC}"
echo -e "Falhou: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ TUDO PRONTO! Sua implementação está completa.${NC}"
    echo ""
    echo "Próximas ações:"
    echo "1. cd server && npm run dev"
    echo "2. cd client && npm run dev (em outro terminal)"
    echo "3. Acesse http://localhost:5173"
    echo "4. Faça login e teste o chat"
    exit 0
else
    echo -e "${RED}❌ Há $(FAILED) problemas a resolver.${NC}"
    echo ""
    echo "Verifique os itens acima marcados com ❌"
    exit 1
fi
