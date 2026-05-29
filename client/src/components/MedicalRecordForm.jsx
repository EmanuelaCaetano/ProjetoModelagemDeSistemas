import { useState } from 'react';
import { createMedicalRecord } from '../services/medicalRecordService';
import './MedicalRecordForm.css';

const MedicalRecordForm = ({ schedules, onSuccess }) => {
  const [appointmentId, setAppointmentId] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [medicamentos, setMedicamentos] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selectedSchedule = schedules.find((schedule) => schedule.id === appointmentId);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!appointmentId) {
      setError('Escolha uma consulta para registrar o prontuário.');
      return;
    }

    if (!diagnostico.trim()) {
      setError('O diagnóstico é obrigatório.');
      return;
    }

    try {
      await createMedicalRecord({
        appointmentId: selectedSchedule?.id,
        animalId: selectedSchedule?.pet?.id,
        diagnostico: diagnostico.trim(),
        observacoes: observacoes.trim(),
        medicamentos: medicamentos.trim(),
      });

      setMessage('Prontuário salvo com sucesso.');
      setDiagnostico('');
      setObservacoes('');
      setMedicamentos('');
      setAppointmentId('');
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar o prontuário.');
    }
  };

  return (
    <div className="medical-record-form">
      <h2>Registrar Prontuário</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="appointmentId">Consulta</label>
          <select
            id="appointmentId"
            value={appointmentId}
            onChange={(e) => setAppointmentId(e.target.value)}
          >
            <option value="">Selecione uma consulta</option>
            {schedules.map((schedule) => (
              <option key={schedule.id} value={schedule.id}>
                {schedule.pet?.nome} — {new Date(schedule.date).toLocaleString('pt-BR')}
              </option>
            ))}
          </select>
        </div>

        {selectedSchedule && (
          <div className="record-summary">
            <p><strong>Animal:</strong> {selectedSchedule.pet?.nome}</p>
            <p><strong>Cliente:</strong> {selectedSchedule.client?.nome}</p>
            <p><strong>Data:</strong> {new Date(selectedSchedule.date).toLocaleString('pt-BR')}</p>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="diagnostico">Diagnóstico *</label>
          <textarea
            id="diagnostico"
            value={diagnostico}
            onChange={(e) => setDiagnostico(e.target.value)}
            rows={4}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="observacoes">Observações</label>
          <textarea
            id="observacoes"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="medicamentos">Medicamentos</label>
          <textarea
            id="medicamentos"
            value={medicamentos}
            onChange={(e) => setMedicamentos(e.target.value)}
            rows={3}
          />
        </div>

        {error && <div className="form-error">{error}</div>}
        {message && <div className="form-success">{message}</div>}

        <button type="submit" className="btn-submit">
          Salvar prontuário
        </button>
      </form>
    </div>
  );
};

export default MedicalRecordForm;
