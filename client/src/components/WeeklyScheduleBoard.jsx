import React, { useMemo, useState } from 'react';
import './WeeklyScheduleBoard.css';

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16];

function formatTime(hour) {
  return `${String(hour).padStart(2, '0')}:00`;
}

function formatDayLabel(date) {
  return `${date.toLocaleDateString('pt-BR', { weekday: 'long' }).replace(/^./, (c) => c.toUpperCase())} - ${date.toLocaleDateString('pt-BR')}`;
}

function buildWeekDays() {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(date);
  }
  return days;
}

export const WeeklyScheduleBoard = ({ schedules = [], title = 'Agenda Semanal' }) => {
  const [selectedDate, setSelectedDate] = useState(buildWeekDays()[0]);

  const scheduleMap = useMemo(() => {
    const map = {};
    schedules.forEach((item) => {
      const date = new Date(item.date);
      const dayKey = date.toLocaleDateString('pt-BR');
      const timeKey = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      map[dayKey] = map[dayKey] || {};
      map[dayKey][timeKey] = item;
    });
    return map;
  }, [schedules]);

  const weekDays = buildWeekDays();
  const selectedDayKey = selectedDate.toLocaleDateString('pt-BR');

  return (
    <div className="weekly-schedule-board">
      <div className="weekly-schedule-header">
        <h2>{title}</h2>
        <p>Veja a semana inteira e clique em um dia para consultar horários disponíveis.</p>
      </div>

      <div className="weekly-schedule-grid">
        {weekDays.map((day) => {
          const dayKey = day.toLocaleDateString('pt-BR');
          return (
            <button
              key={dayKey}
              type="button"
              className={`day-card ${dayKey === selectedDayKey ? 'day-card-selected' : ''}`}
              onClick={() => setSelectedDate(day)}
            >
              <div className="day-card-title">{formatDayLabel(day)}</div>
              <div className="day-card-slots">
                {HOURS.map((hour) => {
                  const time = formatTime(hour);
                  const isBooked = scheduleMap[dayKey]?.[time];
                  return (
                    <span key={time} className={`day-slot ${isBooked ? 'day-slot-booked' : 'day-slot-free'}`}>
                      {time}
                    </span>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      <div className="selected-day-summary">
        <h3>Horários para {formatDayLabel(selectedDate)}</h3>
        <div className="selected-day-grid">
          {HOURS.map((hour) => {
            const time = formatTime(hour);
            const appointment = scheduleMap[selectedDayKey]?.[time];
            return (
              <div key={time} className="selected-slot-row">
                <div className="selected-slot-time">{time}</div>
                <div className={`selected-slot-status ${appointment ? 'booked' : 'available'}`}>
                  {appointment ? `Ocupado (${appointment.pet?.nome || 'consulta'})` : 'Disponível'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
