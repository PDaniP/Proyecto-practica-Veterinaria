import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:3000/clientes'
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/


export default function FormularioClientes({ clienteInicial, onClose }) {
  const esEdicion = Boolean(clienteInicial)

  const [cliente, setCliente] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
    telefono_alternativo: '',
    direccion: '',
    localidad: '',
    ciudad: '',
  })

  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)

  // Cargar datos del cliente a editar
  useEffect(() => {
    if (clienteInicial) {
      setCliente({
        nombre: clienteInicial.nombre || '',
        apellido: clienteInicial.apellido || '',
        dni: clienteInicial.dni || '',
        email: clienteInicial.email || '',
        telefono: clienteInicial.telefono || '',
        telefono_alternativo: clienteInicial.telefono_alternativo || '',
        direccion: clienteInicial.direccion || '',
        localidad: clienteInicial.localidad || '',
        ciudad: clienteInicial.ciudad || '',
      })
    }
  }, [clienteInicial])

  const handleChange = (e) => {
    const { name, value } = e.target
    setCliente((prev) => ({ ...prev, [name]: value }))
  }

  const validar = () => {
    const nuevosErrores = {}

    if (!cliente.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio.'
    if (!cliente.apellido.trim()) nuevosErrores.apellido = 'El apellido es obligatorio.'
    if (!cliente.dni.trim()) nuevosErrores.dni = 'El DNI es obligatorio.'
    if (!cliente.telefono.trim()) nuevosErrores.telefono = 'El teléfono es obligatorio.'
    if (!cliente.localidad.trim()) nuevosErrores.localidad = 'La localidad es obligatoria.'
    if (!cliente.ciudad.trim()) nuevosErrores.ciudad = 'La ciudad es obligatoria.'

    // Email es opcional, pero si lo cargan tiene que tener formato válido
    if (cliente.email.trim() && !EMAIL_REGEX.test(cliente.email.trim())) {
      nuevosErrores.email = 'Ingrese un email válido.'
    }

    return nuevosErrores
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const erroresValidacion = validar()
    setErrores(erroresValidacion)
    if (Object.keys(erroresValidacion).length > 0) return

    setEnviando(true)
    try {
      if (esEdicion) {
        await axios.put(`${API_URL}/editar/${clienteInicial.id}`, cliente, {
          withCredentials: true,
        })
        alert('Cliente actualizado correctamente.')
      } else {
        await axios.post(`${API_URL}/add`, cliente, { withCredentials: true })
        alert('Cliente registrado correctamente.')

        setCliente({
          nombre: '',
          apellido: '',
          dni: '',
          email: '',
          telefono: '',
          telefono_alternativo: '',
          direccion: '',
          localidad: '',
          ciudad: '',
        })
      }

      setErrores({})
      onClose()
    } catch (error) {
      console.error('Error al guardar el cliente:', error)
      alert('Hubo un error al guardar el cliente. Por favor, inténtelo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  useEffect(() => {
    const styleId = 'formulario-clientes-styles'
    if (!document.getElementById(styleId)) {
      const styleTag = document.createElement('style')
      styleTag.id = styleId
      styleTag.textContent = formStyles
      document.head.appendChild(styleTag)
    }
  }, [])

  return (
    <div className="card">
      <h2 className="card-title">{esEdicion ? 'Editar Cliente' : 'Registrar Cliente'}</h2>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="nombre">
            Nombre <span className="obligatorio">*</span>
          </label>
          <input
            id="nombre"
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={cliente.nombre}
            onChange={handleChange}
          />
          {errores.nombre && <p className="error">{errores.nombre}</p>}
        </div>

        <div className="field">
          <label htmlFor="apellido">
            Apellido <span className="obligatorio">*</span>
          </label>
          <input
            id="apellido"
            type="text"
            name="apellido"
            placeholder="Apellido"
            value={cliente.apellido}
            onChange={handleChange}
          />
          {errores.apellido && <p className="error">{errores.apellido}</p>}
        </div>

        <div className="field">
          <label htmlFor="dni">
            DNI <span className="obligatorio">*</span>
          </label>
          <input
            id="dni"
            type="text"
            name="dni"
            placeholder="DNI"
            value={cliente.dni}
            onChange={handleChange}
          />
          {errores.dni && <p className="error">{errores.dni}</p>}
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Email"
            value={cliente.email}
            onChange={handleChange}
          />
          {errores.email && <p className="error">{errores.email}</p>}
        </div>

        <div className="field">
          <label htmlFor="telefono">
            Teléfono <span className="obligatorio">*</span>
          </label>
          <input
            id="telefono"
            type="text"
            name="telefono"
            placeholder="Teléfono"
            value={cliente.telefono}
            onChange={handleChange}
          />
          {errores.telefono && <p className="error">{errores.telefono}</p>}
        </div>

        <div className="field">
          <label htmlFor="telefono_alternativo">Teléfono alternativo</label>
          <input
            id="telefono_alternativo"
            type="text"
            name="telefono_alternativo"
            placeholder="Teléfono alternativo"
            value={cliente.telefono_alternativo}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label htmlFor="direccion">Dirección</label>
          <input
            id="direccion"
            type="text"
            name="direccion"
            placeholder="Dirección"
            value={cliente.direccion}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label htmlFor="localidad">
            Localidad <span className="obligatorio">*</span>
          </label>
          <input
            id="localidad"
            type="text"
            name="localidad"
            placeholder="Localidad"
            value={cliente.localidad}
            onChange={handleChange}
          />
          {errores.localidad && <p className="error">{errores.localidad}</p>}
        </div>

        <div className="field">
          <label htmlFor="ciudad">
            Ciudad <span className="obligatorio">*</span>
          </label>
          <input
            id="ciudad"
            type="text"
            name="ciudad"
            placeholder="Ciudad"
            value={cliente.ciudad}
            onChange={handleChange}
          />
          {errores.ciudad && <p className="error">{errores.ciudad}</p>}
        </div>

        <button className="btn" type="submit" disabled={enviando}>
          {enviando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Guardar'}
        </button>
      </form>
    </div>
  )
}

const formStyles = `
.card {
  background: #fff;
  border-radius: 16px;
  padding: 36px 32px;
  width: 100%;
  max-width: 720px;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  box-shadow: 0 0 40px rgba(255, 255, 255, 0.35);
}

.card-title {
  font-size: 40px;
  font-weight: 500;
  color: #111;
  text-align: center;
  margin: 0 0 4px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.field label {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.obligatorio {
  color: #dc2626;
  font-weight: 700;
}

.field input,
.field select,
.field textarea {
  color: #111;
  flex: 1;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  padding: 10px 12px;
  font-size: 13px;
}

.field .hint {
  font-size: 11px;
  color: #6b7280;
  margin: 2px 0 0;
}

.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  margin-top: 4px;
}

.btn {
  width: 100%;
  height: 42px;
  background: #534ab7;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
`