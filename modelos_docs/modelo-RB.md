# Modelo de Regras de Negócio

## Instruções

- Regras de negócio descrevem normas, restrições e condições que devem ser seguidas no funcionamento da clínica veterinária.

- Elas representam como os processos da clínica acontecem na prática, como atendimento de animais, registro de prontuários, controle de agenda e aplicação de vacinas.

- As regras devem ser escritas de forma clara, objetiva e direta, focando nas atividades da clínica e não em detalhes do sistema.

- Evite descrever telas ou funcionalidades específicas, priorizando regras que representem o comportamento e as responsabilidades no ambiente real da clínica.

---


## Exemplos

### RB01. O animal só pode ser atendido se estiver vinculado a um cliente 

### RB02. A consulta deve ser realizada por um médico veterinário habilitado 

### RB03. A agenda da clínica não pode possuir conflitos de horário  

### RB04. A vacinação deve seguir o calendário adequado para cada animal  

### RB05. Somente administradores podem cadastrar médicos veterinários
---

## Estrutura recomendada

Uma boa forma de escrever é:

**Entidade ou ator + condição/regra + consequência**

**Exemplos:**

- O aluno só pode realizar matrícula se estiver com status ativo.
- O sistema deve bloquear a venda de produtos sem estoque disponível.
- O professor só pode lançar notas das turmas em que está vinculado.

---

## Tipos comuns de regras de negócio

### Limites

- A clínica pode atender um número limitado de consultas por dia
- Um médico pode realizar um número máximo de atendimentos por período

### Condições

- A consulta só pode ser realizada se estiver previamente agendada
- O animal só pode ser atendido se estiver vinculado a um cliente

### Restrições de acesso

- Somente médicos veterinários podem registrar prontuários
- Apenas administradores podem cadastrar novos médicos

### Critérios de cálculo ou validação
Definem regras para aprovar, calcular ou validar dados.

**Exemplos:**
- O prontuário deve conter diagnóstico e data do atendimento
- O registro de vacinação deve incluir o tipo de vacina e a data de aplicação

---

