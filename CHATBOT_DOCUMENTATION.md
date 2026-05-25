# 🤖 Chatbot Inteligente - Documentação Completa

## Visão Geral

O chatbot inteligente é um assistente baseado em IA que utiliza a API OpenAI (GPT-4o) para interpretar linguagem natural e executar ações no sistema de agenda veterinária através de function calling.

## Arquitetura

### Backend
- **Framework**: Express.js + TypeScript
- **Banco de Dados**: SQLite com Prisma ORM
- **IA**: OpenAI API (GPT-4o)
- **Autenticação**: JWT

### Frontend
- **Framework**: React + TypeScript
- **Componentes**: ChatWindow, MessageBubble, ChatInput
- **HTTP Client**: Axios

## Estrutura de Pastas

```
server/src/modules/chatbot/
├── controllers/
│   └── chatbotController.ts      # Handlers dos endpoints
├── services/
│   ├── openAIChatService.ts      # Orquestrador OpenAI
│   ├── clientChatService.ts      # Services para clientes
│   └── adminChatService.ts       # Services para admins
├── routes/
│   └── chatbotRoutes.ts          # Definição das rotas
├── prompts/                      # Prompts do sistema
├── tools/                        # Definições de ferramentas
└── types/
    └── index.ts                  # Tipos TypeScript

client/src/components/chatbot/
├── ChatWindow.tsx                # Componente principal
├── ChatWindow.css                # Estilos do componente
├── MessageBubble.tsx             # Componente de mensagem
├── MessageBubble.css             # Estilos das mensagens
├── ChatInput.tsx                 # Componente de entrada
├── ChatInput.css                 # Estilos do input
├── useChat.ts                    # Hook de gerenciamento
└── index.ts                      # Exportações
```

## Configuração

### Variáveis de Ambiente

```bash
# .env (server)
PORT=4000
DATABASE_URL="file:./data/database.sqlite"
JWT_SECRET="sua_chave_secreta"
OPENAI_API_KEY="sua_chave_openai"
```

### Instalação de Dependências

```bash
# Backend
cd server
npm install openai

# Frontend
cd ../client
npm install
```

## Endpoints da API

### POST `/chat/client`
Processa mensagens de clientes autenticados.

**Headers**:
```
Authorization: Bearer {token_jwt}
Content-Type: application/json
```

**Body**:
```json
{
  "message": "Quero marcar uma consulta para meu cachorro"
}
```

**Response**:
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

### POST `/chat/admin`
Processa mensagens de administradores autenticados.

**Headers**:
```
Authorization: Bearer {token_jwt}
Content-Type: application/json
```

**Body**:
```json
{
  "message": "Quantas consultas temos hoje?"
}
```

### GET `/chat/history`
Obtém o histórico de conversa do usuário autenticado.

**Headers**:
```
Authorization: Bearer {token_jwt}
```

**Query Parameters**:
- `limit`: número de mensagens (padrão: 20, máximo: 100)

### GET `/chat/health`
Verifica a saúde do serviço de chat.

**Response**:
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

## Comportamentos por Role

### CLIENT (Cliente)
O assistente ajuda clientes com:
- ✅ Marcar consultas
- ✅ Consultar horários disponíveis
- ✅ Visualizar consultas futuras
- ✅ Buscar veterinários por especialidade
- ❌ Não pode cancelar ou modificar agendamentos
- ❌ Não pode acessar dados de outros clientes

**Ferramentas Disponíveis**:
- `getClientPets` - Obtém pets do cliente
- `listVeterinarians` - Lista veterinários
- `findVeterinarianBySpecialty` - Busca por especialidade
- `getAvailableSchedules` - Horários livres
- `createSchedule` - Cria novo agendamento
- `listClientSchedules` - Agendamentos do cliente
- `getScheduleDetails` - Detalhes de um agendamento

### ADMIN (Administrador)
O assistente ajuda admins com:
- ✅ Consultar agendamentos
- ✅ Visualizar estatísticas
- ✅ Monitorar desempenho
- ✅ Gerar relatórios
- ❌ Não pode modificar agendamentos
- ❌ Apenas leitura de dados

**Ferramentas Disponíveis**:
- `getSchedulesToday` - Agendamentos de hoje
- `getSchedulesByDate` - Agendamentos por data
- `getVeterinarianStatistics` - Estatísticas dos vets
- `getCancelledSchedules` - Agendamentos cancelados
- `getAvailableTimeSlots` - Horários livres
- `getClinicStatistics` - Estatísticas gerais

## Exemplos de Uso

### Cliente

**Exemplo 1**: Marcar consulta
```
Cliente: "Preciso marcar uma consulta para meu cachorro Max"
IA: "Ótimo! Vou ajudá-lo. Qual é o tipo de consulta que você precisa?
     Você tem as seguintes opções:
     - Clínico Geral
     - Dermatologia
     - Cirurgia"
Cliente: "Preciso de um veterinário dermatologista"
IA: "Encontrei 2 dermatologistas disponíveis:
     1. Dra. Ana - Segunda a Sexta
     2. Dr. Carlos - Terça a Quinta
     Qual é sua data preferida?"
```

