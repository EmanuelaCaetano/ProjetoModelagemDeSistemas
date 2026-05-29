import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchMySchedules } from '../../../services/scheduleService';
import { fetchMyMedicalRecords, deleteMedicalRecord } from '../../../services/medicalRecordService';
import MedicalRecordForm from '../../../components/MedicalRecordForm';
import PrescriptionForm from '../../../components/PrescriptionForm';
import EditableProfile from '../../../components/EditableProfile';
import './DoctorSchedulePage.css';

const DoctorSchedulePage = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const allowedTabs = ['agenda', 'prontuarios', 'registroprontuarios', 'receituarios', 'perfil'];
  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    return allowedTabs.includes(tab) ? tab : 'agenda';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [schedules, setSchedules] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState('');

  useEffect(() => {
    loadSchedules();
  }, []);

  useEffect(() => {
    if (activeTab === 'registroprontuarios') {
      loadMedicalRecords();
    }
  }, [activeTab]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && allowedTabs.includes(tab) && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location.search, activeTab]);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const data = await fetchMySchedules();
      setSchedules(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError('Não foi possível carregar sua agenda.');
    }
    setLoading(false);
  };

  const loadMedicalRecords = async () => {
    setRecordsLoading(true);
    try {
      const data = await fetchMyMedicalRecords();
      setMedicalRecords(Array.isArray(data) ? data : []);
      setRecordsError('');
    } catch (err) {
      setRecordsError('Não foi possível carregar os prontuários.');
    }
    setRecordsLoading(false);
  };

  if (!user || user.tipoUsuario !== 'medico') {
    return <div className="unauthorized-message">Você não tem permissão para acessar esta página.</div>;
  }

  return (
    <div className="schedule-page doctor-schedule-page">
      <header className="schedule-page-header">
        <div>
          <h1>📋 Painel do Médico</h1>
          <p>Gerencie sua agenda, registre prontuários e emita receituários de forma rápida.</p>
        </div>
        <button className="logout-button" onClick={() => logout()}>
          🚪 Sair
        </button>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="doctor-profile-summary">
        <div className="doctor-card doctor-info-card">
          <span>Médico Veterinário</span>
          <h2>Dr. {user.nome}</h2>
          <p>CRMV: <strong>{user.crmv || 'Não informado'}</strong></p>
          <p>Especialidade: <strong>{user.especialidade || 'Geral'}</strong></p>
        </div>

        <div className="doctor-card doctor-stat-card">
          <div>
            <h3>{loading ? '...' : schedules.length}</h3>
            <p>Consultas atribuídas</p>
          </div>
          <div>
            <h3>{schedules.filter((item) => item.status === 'confirmada').length}</h3>
            <p>Consultas confirmadas</p>
          </div>
        </div>
      </div>

      <div className="doctor-tabs">
        <button
          className={activeTab === 'agenda' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('agenda')}
        >
          Agenda
        </button>
        <button
          className={activeTab === 'registroprontuarios' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('registroprontuarios')}
        >
          Registro de Prontuários
        </button>
        <button
          className={activeTab === 'receituarios' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('receituarios')}
        >
          Receituários
        </button>
        <button
          className={activeTab === 'perfil' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('perfil')}
        >
          Perfil
        </button>
      </div>

      <div className="doctor-tab-panel">
        {activeTab === 'agenda' && (
          <section className="doctor-schedule-panel">
            <h2>Consultas agendadas</h2>
            {loading ? (
              <div>Carregando sua agenda...</div>
            ) : schedules.length === 0 ? (
              <div>Você ainda não possui consultas agendadas.</div>
            ) : (
              <div className="schedule-table-wrapper">
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th>Pet</th>
                      <th>Cliente</th>
                      <th>Data / Horário</th>
                      <th>Status</th>
                      <th>Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((item) => (
                      <tr key={item.id}>
                        <td>{item.pet?.nome || '-'}</td>
                        <td>{item.client?.nome || '-'}</td>
                        <td>{new Date(item.date).toLocaleString('pt-BR')}</td>
                        <td>{item.status}</td>
                        <td>{item.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeTab === 'prontuarios' && (
          <section className="doctor-action-panel">
            <h2>Consultas Recentes</h2>
            {schedules.length === 0 ? (
              <div>Você ainda não possui consultas agendadas.</div>
            ) : (
              <div className="schedule-table-wrapper">
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th>Pet</th>
                      <th>Cliente</th>
                      <th>Data / Horário</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((item) => (
                      <tr key={item.id}>
                        <td>{item.pet?.nome || '-'}</td>
                        <td>{item.client?.nome || '-'}</td>
                        <td>{new Date(item.date).toLocaleString('pt-BR')}</td>
                        <td>{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeTab === 'registroprontuarios' && (
          <section className="doctor-action-panel">
            <h2>Registro de Prontuários</h2>

            <div className="record-list">
              <h3>Prontuários Salvos</h3>
              {recordsLoading ? (
                <div>Carregando prontuários...</div>
              ) : medicalRecords.length === 0 ? (
                <div>Nenhum prontuário encontrado.</div>
              ) : (
                <div className="schedule-table-wrapper">
                  <table className="schedule-table">
                    <thead>
                      <tr>
                        <th>Animal</th>
                        <th>Cliente</th>
                        <th>Diagnóstico</th>
                        <th>Medicamentos</th>
                        <th>Data</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicalRecords.map((rec) => (
                        <tr key={rec.id}>
                          <td>{rec.animal?.nome || rec.animal_nome || '-'}</td>
                          <td>{rec.owner?.nome || rec.owner_nome || '-'}</td>
                          <td>{rec.diagnostico}</td>
                          <td>{rec.medicamentos || '-'}</td>
                          <td>{new Date(rec.createdAt).toLocaleString('pt-BR')}</td>
                          <td className="record-actions">
                            <button className="btn-small" onClick={() => setEditingRecord(rec)}>Editar</button>
                            <button
                              className="btn-small btn-danger"
                              onClick={async () => {
                                if (!window.confirm('Tem certeza que deseja excluir este prontuário?')) return;
                                try {
                                  await deleteMedicalRecord(rec.id);
                                  await loadMedicalRecords();
                                } catch (err) {
                                  console.error('Erro ao excluir:', err);
                                  alert('Erro ao excluir prontuário.');
                                }
                              }}
                            >
                              Excluir
                            </button>
                          </td>
                          </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

              <div style={{ marginTop: 20 }}>
                <h3>{editingRecord ? 'Editar prontuário' : 'Registrar novo prontuário'}</h3>
                <MedicalRecordForm
                  schedules={schedules}
                  editingRecord={editingRecord}
                  onCancel={() => setEditingRecord(null)}
                  onSuccess={() => { setEditingRecord(null); loadSchedules(); loadMedicalRecords(); }}
                />
              </div>
          </section>
        )}

        {activeTab === 'receituarios' && (
          <section className="doctor-action-panel">
            <h2>Gerar Receituário</h2>
            <PrescriptionForm schedules={schedules} />
          </section>
        )}

        {activeTab === 'perfil' && (
          <section className="doctor-action-panel">
            <h2>Meu Perfil</h2>
            <EditableProfile />
          </section>
        )}
      </div>
    </div>
  );
};

export default DoctorSchedulePage;
