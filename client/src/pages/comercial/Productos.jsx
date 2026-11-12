import { useState, useEffect } from "react";
import api from "../../../config/api.js";
import FormularioProductos from "../../components/FormularioProductos";
import FormularioEdicionProductos from "../../components/FormularioEdicionProducto";
import Modal from "../../components/Modal";
import FormularioLote from "../../components/FormularioLote";
import ExportarPDF from "../../components/ExportarPDF.jsx";
import useSystemFeedback from "../../hooks/useSystemFeedback.js";
import { normalizarTexto } from "../../utils/normalizarTexto.js";
import "./Productos.css";

const API_URL = "products";

const cargarProductos = () => api.get(API_URL, { withCredentials: true });

export default function Productos() {
  const { confirmarAccion } = useSystemFeedback();
  const [vistaLotes, setVistaLotes] = useState(false);
  const [productos, setProductos] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [tipoModal, setTipoModal] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const response = await cargarProductos();
      setProductos(response.data);
    } catch (err) {
      console.error("Error al cargar productos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let activo = true;
    cargarProductos()
      .then((response) => {
        if (activo) setProductos(response.data);
      })
      .catch((err) => {
        console.error("Error al cargar productos:", err);
      })
      .finally(() => {
        if (activo) setLoading(false);
      });

    return () => {
      activo = false;
    };
  }, []);
  console.log(productos);

  const fetchLotes = async () => {
    try {
      const response = await api.get(`${API_URL}/product/lotes`, {
        withCredentials: true,
      });
      setLotes(response.data.datos);
    } catch (err) {
      console.error("Error al cargar lotes:", err);
    }
  };

  const handleEliminar = async (id) => {
    const confirmar = await confirmarAccion(
      "¿Seguro que querés eliminar este producto? Esta acción no se puede deshacer.",
      { variante: "warning", textoConfirmar: "Eliminar" },
    );
    if (!confirmar) return;

    try {
      await api.delete(`${API_URL}/product/delete/${id}`, {
        withCredentials: true,
      });
      setProductos((prev) => prev.filter((p) => p.id !== id));
      cerrarModal();
    } catch (err) {
      console.error("Error al eliminar producto:", err);
    }
  };

  const abrirModalCrear = () => {
    setTipoModal("crear");
    setProductoSeleccionado(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (producto) => {
    setTipoModal("editar");
    setProductoSeleccionado(producto);
    setModalAbierto(true);
  };

  const abrirModalLote = (idproducto) => {
    setTipoModal("lote");
    setProductoSeleccionado(idproducto);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setTipoModal(null);
    setProductoSeleccionado(null);
    fetchProductos();
  };

  const productosFiltrados = productos.filter((p) =>
    normalizarTexto(p.nombre).includes(normalizarTexto(busqueda)),
  );

  const lotesFiltrados = lotes.filter((l) =>
    normalizarTexto(l.nombre_producto).includes(normalizarTexto(busqueda)),
  );

  const POR_PAGINA = 15;
  const [pagina, setPagina] = useState(1);

  const listaFiltrada = vistaLotes ? lotesFiltrados : productosFiltrados;
  const totalPaginas = Math.ceil(listaFiltrada.length / POR_PAGINA);
  const paginaActual = Math.min(pagina, Math.max(totalPaginas, 1));
  const filasPagina = listaFiltrada.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);


  const badgeStock = (actual, minimo) => {
    if (actual === 0)
      return <span className="badge badge-danger">{actual}</span>;
    if (actual <= minimo)
      return <span className="badge badge-warning">{actual}</span>;
    return <span className="badge badge-ok">{actual}</span>;
  };

  return (
    <section className="page-shell productos-page">
      {/* Toolbar */}
      <div className="productos-toolbar">
        <h1>{vistaLotes ? "Lotes" : "Productos"}</h1>

        <input
          className="search-input"
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => {setBusqueda(e.target.value); setPagina(1);}}
        />

        {!vistaLotes && !loading && (
          <ExportarPDF
            titulo="Listado de productos"
            nombreArchivo="productos"
            secciones={[
              {
                titulo: "Productos",
                columnas: [
                  "ID",
                  "Nombre",
                  "Categoría (ID)",
                  "Marca",
                  "Precio costo",
                  "Precio venta",
                  "Stock",
                ],
                filas: productosFiltrados.map((p) => [
                  p.id,
                  p.nombre,
                  p.id_categoria,
                  p.marca,
                  p.precio_costo == null
                    ? "—"
                    : `$${Number(p.precio_costo).toLocaleString("es-AR")}`,
                  p.precio_venta == null
                    ? "Sin definir"
                    : `$${Number(p.precio_venta).toLocaleString("es-AR")}`,
                  p.stock_actual,
                ]),
              },
            ]}
          />
        )}

        <button
          className={`btn-toggle${vistaLotes ? " active" : ""}`}
          onClick={() => {
            setVistaLotes((v) => !v);
            setBusqueda("");
            setPagina(1);
            if (!vistaLotes) fetchLotes();
          }}
        >
          {vistaLotes ? " Ver productos" : "Ver lotes"}
        </button>

        <button className="btn-primary" onClick={abrirModalCrear}>
          + Nuevo producto
        </button>
      </div>

      {!vistaLotes &&
        (loading ? (
          <p className="productos-loading">Cargando productos...</p>
        ) : productosFiltrados.length === 0 ? (
          <p className="productos-empty">No se encontraron productos.</p>
        ) : (
          <div className="tabla-wrapper">
            <table className="productos-tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Marca</th>
                  <th>Precio costo</th>
                  <th>Precio venta</th>
                  <th>Stock</th>
                  <th>Público</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filasPagina.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td>{p.marca}</td>
                    <td>${parseFloat(p.precio_costo).toLocaleString()}</td>
                    <td>
                      {p.precio_venta == null
                        ? "Sin definir"
                        : `$${Number(p.precio_venta).toLocaleString()}`}
                    </td>
                    <td>{badgeStock(p.stock_actual, p.stock_minimo)}</td>
                    <td>{p.venta_al_publico ? "Sí" : "No"}</td>
                    <td>
                      <button
                        className="btn-editar"
                        onClick={() => abrirModalEditar(p)}
                      >
                        Editar
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn-editar"
                        onClick={() => abrirModalLote(p.id)}
                      >
                        Añadir lote
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {vistaLotes &&
        (lotesFiltrados.length === 0 ? (
          <p className="productos-empty">No se encontraron lotes.</p>
        ) : (
          <div className="tabla-wrapper">
            <table className="productos-tabla">
              <thead>
                <tr>
                  <th>Código lote</th>
                  <th>Producto</th>
                  <th>Marca</th>
                  <th>Stock inicial</th>
                  <th>Stock actual</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filasPagina.map((l) => (
                  <tr key={l.id}>
                    <td>{l.codigo_lote}</td>
                    <td>{l.nombre_producto}</td>
                    <td>{l.marca_producto}</td>
                    <td>{l.stock_inicial}</td>
                    <td>{badgeStock(l.stock_actual, 0)}</td>
                    <td>{l.fecha_vencimiento}</td>
                    <td>
                      <span
                        className={`badge ${l.activo ? "badge-ok" : "badge-danger"}`}
                      >
                        {l.activo ? "Activo" : "Vencido"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      <div className="productos-pagination" aria-label="Paginación">
  <button
    className="productos-pagination__button"
    onClick={() => setPagina((p) => Math.max(p - 1, 1))}
    disabled={paginaActual === 1}
    aria-label="Ir a la página anterior"
  >
    Anterior
  </button>

  <span className="productos-pagination__info">
    Página <strong>{paginaActual}</strong> de{" "}
    <strong>{Math.max(totalPaginas, 1)}</strong>
  </span>

  <button
    className="productos-pagination__button"
    onClick={() => setPagina((p) => Math.min(p + 1, totalPaginas))}
    disabled={paginaActual >= totalPaginas}
    aria-label="Ir a la página siguiente"
  >
    Siguiente
  </button>
</div>

      <Modal isOpen={modalAbierto} onClose={cerrarModal}>
        {tipoModal === "lote" && (
          <FormularioLote
            onClose={cerrarModal}
            productoId={productoSeleccionado}
          />
        )}
        {tipoModal === "editar" && productoSeleccionado && (
          <>
            <FormularioEdicionProductos
              key={productoSeleccionado.id}
              productoInicial={productoSeleccionado}
              onClose={cerrarModal}
              onEliminar={() => handleEliminar(productoSeleccionado.id)}
            />
          </>
        )}
        {tipoModal === "crear" && <FormularioProductos onClose={cerrarModal} />}
      </Modal>
    </section>
  );
}
