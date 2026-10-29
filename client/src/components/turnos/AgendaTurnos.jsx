//import { useState } from "react";
import "./AgendaTurnos.css";

export default function AgendaTurnos({
  turnos = [],
  profesionales = [],
  cargando = false,
  error = "",
  profesionalSeleccionado = "todos",
  setProfesionalSeleccionado,
  estadoSeleccionado = "todos",
  setEstadoSeleccionado,
  fechaAgenda,
  onCambiarDia,
  onVolverHoy,
  onNuevoTurno,
  onEditarTurno,
  onCompletarTurno,
  onCancelarTurno,
  onVerSemana,
  onVerMes,
}) {
  /*
  const [profesionalSeleccionado, setProfesionalSeleccionado] =
    useState("todos");
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("todos");
*/
  const turnosFiltrados = turnos.filter((turno) => {
    const coincideProfesional =
      profesionalSeleccionado === "todos" ||
      (profesionalSeleccionado === "sin_asignar"
        ? turno.profesional_id == null
        : String(turno.profesional_id) === profesionalSeleccionado);

    const coincideEstado =
      estadoSeleccionado === "todos" || turno.estado === estadoSeleccionado;

    return coincideProfesional && coincideEstado;
  });

  const formatearHora = (fechaHora) => {
    if (!fechaHora) return "--:--";

    return new Date(fechaHora).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <section className="agenda-turnos">
      <div className="agenda-turnos__encabezados">
        
<div>
  <h2>Agenda de turnos</h2>

  <p>
    Turnos programados para el{" "}
    {new Date(
      `${fechaAgenda}T12:00:00`
    ).toLocaleDateString("es-AR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    })}
  </p>

  <div className="agenda-turnos__navegacion">
    <button
      type="button"
      onClick={() => onCambiarDia(-1)}
    >
      Día anterior
    </button>

    <button
      type="button"
      onClick={onVolverHoy}
    >
      Hoy
    </button>

    <button
      type="button"
      onClick={() => onCambiarDia(1)}
    >
      Día siguiente
    </button>
  </div>
</div>


        <div className="agenda-turnos__acciones">
          <button className="button-añadir" type="button" onClick={onNuevoTurno}>
            Añadir turno
          </button>

          <button type="button" onClick={onVerSemana}>
            Ver semana
          </button>

          <button type="button" onClick={onVerMes}>
            Ver mes
          </button>
        </div>
      </div>

      <div className="agenda-turnos__filtros">
        <label>
          Profesional
          <select
            name=""
            id=""
            value={profesionalSeleccionado}
            onChange={(e) => setProfesionalSeleccionado(e.target.value)}
          >
            <option value="todos">Todos los profesionales</option>

            <option value="sin_asignar">Sin profesional asignado</option>

            {profesionales.map((profesional) => (
              <option key={profesional.id} value={String(profesional.id)}>
                {profesional.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          Estado
          <select
            name=""
            id=""
            value={estadoSeleccionado}
            onChange={(e) => setEstadoSeleccionado(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="completado">Completados</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </label>
      </div>

      {cargando && <p className="agenda-turnos__mensaje">Cargando turnos...</p>}

      {!cargando && error && <p className="agenda-turnos__error">{error}</p>}

      {!cargando && !error && turnosFiltrados.length === 0 && (
        <p className="agenda-turnos__mensaje">
          No hay turnos para mostrar con los filtros seleccionados.
        </p>
      )}

      {!cargando && !error && turnosFiltrados.length > 0 && (
        <div className="agenda-turnos__lista">
          {[...turnosFiltrados]
            .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora))
            .map((turno) => (
              <article className="agenda-turnos__item" key={turno.id}>
                <div className="agenda-turnos__hora">
                  {formatearHora(turno.fecha_hora)}
                </div>

                <div className="agenda-turnos__datos">
                  <h3>{turno.nombre_contacto}</h3>
                  <p>{turno.motivo}</p>
                  <p>
                    Profesional:{" "}
                    {turno.profesional_nombre ||
                      (turno.profesional_id
                        ? "Sin nombre disponible"
                        : "Sin asignar")}
                  </p>
                  {turno.telefono_contacto && (
                    <p>Teléfono: {turno.telefono_contacto}</p>
                  )}
                </div>

                {turno.estado !== "cancelado" &&
                  turno.estado !== "completado" && (
                    <div className="agenda-turnos__botones">
                      <button
                        type="button"
                        onClick={() => onEditarTurno?.(turno)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => onCompletarTurno?.(turno)}
                      >
                        Completar
                      </button>

                      <button
                        type="button"
                        onClick={() => onCancelarTurno?.(turno)}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}

                <span
                  className={`agenda-turnos__estado agenda-turnos__estado--${turno.estado}`}
                >
                  {turno.estado || "pendiente"}
                </span>
              </article>
            ))}
        </div>
      )}
    </section>
  );
}
