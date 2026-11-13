import { useState, useEffect } from "react";
import api from "../../../config/api.js";
import { useParams } from "react-router-dom";
import Modal from "../../components/Modal";
import FormularioConsulta from "../../components/FormularioConsulta";
import DetalleConsulta from "../../components/DetalleConsulta";
import "../comercial/Productos.css";
import "./HistoriasClinicas.css";
import { obtenerEspecies, obtenerRazas } from "../../service/especiesService";
import FormularioEdicionConsulta from "../../components/FormularioEdicionConsulta";
import ExportarPDF from "../../components/ExportarPDF.jsx";

const formatearFecha = (fecha) => {
  if (!fecha) return "-";

  const fechaSinHora =
    fecha instanceof Date
      ? [
          fecha.getFullYear(),
          String(fecha.getMonth() + 1).padStart(2, "0"),
          String(fecha.getDate()).padStart(2, "0"),
        ].join("-")
      : String(fecha).trim().split(/[T\s]/)[0];
  const componentes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fechaSinHora);

  return componentes
    ? `${componentes[3]}/${componentes[2]}/${componentes[1]}`
    : "-";
};

const estadoProximaDosis = (fecha) => {
  if (!fecha) return "";

  const [fechaSinHora] = fecha.split("T");
  const hoy = new Date();
  const limite = new Date();
  limite.setDate(hoy.getDate() + 15);

  const aISO = (date) => date.toISOString().slice(0, 10);

  if (fechaSinHora < aISO(hoy)) return "vencida";
  if (fechaSinHora <= aISO(limite)) return "proxima";
  return "";
};

const porFechaDescendente = (campo) => (a, b) =>
  String(b[campo] ?? "").localeCompare(String(a[campo] ?? ""));

