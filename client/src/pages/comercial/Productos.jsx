import { useState, useEffect } from "react";
import FormularioProductos from "../../components/FormularioProductos";
import FormularioEdicionProductos from "../../components/FormularioEdicionProducto";
import Modal from "../../components/Modal";
import FormularioLote from "../../components/FormularioLote";

export default function Productos() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarFormularioLote, setMostrarFormularioLote] = useState(false);
  const [tipoFormulario, setTipoFormulario] = useState(null);

  //const abrirModal = () => setMostrarFormulario(true);
  const abrirModalCrear = () => {
    setTipoFormulario("producto");
    setModoEdicion(false);
    setProductoSeleccionado(null);
    setMostrarFormulario(true);
  };

  const abrirModalEditar = () => {
    // 🔥 Simulación de producto seleccionado
    const productoDemo = {
      precio_compra: 100,
      precio_venta: 150,
      stock_actual: 20,
      stock_minimo: 5,
      fecha_vencimiento: "2026-12-31",
      proveedor: 2,
    };

    setProductoSeleccionado(productoDemo);
    setModoEdicion(true);
    setTipoFormulario("producto");
    setMostrarFormulario(true);
  };

  const abrirModalLote = () => {
    setTipoFormulario("lote");
    setModoEdicion(false);
    setProductoSeleccionado(null);
    setMostrarFormulario(true);
  };

  const cerrarModal = () => setMostrarFormulario(false);

  useEffect(() => {
    const styleId = "btn-agregar-style";

    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = estilosBoton;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <section className="page-shell">
      <h1>Productos</h1>
      <p>Administra el catálogo de productos para tu clínica veterinaria.</p>

      <div style={{ display: "flex", gap: "10px" }}>
        <button type="button" className="btn-agregar" onClick={abrirModalCrear}>
          Agregar Producto
        </button>

        <button
          type="button"
          className="btn-agregar"
          onClick={abrirModalEditar}
        >
          Editar Producto
        </button>
        <button type="button" className="btn-agregar" onClick={abrirModalLote}>
          Agregar Lote
        </button>
      </div>

      {/* MODAL */}
      <Modal isOpen={mostrarFormulario} onClose={cerrarModal}>
        {tipoFormulario === "lote" ? (
          <FormularioLote onClose={cerrarModal} />
        ) : modoEdicion ? (
          <FormularioEdicionProductos
            producto={productoSeleccionado}
            onClose={cerrarModal}
          />
        ) : (
          <FormularioProductos onClose={cerrarModal} />
        )}
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
