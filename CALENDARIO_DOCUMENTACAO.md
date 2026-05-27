# 📅 Documentação - Aba de Calendário para Agendamento de Consultas

## Visão Geral

A aba de Calendário implementa um sistema completo e interativo para que clientes agend estruturem consultas veterinárias na plataforma NewPet. O componente oferece uma experiência moderna, intuitiva e responsiva para dispositivos móveis e desktops.

## Arquivos Criados/Modificados

### Componentes React
1. **[CalendarScheduling.jsx](./CalendarScheduling.jsx)** - Componente principal do calendário
2. **[ScheduleConfirmationModal.jsx](./ScheduleConfirmationModal.jsx)** - Modal de confirmação
3. **[ClientDashboard.jsx](./ClientDashboard.jsx)** - Integração da aba calendário

### Serviços
1. **[availabilityService.js](../services/availabilityService.js)** - Serviço de disponibilidade de veterinários

### Estilos
1. **[CalendarScheduling.css](./CalendarScheduling.css)** - Estilos responsivos do calendário
2. **[ScheduleConfirmationModal.css](./ScheduleConfirmationModal.css)** - Estilos do modal

### Backend
1. **[schedule.routes.ts](../../server/src/modules/schedules/routes/schedule.routes.ts)** - Nova rota `/schedules/book` para clientes

## Dependências Instaladas

```bash
npm install react-calendar date-fns
```

- **react-calendar**: Componente interativo de calendário
- **date-fns**: Manipulação e formatação de datas

## Funcionalidades Implementadas

### 1. Calendário Interativo
- ✅ Visualização de calendário mensal
- ✅ Seleção de datas disponíveis
- ✅ Destaque visual para:
  - Dias disponíveis (verde)
  - Dias indisponíveis (cinza)
  - Dia atual (amarelo)
- ✅ Bloqueio automático de datas passadas
- ✅ Bloqueio de domingos (fechado)
- ✅ Legenda interativa

### 2. Seleção de Serviços
- ✅ Seleção de pet do cliente
- ✅ Lista de veterinários disponíveis no dia selecionado
- ✅ Visualização de horários disponíveis para cada veterinário
- ✅ Seleção interativa de horário (slots de 30 minutos)

### 3. Validações
- ✅ Validação de conflitos de horário
- ✅ Prevenção de datas passadas
- ✅ Verificação de disponibilidade em tempo real
- ✅ Confirmação obrigatória antes de agendar

### 4. Feedback Visual
- ✅ Mensagens de sucesso e erro
- ✅ Modal de confirmação com detalhes completos
- ✅ Animações suaves (fade-in, slide-up)
- ✅ Estados carregamento

### 5. Gerenciamento de Consultas
- ✅ Exibição de próximas consultas
- ✅ Possibilidade de cancelamento
- ✅ Status em tempo real
- ✅ Histórico visual de agendamentos

### 6. Responsividade
- ✅ Design mobile-first
- ✅ Grid responsivo que adapta em telas pequenas
- ✅ Toque otimizado para dispositivos móveis
- ✅ Espaçamento apropriado em todos os tamanhos

## Fluxo de Uso

### Passo 1: Acessar o Calendário
1. Cliente faz login na plataforma
2. Acessa o Dashboard
3. Clica na aba "📅 Calendário"

### Passo 2: Selecionar Data
1. Visualiza o calendário mensal
2. Clica em um dia disponível (marcado em verde)
3. O sistema carrega veterinários e horários para aquele dia

### Passo 3: Selecionar Pet
1. Dropdown com todos os seus pets
2. Escolhe o pet para a consulta
3. Caso não tenha pets, pode adicionar via aba "Meus Pets"

### Passo 4: Selecionar Veterinário
1. Visualiza lista de veterinários disponíveis
2. Clica para selecionar o veterinário desejado
3. Sistema exibe horários disponíveis para aquele profissional

### Passo 5: Selecionar Horário
1. Grid de horários disponíveis aparece
2. Clica em um horário (30 em 30 minutos)
3. Horário é destacado como selecionado

### Passo 6: Confirmar Agendamento
1. Clica em "✓ Confirmar Agendamento"
2. Modal exibe resumo da consulta
3. Confirma ou cancela a ação
4. Agendamento é salvo e exibido na lista de próximas consultas

