# Caso de Uso: MEDICO

## Nome
Registrar Atendimento

## Ator Principal
Médico Veterinário

## Fluxo Principal
1. O médico acessa o sistema e realiza login.
2. O médico visualiza sua agenda de consultas.
3. O médico seleciona uma consulta agendada.
4. O sistema exibe os dados do animal e do cliente.
5. O médico registra informações do atendimento (diagnóstico, observações e medicamentos).
6. O sistema salva as informações no prontuário do animal.
7. O sistema marca a consulta como concluída.

## Extensões
### Extensão 1 — Consulta Cancelada
1. O sistema identifica que a consulta foi cancelada.
2. O sistema informa ao médico que a consulta não está disponível para atendimento.

### Extensão 2 — Falha ao Salvar Prontuário
1. O sistema não consegue salvar as informações.
2. O sistema solicita que o médico tente registrar novamente.