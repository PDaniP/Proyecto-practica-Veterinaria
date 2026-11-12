import { useEffect, useState } from 'react'
import api from "../../../config/api.js"
import { normalizarTexto } from "../../utils/normalizarTexto.js"
import Modal from '../../components/Modal.jsx'
import FormularioAltaUsuario from '../../components/FormularioAltaUsuario.jsx'
import useSystemFeedback from '../../hooks/useSystemFeedback.js'
import './PanelControl.css'


const API_URL = 'users'
const obtenerUsuarios = () =>
  api.get(`${API_URL}/lista`, { withCredentials: true })

export default function PanelControl() {
  const { confirmarAccion } = useSystemFeedback()
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [errorEstado, setErrorEstado] = useState('')
  const [actualizandoEstado, setActualizandoEstado] = useState({})
  const [restableciendoContrasena, setRestableciendoContrasena] = useState({})
  const [mensajeContrasena, setMensajeContrasena] = useState('')
  const [errorContrasena, setErrorContrasena] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  const cargarUsuarios = async () => {
    try {
      setCargando(true)
      setError('')
      const response = await obtenerUsuarios()
      setUsuarios(response.data.usuarios || [])
    } catch (err) {
      console.error('Error al cargar usuarios:', err)
      setError('No se pudieron cargar los usuarios.')
    } finally {
      setCargando(false)
    }
  }

  const restablecerContrasena = async (usuario) => {
    const confirmar = await confirmarAccion(
      `¿Restablecer la contraseña de ${usuario.nombre} a "temp123"?`,
      { variante: 'warning', textoConfirmar: 'Restablecer' },
    )
    if (!confirmar) return

    setMensajeContrasena('')
    setErrorContrasena('')
    setRestableciendoContrasena((actuales) => ({
      ...actuales,
      [usuario.id]: true,
    }))
    try {
      await api.patch(
        `${API_URL}/restablecer-contrasena/${usuario.id}`,
        {},
        { withCredentials: true },
      )
      setMensajeContrasena(
        `La contraseña de ${usuario.nombre} se restableció a "temp123".`,
      )
    } catch (err) {
      console.error('Error al restablecer la contraseña:', err)
      setErrorContrasena(
        err.response?.data?.message || 'No se pudo restablecer la contraseña.',
      )
    } finally {
      setRestableciendoContrasena((actuales) => ({
        ...actuales,
        [usuario.id]: false,
      }))
    }
  }

  useEffect(() => {
    let activo = true
    obtenerUsuarios()
      .then((response) => {
        if (activo) setUsuarios(response.data.usuarios || [])
      })
      .catch((err) => {
        console.error('Error al cargar usuarios:', err)
        if (activo) setError('No se pudieron cargar los usuarios.')
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [])

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const texto = normalizarTexto(busqueda)

    if (!texto) return true

    return [usuario.nombre, usuario.usuario, usuario.email, usuario.rol]
      .some((dato) => normalizarTexto(dato).includes(texto))
  })

  const cambiarEstado = async (usuario) => {
    setErrorEstado('')
    setActualizandoEstado((actuales) => ({ ...actuales, [usuario.id]: true }))
    try {
      const response = await api.patch(
        `${API_URL}/estado/${usuario.id}`,
        { activo: !usuario.activo },
        { withCredentials: true },
      )
      setUsuarios((actuales) =>
        actuales.map((actual) =>
          actual.id === usuario.id
            ? { ...actual, activo: response.data.user.activo }
            : actual,
        ),
      )
    } catch (err) {
      console.error('Error al cambiar el estado del usuario:', err)
      setErrorEstado(
        err.response?.data?.message || 'No se pudo cambiar el estado del usuario.',
      )
    } finally {
      setActualizandoEstado((actuales) => ({
        ...actuales,
        [usuario.id]: false,
      }))
    }
  }

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
        <>
          {errorEstado && (
            <p className="usuarios-error" role="alert">{errorEstado}</p>
          )}
          {mensajeContrasena && (
            <p className="usuarios-status" role="status" aria-live="polite">
              <span className="usuarios-status__icon" aria-hidden="true">✓</span>
              <span>
                {mensajeContrasena}
                <small>El usuario ya puede ingresar con esta contraseña.</small>
              </span>
            </p>
          )}
          {errorContrasena && (
            <p className="usuarios-reset-error" role="alert">
              {errorContrasena}
            </p>
          )}
          <div className="usuarios-tabla-wrapper">
            <table className="usuarios-tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Contraseña</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((usuario) => {
                  const esAdministrador =
                    usuario.rol?.trim().toLowerCase() === 'administrador'
                  const estaActualizando = Boolean(actualizandoEstado[usuario.id])

                  return (
                    <tr key={usuario.id}>
                      <td>{usuario.nombre}</td>
                      <td>{usuario.usuario}</td>
                      <td>{usuario.email}</td>
                      <td>{usuario.rol}</td>
                      <td>
                        <button
                          type="button"
                          className="usuario-reset"
                          onClick={() => restablecerContrasena(usuario)}
                          disabled={
                            esAdministrador ||
                            Boolean(restableciendoContrasena[usuario.id])
                          }
                          aria-busy={Boolean(restableciendoContrasena[usuario.id])}
                          title={
                            esAdministrador
                              ? 'No se puede restablecer la contraseña de un administrador'
                              : 'Restablecer contraseña a temp123'
                          }
                        >
                          Reset
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`usuario-estado ${usuario.activo ? 'activo' : 'inactivo'}`}
                          onClick={() => cambiarEstado(usuario)}
                          disabled={esAdministrador || estaActualizando}
                          aria-busy={estaActualizando}
                          aria-label={`${usuario.activo ? 'Desactivar' : 'Activar'} usuario ${usuario.nombre}`}
                          title={
                            esAdministrador
                              ? 'No se puede cambiar el estado de un administrador'
                              : `Cambiar a ${usuario.activo ? 'inactivo' : 'activo'}`
                          }
                        >
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
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