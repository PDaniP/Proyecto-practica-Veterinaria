import { useEffect, useState } from "react";
import api from "../../../config/api.js";
import { asignarTurno, modificarTurno } from "../../service/turnosService";
import "./FormularioTurnos.css";

export default function FormularioTurno({
  profesionales = [],
  onClose,
  onGuardado,
  turnoEditar = null,
}) {
  const [clientes, setClientes] = useState([]);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [usarClienteRegistrado, setUsarClienteRegistrado] = useState(true);

  const [nombreContacto, setNombreContacto] = useState("");
  const [telefonoContacto, setTelefonoContacto] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [motivo, setMotivo] = useState("");
  const [profesionalId, setProfesionalId] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [recordatorioWhatsApp, setRecordatorioWhatsApp] = useState(false);

  const [cargandoClientes, setCargandoClientes] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (turnoEditar) {
      const fechaHora = String(turnoEditar.fecha_hora ?? "").replace(" ", "T");
      const [fechaTurno, horaTurno = ""] = fechaHora.split("T");

      setFecha(fechaTurno);
      setHora(horaTurno.slice(0, 5));
      setMotivo(turnoEditar.motivo ?? "");
      setProfesionalId(
        turnoEditar.profesional_id == null
          ? ""
          : String(turnoEditar.profesional_id),
      );
      setObservaciones(turnoEditar.observaciones ?? "");
      // AGREGADO: Cargar el estado del recordatorio si estamos editando
      setRecordatorioWhatsApp(Boolean(turnoEditar.recibe_notificaciones)); 
      setError("");
    } else {
      setNombreContacto("");
      setTelefonoContacto("");
      setFecha("");
      setHora("");
      setMotivo("");
      setProfesionalId("");
      setObservaciones("");
      setClienteSeleccionado(null);
      setBusquedaCliente("");
      setUsarClienteRegistrado(true);
      setRecordatorioWhatsApp(false); // AGREGADO: Limpiar estado
      setError("");
    }
  }, [turnoEditar]);

  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const response = await api.get("clientes", {
          withCredentials: true,
        });

        setClientes(response.data.clientes ?? []);
      } catch (error) {
        console.error("Error al cargar clientes:", error);
        setError("No se pudieron cargar los clientes registrados.");
      } finally {
        setCargandoClientes(false);
      }
    };

    cargarClientes();
  }, []);

  const clientesFiltrados = clientes.filter((cliente) => {
    const texto = busquedaCliente.trim().toLowerCase();

    if (!texto) return true;

    const nombreCompleto =
      `${cliente.nombre ?? ""} ${cliente.apellido ?? ""}`.toLowerCase();

    const telefono = String(cliente.telefono ?? "").toLowerCase();

    return nombreCompleto.includes(texto) || telefono.includes(texto);
  });

  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setNombreContacto(
      `${cliente.nombre ?? ""} ${cliente.apellido ?? ""}`.trim(),
    );
    setTelefonoContacto(cliente.telefono ?? "");
    setBusquedaCliente(
      `${cliente.nombre ?? ""} ${cliente.apellido ?? ""}`.trim(),
    );
  };

  const cambiarTipoContacto = (registrado) => {
    setUsarClienteRegistrado(registrado);
    setClienteSeleccionado(null);
    setBusquedaCliente("");
    setNombreContacto("");
    setTelefonoContacto("");
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError("");

    if (!turnoEditar && (!nombreContacto.trim() || !telefonoContacto.trim())) {
      setError("Completá el nombre y el teléfono del contacto.");
      return;
    }

    if (!fecha || !hora || !motivo.trim()) {
      setError("Completá la fecha, la hora y el motivo del turno.");
      return;
    }

    if (!turnoEditar && usarClienteRegistrado && !clienteSeleccionado) {
      setError("Seleccioná un cliente registrado de la lista.");
      return;
    }

    try {
      setGuardando(true);

      // AGREGADO: Sumamos recibe_notificaciones para que viaje al backend
      const datosTurno = {
        profesional_id: profesionalId ? Number(profesionalId) : null,
        fecha_hora: `${fecha}T${hora}:00`,
        motivo: motivo.trim(),
        observaciones: observaciones.trim() || null,
        recibe_notificaciones: recordatorioWhatsApp, 
      };

      if (turnoEditar) {
        await modificarTurno(turnoEditar.id, {
          ...datosTurno,
          estado: turnoEditar.estado,
        });
      } else {
        await asignarTurno({
          // AGREGADO: Mandamos el cliente_id si existe
          cliente_id: usarClienteRegistrado && clienteSeleccionado ? clienteSeleccionado.id : null,
          nombre_contacto: nombreContacto.trim(),
          telefono_contacto: telefonoContacto.trim(),
          ...datosTurno,
        });
      }

      if (onGuardado) {
        await onGuardado();
      }

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error al guardar el turno:", error);
      setError(
        error.response?.data?.message ||
          "No se pudo guardar el turno. Intentá nuevamente.",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form className="formulario-turno" onSubmit={manejarEnvio}>
      <h2>{turnoEditar ? "Editar turno" : "Nuevo turno"}</h2>

      {!turnoEditar && (
        <fieldset className="formulario-turno__grupo">
          <legend>Datos del contacto</legend>

          <div className="formulario-turno__opciones">
            <label>
              <input
                type="radio"
                checked={usarClienteRegistrado}
                onChange={() => cambiarTipoContacto(true)}
              />
              Cliente registrado
            </label>

            <label>
              <input
                type="radio"
                checked={!usarClienteRegistrado}
                onChange={() => cambiarTipoContacto(false)}
              />
              Contacto nuevo
            </label>
          </div>

          {usarClienteRegistrado && (
            <div className="formulario-turno__campo">
              <label htmlFor="buscar-cliente">
                Buscar cliente por nombre o teléfono
              </label>

              <input
                id="buscar-cliente"
                type="text"
                value={busquedaCliente}
                onChange={(e) => {
                  setBusquedaCliente(e.target.value);
                  setClienteSeleccionado(null);
                  setNombreContacto("");
                  setTelefonoContacto("");
                }}
                placeholder="Escribí un nombre o teléfono..."
              />

              {cargandoClientes ? (
                <p>Cargando clientes...</p>
              ) : (
                <div className="formulario-turno__resultados">
                  {clientesFiltrados.map((cliente) => (
                    <button
                      type="button"
                      key={cliente.id}
                      onClick={() => seleccionarCliente(cliente)}
                      className={
                        clienteSeleccionado?.id === cliente.id
                          ? "formulario-turno__cliente seleccionado"
                          : "formulario-turno__cliente"
                      }
                    >
                      {cliente.nombre} {cliente.apellido}
                      {" — "}
                      {cliente.telefono || "Sin teléfono"}
                    </button>
                  ))}

                  {!clientesFiltrados.length && (
                    <p>No se encontraron clientes.</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="formulario-turno__campo">
            <label htmlFor="nombre-contacto">Nombre del contacto</label>
            <input
              id="nombre-contacto"
              value={nombreContacto}
              onChange={(e) => setNombreContacto(e.target.value)}
              required
            />
          </div>

          <div className="formulario-turno__campo">
            <label htmlFor="telefono-contacto">Teléfono</label>
            <input
              id="telefono-contacto"
              value={telefonoContacto}
              onChange={(e) => setTelefonoContacto(e.target.value)}
              required
            />
          </div>
        </fieldset>
      )}
      <div className="formulario-turno__campo">
        <label htmlFor="fecha-turno">Fecha</label>
        <input
          id="fecha-turno"
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
        />
      </div>

      <div className="formulario-turno__campo">
        <label htmlFor="hora-turno">Hora</label>
        <input
          id="hora-turno"
          type="time"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          required
        />
      </div>

      <div className="formulario-turno__campo">
        <label htmlFor="motivo-turno">Motivo del turno</label>
        <input
          id="motivo-turno"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Ej.: Consulta, vacunación, peluquería..."
          required
        />
      </div>

      <div className="formulario-turno__campo">
        <label htmlFor="profesional-turno">Profesional</label>
        <select
          id="profesional-turno"
          value={profesionalId}
          onChange={(e) => setProfesionalId(e.target.value)}
        >
          <option value="">Sin asignar</option>

          {profesionales.map((profesional) => (
            <option key={profesional.id} value={profesional.id}>
              {profesional.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="formulario-turno__campo">
        <label htmlFor="observaciones-turno">Observaciones</label>
        <textarea
          id="observaciones-turno"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          rows={3}
        />
      </div>

      <label className="formulario-turno__recordatorio">
        <input
          type="checkbox"
          checked={recordatorioWhatsApp}
          onChange={(e) => setRecordatorioWhatsApp(e.target.checked)}
        />
        Enviar recordatorio por WhatsApp
      </label>

      {error && (
        <p className="formulario-turno__error" role="alert">
          {error}
        </p>
      )}

      <div className="formulario-turno__acciones">
        <button type="button" onClick={onClose} disabled={guardando}>
          Cancelar
        </button>

        <button type="submit" disabled={guardando}>
          {guardando
            ? "Guardando..."
            : turnoEditar
              ? "Guardar cambios"
              : "Guardar turno"}
        </button>
      </div>
    </form>
  );
}