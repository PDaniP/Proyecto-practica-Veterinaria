import api from "../../config/api.js";

export const listarEstudios = async (idConsulta) => {
  const { data } = await api.get(`estudios/consulta/${idConsulta}`, {
    withCredentials: true,
  });
  if (!Array.isArray(data.estudios)) {
    throw new Error("La respuesta de estudios no tiene el formato esperado.");
  }
  return data.estudios;
};

export const subirEstudio = async (idConsulta, archivo) => {
  const formulario = new FormData();
  formulario.append("archivo", archivo);
  const { data } = await api.post(
    `estudios/consulta/${idConsulta}`,
    formulario,
    {
      withCredentials: true,
    },
  );
  return data;
};

export const obtenerArchivoEstudio = async (idEstudio, descargar = false) => {
  const { data } = await api.get(
    `estudios/archivo/${idEstudio}${descargar ? "?descargar=1" : ""}`,
    {
      withCredentials: true,
      responseType: "blob",
    },
  );
  return data;
};
