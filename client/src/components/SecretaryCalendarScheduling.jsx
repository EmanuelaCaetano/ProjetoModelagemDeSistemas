import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import { format, isToday, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axios from '../services/api';
import {
  fetchAllVeterinarians,
  fetchAvailableVeterinariansForDate,
  validateTimeSlot,
} from '../services/availabilityService';
import { bookSchedule, fetchAllSchedules } from '../services/scheduleService';
import ScheduleConfirmationModal from './ScheduleConfirmationModal';
import 'react-calendar/dist/Calendar.css';
import './CalendarScheduling.css';

const SecretaryCalendarScheduling = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarValue, setCalendarValue] = useState(new Date());

  const [clients, setClients] = useState([]);
  const [pets, setPets] = useState([]);
  const [veterinarians, setVeterinarians] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);

  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedVeterinarian, setSelectedVeterinarian] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError('');

    try {
      const [usersResponse, animalsResponse, schedulesResponse] = await Promise.all([
        axios.get('/auth/users'),
        axios.get('/animals'),
        fetchAllSchedules(),
      ]);

      const users = Array.isArray(usersResponse.data) ? usersResponse.data : [];
      const clientsList = users.filter((user) => user.tipoUsuario === 'cliente');
      const veterinariansList = users.filter((user) => user.tipoUsuario === 'medico' || user.role === 'medico');

      setClients(clientsList);
      setPets(Array.isArray(animalsResponse.data) ? animalsResponse.data : []);
      setVeterinarians(veterinariansList);

      const upcomingAppointments = Array.isArray(schedulesResponse)
        ? schedulesResponse.filter(
            (schedule) =>
              schedule &&
              new Date(schedule.date) >= startOfDay(new Date()) &&
              schedule.status !== 'cancelled'
          )
        : [];
      setUpcomingSchedules(upcomingAppointments);
    } catch (err) {
      console.error('Erro ao carregar dados da agenda da secretaria:', err);
      setError('Erro ao carregar os dados de agendamento. Atualize a página e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = async (date) => {
    if (!isTileDayAvailable(date)) {
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
      setError('Erro ao buscar disponibilidade. Tente novamente.');
      setVeterinarians([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVeterinarianSelect = (vet) => {
    setSelectedVeterinarian(vet);
    setSelectedTime(null);
    setAvailableSlots(vet.availableSlots || []);
  };

  const isTileDayAvailable = (date) => {
    const today = startOfDay(new Date());

    if (isBefore(date, today)) {
      return false;
    }

    if (date.getDay() === 0) {
      return false;
    }

    return true;
  };

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

  const handleConfirmSchedule = async () => {
    if (!selectedDate || !selectedPet || !selectedVeterinarian || !selectedTime) {
      setError('Por favor, selecione pet, médico, data e horário antes de confirmar.');
      return;
    }

    if (!selectedPet.clienteId) {
      setError('Não foi possível identificar o cliente do animal selecionado.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const isValid = await validateTimeSlot(
        selectedVeterinarian.id,
        selectedDate,
        selectedTime.time
      );

      if (!isValid) {
        setError('Este horário não está mais disponível. Escolha outro horário.');
        setLoading(false);
        return;
      }

      const [hours, minutes] = selectedTime.time.split(':').map(Number);
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(hours, minutes, 0, 0);

      if (appointmentDate <= new Date()) {
        setError('A data e horário selecionados já passaram.');
        setLoading(false);
        return;
      }

      await bookSchedule({
        clientId: selectedPet.clienteId,
        petId: selectedPet.id,
        veterinarianId: selectedVeterinarian.id,
        date: appointmentDate.toISOString(),
        notes: '',
      });

      setSuccess('Consulta agendada com sucesso.');
      setShowConfirmation(false);
      setSelectedDate(null);
      setCalendarValue(new Date());
      setSelectedPet(null);
      setSelectedVeterinarian(null);
      setSelectedTime(null);
      setAvailableSlots([]);

      setTimeout(() => {
        loadInitialData();
        setSuccess('');
      }, 1000);
    } catch (err) {
      console.error('Erro ao agendar consulta:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Erro ao agendar consulta.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSchedule = async (scheduleId) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta consulta?')) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`/schedules/${scheduleId}`);
      setSuccess('Consulta cancelada com sucesso.');
      setError('');
      setTimeout(() => {
        loadInitialData();
        setSuccess('');
      }, 1000);
    } catch (err) {
      console.error('Erro ao cancelar consulta:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Erro ao cancelar consulta.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="calendar-scheduling-container">
      <h2>📅 Agenda da Secretaria</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="scheduling-layout">
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

        <div className="details-section">
          {selectedDate ? (
            <div className="booking-form">
              <h3>Detalhes da Consulta</h3>
              <p className="selected-date">
                📆 {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>

              <div className="form-group">
                <label>� Selecione o Pet</label>
                {pets.length === 0 ? (
                  <p className="text-muted">Nenhum animal cadastrado. Cadastre pets antes de agendar.</p>
                ) : (
                  <select
                    value={selectedPet?.id || ''}
                    onChange={(e) => setSelectedPet(pets.find((pet) => pet.id === Number(e.target.value)))}
                    className="form-select"
                  >
                    <option value="">-- Escolha um pet --</option>
                    {pets.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.nome} ({pet.especie})
                      </option>
                    ))}
                  </select>
                )}
                {selectedPet && (
                  <p className="text-muted">
                    Cliente: {clients.find((client) => client.id === selectedPet.clienteId)?.nome || 'Automático'}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>👨‍⚕️ Selecione o Veterinário</label>
                {loading ? (
                  <p className="text-muted">Carregando veterinários disponíveis...</p>
                ) : veterinarians.length === 0 ? (
                  <p className="text-muted">Nenhum veterinário disponível nesta data.</p>
                ) : (
                  <div className="veterinarians-list">
                    {veterinarians.map((vet) => (
                      <div
                        key={vet.id}
                        className={`vet-card ${selectedVeterinarian?.id === vet.id ? 'selected' : ''}`}
                        onClick={() => handleVeterinarianSelect(vet)}
                      >
                        <div className="vet-name">{vet.nome}</div>
                        {vet.especialidade && <div className="vet-specialty">{vet.especialidade}</div>}
                        <div className="vet-availability">
                          {vet.availableSlots?.length || 0} horários
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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

              <div className="form-actions">
                <button
                  className="btn btn-primary btn-lg"
                  type="button"
                  onClick={() => setShowConfirmation(true)}
                  disabled={!selectedClient || !selectedPet || !selectedVeterinarian || !selectedTime}
                >
                  ✓ Confirmar Agendamento
                </button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => {
                    setSelectedDate(null);
                    setCalendarValue(new Date());
                    setSelectedClient(null);
                    setSelectedPet(null);
                    setSelectedVeterinarian(null);
                    setSelectedTime(null);
                    setAvailableSlots([]);
                    setFilteredPets([]);
                  }}
                >
                  Limpar
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>👈 Selecione uma data no calendário para começar.</p>
            </div>
          )}
        </div>
      </div>

      <div className="upcoming-schedules-section">
        <h3>📋 Próximas Consultas</h3>
        {upcomingSchedules.length === 0 ? (
          <p className="text-muted">Nenhuma consulta agendada.</p>
        ) : (
          <div className="schedules-grid">
            {upcomingSchedules.map((schedule) => (
              <div key={schedule.id} className="schedule-card">
                <div className="schedule-date">
                  {format(new Date(schedule.date), 'dd/MM/yyyy HH:mm')}
                </div>
                <div className="schedule-pet">🐾 {schedule.pet?.nome || 'Pet'}</div>
                <div className="schedule-vet">👨‍⚕️ {schedule.veterinarian?.nome || 'Veterinário'}</div>
                <div className="schedule-client">👤 {schedule.client?.nome || 'Cliente'}</div>
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

export default SecretaryCalendarScheduling;
