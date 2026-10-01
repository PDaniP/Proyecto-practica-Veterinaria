// Funciones auxiliares para los formularios de vacuna y consulta

export const hoy = () => new Date().toISOString().slice(0, 10);

export const vacunaVacia = () => ({
  id_lote: "",
  nombre_vacuna: "",
  fecha_aplicacion: hoy(),
  proxima_dosis: "",
  observaciones_vacuna: "",
});

// Limpia los datos de vacuna antes de enviarlos al backend
export const prepararVacuna = (vacuna) => ({
  id_lote: vacuna.id_lote ? Number(vacuna.id_lote) : null,
  nombre_vacuna: vacuna.nombre_vacuna.trim(),
  fecha_aplicacion: vacuna.fecha_aplicacion,
  proxima_dosis: vacuna.proxima_dosis || null,
  observaciones_vacuna: vacuna.observaciones_vacuna.trim() || null,
});

// Devuelve un mensaje de error si faltan datos, o "" si está todo bien
export const validarVacuna = (vacuna) => {
  if (!vacuna.nombre_vacuna.trim()) return "Ingrese el nombre de la vacuna.";
  if (!vacuna.fecha_aplicacion) return "Ingrese la fecha de aplicación.";
  if (vacuna.proxima_dosis && vacuna.proxima_dosis < vacuna.fecha_aplicacion) {
    return "La próxima dosis no puede ser anterior a la fecha de aplicación.";
  }
  return "";
};
