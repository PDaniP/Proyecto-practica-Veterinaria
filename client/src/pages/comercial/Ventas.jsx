import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import Modal from '../../components/Modal'
import './Ventas.css'
import FormularioNuevaVenta from "../../components/FormularioNuevaVenta";

const API_URL = 'http://localhost:3000'

export default function Ventas() {
  const [ventas, setVentas] = useState([])
  const [productosPorVenta, setProductosPorVenta] = useState({})
  const [loading, setLoading] = useState(true)

  const hoy = new Date().toISOString().split('T')[0]
  const [fechaDesde, setFechaDesde] = useState(hoy)
  const [fechaHasta, setFechaHasta] = useState(hoy)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null)
  const [detalleSeleccionado, setDetalleSeleccionado] = useState([])
  const [loadingDetalle, setLoadingDetalle] = useState(false)

   const [mostrarModal, setMostrarModal] = useState(false);

  const abrirModal = () => setMostrarModal(true);
  const cerrarModales = () => setMostrarModal(false);

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


  useEffect(() => {
    fetchVentas()
  }, [])

  const fetchVentas = async () => {
  setLoading(true)

  try {
    const response = await axios.get(`${API_URL}/ventas/lista-ventas`)
    
    const listaVentas = response.data.ventas || []
    
    setVentas(listaVentas)
    console.log('Ventas obtenidas:', listaVentas)

    const resumen = {}

    await Promise.all(
      listaVentas.map(async (venta) => {
        try {
          const res = await axios.get(
            `${API_URL}/ventas/detalles-venta/${venta.id}`
          )
          

          resumen[venta.id] = res.data.detalles || []
          
        } catch (error) {
          console.error(
            `Error al obtener el detalle de la venta ${venta.id}`,
            error
          )

          resumen[venta.id] = []
        }
      })
    )

    setProductosPorVenta(resumen)
    
  } catch (error) {
    console.error('Error al cargar las ventas:', error)
  } finally {
    setLoading(false)
  }
}

  const abrirDetalle = async (venta) => {
  setVentaSeleccionada(venta)
  setModalAbierto(true)
  setLoadingDetalle(true)

  try {
    const res = await axios.get(
      `${API_URL}/ventas/detalles-venta/${venta.id}`
    )
    setDetalleSeleccionado(res.data.detalles || [])
  } catch (error) {
    console.error(error)
    setDetalleSeleccionado([])
  } finally {
    setLoadingDetalle(false)
  }
}

  const cerrarModal = () => {
    setModalAbierto(false)
    setVentaSeleccionada(null)
    setDetalleSeleccionado([])
  }

  const ventasFiltradas = useMemo(() => {
    return ventas.filter((v) => {
      
      const fecha = v.fecha_venta.split('T')[0]
      return fecha >= fechaDesde && fecha <= fechaHasta
    })
  }, [ventas, fechaDesde, fechaHasta])

 
  const stats = useMemo(() => {
  return ventasFiltradas.reduce(
    (acc, v) => {
      const total = Number(v.total)

      acc.totalVentas++
      acc.ingresos += total

      

      if (v.metodo_pago) {
        switch (v.metodo_pago.toLowerCase()) {
          case 'efectivo':
            acc.efectivo += total
            break

          case 'tarjeta':
            acc.tarjeta += total
            break

          case 'transferencia':
            acc.transferencia += total
            break

          default:
            break
        }
      }

      return acc
    },
    {
      totalVentas: 0,
      ingresos: 0,
      efectivo: 0,
      tarjeta: 0,
      transferencia: 0,
    }
  )
}, [ventasFiltradas])



  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO)

    return fecha.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const resumenProductos = (idVenta) => {
    const detalles = productosPorVenta[idVenta]

    if (!detalles || detalles.length === 0) return '—'

    return detalles
      .map((d) => `${d.producto_nombre || d.servicio_nombre} x${d.cantidad}`)
      .join(', ')
  }

  const badgePago = (metodo) => {
  if (!metodo)
    return (
      <span className="badge badge-pago-desconocido">
        Sin datos
      </span>
    )

  const clase =
    metodo.toLowerCase() === 'efectivo'
      ? 'badge-pago-efectivo'
      : metodo.toLowerCase() === 'tarjeta'
      ? 'badge-pago-tarjeta'
      : 'badge-pago-transferencia'

  return <span className={`badge ${clase}`}>{metodo}</span>
}

  return (
    <section className="page-shell">
      <div>
        <section className="page-shell">
      <h1>Ventas</h1>

      <button onClick={abrirModal} className="btn-primary">
        Nueva Venta
      </button>

      
        <Modal isOpen={mostrarModal} onClose={cerrarModales}>
          <FormularioNuevaVenta onClose={cerrarModales} />
        </Modal>
      
    </section>
      </div>
      <div className="ventas-toolbar">
        <h1>Historial de ventas</h1>

        <div className="fecha-filtro">
          <input
            type="date"
            className="search-input"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />

          <input
            type="date"
            className="search-input"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
        </div>
      </div>

      <div className="ventas-resumen">
        <div className="resumen-card">
          <span className="resumen-label">Total ventas</span>
          <span className="resumen-valor">{stats.totalVentas}</span>
        </div>

        <div className="resumen-card">
          <span className="resumen-label">Ingresos del día</span>
          <span className="resumen-valor">${stats.ingresos.toLocaleString()}</span>
        </div>

        <div className="resumen-card">
          <span className="resumen-label">Efectivo</span>
          <span className="resumen-valor">${stats.efectivo.toLocaleString()}</span>
        </div>

        <div className="resumen-card">
          <span className="resumen-label">Tarjeta</span>
          <span className="resumen-valor">${stats.tarjeta.toLocaleString()}</span>
        </div>

        <div className="resumen-card">
          <span className="resumen-label">Transferencia</span>
          <span className="resumen-valor">${stats.transferencia.toLocaleString()}</span>
        </div>
      </div>

      {loading ? (
        <p className="productos-loading">Cargando ventas...</p>
      ) : ventasFiltradas.length === 0 ? (
        <p className="productos-empty">No se encontraron ventas en ese rango de fechas.</p>
      ) : (
        <div className="tabla-wrapper">
          <table className="productos-tabla">
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Productos</th>
                <th>Forma de pago</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {ventasFiltradas.map((v) => (
                <tr key={v.id}>
                  <td>#{String(v.id).padStart(3, '0')}</td>
                  <td>{formatearFecha(v.fecha_venta)}</td>
                  <td>{resumenProductos(v.id)}</td>
                  <td>{badgePago(v.metodo_pago)}</td>
                  <td>${Number(v.total).toLocaleString()}</td>

                  <td>
                    <button
                      className="btn-editar"
                      onClick={() => abrirDetalle(v)}
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalAbierto} onClose={cerrarModal}>
        <h2 className="detalle-titulo">
          Venta #
          {ventaSeleccionada &&
            String(ventaSeleccionada.id).padStart(3, '0')}
        </h2>

        {loadingDetalle ? (
          <p>Cargando...</p>
        ) : (
          <table className="productos-tabla">
            <thead>
              <tr>
                <th>Producto/Servicio</th>
                <th>Cantidad</th>
                <th>Precio unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>

            <tbody>
              {detalleSeleccionado.map((d) => (
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
      </Modal>
    </section>
  )
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
}`