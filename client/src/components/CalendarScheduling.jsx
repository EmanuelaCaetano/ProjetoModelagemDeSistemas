import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format, isToday, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import axios from '../services/api';
import {
  fetchAllVeterinarians,
  fetchAvailableVeterinariansForDate,
  validateTimeSlot
} from '../services/availabilityService';
import { bookSchedule } from '../services/scheduleService';
import ScheduleConfirmationModal from './ScheduleConfirmationModal';
import 'react-calendar/dist/Calendar.css';
import './CalendarScheduling.css';

const CalendarScheduling = () => {
  const { user } = useAuth();
  
  // Estados do calendário
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarValue, setCalendarValue] = useState(new Date());
  
  // Estados dos dados
  const [pets, setPets] = useState([]);
  const [veterinarians, setVeterinarians] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  
  // Estados da seleção
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedVeterinarian, setSelectedVeterinarian] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  
  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [success, setSuccess] = useState('');

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError('');
    try {
      // Buscar pets do usuário
      try {
        const petsResponse = await axios.get(`/pets`);
        const petsData = Array.isArray(petsResponse.data)
          ? petsResponse.data
          : Array.isArray(petsResponse.data?.pets)
            ? petsResponse.data.pets
            : [];
        setPets(petsData);
      } catch (petErr) {
        console.error('Erro ao carregar pets:', petErr);
        setPets([]);
      }

      // Buscar agendamentos futuros
      try {
        const schedulesResponse = await axios.get('/schedules/my');
        const upcomingAppointments = Array.isArray(schedulesResponse.data)
          ? schedulesResponse.data.filter(
              schedule => schedule && new Date(schedule.date) >= startOfDay(new Date()) &&
              schedule.status !== 'cancelled'
            )
          : [];
        setUpcomingSchedules(upcomingAppointments);
      } catch (schedErr) {
        console.error('Erro ao carregar agendamentos:', schedErr);
        setUpcomingSchedules([]);
      }

      // Buscar veterinários
      try {
        const vets = await fetchAllVeterinarians();
        setVeterinarians(Array.isArray(vets) ? vets : []);
      } catch (vetErr) {
        console.error('Erro ao carregar veterinários:', vetErr);
        setVeterinarians([]);
      }

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar informações. Tente novamente ou atualize a página.');
    } finally {
      setLoading(false);
    }
  };

  // Manipulador de seleção de data
  const handleDateChange = async (date) => {
    if (!date || !isTileDayAvailable(date)) {
      setError('Por favor, selecione uma data válida disponível.');
      return;
    }

    setSelectedDate(date);
    setCalendarValue(date);
    setSelectedVeterinarian(null);
    setSelectedTime(null);
    setAvailableSlots([]);
    setError('');
    
    setLoading(true);
    try {
      const availableVets = await fetchAvailableVeterinariansForDate(date);
      setVeterinarians(Array.isArray(availableVets) ? availableVets : []);
      if (!availableVets || availableVets.length === 0) {
        setError('Nenhum veterinário disponível neste dia. Tente outro dia.');
      }
    } catch (err) {
      console.error('Erro ao buscar veterinários disponíveis:', err);
      setError('Erro ao buscar disponibilidade. Tente outro dia.');
      setVeterinarians([]);
    } finally {
      setLoading(false);
    }
  };

  // Manipulador de seleção de veterinário
  const handleVeterinarianSelect = (vet) => {
    setSelectedVeterinarian(vet);
    setSelectedTime(null);
    setAvailableSlots(vet.availableSlots || []);
  };

  // Função para verificar se um dia é disponível
  const isTileDayAvailable = (date) => {
    const today = startOfDay(new Date());
    
    // Não permitir datas passadas
    if (isBefore(date, today)) {
      return false;
    }

    // Não permitir domingos
    if (date.getDay() === 0) {
      return false;
    }

    return true;
  };

  // Função para adicionar classe CSS aos dias no calendário
  const tileClassName = ({ date }) => {
    const classes = [];

    if (!isTileDayAvailable(date)) {
      classes.push('unavailable-day');
    } else if (isToday(date)) {
      classes.push('today');
    } else {
      classes.push('available-day');
    }

    return classes.join(' ');
  };

  // Manipulador de confirmação de agendamento
  const handleConfirmSchedule = async () => {
    if (!selectedDate || !selectedPet || !selectedVeterinarian || !selectedTime) {
      setError('❌ Por favor, selecione todos os dados antes de confirmar.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Validar slot de horário
      const isValid = await validateTimeSlot(
        selectedVeterinarian.id,
        selectedDate,
        selectedTime
      );

      if (!isValid) {
        setError('⚠️ Este horário não está mais disponível. Escolha outro.');
        setLoading(false);
        return;
      }

      // Criar data e hora combinadas
      const [hours, minutes] = selectedTime.time.split(':').map(Number);
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(hours, minutes, 0, 0);

      // Validar que a data está no futuro
      if (appointmentDate <= new Date()) {
        setError('❌ A data/hora selecionada já passou.');
        setLoading(false);
        return;
      }

      // Enviar agendamento
      await bookSchedule({
        clientId: user.id,
        petId: selectedPet.id,
        veterinarianId: selectedVeterinarian.id,
        date: appointmentDate.toISOString(),
        notes: ''
      });

      setSuccess('✅ Consulta agendada com sucesso! 🎉');
      setShowConfirmation(false);

      // Limpar formulário
      setSelectedDate(null);
      setCalendarValue(new Date());
      setSelectedPet(null);
      setSelectedVeterinarian(null);
      setSelectedTime(null);
      setAvailableSlots([]);

      // Recarregar dados
      setTimeout(() => {
        loadInitialData();
        setSuccess('');
      }, 2000);

    } catch (err) {
      console.error('Erro ao agendar consulta:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Erro ao agendar consulta';
      setError(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Manipulador de cancelamento de consulta
  const handleCancelSchedule = async (scheduleId) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta consulta?')) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`/schedules/${scheduleId}`);
      setSuccess('✅ Consulta cancelada com sucesso.');
      setError('');
      setTimeout(() => {
        loadInitialData();
        setSuccess('');
      }, 1500);
    } catch (err) {
      console.error('Erro ao cancelar consulta:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Erro ao cancelar consulta';
      setError(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="calendar-scheduling-container">
      <h2>📅 Agendar Consulta Veterinária</h2>

      {/* Mensagens de feedback */}
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="scheduling-layout">
        {/* Coluna esquerda - Calendário */}
        <div className="calendar-section">
          <h3>Selecione uma data</h3>
          <Calendar
            value={calendarValue}
            onChange={handleDateChange}
            tileClassName={tileClassName}
            tileDisabled={({ date }) => !isTileDayAvailable(date)}
            minDate={new Date()}
          />
          <div className="calendar-legend">
            <div className="legend-item">
              <span className="legend-color available"></span>
              Disponível
            </div>
            <div className="legend-item">
              <span className="legend-color unavailable"></span>
              Indisponível
            </div>
            <div className="legend-item">
              <span className="legend-color today"></span>
              Hoje
            </div>
          </div>
        </div>

        {/* Coluna direita - Detalhes do agendamento */}
        <div className="details-section">
          {selectedDate ? (
            <div className="booking-form">
              <h3>Detalhes da Consulta</h3>
              <p className="selected-date">
                📆 {format(selectedDate, 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
              </p>

              {/* Seleção de Pet */}
              <div className="form-group">
                <label>🐾 Selecione o Pet</label>
                {pets.length === 0 ? (
                  <p className="text-muted">Nenhum pet cadastrado. <a href="/dashboard?tab=pets">Cadastre um pet</a></p>
                ) : (
                  <select
                    value={selectedPet?.id || ''}
                    onChange={(e) => setSelectedPet(pets.find(p => p.id === parseInt(e.target.value)))}
                    className="form-select"
                  >
                    <option value="">-- Escolha um pet --</option>
                    {pets.map(pet => (
                      <option key={pet.id} value={pet.id}>
                        {pet.nome} ({pet.especie})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Seleção de Veterinário */}
              <div className="form-group">
                <label>👨‍⚕️ Selecione o Veterinário</label>
                {loading ? (
                  <p className="text-muted">Carregando veterinários disponíveis...</p>
                ) : veterinarians.length === 0 ? (
                  <p className="text-muted">Nenhum veterinário disponível neste dia.</p>
                ) : (
                  <div className="veterinarians-list">
                    {veterinarians.map(vet => (
                      <div
                        key={vet.id}
                        className={`vet-card ${selectedVeterinarian?.id === vet.id ? 'selected' : ''}`}
                        onClick={() => handleVeterinarianSelect(vet)}
                      >
                        <div className="vet-name">{vet.nome}</div>
                        {vet.especialidade && (
                          <div className="vet-specialty">{vet.especialidade}</div>
                        )}
                        <div className="vet-availability">
                          {vet.availableSlots?.length || 0} horários
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Seleção de Horário */}
              {selectedVeterinarian && (
                <div className="form-group">
                  <label>⏰ Selecione o Horário</label>
                  {availableSlots.length > 0 ? (
                    <div className="time-slots-grid">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          className={`time-slot ${selectedTime?.time === slot.time ? 'selected' : ''}`}
                          onClick={() => setSelectedTime(slot)}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">Nenhum horário disponível para este veterinário nesta data.</p>
                  )}
                </div>
              )}

              {/* Botão de Confirmação */}
              <div className="form-actions">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => setShowConfirmation(true)}
                  disabled={!selectedPet || !selectedVeterinarian || !selectedTime}
                >
                  ✓ Confirmar Agendamento
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedDate(null);
                    setSelectedPet(null);
                    setSelectedVeterinarian(null);
                    setSelectedTime(null);
                    setAvailableSlots([]);
                  }}
                >
                  Limpar
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>👈 Selecione uma data no calendário para começar</p>
            </div>
          )}
        </div>
      </div>

      {/* Próximas Consultas */}
      <div className="upcoming-schedules-section">
        <h3>📋 Suas Próximas Consultas</h3>
        {upcomingSchedules.length === 0 ? (
          <p className="text-muted">Nenhuma consulta agendada.</p>
        ) : (
          <div className="schedules-grid">
            {upcomingSchedules.map((schedule) => (
              <div key={schedule.id} className="schedule-card">
                <div className="schedule-date">
                  {format(new Date(schedule.date), 'dd/MM/yyyy HH:mm')}
                </div>
                <div className="schedule-pet">
                  🐾 {schedule.pet?.nome || 'Pet'}
                </div>
                <div className="schedule-vet">
                  👨‍⚕️ {schedule.veterinarian?.nome || schedule.vet_nome || 'Veterinário'}
                </div>
                <div className="schedule-actions">
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleCancelSchedule(schedule.id)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Confirmação */}
      {showConfirmation && (
        <ScheduleConfirmationModal
          selectedDate={selectedDate}
          selectedPet={selectedPet}
          selectedVeterinarian={selectedVeterinarian}
          selectedTime={selectedTime}
          onConfirm={handleConfirmSchedule}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
};

export default CalendarScheduling;
