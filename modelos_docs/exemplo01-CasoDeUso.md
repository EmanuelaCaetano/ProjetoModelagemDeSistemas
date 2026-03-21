# Caso de Uso: CLIENTE

**Nome:** Agendar Consulta  
**Atores:** Cliente, Sistema Veterinário  
**Objetivo:** Permitir que o Cliente acesse o sistema para agendar novas consultas e verificar consultas antigas. 
## Descrição

Este caso de uso descreve o processo pelo qual o cliente realiza o agendamento de uma consulta para um de seus animais no sistema da clínica veterinária. O cliente acessa o sistema, seleciona um animal previamente cadastrado e escolhe um horário disponível na agenda. O sistema valida as informações, registra a consulta no banco de dados e apresenta uma confirmação do agendamento ao usuário.

## Pré-condições

- O Cliente deve estar autenticado no sistema(ter um login)
- O Clinte pode criar um perfil para o seu PET
- O Cliente pode agendar a sua consulta

## Fluxo principal

1. O cliente acessa o sistema e realiza login com e-mail e senha.
2. O cliente acessa a área de agendamento de consultas.
3. O sistema exibe a agenda com os horários disponíveis.
4. O cliente seleciona o animal que será atendido.
5. O cliente escolhe a data e o horário da consulta.
6. O sistema verifica a disponibilidade do horário.
7. O sistema registra a consulta no banco de dados.
8. O sistema confirma o agendamento para o cliente.

## Fluxos alternativos

### A1. Possíveis não conclusão de agendamento

1. No passo 3, o sistema identifica o dia em que a clínica não realiza consultas.
2. No passo 5 o sitema indica quais dias não terá disponibilidade de horário para agendar consultas.

### A2. Cadastrar o pet

1. No passo 1, o sitema pede para cadastrar um pet(Tipo de animal, raça, porte). Também é possivel cadastrar mais que pets na página inicial.

## Pós-condições

- O cliente deve ter a consulta registrada em sua conta no sistema.
- O cliente deve conseguir visualizar a consulta agendada em seu histórico.
- O cliente deve receber a confirmação do agendamento.
