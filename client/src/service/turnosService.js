import api from '../../config/api.js'

const API_URL = 'turnos';

export const asignarTurno = async (turno) => {
  const response = await api.post(`${API_URL}/asignar`, turno, {
    withCredentials: true,
  });
  return response.data;
};

export const modificarTurno = async (id, turno) => {
  const response = await api.patch(`${API_URL}/modificar/${id}`, turno, {
    withCredentials: true,
  });
  return response.data;
};

export const cancelarTurno = async (id) => {
  const response = await api.patch(
    `${API_URL}/cancelar/${id}`,
    {},
    { withCredentials: true },
  );
  return response.data;
};

export const completarTurno = async (id) => {
  const response = await api.patch(
    `${API_URL}/completar/${id}`,
    {},
    { withCredentials: true },
  );
  return response.data;
};

export const obtenerTurnosPorFecha = async (fecha) => {
  const response = await api.get(
    `${API_URL}/fecha`, {
    params: { fecha },
    withCredentials: true,
  });

  return response.data.turnos ?? [];
};

export const obtenerHorarioAtencion = async () => {
  const response = await api.get(`${API_URL}/horario`, {
    withCredentials: true,
  });
  return response.data.horario;
};

export const actualizarHorarioAtencion = async (horario) => {
  const response = await api.put(`${API_URL}/horario`, horario, {
    withCredentials: true,
  });
  return response.data.horario;
};
