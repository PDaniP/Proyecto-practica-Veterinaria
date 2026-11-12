import { useEffect, useState } from "react";
import api from "../../config/api.js";
import Modal from "./Modal.jsx";
import { normalizarTexto } from "../utils/normalizarTexto.js";

const formatearFecha = (fecha) => {
  if (!fecha) return "-";

  const [fechaParte] = String(fecha).split("T");
  const [anio, mes, dia] = fechaParte.split("-");

  if (!anio || !mes || !dia) return "-";

  return `${dia}/${mes}/${anio}`;
};

export default function DetalleMascota({
  mascota,
  dueño,
  onMascotaActualizada,
}) {
  const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [errorClientes, setErrorClientes] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState("");
  const [idCliente, setIdCliente] = useState(String(mascota?.id_cliente ?? ""));
  const [busquedaDueño, setBusquedaDueño] = useState(
    dueño === "Dueño no disponible" ? "" : dueño,
  );
  const [tieneChip, setTieneChip] = useState(Boolean(mascota?.numero_chip));
  const [formulario, setFormulario] = useState({
    observaciones: mascota?.observaciones ?? "",
    numero_chip: mascota?.numero_chip ?? "",
    activo: Boolean(mascota?.activo),
  });

  useEffect(() => {
    if (!modalEdicionAbierto || clientes.length > 0) return;

    let activo = true;

    api
      .get("clientes", { withCredentials: true })
      .then((response) => {
        if (activo) setClientes(response.data.clientes ?? []);
      })
      .catch((error) => {
        console.error("Error al cargar los dueños:", error);
        if (activo) setErrorClientes("No se pudieron cargar los clientes.");
      })
      .finally(() => {
        if (activo) setCargandoClientes(false);
      });

    return () => {
      activo = false;
    };
  }, [modalEdicionAbierto, clientes.length]);

  if (!mascota) return null;

  const clientesFiltrados = clientes.filter((cliente) => {
    const nombreCompleto =
      `${cliente.nombre ?? ""} ${cliente.apellido ?? ""} ${cliente.dni ?? ""}`;
    return normalizarTexto(nombreCompleto).includes(
      normalizarTexto(busquedaDueño),
    );
  });

  const cambiarCampo = (event) => {
    const { name, value } = event.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
  };

  const guardarCambios = async (event) => {
    event.preventDefault();
    setErrorGuardado("");

    if (!idCliente) {
      setErrorGuardado("Seleccione un dueño de la lista.");
      return;
    }

    setGuardando(true);
    try {
      const response = await api.put(
        `mascotas/editar/${mascota.id}`,
        {
          id_cliente: Number(idCliente),
          observaciones: formulario.observaciones.trim() || null,
          numero_chip: tieneChip ? formulario.numero_chip.trim() || null : null,
          activo: formulario.activo,
        },
        { withCredentials: true },
      );

      onMascotaActualizada?.(response.data.mascota);
      setModalEdicionAbierto(false);
    } catch (error) {
      console.error("Error al editar la mascota:", error);
      setErrorGuardado(
        error.response?.data?.message || "No se pudo guardar la mascota.",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="mascota-detalle">
      <h2>Detalle de {mascota.nombre}</h2>
      <dl>
        <div><dt>Especie</dt><dd>{mascota.especie}</dd></div>
        <div><dt>Raza</dt><dd>{mascota.raza || "-"}</dd></div>
        <div><dt>Fecha de nacimiento</dt><dd>{formatearFecha(mascota.fecha_nacimiento)}</dd></div>
        <div><dt>Edad</dt><dd>{mascota.fecha_nacimiento ? Math.floor((new Date() - new Date(mascota.fecha_nacimiento)) / (1000 * 60 * 60 * 24 * 365)) + " años" : "-"}</dd></div>
        <div><dt>Sexo</dt><dd>{mascota.genero || "-"}</dd></div>
        <div><dt>Dueño</dt><dd>{dueño}</dd></div>
        <div><dt>Número de chip</dt><dd>{mascota.numero_chip || "-"}</dd></div>
        <div><dt>Observaciones</dt><dd>{mascota.observaciones || "-"}</dd></div>
        <div><dt>Estado</dt><dd>{mascota.activo ? "Activo" : "Inactivo"}</dd></div>
        <div><dt>Fecha de registro</dt><dd>{formatearFecha(mascota.fecha_registro)}</dd></div>
      </dl>
      <button
        type="button"
        className="btn-primary mascota-detalle__edit"
        onClick={() => {
          setErrorGuardado("");
          setErrorClientes("");
          setCargandoClientes(clientes.length === 0);
          setIdCliente(String(mascota.id_cliente ?? ""));
          setBusquedaDueño(dueño === "Dueño no disponible" ? "" : dueño);
          setTieneChip(Boolean(mascota.numero_chip));
          setFormulario({
            observaciones: mascota.observaciones ?? "",
            numero_chip: mascota.numero_chip ?? "",
            activo: Boolean(mascota.activo),
          });
          setModalEdicionAbierto(true);
        }}
      >
        Editar mascota
      </button>

      <Modal
        isOpen={modalEdicionAbierto}
        onClose={() => setModalEdicionAbierto(false)}
      >
        <form className="mascota-edicion" onSubmit={guardarCambios}>
          <h2>Editar mascota</h2>

          <div className="mascota-edicion__field">
            <label htmlFor="mascota-edicion-dueno">Dueño</label>
            <input
              id="mascota-edicion-dueno"
              type="search"
              value={busquedaDueño}
              placeholder="Buscar por nombre, apellido o DNI"
              autoComplete="off"
              onChange={(event) => {
                setBusquedaDueño(event.target.value);
                setIdCliente("");
              }}
            />
            {cargandoClientes && <p>Cargando clientes...</p>}
            {errorClientes && <p className="mascota-edicion__error">{errorClientes}</p>}
            {busquedaDueño && !idCliente && (
              <ul className="mascota-edicion__suggestions">
                {clientesFiltrados.length === 0 ? (
                  <li>No se encontraron dueños.</li>
                ) : (
                  clientesFiltrados.map((cliente) => (
                    <li key={cliente.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setIdCliente(String(cliente.id));
                          setBusquedaDueño(
                            `${cliente.nombre} ${cliente.apellido}`,
                          );
                        }}
                      >
                        {cliente.nombre} {cliente.apellido} ({cliente.dni})
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          <div className="mascota-edicion__field">
            <label htmlFor="mascota-edicion-observaciones">Observaciones</label>
            <textarea
              id="mascota-edicion-observaciones"
              name="observaciones"
              rows="4"
              value={formulario.observaciones}
              onChange={cambiarCampo}
            />
          </div>

          <div className="mascota-edicion__field mascota-edicion__checkbox">
            <input
              id="mascota-edicion-tiene-chip"
              type="checkbox"
              checked={tieneChip}
              onChange={(event) => {
                const marcado = event.target.checked;
                setTieneChip(marcado);
                if (!marcado) {
                  setFormulario((actual) => ({ ...actual, numero_chip: "" }));
                }
              }}
            />
            <label htmlFor="mascota-edicion-tiene-chip">Tiene Chip</label>
          </div>

          <div className="mascota-edicion__field">
            <label htmlFor="mascota-edicion-numero-chip">Número de chip</label>
            <input
              id="mascota-edicion-numero-chip"
              name="numero_chip"
              type="text"
              value={formulario.numero_chip}
              onChange={cambiarCampo}
              disabled={!tieneChip}
            />
          </div>

          <div className="mascota-edicion__field">
            <label htmlFor="mascota-edicion-estado">Estado</label>
            <select
              id="mascota-edicion-estado"
              name="activo"
              value={String(formulario.activo)}
              onChange={(event) =>
                setFormulario((actual) => ({
                  ...actual,
                  activo: event.target.value === "true",
                }))
              }
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>

          {errorGuardado && (
            <p className="mascota-edicion__error" role="alert">
              {errorGuardado}
            </p>
          )}

          <div className="mascota-edicion__actions">
            <button
              type="button"
              className="mascota-edicion__cancel"
              onClick={() => setModalEdicionAbierto(false)}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={guardando || cargandoClientes}
            >
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
