import { useState, useEffect } from "react";
import FormularioProductos from "../../components/FormularioProductos";
import Modal from "../../components/Modal";

export default function Productos() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const abrirModal = () => setMostrarFormulario(true);
  const cerrarModal = () => setMostrarFormulario(false);

  useEffect(() => {
    const styleId = "btn-agregar-style";

    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = estilosBoton;
      document.head.appendChild(style);
    }

    return () => {
      const style = document.getElementById(styleId);
      if (style) style.remove();
    };
  }, []);



  return (
    <section className="page-shell">
      <h1>Productos</h1>
      <p>Administra el catálogo de productos para tu clínica veterinaria.</p>

      <button 
      type="button" 
      className="btn-agregar"
      onClick={abrirModal}
      >
        Agregar Producto
      </button>

      {/* MODAL */}
      <Modal
        isOpen={mostrarFormulario}
        onClose={cerrarModal}
      >
        <FormularioProductos 
          onClose={cerrarModal} 
        />
      </Modal>
    </section>
  );
}

const estilosBoton = `
.btn-agregar {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  transition: all 0.2s ease;
}

.btn-agregar:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(79, 70, 229, 0.3);
}

.btn-agregar:active {
  transform: scale(0.98);
}
`;