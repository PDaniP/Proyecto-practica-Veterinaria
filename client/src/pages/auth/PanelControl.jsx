import { useEffect, useState } from 'react'
import axios from 'axios'
import Modal from '../../components/Modal.jsx'
import FormularioAltaUsuario from '../../components/FormularioAltaUsuario.jsx'
import './PanelControl.css'

const API_URL = 'http://localhost:3000/users'

export default function PanelControl() {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  const cargarUsuarios = async () => {
    try {
      setCargando(true)
      setError('')
      const response = await axios.get(`${API_URL}/lista`, {
        withCredentials: true,
      })
      setUsuarios(response.data.usuarios || [])
    } catch (err) {
      console.error('Error al cargar usuarios:', err)
      setError('No se pudieron cargar los usuarios.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const texto = busqueda.trim().toLowerCase()

    if (!texto) return true

    return [usuario.nombre, usuario.usuario, usuario.email, usuario.rol]
      .some((dato) => dato?.toLowerCase().includes(texto))
  })

  return (
    <section className="page-shell panel-control-page">
      <div className="panel-control-toolbar">
        <h1>Panel de control</h1>

        <input
          className="panel-control-search"
          type="search"
          placeholder="Buscar por nombre, usuario, email o rol..."
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          aria-label="Buscar usuarios"
        />

        <button
          className="btn-primary"
          type="button"
          onClick={() => setModalAbierto(true)}
        >
          Nuevo Usuario
        </button>
      </div>

      {cargando ? (
        <p className="usuarios-loading">Cargando usuarios...</p>
      ) : error ? (
        <p className="usuarios-error">{error}</p>
      ) : usuarios.length === 0 ? (
        <p className="usuarios-empty">No hay usuarios registrados.</p>
      ) : usuariosFiltrados.length === 0 ? (
        <p className="usuarios-empty">No se encontraron usuarios.</p>
      ) : (
        <div className="usuarios-tabla-wrapper">
          <table className="usuarios-tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.nombre}</td>
                  <td>{usuario.usuario}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.rol}</td>
                  <td>
                    <span className={`usuario-estado ${usuario.activo ? 'activo' : 'inactivo'}`}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalAbierto} onClose={() => setModalAbierto(false)}>
        <FormularioAltaUsuario
          onClose={() => setModalAbierto(false)}
          onUsuarioCreado={cargarUsuarios}
        />
      </Modal>
    </section>
  )
}