## Estrutura de Dados

### Objeto Schedule
```javascript
{
  id: string,              // UUID
  clientId: number,        // ID do cliente
  petId: number,          // ID do pet
  veterinarianId: number, // ID do veterinário
  date: string,           // ISO 8601 datetime
  status: string,         // 'scheduled', 'cancelled', 'completed'
  createdAt: string,      // ISO 8601
  updatedAt: string,      // ISO 8601
  
  // Relações (quando retornadas da API)
  pet: {
    id: number,
    nome: string,
    especie: string,
    raca: string
  },
  veterinarian: {
    id: number,
    nome: string,
    especialidade: string
  }
}
```

## Endpoints da API Utilizados

### GET /pets
Retorna pets do cliente autenticado
```javascript
Response: Pet[]
```

### GET /schedules/my
Retorna agendamentos do cliente autenticado
```javascript
Response: Schedule[]
```

### POST /schedules/book
Cria novo agendamento (cliente)
```javascript
Body: {
  clientId: number,
  petId: number,
  veterinarianId: number,
  date: string,
  status?: string
}

Response: {
  message: string,
  schedule: Schedule
}
```

### GET /auth/users
Retorna lista de usuários (filtrado para veterinários)
```javascript
Response: User[]
```

### DELETE /schedules/:id
Cancela agendamento
```javascript
Response: {
  message: string,
  schedule: Schedule
}
```

## Validações Implementadas

### No Cliente
- Data deve ser futura e não no passado
- Domingo está automaticamente bloqueado
- Pet é obrigatório para agendar
- Veterinário é obrigatório
- Horário deve ser selecionado
- Validação de conflito de horário antes de confirmar

### No Servidor
- Validação de JWT obrigatória
- Verificação de conflito de horário para veterinários
- Validação de campos obrigatórios
- Normalização de data/hora ISO 8601

## Estilos e Temas

### Cores Principais
- Primária: #2196F3 (azul)
- Secundária: #667eea-#764ba2 (gradiente roxo)
- Sucesso: #4CAF50 (verde)
- Perigo: #F44336 (vermelho)
- Fundo: #F5F7FA (cinza muito claro)

### Tipografia
- Font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto
- Tamanhos: 12px a 28px
- Weights: 400, 500, 600, 700

### Animações
- Fade-in: 0.3s
- Slide-up: 0.3s
- Transform hover: translateY(-2px) ou scale(1.05)
- Transições suaves: 0.3s ease

## Breakpoints Responsivos

```css
Desktop: > 768px
Tablet: 480px - 768px
Mobile: < 480px
```

## Próximas Melhorias Sugeridas

1. **Integração com calendário de sincronização**
   - Google Calendar sync
   - Notificações por email

2. **Funcionalidades Avançadas**
   - Reagendamento direto
   - Histórico de consultas completo
   - Relatórios de saúde do pet
   - Lembretes antes da consulta

3. **Filtragem Avançada**
   - Filtrar por especialidade do veterinário
   - Horários específicos (manhã/tarde)
   - Veterinários preferidos

4. **Performance**
   - Cache de disponibilidade
   - Pré-carregamento de próximos meses
   - Lazy loading de componentes

5. **Acessibilidade**
   - ARIA labels completos
   - Navegação por teclado
   - Contrast ratio aprimorado

## Troubleshooting

### Problema: Não aparecem veterinários disponíveis
**Solução**: Verifique se há veterinários cadastrados no sistema e com horários disponíveis para o dia selecionado.

### Problema: Erro ao criar agendamento
**Solução**: Certifique-se de que todos os campos estão preenchidos e o pet existe.

### Problema: Calendário não responde ao toque
**Solução**: Verifique se o react-calendar está instalado corretamente e os CSS estão carregados.

### Problema: Horários aparecem como indisponíveis
**Solução**: Verifique se não há conflito de horário com outro agendamento do mesmo veterinário.

## Suporte

Para dúvidas ou problemas, consulte:
- Documentação do [react-calendar](https://www.npmjs.com/package/react-calendar)
- Documentação do [date-fns](https://date-fns.org/)
- Logs do console (F12 > Console)

---

**Versão**: 1.0.0
**Última atualização**: Maio 2026
**Status**: ✅ Funcionando completamente
