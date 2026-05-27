import axios from './api';

/**
 * Busca todos os médicos disponíveis
 */
export async function fetchAllVeterinarians() {
  try {
    const response = await axios.get('/auth/users');
    if (!Array.isArray(response.data)) {
      console.warn('Resposta inesperada da API de usuários:', response.data);
      return [];
    }
    // Filtrar apenas médicos
    const vets = response.data.filter(user => user.tipoUsuario === 'medico' || user.role === 'medico');
    return Array.isArray(vets) ? vets : [];
  } catch (error) {
    console.error('Erro ao buscar veterinários:', error);
    throw error;
  }
}

/**
 * Busca agendamentos para uma data específica
 */
export async function fetchSchedulesForDate(date) {
  try {
    const dateString = date instanceof Date ? date.toISOString().split('T')[0] : date;
    const response = await axios.get('/schedules/date', {
      params: {
        date: dateString
      }
    });

    return Array.isArray(response.data)
      ? response.data.filter(schedule => schedule && schedule.status !== 'cancelled')
      : [];
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    throw error;
  }
}

/**
 * Busca veterinários disponíveis em uma data específica
 */
export async function fetchAvailableVeterinariansForDate(date) {
  try {
    const veterinarians = await fetchAllVeterinarians();
    const schedulesForDate = await fetchSchedulesForDate(date);
    
    // Agrupar agendamentos por veterinário
    const vetSchedules = {};
    schedulesForDate.forEach(schedule => {
      if (!vetSchedules[schedule.veterinarianId]) {
        vetSchedules[schedule.veterinarianId] = [];
      }
      vetSchedules[schedule.veterinarianId].push(schedule);
    });
    
    // Retornar veterinários com seus agendamentos
    return veterinarians.map(vet => ({
      ...vet,
      schedules: vetSchedules[vet.id] || [],
      availableSlots: getAvailableSlots(vetSchedules[vet.id] || [])
    }));
  } catch (error) {
    console.error('Erro ao buscar veterinários disponíveis:', error);
    throw error;
  }
}

/**
 * Calcula slots disponíveis de horário (09:00 às 18:00, intervalos de 30 min)
 */
function getAvailableSlots(schedules = []) {
  const slots = [];
  const startHour = 9;
  const endHour = 18;
  const slotDuration = 30; // minutos

  // Converter horários de agendamentos para número para comparação
  const bookedTimes = schedules.map(s => {
    const date = new Date(s.date);
    return date.getHours() * 60 + date.getMinutes();
  });

  // Gerar todos os slots disponíveis
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const timeInMinutes = hour * 60 + minute;
      
      // Verificar se o slot está ocupado
      const isBooked = bookedTimes.some(
        bookedTime => bookedTime === timeInMinutes || 
        (bookedTime > timeInMinutes && bookedTime < timeInMinutes + slotDuration)
      );
      
      if (!isBooked) {
        slots.push({
          time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
          timeInMinutes: timeInMinutes
        });
      }
    }
  }

  return slots;
}

/**
 * Busca dias com disponibilidade no mês
 */
export async function fetchAvailableDaysForMonth(year, month) {
  try {
    const veterinarians = await fetchAllVeterinarians();
    
    // Se não há veterinários, retorna array vazio
    if (veterinarians.length === 0) {
      return [];
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const availableDays = [];

    // Verificar cada dia do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      
      // Excluir domingos (0) e segundas (1) - dias fechados
      if (dayOfWeek === 0 || dayOfWeek === 1) {
        continue;
      }

      const dateString = date.toISOString().split('T')[0];
      const schedules = await fetchSchedulesForDate(date);
      
      // Verificar se há slots disponíveis considerando os agendamentos
      const hasAvailableSlots = schedules.length < veterinarians.length * 8; // 8 slots por veterinário (9-18)
      
      if (hasAvailableSlots) {
        availableDays.push(day);
      }
    }

    return availableDays;
  } catch (error) {
    console.error('Erro ao buscar dias disponíveis:', error);
    throw error;
  }
}

/**
 * Valida se há conflito de horário
 */
export async function validateTimeSlot(veterinarianId, date, time) {
  try {
    const schedules = await fetchSchedulesForDate(date);
    const [hours, minutes] = time.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;

    const hasConflict = schedules.some(schedule => {
      if (schedule.veterinarianId !== veterinarianId) return false;
      
      const scheduleTime = new Date(schedule.date);
      const scheduleTimeInMinutes = scheduleTime.getHours() * 60 + scheduleTime.getMinutes();
      
      return Math.abs(scheduleTimeInMinutes - timeInMinutes) < 30;
    });

    return !hasConflict;
  } catch (error) {
    console.error('Erro ao validar slot de horário:', error);
    throw error;
  }
}
