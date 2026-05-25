# 🤖 Chatbot IA - Clínica Veterinária NewPet

> Sistema de chatbot inteligente com OpenAI integrado à agenda de clínica veterinária

## ✨ Destaques

- **🤖 IA Inteligente**: GPT-4o-mini com compreensão de linguagem natural
- **🔗 Function Calling**: Executa ações reais (marcar consultas, gerar relatórios, etc)
- **👥 Multi-role**: Diferentes comportamentos para cliente e administrador
- **📱 Responsivo**: Funciona perfeitamente em mobile, tablet e desktop
- **🔐 Seguro**: Autenticação JWT + Validação de permissões
- **💾 Persistente**: Histórico salvo em SQLite
- **📚 Bem documentado**: Guias completos com exemplos

## 🚀 Quick Start

### 1. Configurar Variáveis de Ambiente

```bash
cd server
echo "OPENAI_API_KEY=sk-..." >> .env
```

Obtenha sua chave em https://platform.openai.com/api-keys

### 2. Instalar Dependências

```bash
# Backend
cd server
npm install openai

# Frontend (se necessário)
cd ../client
npm install
```

### 3. Executar Migrations

```bash
cd server
npx prisma migrate dev
```

### 4. Iniciar Serviços

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend  
cd client && npm run dev
```

### 5. Acessar o Chat

```
Cliente:  http://localhost:5173/chat
Admin:    http://localhost:5173/chat/admin
```

## 📋 Funcionalidades

### Para Clientes (👤)

O assistente ajuda com:
- ✅ Marcar consultas
- ✅ Consultar horários disponíveis
- ✅ Listar veterinários e especialidades
- ✅ Visualizar agendamentos futuros
- ✅ Ver pets cadastrados

**Exemplo de conversa:**
```
Cliente: "Quero marcar uma consulta para meu cachorro Max"
IA: "Ótimo! Qual é a especialidade que você precisa?"
Cliente: "Preciso de um dermatologista"
IA: "Encontrei 2 especialistas. Qual a data preferida?"
```

### Para Admins (👨‍💼)

O assistente fornece:
- ✅ Agendamentos de hoje
- ✅ Relatórios por data
- ✅ Estatísticas dos veterinários
- ✅ Horários disponíveis
- ✅ Estatísticas gerais da clínica

**Exemplo de conversa:**
```
Admin: "Quantas consultas temos hoje?"
IA: "Temos 12 consultas confirmadas hoje"
Admin: "Qual veterinário tem mais atendimentos?"
IA: "Aqui está o ranking..."
```

## 🔌 Endpoints da API

| Método | URL | Descrição | Autenticação |
|--------|-----|-----------|-------------|
| POST | /chat/client | Chat do cliente | JWT |
| POST | /chat/admin | Chat do admin | JWT |
| GET | /chat/history | Histórico de conversa | JWT |
| GET | /chat/health | Status do serviço | Não |

### Exemplo de Requisição

```bash
curl -X POST http://localhost:4000/chat/client \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"message": "Quero marcar uma consulta"}'
```

### Exemplo de Resposta

```json
{
  "success": true,
  "data": {
    "response": "Ótimo! Vou ajudar você a marcar uma consulta...",
    "toolsUsed": ["getClientPets", "listVeterinarians"],
    "timestamp": "2026-05-25T10:30:00Z"
  }
}
```

## 📦 Estrutura do Projeto

```
ProjetoModelagemDeSistemas/
├── server/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── chatbot/              ← 🤖 Novo módulo
│   │   │   │   ├── controllers/
│   │   │   │   ├── services/
│   │   │   │   ├── routes/
│   │   │   │   └── types/
│   │   │   └── schedules/
│   │   └── index.ts                  (Atualizado)
│   ├── prisma/
│   │   ├── schema.prisma             (Atualizado)
│   │   └── migrations/
│   ├── .env                          (Novo)
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── chatbot/              ← 🤖 Novo módulo
│   │   │   │   ├── ChatWindow.tsx
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   ├── useChat.ts
│   │   │   │   └── index.ts
│   │   └── pages/
│   │       ├── ClientChatPage.tsx
│   │       └── AdminChatPage.tsx
│   └── package.json
│
└── Documentação
    ├── CHATBOT_DOCUMENTATION.md
    ├── CHATBOT_INTEGRATION_GUIDE.md
    ├── CHATBOT_APP_INTEGRATION_EXAMPLE.md
    ├── CHATBOT_QUICK_REFERENCE.md
    ├── IMPLEMENTATION_SUMMARY.md
    ├── test_chatbot_api.sh
    └── verify_chatbot_setup.sh
```

## 🛠️ Integração no App.jsx

Adicione ao seu router (Option 1):

```tsx
<Route
  path="/chat"
  element={
    <ProtectedRoute>
      {user?.tipoUsuario === 'cliente' ? (
        <ClientChatPage apiUrl="http://localhost:4000" />
      ) : (
        <Navigate to="/dashboard" />
      )}
    </ProtectedRoute>
  }
