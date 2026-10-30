import { useEffect, useState } from "react";
import { obtenerTurnosPorFecha } from "../../service/turnosService.js";
import "./VistaMes.css";

const formatearFecha = (fecha) => {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
};

const obtenerPrimerDiaMes = (fecha) => {
  return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
};

const obtenerCantidadDiasMes = (fecha) => {
  return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();
};

const nombresDias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const formatearHora = (fechaHora) => {
  if (!fechaHora) return "--:--";

  return new Date(fechaHora).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export default function VistaMes({
  profesionalSeleccionado = "todos",
  estadoSeleccionado = "todos",
  actualizarTurnos = 0,
  onCerrar,
  onEditarTurno,
}) {
  const [mesActual, setMesActual] = useState(() =>
    obtenerPrimerDiaMes(new Date()),
  );

  const [turnosPorFecha, setTurnosPorFecha] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [fechaSeleccionada, setFechaSeleccionada] = useState(() =>
    formatearFecha(new Date()),
  );

  useEffect(() => {
    let cancelado = false;

    const cargarTurnosMes = async () => {
      setCargando(true);
      setError("");

      try {
        const cantidadDias = obtenerCantidadDiasMes(mesActual);

        const fechas = Array.from(
          { length: cantidadDias },
          (_, indice) =>
            new Date(mesActual.getFullYear(), mesActual.getMonth(), indice + 1),
        );

        const resultados = await Promise.all(
          fechas.map((fecha) => obtenerTurnosPorFecha(formatearFecha(fecha))),
        );

        if (cancelado) return;

        const turnosAgrupados = {};

        fechas.forEach((fecha, indice) => {
          turnosAgrupados[formatearFecha(fecha)] = resultados[indice];
        });

        setTurnosPorFecha(turnosAgrupados);
      } catch (error) {
        console.error("Error al cargar los turnos del mes:", error);

        if (!cancelado) {
          setError("No se pudieron cargar los turnos del mes.");
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    };

    cargarTurnosMes();

    return () => {
      cancelado = true;
    };
  }, [mesActual, actualizarTurnos]);

  const cambiarMes = (cantidad) => {
    setMesActual(
      (mesAnterior) =>
        new Date(
          mesAnterior.getFullYear(),
          mesAnterior.getMonth() + cantidad,
          1,
        ),
    );
  };

  const volverAlMesActual = () => {
    const hoy = new Date();

    setMesActual(obtenerPrimerDiaMes(hoy));
    setFechaSeleccionada(formatearFecha(hoy));
  };

  const nombreMes = mesActual.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });

  const primerDiaSemana = (obtenerPrimerDiaMes(mesActual).getDay() + 6) % 7;

  const cantidadDias = obtenerCantidadDiasMes(mesActual);

  const celdas = [
    ...Array(primerDiaSemana).fill(null),
    ...Array.from({ length: cantidadDias }, (_, indice) => indice + 1),
  ];

  const turnosDelDia = (fecha) => {
    const turnos = turnosPorFecha[fecha] ?? [];

    return turnos
      .filter((turno) => {
        const coincideProfesional =
          profesionalSeleccionado === "todos" ||
          (profesionalSeleccionado === "sin_asignar"
            ? turno.profesional_id == null
            : String(turno.profesional_id) === profesionalSeleccionado);

        const coincideEstado =
          estadoSeleccionado === "todos" || turno.estado === estadoSeleccionado;

        return coincideProfesional && coincideEstado;
      })
      .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora));
  };

  const turnosSeleccionados = turnosDelDia(fechaSeleccionada);

  return (
    <section className="vista-mes">
      <header className="vista-mes__encabezado">
        <div>
          <h2>Agenda mensual</h2>
          <p>{nombreMes}</p>
        </div>
      </header>

      <nav className="vista-mes__navegacion">
        <button type="button" onClick={() => cambiarMes(-1)}>
          ← Mes anterior
        </button>

        <button type="button" onClick={volverAlMesActual}>
          Mes actual
        </button>

        <button type="button" onClick={() => cambiarMes(1)}>
          Mes siguiente →
        </button>
      </nav>

      {cargando && (
        <p className="vista-mes__mensaje">Cargando turnos del mes...</p>
      )}

      {!cargando && error && <p className="vista-mes__error">{error}</p>}

      {!cargando && !error && (
        <>
          <div className="vista-mes__calendario">
            {nombresDias.map((dia) => (
              <div className="vista-mes__nombre-dia" key={dia}>
                {dia}
              </div>
            ))}

            {celdas.map((dia, indice) => {
              if (dia === null) {
                return (
                  <div
                    className="vista-mes__celda-vacia"
                    key={`vacio-${indice}`}
                  />
                );
              }

              const fecha = formatearFecha(
                new Date(mesActual.getFullYear(), mesActual.getMonth(), dia),
              );

              const cantidadTurnos = turnosDelDia(fecha).length;
              const esHoy = fecha === formatearFecha(new Date());
              const seleccionado = fecha === fechaSeleccionada;

              return (
                <button
                  type="button"
                  key={fecha}
                  className={[
                    "vista-mes__dia",
                    esHoy ? "vista-mes__dia--hoy" : "",
                    seleccionado ? "vista-mes__dia--seleccionado" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setFechaSeleccionada(fecha)}
                  aria-label={`${dia}, ${cantidadTurnos} turnos`}
                  aria-pressed={seleccionado}
                >
                  <span className="vista-mes__numero">{dia}</span>

                  {cantidadTurnos > 0 && (
                    <span className="vista-mes__cantidad">
                      {cantidadTurnos}{" "}
                      {cantidadTurnos === 1 ? "turno" : "turnos"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <section className="vista-mes__detalle">
            <h3>
              Turnos de {nombreMes}
            </h3>

            {turnosSeleccionados.length === 0 ? (
              <p className="vista-mes__vacio">
                No hay turnos para este día con los filtros seleccionados.
              </p>
            ) : (
              <div className="vista-mes__lista">
                {turnosSeleccionados.map((turno) => (
                  <article className="vista-mes__turno" key={turno.id}>
                    <strong>
                      {formatearHora(turno.fecha_hora)} —{" "}
                      {turno.nombre_contacto}
                    </strong>

                    <span>{turno.motivo}</span>

                    <small>
                      {turno.profesional_nombre ||
                        (turno.profesional_id
                          ? "Profesional sin nombre"
                          : "Sin asignar")}
                    </small>

                    <span
                      className={`vista-mes__estado vista-mes__estado--${
                        turno.estado || "pendiente"
                      }`}
                    >
                      {turno.estado || "pendiente"}
                    </span>
                    {turno.estado !== "cancelado" &&
                      turno.estado !== "completado" && (
                        <button
                          type="button"
                          className="vista-mes__boton-editar"
                          onClick={() => onEditarTurno?.(turno)}
                        >
                          Editar
                        </button>
                      )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}
