# API de Autenticação - Clínica Veterinária NewPet

Esta API fornece funcionalidades de autenticação para o sistema da clínica veterinária NewPet, incluindo login e registro de usuários com diferentes tipos (cliente, médico veterinário, administrador).

## Funcionalidades

- **Login**: Autenticação de usuários por e-mail e senha
- **Registro**: Cadastro de novos usuários
- **Tipos de Usuário**: Cliente, Médico Veterinário, Administrador
- **Banco de Dados**: SQLite com dados iniciais

## Usuários Iniciais

A API vem com usuários iniciais pré-cadastrados:

1. **Administrador**
   - Email: `admin@newpet.com`
   - Senha: `Admin@123`

2. **Médico Veterinário**
   - Email: `medico@newpet.com`
   - Senha: `Medico@123`

3. **Cliente**
   - Email: `cliente@newpet.com`
   - Senha: `Cliente@123`

## Instalação e Execução

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Compilar para produção
npm run build

# Executar em produção
npm start
```

O servidor será executado em `http://localhost:4000`.

## Solução de Problemas

Se encontrar erros ao executar `npm run dev`, certifique-se de que:

1. Todas as dependências foram instaladas: `npm install`
2. O Node.js está na versão 18+ (recomendado 20+)
3. O projeto está configurado para CommonJS (não ES modules)

### Comandos Alternativos

Se `npm run dev` não funcionar, tente:

```bash
# Usando ts-node diretamente
npx ts-node src/index.ts

# Ou compilando primeiro
npm run build && npm start
```

## Endpoints da API

### POST /auth/login
Realiza login de usuário.

**Corpo da requisição:**
```json
{
  "email": "usuario@exemplo.com",
  "senha": "senha123"
}
```

**Resposta de sucesso:**
```json
{
  "message": "Login realizado com sucesso.",
  "usuario": {
    "id": 1,
    "nome": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "tipoUsuario": "cliente",
    "telefone": "+55 11 99999-9999",
    "endereco": "Rua Exemplo, 123",
    "createdAt": "2026-04-29T23:30:00.000Z"
  }
}
```

### POST /auth/register
Registra um novo usuário.

**Corpo da requisição:**
```json
{
  "nome": "Novo Usuário",
  "email": "novo@exemplo.com",
  "senha": "senha123",
  "role": "cliente",
  "telefone": "+55 11 99999-9999",
  "endereco": "Rua Nova, 456"
}
```

**Campos obrigatórios:** `nome`, `email`, `senha`, `role`

**Valores possíveis para `role`:** `cliente`, `medico`, `administrador`

## Estrutura do Banco de Dados

A tabela `users` contém os seguintes campos:
- `id`: Identificador único (auto-incremento)
- `nome`: Nome completo do usuário
- `email`: E-mail único do usuário
- `senha`: Senha criptografada (SHA-256)
- `role`: Tipo de usuário (cliente/medico/administrador)
- `telefone`: Telefone (opcional)
- `endereco`: Endereço (opcional)
- `crmv`: Número do CRMV (para médicos veterinários)
- `especialidade`: Especialidade médica (para médicos veterinários)
- `nivelAcesso`: Nível de acesso (para administradores)
- `createdAt`: Data de criação do registro

## Tecnologias Utilizadas

- **Node.js**: Runtime JavaScript
- **Express.js**: Framework web
- **SQLite3**: Banco de dados
- **TypeScript**: Tipagem estática
- **CORS**: Suporte a requisições cross-origin

## Desenvolvimento

O projeto segue a arquitetura MVC com:
- `controllers/`: Controladores da API
- `models/`: Modelos de dados e operações do banco
- `routes/`: Definição das rotas
- `config/`: Configuração do banco de dados
- `utils/`: Utilitários (criptografia de senha)
