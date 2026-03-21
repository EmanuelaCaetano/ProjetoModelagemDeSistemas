# Caso de Uso: CLIENTE

## Nome
Agendar Consulta

## Ator Principal
Cliente (Tutor do animal)

## Fluxo Principal
1. O cliente acessa o sistema e realiza login com e-mail e senha.
2. O cliente acessa a área de agendamento de consultas.
3. O sistema exibe a agenda com os horários disponíveis.
4. O cliente seleciona o animal que será atendido.
5. O cliente escolhe a data e o horário da consulta.
6. O sistema verifica a disponibilidade do horário.
7. O sistema registra a consulta no banco de dados.
8. O sistema confirma o agendamento para o cliente.

## Extensões
### Extensão 1 — Horário Indisponível
1. O sistema identifica que o horário já está ocupado.
2. O sistema informa que o horário não está disponível.
3. O cliente escolhe outro horário disponível.

### Extensão 2 — Animal Não Cadastrado
1. O cliente não possui animal cadastrado.
2. O sistema solicita o cadastro de um animal.
3. O cliente cadastra o animal.
4. O sistema retorna ao processo de agendamento.