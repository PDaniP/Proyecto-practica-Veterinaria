import api from "../../config/api.js";

export const obtenerDetalleConsulta = async (idConsulta) => {
  const { data } = await api.get(`mascotas/historia/consulta/${idConsulta}`);
  const insumos =
    typeof data.insumos === "string"
      ? JSON.parse(data.insumos)
      : data.insumos ?? [];

  if (!Array.isArray(insumos)) {
    throw new Error("La respuesta de insumos no tiene el formato esperado.");
  }

  return { ...data, insumos };
};
