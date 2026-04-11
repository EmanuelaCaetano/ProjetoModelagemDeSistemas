# Modelo Conceitual de Domínio

## Sistema: Clinica veterinária

O modelo conceitual de domínio abaixo representa os principais conceitos do sistema e os relacionamentos entre eles.
@startuml
classDiagram
    class Usuario {
        +id
        +nome
        +email
        +senha
    }

    class Cliente {
        +telefone
        +endereco
    }

    class MedicoVeterinario {
        +crmv
        +especialidade
    }

    class Administrador {
        +nivelAcesso
    }

    class Animal {
        +id
        +nome
        +especie
        +raca
    }

    class Consulta {
        +id
        +dataHorario
        +procedimento
    }

    class Prontuario {
        +id
        +historicoMedico
    }

    class Agenda {
        +id
        +horariosDisponiveis
    }

    Usuario <|-- Cliente
    Usuario <|-- MedicoVeterinario
    Usuario <|-- Administrador
@enduml
    Cliente "1" --> "0..*" Animal : possui
    Animal "1" --> "1" Prontuario : possui
    MedicoVeterinario "1" --> "0..*" Consulta : realiza
    Animal "1" --> "0..*" Consulta : recebe
    Agenda "1" --> "0..*" Consulta : controla
    Administrador "1" --> "0..*" Agenda : gerencia
