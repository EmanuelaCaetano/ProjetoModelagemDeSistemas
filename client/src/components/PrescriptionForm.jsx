import { useState } from 'react';
import './PrescriptionForm.css';

const PrescriptionForm = ({ schedules }) => {
  const [appointmentId, setAppointmentId] = useState('');
  const [medicamento, setMedicamento] = useState('');
  const [dosagem, setDosagem] = useState('');
  const [orientacoes, setOrientacoes] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [error, setError] = useState('');

  const selectedSchedule = schedules.find((schedule) => schedule.id === appointmentId);
  const paciente = selectedSchedule?.pet?.nome || '';
  const cliente = selectedSchedule?.client?.nome || '';
  const data = new Date().toLocaleDateString('pt-BR');

  const buildPrescriptionHtml = () => {
    return `
      <html>
        <head>
          <title>Receituário Veterinário</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
            h1 { text-align: center; margin-bottom: 16px; }
            .section { margin-bottom: 16px; }
            .section strong { display: inline-block; width: 120px; }
            .prescription-box { border: 1px solid #333; padding: 16px; border-radius: 8px; }
            .footer { margin-top: 24px; font-size: 0.95rem; }
          </style>
        </head>
        <body>
          <h1>Receituário Veterinário</h1>
          <div class="section">
            <p><strong>Paciente:</strong> ${paciente || '____________________'}</p>
            <p><strong>Cliente:</strong> ${cliente || '____________________'}</p>
            <p><strong>Data:</strong> ${data}</p>
          </div>
          <div class="prescription-box">
            <p><strong>Medicamento:</strong> ${medicamento || '____________________'}</p>
            <p><strong>Dosagem:</strong> ${dosagem || '____________________'}</p>
            <p><strong>Orientações:</strong></p>
            <p>${orientacoes || '____________________'}</p>
            ${observacoes ? `<p><strong>Observações:</strong> ${observacoes}</p>` : ''}
          </div>
          <div class="footer">
            <p>Assinatura do médico: _______________________________</p>
            <p>CRMV: _______________________________</p>
          </div>
        </body>
      </html>
    `;
  };

  const handleExport = (event) => {
    event.preventDefault();
    setError('');

    if (!medicamento.trim() || !dosagem.trim() || !orientacoes.trim()) {
      setError('Medicamento, dosagem e orientações são obrigatórios.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setError('Não foi possível abrir a janela de impressão. Verifique seu bloqueador de pop-ups.');
      return;
    }

    printWindow.document.write(buildPrescriptionHtml());
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="prescription-form">
      <h2>Gerar Receituário</h2>
      <form onSubmit={handleExport}>
        <div className="form-group">
          <label htmlFor="appointmentId">Consulta</label>
          <select
            id="appointmentId"
            value={appointmentId}
            onChange={(e) => setAppointmentId(e.target.value)}
          >
            <option value="">Selecione uma consulta (opcional)</option>
            {schedules.map((schedule) => (
              <option key={schedule.id} value={schedule.id}>
                {schedule.pet?.nome} — {new Date(schedule.date).toLocaleDateString('pt-BR')}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="medicamento">Medicamento *</label>
          <input
            id="medicamento"
            value={medicamento}
            onChange={(e) => setMedicamento(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="dosagem">Dosagem *</label>
          <input
            id="dosagem"
            value={dosagem}
            onChange={(e) => setDosagem(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="orientacoes">Orientações *</label>
          <textarea
            id="orientacoes"
            value={orientacoes}
            onChange={(e) => setOrientacoes(e.target.value)}
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

        {error && <div className="form-error">{error}</div>}
        <button type="submit" className="btn-submit">
          Exportar em PDF
        </button>
      </form>
    </div>
  );
};

export default PrescriptionForm;
