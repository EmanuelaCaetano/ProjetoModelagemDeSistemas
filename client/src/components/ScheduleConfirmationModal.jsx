import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './ScheduleConfirmationModal.css';

const ScheduleConfirmationModal = ({
  selectedDate,
  selectedPet,
  selectedClient,
  selectedVeterinarian,
  selectedTime,
  onConfirm,
  onCancel
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content schedule-confirmation-modal">
        <div className="modal-header">
          <h2>✓ Confirmar Agendamento</h2>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>

        <div className="modal-body">
          <div className="confirmation-item">
            <span className="confirmation-label">📅 Data:</span>
            <span className="confirmation-value">
              {format(selectedDate, 'EEEE, dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
            </span>
          </div>

          <div className="confirmation-item">
            <span className="confirmation-label">⏰ Horário:</span>
            <span className="confirmation-value">{selectedTime?.time}</span>
          </div>

          {selectedClient && (
            <div className="confirmation-item">
              <span className="confirmation-label">👤 Cliente:</span>
              <span className="confirmation-value">{selectedClient.nome}</span>
            </div>
          )}

          <div className="confirmation-item">
            <span className="confirmation-label">🐾 Pet:</span>
            <span className="confirmation-value">
              {selectedPet ? `${selectedPet.nome} (${selectedPet.especie})` : 'Não informado'}
            </span>
          </div>

          <div className="confirmation-item">
            <span className="confirmation-label">👨‍⚕️ Veterinário:</span>
            <span className="confirmation-value">
              {selectedVeterinarian?.nome}
              {selectedVeterinarian?.especialidade && (
                <div className="specialty-info">
                  Especialidade: {selectedVeterinarian.especialidade}
                </div>
              )}
            </span>
          </div>

          <div className="confirmation-summary">
            <p>Todos os dados estão corretos?</p>
            <button className="btn btn-success" onClick={onConfirm}>
              ✓ Confirmar Agendamento
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn btn-success" onClick={onConfirm}>
            ✓ Confirmar Agendamento
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleConfirmationModal;
