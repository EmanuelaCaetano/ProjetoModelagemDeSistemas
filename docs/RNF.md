# Requisitos Funcionais Clinica veterinaria

### RF01. Cadastro de usuários
- O sistema deve permitir que o administrador cadastre novos usuários no sistema, incluindo médicos veterinários e secretários.  
- O sistema deve armazenar as informações do usuário para acesso posterior.

### RF02. Autenticação de usuários
- O sistema deve permitir que usuários realizem login utilizando e-mail e senha.  
- O sistema deve validar as credenciais antes de liberar o acesso às funcionalidades.

### RF03. Cadastro de clientes
- O sistema deve permitir que clientes realizem seu próprio cadastro na plataforma.  
- O sistema deve registrar os dados do cliente para utilização nos atendimentos.

### RF04. Cadastro de animais
- O sistema deve permitir que o cliente cadastre animais informando suas caracteristicas.  
- O sistema deve vincular o animal ao cliente responsável.

### RF05. Consulta de agenda
- O sistema deve permitir que usuários visualizem a agenda de consultas com horários disponíveis e indisponíveis.  
- O sistema deve apresentar a indisponibilidade de horários em tempo real.

### RF06. Definição de disponibilidade médica
- O sistema deve permitir que o médico veterinário informe os horários em que estará disponível para atendimento.  
- O sistema deve atualizar automaticamente a agenda geral da clínica.

### RF07. Agendamento de consultas pelo cliente
- O sistema deve permitir que o cliente agende consultas selecionando animal, data e horário disponíveis.  
- O sistema deve associar automaticamente a consulta a um médico disponível.

### RF08. Agendamento de consultas pela secretaria
- O sistema deve permitir que a secretária agende consultas para clientes através de um painel administrativo.  
- O sistema deve permitir filtros de busca para facilitar o agendamento.

### RF09. Confirmação de consulta
- O sistema deve confirmar o agendamento da consulta após validação do horário escolhido.  
- O sistema deve registrar a consulta no banco de dados.

### RF10. Filtro de médicos
- O sistema deve permitir a filtragem de médicos disponíveis durante o agendamento de consultas.  
- O sistema deve apresentar apenas profissionais compatíveis com o horário selecionado.

### RF11. Assistente de horários (prompt de conversa)
- O sistema deve disponibilizar um mecanismo de conversa para auxiliar o usuário na escolha de horários disponíveis.  
- O sistema deve sugerir horários com base na disponibilidade cadastrada.

### RF12. Visualização de agenda pessoal do médico
- O sistema deve permitir que o médico visualize apenas sua agenda pessoal de consultas.  
- O sistema deve apresentar consultas futuras e concluídas.

### RF13. Registro de atendimento veterinário
- O sistema deve permitir que o médico registre diagnóstico, observações e medicamentos após a consulta.  
- O sistema deve atualizar o prontuário do animal automaticamente.

### RF14. Gerenciamento de prontuário
- O sistema deve armazenar o histórico médico dos animais atendidos.  
- O sistema deve permitir consulta posterior das informações registradas.

### RF15. Cancelamento ou alteração de consultas
- O sistema deve permitir alteração ou cancelamento de consultas previamente agendadas.

### RF16. Painel administrativo da secretaria
- O sistema deve disponibilizar um painel para secretárias realizarem consultas, filtros e agendamentos.  
- O sistema deve centralizar as funções operacionais da clínica.

### RF17. Gerenciamento completo pelo administrador SUS
- O sistema deve permitir que o administrador possua acesso total às funcionalidades do sistema.  
- O sistema deve permitir cadastro e gerenciamento de médicos e secretários.

