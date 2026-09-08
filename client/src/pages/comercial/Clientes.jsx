import { useState, useEffect } from 'react'
import axios from 'axios'
import FormularioClientes from '../../components/FormularioClientes'
import FichaCliente from '../../components/FichaCliente'
import HistorialCompras from '../../components/HistorialCompras'
import Modal from '../../components/Modal'
import './Clientes.css'

const CLIENTES_URL = 'http://localhost:3000/clientes'
const MASCOTAS_URL = 'http://localhost:3000/mascotas'
const VENTAS_URL = 'http://localhost:3000/ventas/lista-ventas'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [idsConMascotas, setIdsConMascotas] = useState(new Set())
  const [idsConCompras, setIdsConCompras] = useState(new Set())
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [tipoModal, setTipoModal] = useState(null)
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)

  useEffect(() => {
    fetchTodo()
  }, [])

  const fetchTodo = async () => {
    setLoading(true)
    try {
      const [resClientes, resMascotas, resVentas] = await Promise.all([
        axios.get(CLIENTES_URL, { withCredentials: true }).catch((err) => {
          if (err.response?.status === 404) return { data: { clientes: [] } }
          throw err
        }),
        axios.get(MASCOTAS_URL, { withCredentials: true }).catch((err) => {
          if (err.response?.status === 404) return { data: { mascotas: [] } }
          throw err
        }),
        axios.get(VENTAS_URL, { withCredentials: true }).catch((err) => {
          if (err.response?.status === 404) return { data: { ventas: [] } }
          throw err
        }),
      ])

      setClientes(resClientes.data.clientes || [])

      const mascotas = resMascotas.data.mascotas || []
      setIdsConMascotas(new Set(mascotas.map((m) => String(m.id_cliente))))

      const ventas = resVentas.data.ventas || []
      setIdsConCompras(new Set(ventas.map((v) => String(v.id_cliente))))
    } catch (err) {
      console.error('Error al cargar clientes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEliminar = async (id) => {
    const confirmar = window.confirm(
      '¿Seguro que querés eliminar este cliente? Esta acción no se puede deshacer.'
    )
    if (!confirmar) return

    try {
      await axios.delete(`${CLIENTES_URL}/eliminar/${id}`, { withCredentials: true })
      setClientes((prev) => prev.filter((c) => c.id !== id))
      setModalAbierto(false)
    } catch (err) {
      console.error('Error al eliminar cliente:', err)
      alert('Hubo un error al eliminar el cliente.')
    }
  }

  const abrirModalCrear = () => {
    setTipoModal('crear')
    setClienteSeleccionado(null)
    setModalAbierto(true)
  }

  const abrirModalEditar = (cliente) => {
    setTipoModal('editar')
    setClienteSeleccionado(cliente)
    setModalAbierto(true)
  }


  const abrirModalFicha = (cliente) => {
    if (!idsConMascotas.has(String(cliente.id))) return
    setTipoModal('ficha')
    setClienteSeleccionado(cliente)
    setModalAbierto(true)
  }

  const abrirModalHistorial = (cliente) => {
    if (!idsConCompras.has(String(cliente.id))) return
    setTipoModal('historial')
    setClienteSeleccionado(cliente)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setClienteSeleccionado(null)
    fetchTodo()
  }


  const clientesFiltrados = clientes.filter((c) => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return true

    const nombreCompleto = `${c.nombre ?? ''} ${c.apellido ?? ''}`.toLowerCase()
    const telefono = (c.telefono ?? '').toLowerCase()

    return nombreCompleto.includes(texto) || telefono.includes(texto)
  })

  return (
    <section className="page-shell">
      <div className="clientes-toolbar">
        <h1>Clientes</h1>

        <input
          className="search-input"
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <button className="btn-primary" onClick={abrirModalCrear}>
          + Nuevo cliente
        </button>
      </div>

      {loading ? (
        <p className="clientes-loading">Cargando clientes...</p>
      ) : clientesFiltrados.length === 0 ? (
        <p className="clientes-empty">No se encontraron clientes.</p>
      ) : (
        <div className="tabla-wrapper">
          <table className="clientes-tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>DNI</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Email</th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((c) => {
                const tieneMascotas = idsConMascotas.has(String(c.id))
                const tieneCompras = idsConCompras.has(String(c.id))

                return (
                  <tr key={c.id}>
                    <td>{c.nombre}</td>
                    <td>{c.apellido}</td>
                    <td>{c.dni}</td>
                    <td>{c.telefono}</td>
                    <td>{c.direccion}</td>
                    <td>{c.email || '—'}</td>
                    <td>
                      <button className="btn-editar" onClick={() => abrirModalEditar(c)}>
                        Editar
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn-editar"
                        onClick={() => abrirModalFicha(c)}
                        disabled={!tieneMascotas}
                        title={!tieneMascotas ? 'Este cliente no tiene mascotas registradas' : undefined}
                      >
                        Ver ficha
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn-editar"
                        onClick={() => abrirModalHistorial(c)}
                        disabled={!tieneCompras}
                        title={!tieneCompras ? 'Este cliente no registra compras' : undefined}
                      >
                        Historial de compra
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalAbierto} onClose={cerrarModal}>
        {tipoModal === 'editar' && (
          <>
            <FormularioClientes clienteInicial={clienteSeleccionado} onClose={cerrarModal} />
            <div className="modal-eliminar">
              <button
                className="btn-danger"
                onClick={() => handleEliminar(clienteSeleccionado?.id)}
              >
                Eliminar cliente
              </button>
            </div>
          </>
        )}
        {tipoModal === 'crear' && <FormularioClientes onClose={cerrarModal} />}
        {tipoModal === 'ficha' && (
          <FichaCliente clienteId={clienteSeleccionado?.id} onClose={cerrarModal} />
        )}
        {tipoModal === 'historial' && (
          <HistorialCompras clienteId={clienteSeleccionado?.id} onClose={cerrarModal} />
        )}
      </Modal>
    </section>
  )
}