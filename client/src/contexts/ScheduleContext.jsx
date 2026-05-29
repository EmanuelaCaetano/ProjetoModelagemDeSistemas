import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchAllSchedules, fetchMySchedules, bookSchedule, cancelSchedule } from '../services/scheduleService';
import { useAuth } from './AuthContext';

const ScheduleContext = createContext();

export const useSchedules = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedules deve ser usado dentro de um ScheduleProvider');
  }
  return context;
};

export const ScheduleProvider = ({ children }) => {
  const { user } = useAuth();
  const [allSchedules, setAllSchedules] = useState([]);
  const [mySchedules, setMySchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);

  // Sincronização automática a cada 10 segundos
  const SYNC_INTERVAL = 10000;

  // Carregar todos os agendamentos
  const loadAllSchedules = useCallback(async () => {
    try {
      const response = await fetchAllSchedules();
      setAllSchedules(Array.isArray(response) ? response : []);
      setLastUpdate(new Date());
      setError('');
    } catch (err) {
      console.error('Erro ao carregar todos os agendamentos:', err);
      setError('Erro ao sincronizar agendamentos');
    }
  }, []);

  // Carregar agendamentos do cliente atual
  const loadMySchedules = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetchMySchedules();
      setMySchedules(Array.isArray(response) ? response : []);
      setLastUpdate(new Date());
      setError('');
    } catch (err) {
      console.error('Erro ao carregar meus agendamentos:', err);
      setError('Erro ao carregar seus agendamentos');
    }
  }, [user]);

  // Sincronizar dados dependendo do tipo de usuário
  const syncSchedules = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (user.tipoUsuario === 'cliente') {
        await loadMySchedules();
      } else if (user.tipoUsuario === 'secretario' || user.tipoUsuario === 'administrador') {
        await loadAllSchedules();
      }
    } catch (err) {
      console.error('Erro ao sincronizar agendamentos:', err);
    } finally {
      setLoading(false);
    }
  }, [user, loadAllSchedules, loadMySchedules]);

  // Carregar dados iniciais quando usuário fizer login
  useEffect(() => {
    if (user) {
      syncSchedules();
    }
  }, [user, syncSchedules]);

  // Auto-sincronização periódica
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      syncSchedules();
    }, SYNC_INTERVAL);

    return () => clearInterval(interval);
  }, [user, syncSchedules]);

  // Função para agendar consulta
  const createSchedule = useCallback(async (scheduleData) => {
    setLoading(true);
    try {
      const response = await bookSchedule(scheduleData);
      // Sincronizar dados após criar agendamento
      await syncSchedules();
      return { success: true, data: response };
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Erro ao agendar consulta';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [syncSchedules]);

  // Função para cancelar agendamento
  const removeSchedule = useCallback(async (scheduleId) => {
    setLoading(true);
    try {
      await cancelSchedule(scheduleId);
      // Sincronizar dados após cancelar agendamento
      await syncSchedules();
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Erro ao cancelar agendamento';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [syncSchedules]);

  // Obter agendamentos a visualizar baseado no tipo de usuário
  const getSchedulesToDisplay = useCallback(() => {
    if (!user) return [];

    if (user.tipoUsuario === 'cliente') {
      return mySchedules;
    } else if (user.tipoUsuario === 'secretario' || user.tipoUsuario === 'administrador') {
      return allSchedules;
    }

    return [];
  }, [user, mySchedules, allSchedules]);

  // Obter agendamentos de um cliente específico
  const getSchedulesByClient = useCallback((clientId) => {
    return allSchedules.filter((schedule) => schedule.client?.id === clientId);
  }, [allSchedules]);

  // Obter agendamentos de um veterinário específico
  const getSchedulesByVeterinarian = useCallback((veterinarianId) => {
    return allSchedules.filter((schedule) => schedule.veterinarian?.id === veterinarianId);
  }, [allSchedules]);

  // Obter agendamentos em uma data específica
  const getSchedulesByDate = useCallback((date) => {
    const dateStr = new Date(date).toDateString();
    return allSchedules.filter((schedule) => {
      return new Date(schedule.date).toDateString() === dateStr;
    });
  }, [allSchedules]);

  // Verificar se um horário está disponível
  const isTimeSlotAvailable = useCallback((veterinarianId, date, time) => {
    const dateTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    dateTime.setHours(hours, minutes, 0, 0);

    return !allSchedules.some(
      (schedule) =>
        schedule.veterinarian?.id === veterinarianId &&
        new Date(schedule.date).getTime() === dateTime.getTime() &&
        schedule.status !== 'cancelled'
    );
  }, [allSchedules]);

  const value = {
    allSchedules,
    mySchedules,
    loading,
    error,
    lastUpdate,
    syncSchedules,
    createSchedule,
    removeSchedule,
    getSchedulesToDisplay,
    getSchedulesByClient,
    getSchedulesByVeterinarian,
    getSchedulesByDate,
    isTimeSlotAvailable,
  };

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
};
