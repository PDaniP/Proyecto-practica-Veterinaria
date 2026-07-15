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

      <button onClick={abrirModal} className="btn-primary">
        Nueva Venta
      </button>

      
        <Modal isOpen={mostrarModal} onClose={cerrarModal}>
          <FormularioNuevaVenta onClose={cerrarModal} />
        </Modal>
      
    </section>
  );
}

const formStyles =`
  .btn-primary {
  background: var(--vet-purple);
  color: #fff;
  border: none;
  border-radius: 8px;
  height: 38px;
  padding: 0 22px;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(125, 31, 153, 0.25);
}

.btn-primary:hover {
  background: var(--vet-purple-light);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(125, 31, 153, 0.3);
}

.btn-primary:active {
  transform: scale(0.97);
}
`
