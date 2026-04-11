# Caso de Uso: ADMINISTRADOR

## Nome
Gerenciar Usuários

## Ator Principal
Administrador

## Fluxo Principal
1. O administrador realiza login no sistema.
2. O administrador acessa a área de gerenciamento de usuários.
3. O sistema exibe a lista de usuários cadastrados.
4. O administrador seleciona uma ação (cadastrar, editar ou remover usuário).
5. O administrador preenche ou altera as informações necessárias.
6. O sistema valida os dados.
7. O sistema salva as alterações no banco de dados.
8. O sistema confirma a operação.

## Extensões
### Extensão 1 — Dados Inválidos
1. O sistema identifica informações inválidas.
2. O sistema solicita correção dos dados.

### Extensão 2 — Usuário Já Cadastrado
1. O sistema identifica que o e-mail já está em uso.
2. O sistema informa que o usuário já existe.