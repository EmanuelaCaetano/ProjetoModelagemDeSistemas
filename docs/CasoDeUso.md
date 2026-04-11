# Caso de Uso Nº 01

**Nome:** Gerenciar Usuários  
**Atores:** Administrador  
**Objetivo:** Permitir que o administrador cadastre, edite e remova usuários do sistema.

## Descrição

Este caso de uso representa o gerenciamento de usuários da clínica veterinária, permitindo ao administrador manter atualizados os cadastros de médicos e secretários no sistema.

## Pré-condições

- o administrador deve estar autenticado no sistema  
- o administrador deve possuir permissão de gerenciamento de usuários  

## Fluxo principal

1. O administrador realiza login no sistema.  
2. O administrador acessa a área de gerenciamento de usuários.  
3. O sistema exibe a lista de usuários cadastrados.  
4. O administrador seleciona uma ação (cadastrar, editar ou remover usuário).  
5. O administrador preenche ou altera as informações necessárias.  
6. O sistema valida os dados informados.  
7. O sistema salva as alterações no banco de dados.  
8. O sistema confirma a operação realizada.  

## Fluxos alternativos

### A1. Dados Inválidos

1. O sistema identifica informações inválidas.  
2. O sistema solicita a correção dos dados.  
3. O administrador corrige as informações e reenvi­a.  

### A2. Usuário Já Cadastrado

1. O sistema identifica que o e-mail já está em uso.  
2. O sistema informa que o usuário já existe.  
3. O administrador informa outro e-mail válido.  

## Pós-condições

- usuário cadastrado, atualizado ou removido com sucesso  
- base de usuários atualizada no sistema  

---

# Caso de Uso Nº 02

**Nome:** Cadastrar Animal  
**Atores:** Cliente  
**Objetivo:** Permitir que o cliente registre um animal para atendimento na clínica.

## Descrição

Este caso de uso permite que o cliente cadastre os dados do seu animal no sistema para possibilitar o agendamento de consultas veterinárias.

## Pré-condições

- o cliente deve estar autenticado no sistema  
- o cliente deve possuir cadastro ativo  

## Fluxo principal

1. O cliente realiza login no sistema.  
2. O cliente acessa a área de cadastro de animais.  
3. O cliente preenche os dados do animal (nome, espécie, raça, idade e peso).  
4. O cliente confirma o cadastro.  
5. O sistema valida as informações fornecidas.  
6. O sistema registra o animal no banco de dados.  
7. O sistema confirma o cadastro ao cliente.  

## Fluxos alternativos

### A1. Dados Incompletos

1. O sistema identifica campos obrigatórios não preenchidos.  
2. O sistema solicita o preenchimento das informações faltantes.  
3. O cliente completa os dados e confirma novamente.  

### A2. Erro no Cadastro

1. O sistema não consegue salvar os dados.  
2. O sistema informa erro ao usuário.  
3. O cliente realiza nova tentativa de cadastro.  

## Pós-condições

- animal cadastrado no sistema  
- animal disponível para seleção em agendamentos  

---

# Caso de Uso Nº 03

**Nome:** Agendar Consulta  
**Atores:** Cliente (Tutor do animal)  
**Objetivo:** Permitir que o cliente agende uma consulta veterinária para um animal cadastrado.

## Descrição

Este caso de uso representa o processo de agendamento de consultas, onde o cliente seleciona um animal e um horário disponível, sendo automaticamente vinculado a um médico disponível.

## Pré-condições

- o cliente deve estar autenticado no sistema  
- o cliente deve possuir ao menos um animal cadastrado  
- deve existir médico disponível no horário selecionado  

## Fluxo principal

1. O cliente acessa o sistema e realiza login com e-mail e senha.  
2. O cliente acessa a área de agendamento de consultas.  
3. O sistema exibe a agenda com horários disponíveis e indisponíveis.  
4. O cliente seleciona o animal que será atendido.  
5. O cliente escolhe data e horário da consulta.  
6. O sistema verifica a disponibilidade do horário.  
7. O sistema associa automaticamente um médico disponível.  
8. O sistema registra a consulta no banco de dados.  
9. O sistema confirma o agendamento para o cliente.  

## Fluxos alternativos

### A1. Horário Indisponível

1. O sistema identifica que o horário já está ocupado.  
2. O sistema informa indisponibilidade ao cliente.  
3. O cliente escolhe outro horário disponível.  

### A2. Animal Não Cadastrado

1. O sistema identifica que o cliente não possui animal cadastrado.  
2. O sistema solicita o cadastro de um animal.  
3. O cliente realiza o cadastro do animal.  
4. O sistema retorna ao processo de agendamento.  

## Pós-condições

- consulta registrada no sistema  
- agenda do médico atualizada automaticamente  

---

# Caso de Uso Nº 04

**Nome:** Registrar Atendimento  
**Atores:** Médico Veterinário  
**Objetivo:** Permitir que o médico registre informações do atendimento realizado.

## Descrição

Este caso de uso permite ao médico veterinário registrar diagnósticos, observações e medicamentos após a realização de uma consulta, atualizando o prontuário do animal.

## Pré-condições

- o médico deve estar autenticado no sistema  
- deve existir consulta agendada para o médico  
- a consulta deve estar ativa ou em andamento  

## Fluxo principal

1. O médico acessa o sistema e realiza login.  
2. O médico visualiza sua agenda de consultas.  
3. O médico seleciona uma consulta agendada.  
4. O sistema exibe os dados do animal e do cliente.  
5. O médico registra informações do atendimento (diagnóstico, observações e medicamentos).  
6. O sistema salva as informações no prontuário do animal.  
7. O sistema marca a consulta como concluída.  

## Fluxos alternativos

### A1. Consulta Cancelada

1. O sistema identifica que a consulta foi cancelada.  
2. O sistema informa ao médico que a consulta não está disponível para atendimento.  
3. O fluxo é encerrado.  

### A2. Falha ao Salvar Prontuário

1. O sistema não consegue salvar as informações.  
2. O sistema informa erro ao médico.  
3. O médico tenta registrar novamente.  

## Pós-condições

- prontuário do animal atualizado  
- consulta marcada como concluída  
