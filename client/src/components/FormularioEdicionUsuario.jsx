import { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:3000/users'

export default function FormularioEdicionUsuario({
  usuarioInicial,
  onClose,
  onUsuarioActualizado,
}) {
  const [formulario, setFormulario] = useState({
    usuario: '',
    email: '',
    password: '',
  })

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (usuarioInicial) {
      setFormulario({
        usuario: usuarioInicial.usuario || '',
        email: usuarioInicial.email || '',
        password: '',
      })
    }
  }, [usuarioInicial])

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!formulario.usuario.trim() || !formulario.email.trim()) {
      setError('El usuario y el email son obligatorios.')
      return
    }

    try {
      setGuardando(true)

      await axios.patch(
        `${API_URL}/datos/${usuarioInicial.id}`,
        {
          usuario: formulario.usuario,
          email: formulario.email,
          password: formulario.password || undefined,
        },
        {
          withCredentials: true,
        }
      )

      if (onUsuarioActualizado) {
        onUsuarioActualizado()
      }

      if (onClose) {
        onClose()
      }
    } catch (err) {
      console.error('Error al editar usuario:', err)

      setError(
        err.response?.data?.message ||
          'No se pudieron actualizar los datos del usuario.'
      )
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="formulario-usuario">
      <h2>Editar usuario</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
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
          <label htmlFor="password">
            Nueva contraseña
          </label>

          <input
            id="password"
            name="password"
            type="password"
            value={formulario.password}
            onChange={handleChange}
            placeholder="Dejar vacío para conservar la actual"
          />
        </div>

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
            disabled={guardando}
          >
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}