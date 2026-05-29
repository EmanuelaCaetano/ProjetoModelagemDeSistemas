import { useState, useEffect } from 'react';
import { createMedicalRecord, updateMedicalRecord } from '../services/medicalRecordService';
import './MedicalRecordForm.css';

const MedicalRecordForm = ({ schedules, onSuccess, editingRecord, onCancel }) => {
  const [appointmentId, setAppointmentId] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [medicamentos, setMedicamentos] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingRecord) {
      setAppointmentId(editingRecord.scheduleId ?? '');
      setDiagnostico(editingRecord.diagnostico ?? '');
      setObservacoes(editingRecord.observacoes ?? '');
      setMedicamentos(editingRecord.medicamentos ?? '');
      setMessage('');
      setError('');
    }
  }, [editingRecord]);

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
      const payload = {
        scheduleId: selectedSchedule?.id ?? appointmentId,
        animalId: selectedSchedule?.pet?.id ?? editingRecord?.animalId,
        diagnostico: diagnostico.trim(),
        observacoes: observacoes.trim(),
        medicamentos: medicamentos.trim(),
      };

      if (editingRecord && editingRecord.id) {
        await updateMedicalRecord(editingRecord.id, payload);
        setMessage('Prontuário atualizado com sucesso.');
      } else {
        await createMedicalRecord(payload);
        setMessage('Prontuário salvo com sucesso.');
      }

      setDiagnostico('');
      setObservacoes('');
      setMedicamentos('');
      setAppointmentId('');
      onSuccess?.();
      onCancel?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar o prontuário.');
    }
  };

  return (
    <div className="medical-record-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="appointmentId">Consulta</label>
          <select
            id="appointmentId"
            value={appointmentId}
            onChange={(e) => setAppointmentId(e.target.value ? parseInt(e.target.value, 10) : '')}
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

        <div className="form-actions">
          <button type="submit" className="btn-submit">
            {editingRecord ? 'Atualizar prontuário' : 'Salvar prontuário'}
          </button>
          {editingRecord && (
            <button type="button" className="btn-cancel" onClick={() => onCancel?.()}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MedicalRecordForm;
