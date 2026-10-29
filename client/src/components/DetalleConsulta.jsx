import { useEffect, useState } from "react";
import "./FormulariosClinicos.css";
import api from "../../config/api.js";

const formatearFecha = (fecha) => {
  if (!fecha) return "-";
  const [anio, mes, dia] = String(fecha).split("T")[0].split("-");
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : "-";
};

export default function DetalleConsulta({ idConsulta, onClose }) {
  const [consulta, setConsulta] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarConsulta = async () => {
      try {
        const { data } = await api.get(
          `mascotas/historia/consulta/${idConsulta}`,
        );
        const insumos =
          typeof data.insumos === "string"
            ? JSON.parse(data.insumos)
            : data.insumos ?? [];

        if (!Array.isArray(insumos)) {
          throw new Error("La respuesta de insumos no tiene el formato esperado.");
        }

        if (activo) {
          setConsulta({ ...data, insumos });
          setError("");
        }
      } catch (err) {
        console.error("Error al cargar el detalle de la consulta:", err);
        if (activo) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "No se pudo cargar la consulta.",
          );
          setConsulta(null);
        }
      }
    };

    cargarConsulta();
    return () => {
      activo = false;
    };
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
            <dt>Insumos utilizados</dt>
            <dd>
              {consulta.insumos?.length ? (
                <ul className="cf-detalle-insumos">
                  {consulta.insumos.map((insumo) => (
                    <li key={insumo.id}>
                      {insumo.nombre || "Insumo no disponible"}
                      {insumo.marca ? ` - ${insumo.marca}` : ""}
                      {insumo.cantidad != null
                        ? ` (cantidad: ${insumo.cantidad})`
                        : ""}
                      {insumo.codigo_lote
                        ? ` (lote: ${insumo.codigo_lote})`
                        : ""}
                      {insumo.proxima_dosis
                        ? ` — próxima dosis: ${formatearFecha(insumo.proxima_dosis)}`
                        : ""}
                      {insumo.observaciones
                        ? ` — ${insumo.observaciones}`
                        : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                "No se registraron insumos."
              )}
            </dd>
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
