import { useEffect, useState } from "react";
import axios from "axios";
import "./FormulariosClinicos.css";

const formatearFecha = (fecha) => {
  if (!fecha) return "-";
  const [anio, mes, dia] = String(fecha).split("T")[0].split("-");
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : "-";
};

export default function DetalleConsulta({ idConsulta, onClose }) {
  const [consulta, setConsulta] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost:3000/mascotas/historia/consulta/${idConsulta}`, {
        withCredentials: true,
      })
      .then((response) => setConsulta(response.data))
      .catch(() => setError("No se pudo cargar la consulta."));
  }, [idConsulta]);

  return (
    <div className="cf-container">
      <h2 className="cf-titulo">Detalle de la consulta</h2>

      {error && <p className="cf-error">{error}</p>}
      {!error && !consulta && <p className="cf-subtitulo">Cargando...</p>}

      {consulta && (
        <dl className="cf-detalle">
          <div>
            <dt>Fecha</dt>
            <dd>{formatearFecha(consulta.fecha_consulta)}</dd>
          </div>
          <div>
            <dt>Veterinario</dt>
            <dd>{consulta.nombre_veterinario || "No informado"}</dd>
          </div>
          <div>
            <dt>Peso</dt>
            <dd>{consulta.peso_actual ? `${consulta.peso_actual} kg` : "-"}</dd>
          </div>
          <div>
            <dt>Temperatura</dt>
            <dd>{consulta.temperatura ? `${consulta.temperatura} °C` : "-"}</dd>
          </div>
          <div className="cf-detalle-ancho">
            <dt>Motivo</dt>
            <dd>{consulta.motivo || "-"}</dd>
          </div>
          <div className="cf-detalle-ancho">
            <dt>Diagnóstico</dt>
            <dd>{consulta.diagnostico || "-"}</dd>
          </div>
          <div className="cf-detalle-ancho">
            <dt>Tratamiento</dt>
            <dd>{consulta.tratamiento || "-"}</dd>
          </div>
          <div className="cf-detalle-ancho">
            <dt>Observaciones</dt>
            <dd>{consulta.observaciones || "-"}</dd>
          </div>
        </dl>
      )}

      <div className="cf-acciones">
        <button type="button" className="cf-btn-cancelar" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