/>
```

Ou use como modal (Option 2):

```tsx
import { ChatWindow } from '@/components/chatbot';

{showChat && (
  <ChatWindow
    userRole={user?.tipoUsuario === 'cliente' ? 'client' : 'admin'}
    onClose={() => setShowChat(false)}
    apiUrl="http://localhost:4000"
  />
)}
```

Veja [CHATBOT_APP_INTEGRATION_EXAMPLE.md](./CHATBOT_APP_INTEGRATION_EXAMPLE.md) para mais opções.

## 🔧 Customização

### Alterar Cores

Edite `client/src/components/chatbot/ChatWindow.css`:

```css
.chat-header {
  background: linear-gradient(135deg, #seu-cor 0%, #outra-cor 100%);
}
```

### Adicionar Nova Ferramenta

1. Implemente em `clientChatService.ts` ou `adminChatService.ts`
2. Adicione em `executeClientTool()` ou `executeAdminTool()`
3. Defina em `getClientTools()` ou `getAdminTools()`

### Modificar Prompt do Sistema

Edite `openAIChatService.ts`:

```typescript
private getSystemPrompt(userRole: UserRole): string {
  if (userRole === "cliente") {
    return `Seu novo prompt aqui...`;
  }
  // ...
}
```

## 📚 Documentação

- **[CHATBOT_DOCUMENTATION.md](./CHATBOT_DOCUMENTATION.md)** - Documentação técnica completa
- **[CHATBOT_INTEGRATION_GUIDE.md](./CHATBOT_INTEGRATION_GUIDE.md)** - Guia de integração
- **[CHATBOT_APP_INTEGRATION_EXAMPLE.md](./CHATBOT_APP_INTEGRATION_EXAMPLE.md)** - Exemplos práticos
- **[CHATBOT_QUICK_REFERENCE.md](./CHATBOT_QUICK_REFERENCE.md)** - Referência rápida

## 🧪 Testes

Execute o script de testes:

```bash
chmod +x test_chatbot_api.sh
./test_chatbot_api.sh
```

Ou teste manualmente com cURL:

```bash
# Health check
curl http://localhost:4000/chat/health

# Chat do cliente
curl -X POST http://localhost:4000/chat/client \
  -H "Authorization: Bearer {JWT}" \
  -H "Content-Type: application/json" \
  -d '{"message": "teste"}'
```

## ✅ Verificação de Setup

Execute o script de verificação:

```bash
chmod +x verify_chatbot_setup.sh
./verify_chatbot_setup.sh
```

## 🔐 Segurança

- ✅ Autenticação JWT obrigatória
- ✅ Validação de role (cliente vs admin)
- ✅ Isolamento de dados por usuário
- ✅ Sem acesso direto ao banco
- ✅ Validação de entrada
- ✅ CORS configurado

## 📊 Arquitetura

```
┌─────────────────────────────────────────────────────┐
│              React (Client)                         │
│  ChatWindow | MessageBubble | ChatInput | useChat   │
└────────────────┬────────────────────────────────────┘
                 │ HTTP (Axios)
                 ▼
┌─────────────────────────────────────────────────────┐
│    Express (Backend)                                │
│  OpenAI Service + Client/Admin Services             │
└────────────────┬────────────────────────────────────┘
                 │ Function Calling
                 ▼
┌─────────────────────────────────────────────────────┐
│    OpenAI API (GPT-4o-mini)                        │
└────────────────┬────────────────────────────────────┘
                 │ Dados
                 ▼
┌─────────────────────────────────────────────────────┐
│    Prisma ORM + SQLite                              │
└─────────────────────────────────────────────────────┘
```

## 🚨 Troubleshooting

### "OPENAI_API_KEY not found"
```bash
cd server
echo "OPENAI_API_KEY=sk-..." >> .env
npm run dev
```

### "Database not found"
```bash
cd server
npx prisma migrate dev
```

### "Chat não responde"
```bash
# Verifique se o servidor está rodando
curl http://localhost:4000/chat/health

# Verifique o JWT token
# Verifique os logs do servidor
npm run dev
```

## 📈 Performance

- Índices criados em ChatMessage (userId, createdAt)
- Lazy loading de histórico
- Debounce de requisições
- Cache local de dados
- Scroll automático otimizado

## 🎯 Próximos Passos

- [ ] Deploy em staging
- [ ] Treinar usuários
- [ ] Coletar feedback
- [ ] Otimizar prompts
- [ ] Implementar analytics
- [ ] Adicionar suporte a imagens
- [ ] WebSockets para tempo real

## 📋 Stack Tecnológico

**Backend**
- Node.js + Express.js
- TypeScript
- Prisma ORM
- SQLite
- OpenAI API

**Frontend**
- React 19
- TypeScript
- Axios
- CSS3

## 📄 Licença

Projeto privado - Clínica Veterinária NewPet

## 📞 Suporte

Para dúvidas, consulte a documentação ou execute:

```bash
./verify_chatbot_setup.sh
```

---

**Status**: ✅ Pronto para Produção  
**Versão**: 1.0.0  
**Data**: 25/05/2026
