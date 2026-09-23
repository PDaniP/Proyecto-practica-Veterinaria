import { useState } from "react";
import Modal from "../../components/Modal";
import "./HistoriasClinicas.css";

const historiaInicial = {
  mascota: {
    nombre: "Luna",
    especie: "Canino",
    raza: "Labrador",
    edad: "4 años",
    sexo: "Hembra",
  },
  dueño: "María González",
  alergias: "No posee alergias conocidas",
  vacunas: [
    { nombre: "Antirrábica", fecha: "12/03/2025" },
    { nombre: "Séxtuple canina", fecha: "12/03/2025" },
    { nombre: "Bordetella", fecha: "20/06/2024" },
  ],
  atenciones: [
    {
      fecha: "12/03/2025",
      motivo: "Control anual y vacunación",
      veterinario: "Dra. Valentina Ruiz",
    },
    {
      fecha: "20/06/2024",
      motivo: "Consulta dermatológica",
      veterinario: "Dr. Nicolás Pérez",
    },
  ],
};

export default function HistoriasClinicas() {
  const [modalVacunaAbierto, setModalVacunaAbierto] = useState(false);
  const historia = historiaInicial;

  return (
    <section className="page-shell historia-clinica-page">
      <header className="historia-clinica-header">
        <div>
          <p className="historia-clinica-eyebrow">Registro clínico</p>
          <h1>Historia clínica de {historia.mascota.nombre}</h1>
          <p className="historia-clinica-owner">Dueño: {historia.dueño}</p>
        </div>
      </header>

      <div className="historia-clinica-grid">
        <section className="historia-clinica-section">
          <h2>Datos de la mascota</h2>
          <dl className="historia-datos-lista">
            <div>
              <dt>Nombre</dt>
              <dd>{historia.mascota.nombre}</dd>
            </div>
            <div>
              <dt>Especie</dt>
              <dd>{historia.mascota.especie}</dd>
            </div>
            <div>
              <dt>Raza</dt>
              <dd>{historia.mascota.raza}</dd>
            </div>
            <div>
              <dt>Edad</dt>
              <dd>{historia.mascota.edad}</dd>
            </div>
            <div>
              <dt>Sexo</dt>
              <dd>{historia.mascota.sexo}</dd>
            </div>
            <div>
              <dt>Alergias</dt>
              <dd>{historia.alergias}</dd>
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
              <li key={`${vacuna.nombre}-${vacuna.fecha}`}>
                <span>{vacuna.nombre}</span>
                <time>{vacuna.fecha}</time>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="historia-clinica-section">
        <h2>Atenciones previas</h2>
        <ul className="historia-atenciones-lista">
          {historia.atenciones.map((atencion) => (
            <li key={`${atencion.fecha}-${atencion.motivo}`}>
              <time>{atencion.fecha}</time>
              <div>
                <strong>{atencion.motivo}</strong>
                <span>{atencion.veterinario}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <Modal
        isOpen={modalVacunaAbierto}
        onClose={() => setModalVacunaAbierto(false)}
      />
    </section>
  );
}
