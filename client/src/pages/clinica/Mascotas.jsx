import { useState } from "react";
import Modal from "../../components/Modal";
import FormularioNuevaMascota from "../../components/FormularioNuevaMascota";

export default function Mascotas() {
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);

  const abrirModalCrear = () => setModalCrearAbierto(true);
  const cerrarModalCrear = () => setModalCrearAbierto(false);

  return (
    <section className="page-shell">
      <h1>Mascotas</h1>
      <button 
        className="btn btn-primary" 
        onClick={abrirModalCrear}
      >
        Nueva mascota
      </button>
      <p>Consulta y actualiza los registros de las mascotas atendidas.</p>

      <Modal isOpen={modalCrearAbierto} onClose={cerrarModalCrear}>
        <FormularioNuevaMascota />
      </Modal>
    </section>
  );
}
