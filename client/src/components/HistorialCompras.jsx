import { useState, useEffect } from 'react'
import axios from 'axios'
import './HistorialCompras.css'

const CLIENTES_URL = 'http://localhost:3000/clientes'
const VENTAS_URL = 'http://localhost:3000/ventas'

export default function HistorialCompras({ clienteId, onClose }) {
  const [cliente, setCliente] = useState(null)
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [detallePorVenta, setDetallePorVenta] = useState({})
  const [ventaExpandida, setVentaExpandida] = useState(null)

  useEffect(() => {
    if (clienteId) {
      fetchHistorial(clienteId)
    }
  }, [clienteId])

  const fetchHistorial = async (id) => {
    setLoading(true)
    setError(null)
    try {
      const [resClientes, resVentas] = await Promise.all([
        axios.get(CLIENTES_URL, { withCredentials: true }).catch((err) => {
          if (err.response?.status === 404) return { data: { clientes: [] } }
          throw err
        }),
        axios.get(`${VENTAS_URL}/lista-ventas`, { withCredentials: true }).catch((err) => {
          if (err.response?.status === 404) return { data: { ventas: [] } }
          throw err
        }),
      ])

      const clientes = resClientes.data.clientes || []
      const todasLasVentas = resVentas.data.ventas || []

      const clienteEncontrado = clientes.find((c) => String(c.id) === String(id))
      const ventasDelCliente = todasLasVentas.filter(
        (v) => String(v.id_cliente) === String(id)
      )

      if (!clienteEncontrado) {
        setError('No se encontró el cliente solicitado.')
      }

      setCliente(clienteEncontrado || null)
      setVentas(ventasDelCliente)
    } catch (err) {
      console.error('Error al cargar el historial de compras:', err)
      setError('Hubo un error al cargar el historial de compras.')
    } finally {
      setLoading(false)
    }
  }

  const toggleDetalle = async (idVenta) => {
    if (ventaExpandida === idVenta) {
      setVentaExpandida(null)
      return
    }

    setVentaExpandida(idVenta)

    if (!detallePorVenta[idVenta]) {
      try {
        const res = await axios.get(`${VENTAS_URL}/detalles-venta/${idVenta}`, {
          withCredentials: true,
        })
        setDetallePorVenta((prev) => ({ ...prev, [idVenta]: res.data.detalles || [] }))
      } catch (err) {
        console.error('Error al cargar el detalle de la venta:', err)
        setDetallePorVenta((prev) => ({ ...prev, [idVenta]: [] }))
      }
    }
  }

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO)
    if (Number.isNaN(fecha.getTime())) return '—'
    return fecha.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="historial-card">
        <p className="historial-loading">Cargando historial de compras...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="historial-card">
        <p className="historial-error">{error}</p>
        {onClose && (
          <button className="historial-btn-cerrar" onClick={onClose}>
            Cerrar
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="historial-card">
      <div className="historial-header">
        <div>
          <h2 className="historial-titulo">
            {cliente.nombre} {cliente.apellido}
          </h2>
          <p className="historial-subtitulo">Teléfono: {cliente.telefono}</p>
        </div>
        {onClose && (
          <button className="historial-btn-cerrar" onClick={onClose} aria-label="Cerrar historial">
            ✕
          </button>
        )}
      </div>

      <h3 className="historial-seccion-titulo">Historial de compras</h3>

      {ventas.length === 0 ? (
        <p className="historial-sin-compras">Este cliente todavía no registra compras.</p>
      ) : (
        <div className="historial-lista">
          {ventas.map((v) => (
            <div key={v.id} className="historial-venta">
              <div className="historial-venta-resumen">
                <span className="historial-venta-id">#{String(v.id).padStart(3, '0')}</span>
                <span>{formatearFecha(v.fecha_venta)}</span>
                <span className="historial-venta-metodo">{v.metodo_pago}</span>
                <span className="historial-venta-total">
                  ${Number(v.total).toLocaleString()}
                </span>
                <button className="historial-btn-detalle" onClick={() => toggleDetalle(v.id)}>
                  {ventaExpandida === v.id ? 'Ocultar' : 'Ver detalle'}
                </button>
              </div>

              {ventaExpandida === v.id && (
                <div className="historial-detalle-wrapper">
                  {!detallePorVenta[v.id] ? (
                    <p className="historial-loading">Cargando detalle...</p>
                  ) : detallePorVenta[v.id].length === 0 ? (
                    <p className="historial-sin-compras">Sin detalle disponible.</p>
                  ) : (
                    <table className="historial-detalle-tabla">
                      <thead>
                        <tr>
                          <th>Producto/Servicio</th>
                          <th>Cantidad</th>
                          <th>Precio unitario</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detallePorVenta[v.id].map((d) => (
                          <tr key={d.id}>
                            <td>{d.producto_nombre || d.servicio_nombre}</td>
                            <td>{d.cantidad}</td>
                            <td>${Number(d.precio_unitario).toLocaleString()}</td>
                            <td>${Number(d.subtotal).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}