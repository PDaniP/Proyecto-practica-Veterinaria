import { useState, useEffect } from 'react'
import './FichaCliente.css'
import api from "../../config/api.js";
import { obtenerEspecies, obtenerRazas } from '../service/especiesService.js'
import { useNavigate  } from 'react-router-dom';


export default function FichaCliente({ clienteId, onClose }) {
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null)
  const [mascotas, setMascotas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFicha = async (id) => {
    try {
      const [resClientes, resMascotas] = await Promise.all([
        api.get("clientes").catch((err) => {
          if (err.response?.status === 404) return { data: { clientes: [] } }
          throw err
        }),
        api.get("mascotas").catch((err) => {
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

      const idsEspecies = [
        ...new Set(
          mascotasDelCliente
            .map((mascota) => mascota.id_especie)
            .filter((idEspecie) => idEspecie != null)
            .map(Number)
        ),
      ]

      const [especies, gruposRazas] = idsEspecies.length
        ? await Promise.all([
            obtenerEspecies(),
            Promise.all(idsEspecies.map((idEspecie) => obtenerRazas(idEspecie))),
          ])
        : [[], []]
      const nombresEspecies = new Map(
        especies.map((especie) => [Number(especie.id), especie.nombre])
      )
      const nombresRazas = new Map(
        gruposRazas.flat().map((raza) => [Number(raza.id), raza.nombre])
      )
      const mascotasConNombres = mascotasDelCliente.map((mascota) => ({
        ...mascota,
        especie: nombresEspecies.get(Number(mascota.id_especie)) || '—',
        raza: nombresRazas.get(Number(mascota.id_raza)) || '—',
      }))

      setError(null)
      if (!clienteEncontrado) {
        setError('No se encontró el cliente solicitado.')
      }

      setCliente(clienteEncontrado || null)
      setMascotas(mascotasConNombres)
    } catch (err) {
      console.error('Error al cargar la ficha del cliente:', err)
      setError('Hubo un error al cargar la ficha del cliente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (clienteId) {
      Promise.resolve().then(() => fetchFicha(clienteId))
    }
  }, [clienteId])

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
          <p className="ficha-subtitulo">Direccion: {cliente.direccion || '—'}</p>
          <p className="ficha-subtitulo">Teléfono: {cliente.telefono}</p>
          <p className="ficha-subtitulo">Email: {cliente.email || '—'}</p>
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
                {/*<th>Peso</th>*/}
                <th>Género</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {mascotas.map((m) => (
                <tr key={m.id}>
                  <td>{m.nombre}</td>
                  <td>{m.especie}</td>
                  <td>{m.raza || '—'}</td>
                  <td>{calcularEdad(m.fecha_nacimiento)}</td>
                  {/*<td>{m.peso ? `${m.peso} kg` : '—'}</td>*/}
                  <td>{m.genero || '—'}</td>
                  <td>
                    <span className={`ficha-badge ${m.activo ? 'ficha-badge-ok' : 'ficha-badge-inactivo'}`}>
                      {m.activo ? 'Activa' : 'Inactiva'}
                    </span>                  
                  </td>
                  <td>
                  <button
                    type="button"
                    className='ficha-btn-historia'
                    onClick={() => navigate(`/historias-clinicas/${m.id}`)}
                  >
                    Historia clinica
                  </button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}