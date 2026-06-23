import { useState, useEffect } from 'react'
import axios from 'axios'
import FormularioProductos from '../../components/FormularioProductos'
import FormularioEdicionProductos from '../../components/FormularioEdicionProducto'
import Modal from '../../components/Modal'
import FormularioLote from '../../components/FormularioLote'
import './Productos.css'

const API_URL = 'http://localhost:3000/products'

export default function Productos() {
  const [vistaLotes, setVistaLotes] = useState(false)
  const [productos, setProductos] = useState([])
  const [lotes, setLotes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [tipoModal, setTipoModal] = useState(null)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)

  useEffect(() => {
    fetchProductos()
  }, [])

  const fetchProductos = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}`, { withCredentials: true })
      setProductos(response.data)
    } catch (err) {
      console.error('Error al cargar productos:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchLotes = async () => {
    try {
      const response = await axios.get(`${API_URL}/product/lotes`, { withCredentials: true })
      setLotes(response.data)
    } catch (err) {
      console.error('Error al cargar lotes:', err)
    }
  }

 
  const handleEliminar = async (id) => {
    const confirmar = window.confirm('¿Seguro que querés eliminar este producto? Esta acción no se puede deshacer.')
    if (!confirmar) return

    try {
      await axios.delete(`${API_URL}/product/delete/${id}`, { withCredentials: true })
      setProductos((prev) => prev.filter((p) => p.id !== id))
      setModalAbierto(false)
    } catch (err) {
      console.error('Error al eliminar producto:', err)
    }
  }

  const abrirModalCrear = () => {
    setTipoModal('crear')
    setProductoSeleccionado(null)
    setModalAbierto(true)
  }

  const abrirModalEditar = (producto) => {
    setTipoModal('editar')
    setProductoSeleccionado(producto)
    setModalAbierto(true)
  }

  const abrirModalLote = () => {
    setTipoModal('lote')
    setProductoSeleccionado(null)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setProductoSeleccionado(null)
    fetchProductos()
  }

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const lotesFiltrados = lotes.filter((l) =>
    l.producto?.toLowerCase().includes(busqueda.toLowerCase())
  )


  const badgeStock = (actual, minimo) => {
    if (actual === 0) return <span className="badge badge-danger">{actual}</span>
    if (actual <= minimo) return <span className="badge badge-warning">{actual}</span>
    return <span className="badge badge-ok">{actual}</span>
  }


  return (
    <section className="page-shell">

      {/* Toolbar */}
      <div className="productos-toolbar">
        <h1>{vistaLotes ? 'Lotes' : 'Productos'}</h1>

        <input
          className="search-input"
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <button
          className={`btn-toggle${vistaLotes ? ' active' : ''}`}
          onClick={() => {
            setVistaLotes((v) => !v)
            setBusqueda('')
            if (!vistaLotes) fetchLotes()
          }}
        >
          {vistaLotes ? '← Ver productos' : 'Ver lotes'}
        </button>

        <button
          className="btn-primary"
          onClick={vistaLotes ? abrirModalLote : abrirModalCrear}
        >
          + {vistaLotes ? 'Nuevo lote' : 'Nuevo producto'}
        </button>
      </div>

      {!vistaLotes && (
        loading ? (
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
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td>{p.marca}</td>
                    <td>${parseFloat(p.precio_costo).toLocaleString()}</td>
                    <td>${parseFloat(p.precio_venta).toLocaleString()}</td>
                    <td>{badgeStock(p.stock_actual, p.stock_minimo)}</td>
                    <td>{p.venta_al_publico ? 'Sí' : 'No'}</td>
                    <td>
                      <button className="btn-editar" onClick={() => abrirModalEditar(p)}>
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {vistaLotes && (
        lotesFiltrados.length === 0 ? (
          <p className="productos-empty">No se encontraron lotes.</p>
        ) : (
          <div className="tabla-wrapper">
            <table className="productos-tabla">
              <thead>
                <tr>
                  <th>Código lote</th>
                  <th>Producto</th>
                  <th>Stock inicial</th>
                  <th>Stock actual</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {lotesFiltrados.map((l) => (
                  <tr key={l.id}>
                    <td>{l.codigo_lote}</td>
                    <td>{l.producto}</td>
                    <td>{l.stock_inicial}</td>
                    <td>{badgeStock(l.stock_actual, 0)}</td>
                    <td>{l.fecha_vencimiento}</td>
                    <td>
                      <span className={`badge ${l.activo ? 'badge-ok' : 'badge-danger'}`}>
                        {l.activo ? 'Activo' : 'Vencido'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      <Modal isOpen={modalAbierto} onClose={cerrarModal}>
        {tipoModal === 'lote' && (
          <FormularioLote onClose={cerrarModal} />
        )}
        {tipoModal === 'editar' && (
          <>
            <FormularioEdicionProductos
              productoInicial={productoSeleccionado}
              onClose={cerrarModal}
            />
            <div className="modal-eliminar">
              <button
                className="btn-danger"
                onClick={() => handleEliminar(productoSeleccionado?.id)}
              >
                Eliminar producto
              </button>
            </div>
          </>
        )}
        {tipoModal === 'crear' && (
          <FormularioProductos onClose={cerrarModal} />
        )}
      </Modal>

    </section>
  )
}