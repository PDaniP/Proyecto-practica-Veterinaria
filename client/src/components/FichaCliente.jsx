import { useState, useEffect } from 'react'
import axios from 'axios'
import './FichaCliente.css'

const CLIENTES_URL = 'http://localhost:3000/clientes'
const MASCOTAS_URL = 'http://localhost:3000/mascotas'

export default function FichaCliente({ clienteId, onClose }) {
  const [cliente, setCliente] = useState(null)
  const [mascotas, setMascotas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (clienteId) {
      fetchFicha(clienteId)
    }
  }, [clienteId])

  const fetchFicha = async (id) => {
    setLoading(true)
    setError(null)
    try {
      const [resClientes, resMascotas] = await Promise.all([
        axios.get(CLIENTES_URL, { withCredentials: true }).catch((err) => {
          if (err.response?.status === 404) return { data: { clientes: [] } }
          throw err
        }),
        axios.get(MASCOTAS_URL, { withCredentials: true }).catch((err) => {
          if (err.response?.status === 404) return { data: { mascotas: [] } }
          throw err
        }),
      ])

      const clientes = resClientes.data.clientes || []
      const todasLasMascotas = resMascotas.data.mascotas || []

      const clienteEncontrado = clientes.find((c) => String(c.id) === String(id))
      const mascotasDelCliente = todasLasMascotas.filter(
        (m) => String(m.id_cliente) === String(id)
      )

      if (!clienteEncontrado) {
        setError('No se encontró el cliente solicitado.')
      }

      setCliente(clienteEncontrado || null)
      setMascotas(mascotasDelCliente)
    } catch (err) {
      console.error('Error al cargar la ficha del cliente:', err)
      setError('Hubo un error al cargar la ficha del cliente.')
    } finally {
      setLoading(false)
    }
  }

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return '—'
    const nacimiento = new Date(fechaNacimiento)
    if (Number.isNaN(nacimiento.getTime())) return '—'

    const hoy = new Date()
    let anios = hoy.getFullYear() - nacimiento.getFullYear()
    let meses = hoy.getMonth() - nacimiento.getMonth()
    if (meses < 0 || (meses === 0 && hoy.getDate() < nacimiento.getDate())) {
      anios -= 1
      meses += 12
    }
    if (anios <= 0) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`
    return `${anios} ${anios === 1 ? 'año' : 'años'}`
  }

  if (loading) {
    return (
      <div className="ficha-card">
        <p className="ficha-loading">Cargando ficha del cliente...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="ficha-card">
        <p className="ficha-error">{error}</p>
        {onClose && (
          <button className="ficha-btn-cerrar" onClick={onClose}>
            Cerrar
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="ficha-card">
      <div className="ficha-header">
        <div>
          <h2 className="ficha-titulo">
            {cliente.nombre} {cliente.apellido}
          </h2>
          <p className="ficha-subtitulo">Teléfono: {cliente.telefono}</p>
        </div>
        {onClose && (
          <button className="ficha-btn-cerrar" onClick={onClose} aria-label="Cerrar ficha">
            ✕
          </button>
        )}
      </div>



      <h3 className="ficha-seccion-titulo">Mascotas asociadas</h3>

      {mascotas.length === 0 ? (
        <p className="ficha-sin-mascotas">Este cliente todavía no tiene mascotas registradas.</p>
      ) : (
        <div className="ficha-mascotas-wrapper">
          <table className="ficha-mascotas-tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Especie</th>
                <th>Raza</th>
                <th>Edad</th>
                <th>Peso</th>
                <th>Género</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {mascotas.map((m) => (
                <tr key={m.id}>
                  <td>{m.nombre}</td>
                  <td>{m.especie}</td>
                  <td>{m.raza || '—'}</td>
                  <td>{calcularEdad(m.fecha_nacimiento)}</td>
                  <td>{m.peso ? `${m.peso} kg` : '—'}</td>
                  <td>{m.genero || '—'}</td>
                  <td>
                    <span className={`ficha-badge ${m.activo ? 'ficha-badge-ok' : 'ficha-badge-inactivo'}`}>
                      {m.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}