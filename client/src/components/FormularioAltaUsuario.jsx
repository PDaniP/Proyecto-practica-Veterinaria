import { useEffect, useState } from "react";
import axios from 'axios'

const API_URL = 'http://localhost:3000/users'

const formularioInicial = {
    nombre: '',
    usuario: '',
    email: '',
    password: '',
    rol: '',
    activo: true,
}

export default function FormularioAltaUsuario({
  onClose,
  onUsuarioCreado,
}) {
  const [formulario, setFormulario] = useState(formularioInicial)
  const [roles, setRoles] = useState([])
  const [cargandoRoles, setCargandoRoles] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarRoles()
  }, [])

  const cargarRoles = async () => {
    try {
      const response = await axios.get(`${API_URL}/roles`, {
        withCredentials: true,
      })

      setRoles(response.data.roles || [])
    } catch (err) {
      console.error('Error al cargar roles:', err)
      setError('No se pudieron cargar los roles disponibles.')
    } finally {
      setCargandoRoles(false)
    }
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target

    setFormulario((actual) => ({
      ...actual,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!formulario.rol) {
      setError('Debe seleccionar un rol.')
      return
    }

    try {
      setGuardando(true)

      const datosUsuario = {
        ...formulario,
        rol: Number(formulario.rol),
      }

      await axios.post(`${API_URL}/add`, datosUsuario, {
        withCredentials: true,
      })

      setFormulario(formularioInicial)

      if (onUsuarioCreado) {
        onUsuarioCreado()
      }

      if (onClose) {
        onClose()
      }
    } catch (err) {
      console.error('Error al crear usuario:', err)

      setError(
        err.response?.data?.message ||
          'No se pudo crear el usuario.'
      )
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="formulario-usuario">
      <h2>Agregar Usuario</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="nombre">Nombre completo</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={formulario.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="usuario">Usuario</label>
          <input
            id="usuario"
            name="usuario"
            type="text"
            value={formulario.usuario}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formulario.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formulario.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="rol">Rol</label>

          <select
            id="rol"
            name="rol"
            value={formulario.rol}
            onChange={handleChange}
            disabled={cargandoRoles}
            required
          >
            <option value="">
              {cargandoRoles
                ? 'Cargando roles...'
                : 'Seleccionar rol'}
            </option>

            {roles.map((rol) => (
              <option key={rol.id} value={rol.id}>
                {rol.nombre}
              </option>
            ))}
          </select>
        </div>

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="activo"
            checked={formulario.activo}
            onChange={handleChange}
          />
          Usuario activo
        </label>

        <div className="formulario-acciones">
          {onClose && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={guardando || cargandoRoles}
          >
            {guardando ? 'Guardando...' : 'Guardar Usuario'}
          </button>
        </div>
      </form>
    </div>
  )
}