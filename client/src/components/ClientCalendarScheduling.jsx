import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import { format, isToday, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axios from '../services/api';
import {
  fetchAvailableVeterinariansForDate,
  validateTimeSlot,
} from '../services/availabilityService';
import { useSchedules } from '../contexts/ScheduleContext';
import ScheduleConfirmationModal from './ScheduleConfirmationModal';
import 'react-calendar/dist/Calendar.css';
import './CalendarScheduling.css';

const ClientCalendarScheduling = () => {
  const { createSchedule, getSchedulesByDate, isTimeSlotAvailable, loading: contextLoading } = useSchedules();

  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarValue, setCalendarValue] = useState(new Date());

  const [pets, setPets] = useState([]);
  const [veterinarians, setVeterinarians] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedVeterinarian, setSelectedVeterinarian] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Carregar pets do cliente
  useEffect(() => {
    loadClientPets();
  }, []);

  const loadClientPets = async () => {
    try {
      const response = await axios.get('/animals');
      setPets(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erro ao carregar pets:', err);
      setError('Erro ao carregar seus pets');
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

    setLoading(true);
    setError('');

    try {
      const isValid = isTimeSlotAvailable(selectedVeterinarian.id, selectedDate, selectedTime.time);

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

      const result = await createSchedule({
        petId: selectedPet.id,
        veterinarianId: selectedVeterinarian.id,
        date: appointmentDate.toISOString(),
        notes: '',
      });

      if (result.success) {
        setSuccess('Consulta agendada com sucesso!');
        setShowConfirmation(false);
        setSelectedDate(null);
        setCalendarValue(new Date());
        setSelectedPet(null);
        setSelectedVeterinarian(null);
        setSelectedTime(null);
        setAvailableSlots([]);

        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(result.error || 'Erro ao agendar consulta');
      }
    } catch (err) {
      console.error('Erro ao agendar consulta:', err);
      setError('Erro ao agendar consulta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="calendar-scheduling-container">
      <h2>📅 Agende Sua Consulta</h2>

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
                <label>🐾 Selecione o Pet</label>
                {pets.length === 0 ? (
                  <p className="text-muted">Você não tem animais cadastrados. Cadastre um pet para agendar.</p>
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
              </div>

              <div className="form-group">
                <label>👨‍⚕️ Selecione o Veterinário</label>
                {loading ? (
                  <p className="text-muted">Carregando veterinários disponíveis...</p>
                ) : veterinarians.length === 0 ? (
                  <p className="text-muted">Nenhum veterinário disponível nesta data.</p>
                ) : (
                  <select
                    value={selectedVeterinarian?.id || ''}
                    onChange={(e) => {
                      const vet = veterinarians.find((v) => v.id === Number(e.target.value));
                      if (vet) handleVeterinarianSelect(vet);
                    }}
                    className="form-select"
                  >
                    <option value="">-- Escolha um veterinário --</option>
                    {veterinarians.map((vet) => (
                      <option key={vet.id} value={vet.id}>
                        {vet.nome} ({vet.especialidade || 'Não informada'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label>⏰ Selecione o Horário</label>
                {!selectedVeterinarian ? (
                  <p className="text-muted">Selecione um veterinário primeiro para ver horários disponíveis.</p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-muted">Nenhum horário disponível para este veterinário.</p>
                ) : (
                  <select
                    value={selectedTime?.time || ''}
                    onChange={(e) => {
                      const slot = availableSlots.find((s) => s.time === e.target.value);
                      setSelectedTime(slot);
                    }}
                    className="form-select"
                  >
                    <option value="">-- Escolha um horário --</option>
                    {availableSlots.map((slot) => (
                      <option key={slot.time} value={slot.time}>
                        {slot.time}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-actions">
                <button
                  onClick={() => {
                    if (selectedPet && selectedVeterinarian && selectedTime) {
                      setShowConfirmation(true);
                    } else {
                      setError('Preencha todos os campos para confirmar o agendamento.');
                    }
                  }}
                  disabled={!selectedPet || !selectedVeterinarian || !selectedTime || loading || contextLoading}
                  className="btn btn-primary"
                >
                  {loading || contextLoading ? 'Agendando...' : 'Confirmar Agendamento'}
                </button>
              </div>
            </div>
          ) : (
            <div className="booking-form">
              <h3>Selecione uma data</h3>
              <p className="text-muted">Escolha uma data no calendário à esquerda para visualizar veterinários e horários disponíveis.</p>
            </div>
          )}
        </div>
      </div>

      {showConfirmation && (
        <ScheduleConfirmationModal
          selectedDate={selectedDate}
          selectedPet={selectedPet}
          selectedVeterinarian={selectedVeterinarian}
          selectedTime={selectedTime}
          onConfirm={handleConfirmSchedule}
          onCancel={() => setShowConfirmation(false)}
          loading={loading}
        />
      )}
    </div>
  );
};

export default ClientCalendarScheduling;
