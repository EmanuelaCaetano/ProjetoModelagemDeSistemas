import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Agenda.css';

const Agenda = () => {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        const params = new URLSearchParams({ data: selectedDate });
        if (user && user.id) {
          params.append('medicoId', user.id.toString());
        }
        const response = await api.get(`/agendamentos?${params.toString()}`);
        setAgendamentos(response.data);
      } catch (err) {
        setError('Erro ao carregar agendamentos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgendamentos();
  }, [selectedDate, user]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const getAgendamentoForTime = (time) => {
    return agendamentos.find(agendamento => agendamento.horario.split(' ')[1] === time);
  };

  if (loading) {
    return <div className="loading">Carregando agenda...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const timeSlots = generateTimeSlots();

  return (
    <div className="agenda-container">
      <h1>Agenda</h1>
      <div className="date-selector">
        <label htmlFor="date">Selecione a data: </label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={handleDateChange}
        />
      </div>
      <div className="agenda-grid">
        {timeSlots.map((time) => {
          const agendamento = getAgendamentoForTime(time);
          return (
            <div key={time} className={`time-slot ${agendamento ? 'occupied' : 'free'}`}>
              <div className="time">{time}</div>
              {agendamento && (
                <div className="appointment">
                  <div className="cliente">{agendamento.clienteNome}</div>
                  <div className="detalhes">{agendamento.descricao}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Agenda;