import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Modal from "../../components/Modal";
import "../comercial/Productos.css";
import "./HistoriasClinicas.css";

const formatearFecha = (fecha) => {
  if (!fecha) return "-";

  const [fechaSinHora] = fecha.split("T");
  const [año, mes, dia] = fechaSinHora.split("-");

  return dia && mes && año ? `${dia}/${mes}/${año}` : fecha;
};

export default function HistoriasClinicas() {
  const { id } = useParams();
  const [historia, setHistoria] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [modalVacunaAbierto, setModalVacunaAbierto] = useState(false);

  useEffect(() => {
    const cargarHistoria = async () => {
      try {
        const [historiaResponse, clientesResponse] = await Promise.all([
          axios.get(`http://localhost:3000/mascotas/historia/${id}`, {
            withCredentials: true,
          }),
          axios.get("http://localhost:3000/clientes", {
            withCredentials: true,
          }),
        ]);

        const historiaData = historiaResponse.data.historiaClinica;
        const cliente = clientesResponse.data.clientes.find(
          (item) => item.id === Number(historiaData.dueño),
        );

        setHistoria({
          ...historiaData,
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
  }, [id]);

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

  return (
    <section className="page-shell historia-clinica-page">
      <header className="historia-clinica-header">
        <div>
          <h1>Historia clínica de {historia.nombre}</h1>
          <p className="historia-clinica-owner">Dueño: {historia.dueño}</p>
        </div>
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
            <div>
              <dt>Alergias:</dt>
              <dd>{historia.alergias}</dd>
            </div>
            <div>
              <dt>Observaciones:</dt>
              <dd>{historia.observaciones || "-"}</dd>
            </div>
          </dl>
        </section>

        <section className="historia-clinica-section">
          <div className="historia-seccion-heading">
            <h2>Vacunas</h2>
            <button
              className="btn-primary"
              type="button"
              onClick={() => setModalVacunaAbierto(true)}
            >
              + Nueva vacuna
            </button>
          </div>
          <ul className="historia-lista">
            {historia.vacunas.map((vacuna) => (
              <li key={`${vacuna.nombre_vacuna}-${vacuna.fecha_aplicacion}`}>
                <span>{vacuna.nombre_vacuna}</span>
                <time dateTime={vacuna.fecha_aplicacion}>
                  {formatearFecha(vacuna.fecha_aplicacion)}
                </time>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="historia-clinica-section">
        <div className="historia-seccion-heading">
          <h2>Historial de consultas</h2>
          <button className="btn-primary" type="button">
            + Nueva Consulta
          </button>
        </div>
        <div className="tabla-wrapper">
          <table className="productos-tabla">
            <thead>
              <tr>
                <th scope="col">Fecha</th>
                <th scope="col">Descripción</th>
                <th scope="col">Veterinario</th>
              </tr>
            </thead>
            <tbody>
              {historia.consultas.map((consulta) => (
                <tr key={consulta.id}>
                  <td>
                    <time dateTime={consulta.fecha_consulta}>
                      {formatearFecha(consulta.fecha_consulta)}
                    </time>
                  </td>
                  <td>
                    <strong>{consulta.motivo}</strong>
                  </td>
                  <td>{consulta.nombre_veterinario || "No informado"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        isOpen={modalVacunaAbierto}
        onClose={() => setModalVacunaAbierto(false)}
      />
    </section>
  );
}