export default function HistoriasClinicas() {
  const { id } = useParams();
  const [historia, setHistoria] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [modalConsultaAbierto, setModalConsultaAbierto] = useState(false);
  const [consultaSeleccionada, setConsultaSeleccionada] = useState(null);
  const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
  const [consultaEdicionSeleccionada, setConsultaEdicionSeleccionada] =
    useState(null);

  // Cambiar este contador vuelve a pedir la historia (se usa después de guardar)
  const [version, setVersion] = useState(0);
  const recargarHistoria = () => setVersion((actual) => actual + 1);

  useEffect(() => {
    const cargarHistoria = async () => {
      try {
        const [historiaResponse, clientesResponse] = await Promise.all([
          api.get(`mascotas/historia/${id}`, {
            withCredentials: true,
          }),
          api.get("clientes", {
            withCredentials: true,
          }),
        ]);

        const historiaData = historiaResponse.data.historiaClinica;
        const idEspecie = historiaData.especie;

        const [especies, razas] = await Promise.all([
          obtenerEspecies(),
          obtenerRazas(idEspecie),
        ]);

        /*
        const especies = await obtenerEspecies();
        const razas = await obtenerRazas(idEspecie);
 */
        const especieEncontrada = especies.find(
          (item) => Number(item.id) === Number(historiaData.especie),
        );

        const razaEncontrada = razas.find(
          (item) => Number(item.id) === Number(historiaData.raza),
        );

        const cliente = clientesResponse.data.clientes.find(
          (item) => Number(item.id) === Number(historiaData.dueño),
        );

        setHistoria({
          ...historiaData,
          especie: especieEncontrada?.nombre ?? "-",
          raza: razaEncontrada?.nombre ?? "-",
          dueño: cliente
            ? `${cliente.nombre} ${cliente.apellido}`
            : "Dueño no disponible",
        });
      } catch (error) {
        console.error("Error al cargar la historia clinica:", error);
        setError("No se pudo cargar la historia clinica.");
      } finally {
        setCargando(false);
      }
    };
    cargarHistoria();
  }, [id, version]);

  if (cargando) {
    return <p className="productos-loading">Cargando historia clinica...</p>;
  }

  if (error || !historia) {
    return (
      <p className="productos-empty">{error || "Historia no encontrada."}</p>
    );
  }

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return "Desconocida";

    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return `${edad} años`;
  };

  const vacunas = [...(historia.vacunas ?? [])].sort(
    porFechaDescendente("fecha_aplicacion"),
  );

  const consultas = [...(historia.consultas ?? [])].sort(
    porFechaDescendente("fecha_consulta"),
  );

  const limitarTexto = (nombre) => {
    const texto = nombre || "-";
    return texto.length > 40 ? `${texto.slice(0, 39)}…` : texto;
  };

  return (
    <section className="page-shell historia-clinica-page">
      <header className="historia-clinica-header">
        <div>
          <h1>Historia clínica de {historia.nombre}</h1>
          <p className="historia-clinica-owner">Dueño: {historia.dueño}</p>
        </div>
        <ExportarPDF
          titulo={`Historia clínica de ${historia.nombre}`}
          nombreArchivo={`historia-clinica-${historia.nombre}`}
          metadata={{
            Propietario: historia.dueño,
            Especie: historia.especie,
            Raza: historia.raza,
          }}
          secciones={[
            {
              titulo: "Datos generales y clínicos",
              columnas: ["Dato", "Información"],
              filas: [
                ["Fecha de nacimiento", formatearFecha(historia.fecha_nacimiento)],
                ["Sexo", historia.sexo],
                ["Estado", historia.activo ? "Activo" : "Inactivo"],
                ["Alergias", historia.alergias],
                ["Observaciones", historia.observaciones],
                ["Número de chip", historia.numero_chip],
              ],
            },
            {
              titulo: "Consultas (orden cronológico)",
              columnas: ["Fecha", "Motivo", "Diagnóstico", "Tratamiento", "Observaciones", "Peso", "Temperatura"],
              filas: [...consultas].reverse().map((c) => [
                formatearFecha(c.fecha_consulta),
                c.motivo,
                c.diagnostico,
                c.tratamiento,
                c.observaciones,
                c.peso_actual == null ? "—" : `${c.peso_actual} kg`,
                c.temperatura == null ? "—" : `${c.temperatura} °C`,
              ]),
            },
            {
              titulo: "Vacunas aplicadas",
              columnas: ["Vacuna", "Fecha de aplicación", "Próxima dosis"],
              filas: vacunas.map((v) => [
                v.nombre_vacuna,
                formatearFecha(v.fecha_aplicacion),
                formatearFecha(v.proxima_dosis),
              ]),
            },
            {
              titulo: "Antecedentes",
              columnas: ["Tipo", "Descripción", "Fecha de diagnóstico"],
              filas: (historia.antecedentes || []).map((antecedente) => [
                antecedente.tipo,
                antecedente.descripcion,
                formatearFecha(antecedente.fecha_diagnostico),
              ]),
            },
          ]}
        />
      </header>

      <div className="historia-clinica-grid">
        <section className="historia-clinica-section">
          <h2>Datos de la mascota</h2>
          <dl className="historia-datos-lista">
            <div>
              <dt>Especie:</dt>
              <dd>{historia.especie}</dd>
            </div>
            <div>
              <dt>Raza:</dt>
              <dd>{historia.raza || "-"}</dd>
            </div>
            <div>
              <dt>Fecha nac:</dt>
              <dd>{formatearFecha(historia.fecha_nacimiento)}</dd>
            </div>
            <div>
              <dt>Edad:</dt>
              <dd>{calcularEdad(historia.fecha_nacimiento)}</dd>
            </div>
            <div>
              <dt>Sexo:</dt>
              <dd>{historia.sexo}</dd>
            </div>
            <div>
              <dt>Estado:</dt>
              <dd>{historia.activo ? "Activo" : "Inactivo"}</dd>
            </div>
          </dl>
        </section>

        <section className="historia-clinica-section">
          <h2>Datos clínicos</h2>
          <dl className="historia-datos-lista">
            <div>
              <dt>Alergias:</dt>
              <dd>{historia.alergias || "-"}</dd>
            </div>
            <div className="historia-observaciones-fila">
              <dt>Observaciones:</dt>
              <dd>{historia.observaciones || "-"}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="historia-clinica-section historia-vacunas-section">
        <h2>Vacunas aplicadas</h2>
        {vacunas.length ? (
          <div className="historia-vacunas-wrapper">
            <table className="historia-vacunas-tabla">
              <colgroup>
                <col className="historia-vacunas-col-nombre" />
                <col className="historia-vacunas-col-fecha" />
                <col className="historia-vacunas-col-proxima" />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">Vacuna</th>
                  <th scope="col">Fecha de aplicación</th>
                  <th scope="col">Próxima dosis</th>
                </tr>
              </thead>
              <tbody>
                {vacunas.map((vacuna, index) => {
                  const estado = estadoProximaDosis(vacuna.proxima_dosis);

                  return (
                    <tr
                      key={`${vacuna.id}-${vacuna.fecha_aplicacion}-${index}`}
                    >
                      <td title={vacuna.nombre_vacuna || ""}>
                        {limitarTexto(vacuna.nombre_vacuna)}
                      </td>
                      <td>{formatearFecha(vacuna.fecha_aplicacion)}</td>
                      <td>
                        {vacuna.proxima_dosis ? (
                          <span
                            className={`historia-dosis ${
                              estado ? `historia-dosis-${estado}` : ""
                            }`}
                          >
                            {formatearFecha(vacuna.proxima_dosis)}
                            {estado === "vencida" && " · vencida"}
                            {estado === "proxima" && " · próxima"}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="historia-vacunas-vacio">No hay vacunas registradas.</p>
        )}
      </section>

      <section className="historia-clinica-section">
        <div className="historia-seccion-heading">
          <h2>Historial de consultas</h2>
          <button
            className="btn-primary"
            type="button"
            onClick={() => setModalConsultaAbierto(true)}
          >
            + Nueva Consulta
          </button>
        </div>
        {consultas.length ? (
          <div className="tabla-wrapper">
            <table className="productos-tabla historia-consultas-tabla">
              <colgroup>
                <col className="consultas-col-fecha" />
                <col className="consultas-col-motivo" />
                <col className="consultas-col-veterinario" />
                <col className="consultas-col-detalles" />
                <col className="consultas-col-detalles" />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Motivo</th>
                  <th scope="col">Veterinario</th>
                  <th scope="col">Detalles</th>
                  <th scope="col">Editar</th>
                </tr>
              </thead>
              <tbody>
                {consultas.map((consulta) => (
                  <tr key={consulta.id}>
                    <td>
                      <time dateTime={consulta.fecha_consulta}>
                        {formatearFecha(consulta.fecha_consulta)}
                      </time>
                    </td>
                    <td title={consulta.motivo || ""}>
                      <strong>{limitarTexto(consulta.motivo, 30)}</strong>
                    </td>
                    <td>{consulta.nombre_veterinario || "No informado"}</td>
                    <td>
                      <button
                        className="btn-primary"
                        type="button"
                        onClick={() => setConsultaSeleccionada(consulta.id)}
                      >
                        Detalles
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn-primary"
                        type="button"
                        onClick={() => {
                          setConsultaEdicionSeleccionada(consulta);
                          setModalEdicionAbierto(true);
                        }}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="historia-vacunas-vacio">
            No hay consultas registradas.
          </p>
        )}
      </section>

      <Modal
        isOpen={modalConsultaAbierto}
        onClose={() => setModalConsultaAbierto(false)}
      >
        <FormularioConsulta
          idMascota={historia.id}
          nombreMascota={historia.nombre}
          onClose={() => setModalConsultaAbierto(false)}
          onGuardado={recargarHistoria}
        />
      </Modal>

      <Modal
        isOpen={consultaSeleccionada !== null}
        onClose={() => setConsultaSeleccionada(null)}
      >
        {consultaSeleccionada !== null && (
          <DetalleConsulta
            idConsulta={consultaSeleccionada}
            onClose={() => setConsultaSeleccionada(null)}
          />
        )}
      </Modal>

      {/*Modal para abrir el formulario de edición */}
      <Modal
        isOpen={modalEdicionAbierto}
        onClose={() => {
          setModalEdicionAbierto(false);
          setConsultaEdicionSeleccionada(null);
        }}
      >
        {consultaEdicionSeleccionada && (
          <FormularioEdicionConsulta
            idMascota={historia.id}
            consulta={consultaEdicionSeleccionada}
            nombreMascota={historia.nombre}
            onClose={() => {
              setModalEdicionAbierto(false);
              setConsultaEdicionSeleccionada(null);
            }}
            onGuardado={recargarHistoria}
          />
        )}
      </Modal>
    </section>
  );
}
