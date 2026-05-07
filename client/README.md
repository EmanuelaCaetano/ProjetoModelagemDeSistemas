# Frontend - Clínica Veterinária NewPet

Interface React para o sistema de gerenciamento da clínica veterinária NewPet.

## Funcionalidades

- 🔐 **Sistema de Login**: Autenticação integrada com backend
- 👥 **Tipos de Usuário**: Dashboards específicos para Admin, Médico e Cliente
- 🎨 **Interface Moderna**: Design responsivo com React
- 🔄 **Estado Persistente**: Sessão mantida no localStorage

## Tecnologias

- **React 19**: Framework JavaScript
- **Vite**: Build tool e dev server
- **React Router**: Roteamento SPA
- **Axios**: Cliente HTTP
- **CSS Modules**: Estilização

## Instalação e Execução

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## Como Fazer Login

### 1. **Iniciar os Serviços**

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### 2. **Acessar a Aplicação**

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

### 3. **Usuários de Teste**

| Tipo | Email | Senha | Dashboard |
|------|-------|-------|-----------|
| 👑 Admin | `admin@newpet.com` | `Admin@123` | Controle total |
| 👨‍⚕️ Médico | `medico@newpet.com` | `Medico@123` | Consultas e pacientes |
| 🐾 Cliente | `cliente@newpet.com` | `Cliente@123` | Agendamentos |

### 4. **Fluxo de Login**

1. **Acesse** `http://localhost:5173`
2. **Digite** email e senha
3. **Clique** "Entrar"
4. **Será redirecionado** para dashboard específico

## Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Login.jsx       # Página de login
│   ├── Login.css       # Estilos do login
│   ├── Dashboard.jsx   # Dashboard pós-login
│   └── Dashboard.css   # Estilos do dashboard
├── contexts/           # Contextos React
│   └── AuthContext.jsx # Gerenciamento de autenticação
├── App.jsx            # Componente principal
├── App.css            # Estilos globais
└── main.jsx           # Ponto de entrada
```

## Funcionalidades por Tipo de Usuário

### 👑 **Administrador**
- Gerenciar usuários (médicos, secretários)
- Visualizar relatórios
- Configurações do sistema

### 👨‍⚕️ **Médico Veterinário**
- Visualizar agenda de consultas
- Acessar prontuários
- Emitir receitas

### 🐾 **Cliente (Tutor)**
- Agendar consultas
- Gerenciar pets
- Visualizar histórico

## API Integration

O frontend se conecta automaticamente com o backend através do contexto `AuthContext`:

- **Login**: `POST /auth/login`
- **Registro**: `POST /auth/register`
- **Base URL**: `http://localhost:4000`

## Desenvolvimento

### Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview da build
- `npm run lint` - Verificar código com ESLint

### Estrutura de Componentes

- **Login**: Formulário de autenticação
- **Dashboard**: Área logada com conteúdo específico
- **AuthContext**: Gerenciamento global do estado de autenticação

## Próximos Passos

- [ ] Implementar registro de novos usuários
- [ ] Adicionar funcionalidades específicas por tipo
- [ ] Implementar proteção de rotas avançada
- [ ] Adicionar testes automatizados
