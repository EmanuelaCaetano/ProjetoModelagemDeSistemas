# Guia de Integração - Chatbot IA

## ⚡ Quick Start

### 1. Configurar Variáveis de Ambiente

```bash
# server/.env
OPENAI_API_KEY="sk-..." # Obtenha em https://platform.openai.com/api-keys
```

### 2. Iniciar o Backend

```bash
cd server
npm install  # Se necessário
npm run dev
```

O servidor estará disponível em `http://localhost:4000`

### 3. Iniciar o Frontend

```bash
cd client
npm install  # Se necessário
npm run dev
```

### 4. Acessar o Chat

- **Cliente**: Login como cliente → Acesse `/chat/client`
- **Admin**: Login como admin → Acesse `/chat/admin`

---

## 🔧 Como Usar nos Componentes

### Integração Simples

```tsx
import { ChatWindow } from '@/components/chatbot';

export function MyComponent() {
  return (
    <ChatWindow 
      userRole="client"
      title="Assistente de Agendamentos"
      apiUrl="http://localhost:4000"
    />
  );
}
```

### Uso do Hook `useChat`

```tsx
import { useChat } from '@/components/chatbot';

export function CustomChatComponent() {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    loadHistory,
  } = useChat('client', {
    apiUrl: 'http://localhost:4000',
  });

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>
          <strong>{msg.role}:</strong> {msg.content}
        </div>
      ))}
      
      <button onClick={clearMessages}>Limpar</button>
      <button onClick={() => sendMessage('Olá!')}>Enviar</button>
    </div>
  );
}
```

---

## 🔐 Autenticação

O chatbot usa o JWT token do localStorage:

```tsx
// Após login bem-sucedido
localStorage.setItem('token', jwtToken);
localStorage.setItem('userRole', 'cliente'); // ou 'administrador'
```

O token será automaticamente incluído nas requisições.

---

## 📝 Exemplos de Prompts

### Para Clientes

```
"Quero marcar uma consulta para meu cachorro"
"Qual veterinário trata dermatologia?"
"Quais horários estão disponíveis amanhã?"
"Mostre minhas consultas futuras"
"Detalhes da minha próxima consulta"
```

### Para Admins

```
"Quantas consultas temos hoje?"
"Qual veterinário tem mais agendamentos?"
"Quantas consultas foram canceladas este mês?"
"Quais horários estão livres amanhã?"
"Estatísticas gerais da clínica"
```

---

## 🚀 Deploy

### Backend Vercel/Railway

```bash
# Adicione ao package.json
"scripts": {
  "build": "tsc",
  "start": "node ./dist/index.js"
}

# Defina OPENAI_API_KEY nas variáveis de ambiente da plataforma
```

### Frontend Vercel/Netlify

```bash
# Variáveis de ambiente
VITE_API_URL=https://seu-backend.com
```

---

## ✅ Checklist de Implementação

- [ ] OpenAI API Key configurada
- [ ] Banco de dados migrado (`npx prisma migrate dev`)
- [ ] Backend iniciado
- [ ] Frontend iniciado
- [ ] Token JWT funcionando
- [ ] Chat de cliente acessível
- [ ] Chat de admin acessível
- [ ] Histórico salvando no banco
- [ ] Ferramentas executando (verificar no console)
- [ ] Respostas da IA aparecendo

---

## 🐛 Debug

### Verificar conexão com OpenAI

```bash
curl -X GET http://localhost:4000/chat/health
```

Resposta esperada:
```json
{
  "success": true,
  "data": {
    "service": "Chatbot",
    "status": "healthy",
    "openAI": {
      "configured": true
    }
  }
}
```

### Ver logs do servidor

```bash
# Terminal do backend
npm run dev  # Mostrará todos os logs
```

### Inspecionar requisição no navegador

1. Abra DevTools (F12)
2. Vá para a aba Network
3. Procure por requisições `/chat/client` ou `/chat/admin`
4. Verifique Response e Status

---

## 📦 Estrutura de Resposta

```json
{
  "success": true,
  "data": {
    "response": "Encontrei 2 veterinários...",
    "toolsUsed": ["listVeterinarians", "getAvailableSchedules"],
    "timestamp": "2026-05-25T10:30:00Z"
  }
}
```

---

## 🎨 Customização

### Alterar cores

Edite em `ChatWindow.css`:
```css
.chat-header {
  background: linear-gradient(135deg, #seu-cor 0%, #outra-cor 100%);
}
```

### Alterar prompt do sistema

Edite em `openAIChatService.ts`:
```typescript
private getSystemPrompt(userRole: UserRole, context: ConversationContext): string {
  if (userRole === "cliente") {
    return `Seu novo prompt aqui...`;
  }
  // ...
}
```

### Adicionar novas ferramentas

1. Crie um serviço: `newToolService.ts`
2. Implemente a ferramenta: `executeClientTool()` ou `executeAdminTool()`
3. Adicione a definição: `getClientTools()` ou `getAdminTools()`
4. Documente a ferramenta

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique os logs do servidor
2. Consulte a documentação completa
3. Verifique se OPENAI_API_KEY está configurada
4. Teste com curl

---

**Pronto para usar! 🎉**