**Exemplo 2**: Consultar horários
```
Cliente: "Quais são os horários livres para a Dra. Ana amanhã?"
IA: "Aqui estão os horários disponíveis para a Dra. Ana em 26/05/2026:
     - 08:00
     - 08:30
     - 09:00
     - 09:30
     ... e mais 10 horários"
```

### Admin

**Exemplo 1**: Estatísticas
```
Admin: "Como estão os agendamentos hoje?"
IA: "Temos 12 agendamentos confirmados para hoje:
     - Manhã: 6 agendamentos
     - Tarde: 6 agendamentos
     Próximo agendamento: 08:00 com Dra. Ana"
```

**Exemplo 2**: Desempenho
```
Admin: "Qual veterinário tem mais consultas?"
IA: "Aqui está o ranking de consultas:
     1. Dra. Ana - 156 consultas (média: 13/mês)
     2. Dr. Carlos - 142 consultas (média: 12/mês)
     3. Dr. Bruno - 98 consultas (média: 8/mês)"
```

## Fluxo de Function Calling

1. **Usuário envia mensagem** via chat
2. **Backend recebe** e valida autenticação
3. **OpenAI processa** com ferramentas disponíveis
4. **IA decide** qual ferramenta usar
5. **Backend executa** a ferramenta (via Services)
6. **OpenAI recebe** o resultado
7. **IA formula** resposta para o usuário
8. **Backend retorna** resposta e ferramentas usadas
9. **Frontend exibe** a mensagem com indicadores

```
┌─────────┐
│ Cliente │
└────┬────┘
     │ 1. Enviar mensagem
     ▼
┌─────────────────────┐
│ ChatWindow (React)  │
└────┬────────────────┘
     │ 2. HTTP POST /chat/client
     ▼
┌──────────────────────┐
│ ChatbotController    │
└────┬─────────────────┘
     │ 3. Validar JWT
     ▼
┌──────────────────────────────┐
│ OpenAIChatService            │
└────┬─────────────────────────┘
     │ 4. Enviar para OpenAI
     ▼
┌──────────────────────────────┐
│ OpenAI API (GPT-4o)          │
└────┬─────────────────────────┘
     │ 5. Analisar + Ferramentas
     ▼
┌──────────────────────────────┐
│ ClientChatService            │
└────┬─────────────────────────┘
     │ 6. Executar tools
     ▼
┌──────────────────────────────┐
│ Prisma ORM                   │
└────┬─────────────────────────┘
     │ 7. Query banco
     ▼
┌──────────────────────────────┐
│ SQLite                       │
└────┬─────────────────────────┘
     │ 8. Dados reais
     ▼
┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
  Resposta formada com dados
└────┬─────────────────────────┘
     │ 9. JSON response
     ▼
┌─────────────────────┐
│ Frontend exibe      │
└─────────────────────┘
```

## Security

### Autenticação
- JWT token validado em cada requisição
- Role verificado antes de executar ferramentas
- Isolamento de dados por usuário

### Autorização
- Clientes só podem ver seus próprios pets e agendamentos
- Admins só podem consultar, não modificar
- Validação de IDs antes de operações

### Segurança de Dados
- OpenAI não armazena dados (use ephemeral ou regra corporativa)
- Histórico salvo localmente no banco
- Sem exposição de IDs internos na resposta

## Troubleshooting

### Erro: "Token não fornecido"
- Verifique se o JWT está sendo enviado no header `Authorization: Bearer {token}`

### Erro: "OPENAI_API_KEY não configurada"
- Defina a variável de ambiente `OPENAI_API_KEY` no arquivo `.env`

### Chat não responde
- Verifique conexão com OpenAI
- Verifique logs do servidor
- Valide permissões no banco de dados

### Mensagens antigas não aparecem
- Use GET `/chat/history` para carregar histórico
- Verificar se o usuário tem registros no ChatMessage

## Performance

### Otimizações Implementadas
- ✅ Indexes no ChatMessage (userId, createdAt)
- ✅ Limite de mensagens do histórico
- ✅ Lazy loading de dados
- ✅ Debounce de requisições
- ✅ Scroll automático com refs

### Recomendações
- Implementar paginação para muitos agendamentos
- Cache de veterinários
- Rate limiting na API
- Compressão GZIP

## Próximos Passos

1. **Melhorias UI/UX**
   - Typing indicator melhorado
   - Animations customizadas
   - Dark mode

2. **Funcionalidades**
   - Suporte a upload de imagens
   - Relatórios em PDF
   - Notificações em tempo real

3. **IA**
   - Fine-tuning do modelo
   - Modelos específicos por contexto
   - Análise de sentimento

4. **Backend**
   - WebSockets para tempo real
   - Filas de processamento
   - Logs estruturados

## Referências

- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [Prisma ORM](https://www.prisma.io/)
- [Express.js](https://expressjs.com/)
- [React Hooks](https://react.dev/reference/react)

---

**Última atualização**: 25/05/2026
**Versão**: 1.0.0
