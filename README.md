# Projeto Final Modelagem de Sistemas

Projeto final da disciplina de Modelagem de Sistemas para a clínica veterinária NewPet. O sistema é composto por um frontend em React e um backend em Node.js/TypeScript, com autenticação e dashboards diferenciados para administradores, médicos veterinários e clientes.

## Integrantes

- Arthur Garcia - 10436529
- Bruno Soares Vilalba - 10443917
- Emanuela Caetano - 10428527

## Visão geral do projeto

O projeto é dividido em duas partes principais:

- `client/`: frontend React que oferece a interface de login e dashboards para os diferentes tipos de usuário.
- `server/`: backend Node.js com TypeScript que implementa a API de autenticação e persistência em banco de dados SQLite.

## Pré-requisitos

- Node.js 18+ (recomendado Node 20)
- npm 10+ ou compatível

## Passo a passo para rodar o projeto

### 1. Instalar dependências do backend

Abra um terminal na pasta raiz e execute:

```bash
cd server
npm install
```

### 2. Instalar dependências do frontend

No mesmo terminal, ou em outro terminal, execute:

```bash
cd ../client
npm install
```

### 3. Iniciar o backend

No terminal da pasta `server`:

```bash
npm run dev
```

O servidor de API será iniciado em `http://localhost:4000`.

### 4. Iniciar o frontend

No terminal da pasta `client`:

```bash
npm run dev
```

A interface será aberta em `http://localhost:5173`.

### 5. Acessar a aplicação

Abra o navegador em:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Como o projeto funciona

### Backend

O backend fornece a API de autenticação e gerenciamento de usuários.

- `src/index.ts`: ponto de entrada do servidor Express.
- `src/routes/authRoutes.ts`: rotas de autenticação (`/auth/login` e `/auth/register`).
- `src/controllers/authController.ts`: lógica de login e registro.
- `src/models/user.ts`: modelo de usuário e integração com SQLite.
- `src/utils/password.ts`: utilitário para hash de senha.

O banco de dados usa SQLite e é carregado com usuários iniciais para testes.

### Frontend

O frontend é uma aplicação React que consome a API do backend.

- `src/App.jsx`: define as rotas e a estrutura principal da aplicação.
- `src/components/Login.jsx`: página de login.
- `src/components/Dashboard.jsx`: dashboard exibido após autenticação.
- `src/contexts/AuthContext.jsx`: gerencia o estado de autenticação e mantém o token/sessão.
- `src/services/api.js`: configuração de requisições Axios para conectar ao backend.

### Fluxo de uso

1. O usuário acessa `http://localhost:5173`.
2. Digita e-mail e senha.
3. O frontend envia os dados para `POST http://localhost:4000/auth/login`.
4. O backend valida as credenciais e retorna os dados do usuário.
5. O frontend armazena o estado de sessão e mostra o dashboard apropriado.

## Usuários de teste

Por padrão, há usuários iniciais disponíveis para login:

- Admin: `admin@newpet.com` / `Admin@123`
- Médico: `medico@newpet.com` / `Medico@123`
- Cliente: `cliente@newpet.com` / `Cliente@123`

## Estrutura do repositório

```
/                    # Raiz do projeto
├── client/          # Frontend React
│   ├── public/
│   └── src/
├── server/          # Backend Node.js + TypeScript
│   ├── src/
│   └── tsconfig.json
├── docs/            # Documentação do projeto
└── modelos_docs/    # Modelos e exemplos de documentos
```

## Build para produção

Se desejar gerar os builds em cada parte, rode:

```bash
cd server
npm run build
cd ../client
npm run build
```

## Observações

- O frontend depende do backend estar em execução para autenticação.
- O backend usa SQLite local, sem necessidade de servidor de banco externo.
- Caso precise recriar dependências, remova `node_modules` e execute `npm install` novamente em cada pasta.


