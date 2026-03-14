# Caso de Uso: ANIMAL

## Nome
Cadastrar Animal

## Ator Principal
Cliente

## Fluxo Principal
1. O cliente realiza login no sistema.
2. O cliente acessa a área de cadastro de animais.
3. O cliente preenche os dados do animal (nome, espécie, raça, idade e peso).
4. O cliente confirma o cadastro.
5. O sistema valida as informações.
6. O sistema registra o animal no banco de dados.
7. O sistema confirma o cadastro.

## Extensões
### Extensão 1 — Dados Incompletos
1. O sistema identifica que existem campos obrigatórios não preenchidos.
2. O sistema solicita que o cliente complete as informações.

### Extensão 2 — Erro no Cadastro
1. O sistema não consegue salvar os dados.
2. O sistema informa erro e solicita nova tentativa.