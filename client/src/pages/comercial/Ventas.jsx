import { useState, useEffect } from "react";
import FormularioNuevaVenta from "../../components/FormularioNuevaVenta";
import Modal from "../../components/Modal";

export default function Ventas() {
  const [mostrarModal, setMostrarModal] = useState(false);

  const abrirModal = () => setMostrarModal(true);
  const cerrarModal = () => setMostrarModal(false);

  useEffect(() => {
    if (mostrarModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mostrarModal]);

  return (
    <section className="page-shell">
      <h1>Ventas</h1>

      <button onClick={abrirModal}>
        Nueva Venta
      </button>

      
        <Modal isOpen={mostrarModal} onClose={cerrarModal}>
          <FormularioNuevaVenta onClose={cerrarModal} />
        </Modal>
      
    </section>
  );
}
