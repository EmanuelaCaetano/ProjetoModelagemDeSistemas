import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const scheduleSchema = z.object({
  petId: z.string().min(1, 'Pet é obrigatório.'),
  veterinarianId: z.string().min(1, 'Médico é obrigatório.'),
  date: z.string().min(1, 'Data e horário são obrigatórios.'),
  notes: z.string().optional(),
});

const defaultValues = {
  petId: '',
  veterinarianId: '',
  date: '',
  notes: '',
};

const ScheduleForm = ({ clients, pets, veterinarians, schedule, onSubmit, onClose }) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(scheduleSchema),
    defaultValues,
  });

  useEffect(() => {
    reset({
      petId: schedule?.petId?.toString() ?? '',
      veterinarianId: schedule?.veterinarianId?.toString() ?? '',
      date: schedule ? schedule.date.slice(0, 16) : '',
      notes: schedule?.notes ?? '',
    });
  }, [schedule, reset]);

  const selectedPetId = useWatch({ control, name: 'petId' });
  const selectedPet = pets.find((pet) => pet.id.toString() === selectedPetId);
  const selectedClient = selectedPet ? clients.find((client) => client.id === selectedPet.clienteId) : null;

  return (
    <div className="schedule-modal-overlay">
      <div className="schedule-modal">
        <div className="schedule-modal-header">
          <h2>{schedule ? 'Editar Consulta' : 'Nova Consulta'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit((data) => onSubmit(data))}>
          <div className="form-row">
            <label>Pet</label>
            <select {...register('petId')}>
              <option value="">Selecione um pet</option>
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.nome} ({pet.especie})
                </option>
              ))}
            </select>
            {errors.petId && <span className="field-error">{errors.petId.message}</span>}
          </div>

          {selectedPet && selectedClient && (
            <div className="form-row">
              <label>Cliente</label>
              <input type="text" value={selectedClient.nome} readOnly />
            </div>
          )}

          <div className="form-row">
            <label>Médico Veterinário</label>
            <select {...register('veterinarianId')}>
              <option value="">Selecione um médico</option>
              {veterinarians.map((vet) => (
                <option key={vet.id} value={vet.id}>
                  Dr. {vet.nome} {vet.especialidade ? `(${vet.especialidade})` : ''}
                </option>
              ))}
            </select>
            {errors.veterinarianId && <span className="field-error">{errors.veterinarianId.message}</span>}
          </div>

          <div className="form-row">
            <label>Data e horário</label>
            <input type="datetime-local" {...register('date')} />
            {errors.date && <span className="field-error">{errors.date.message}</span>}
          </div>

          <div className="form-row">
            <label>Observações</label>
            <textarea {...register('notes')} rows="3" />
          </div>

          <div className="actions-row">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {schedule ? 'Salvar alteração' : 'Agendar consulta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleForm;
