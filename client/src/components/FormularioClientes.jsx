import { useState, useEffect } from 'react'
import axios from 'axios' // Podés borrar esto si usás solo tu instancia 'api'
import api from "../../config/api.js";
import useSystemFeedback from "../hooks/useSystemFeedback.js";

// const API_URL = 'http://localhost:3000/clientes'
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function FormularioClientes({ clienteInicial, onClose, onEliminar }) {
  const { mostrarAlerta } = useSystemFeedback();
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
    recibe_notificaciones: false, // Nuevo campo
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
        recibe_notificaciones: Boolean(clienteInicial.recibe_notificaciones), // Nuevo campo
      })
    }
  }, [clienteInicial])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setCliente((prev) => ({ 
      ...prev, 
      // Si es checkbox guarda el booleano 'checked', sino el texto 'value'
      [name]: type === 'checkbox' ? checked : value 
    }))
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
        await api.put(`clientes/editar/${clienteInicial.id}`, cliente)
        await mostrarAlerta('Cliente actualizado correctamente.', { variante: 'success' })
      } else {
        await api.post(`clientes/add`, cliente)
        await mostrarAlerta('Cliente registrado correctamente.', { variante: 'success' })

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
          recibe_notificaciones: false,
        })
      }

      setErrores({})
      onClose()
    } catch (error) {
      console.error('Error al guardar el cliente:', error)
      await mostrarAlerta('Hubo un error al guardar el cliente. Por favor, inténtelo de nuevo.', { variante: 'error' })
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
    <div className="formulario-clientes">
      <div className="card formulario-clientes-card">
        <h2 className="card-title">{esEdicion ? 'Editar Cliente' : 'Registrar Cliente'}</h2>

      <form className="formulario-clientes-form" onSubmit={handleSubmit}>
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

        {/* NUEVO CAMPO: Checkbox de notificaciones */}
        <div className="formulario-clientes__preferencias-acciones">
          <div className="field checkbox-field">
            <label htmlFor="recibe_notificaciones" className="checkbox-label">
              <input
                id="recibe_notificaciones"
                type="checkbox"
                name="recibe_notificaciones"
                checked={cliente.recibe_notificaciones}
                onChange={handleChange}
              />
              Desea recibir notificaciones por WhatsApp
            </label>
          </div>

          <div className="formulario-clientes__acciones">
            <button
              className="producto-form__guardar"
              type="submit"
              disabled={enviando}
            >
              {enviando ? 'Guardando...' : 'Guardar'}
            </button>
            {esEdicion && onEliminar && (
              <button
                className="formulario-clientes__eliminar"
                type="button"
                onClick={onEliminar}
              >
                Eliminar
              </button>
            )}
          </div>
        </div>
      </form>
      </div>
    </div>
  )
}

const formStyles = `
.modal:has(.formulario-clientes) {
  overflow-y: auto;
}

.modal:has(.formulario-clientes) .modal__content {
  padding-top: 4px;
}

.formulario-clientes .formulario-clientes-card {
  box-sizing: border-box;
  background: #fff;
  border-radius: 16px;
  padding: 18px 32px 36px;
  width: 100%;
  max-width: 720px;
  max-height: none;
  overflow: visible;
  margin: 0 auto;
  -webkit-overflow-scrolling: touch;
  box-shadow: 0 0 40px rgba(255, 255, 255, 0.35);
}

.formulario-clientes .card-title {
  font-size: 40px;
  font-weight: 500;
  color: #111;
  text-align: center;
  margin: 0 0 16px;
}

.formulario-clientes-form {
  display: flex;
  flex-direction: column;
}

.formulario-clientes .field {
  display: grid;
  grid-template-columns: minmax(125px, 0.3fr) minmax(0, 1fr);
  align-items: center;
  gap: 6px 12px;
  margin-bottom: 14px;
}

.formulario-clientes .field > label {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.formulario-clientes .obligatorio {
  color: #dc2626;
  font-weight: 700;
}

.formulario-clientes .field input:not([type="checkbox"]),
.formulario-clientes .field select,
.formulario-clientes .field textarea {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  color: #111;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  padding: 10px 12px;
  font-size: 13px;
}

.formulario-clientes .field .error {
  grid-column: 2;
}

.formulario-clientes__preferencias-acciones {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 8px;
}

.formulario-clientes .checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px !important;
}

.formulario-clientes .checkbox-field {
  display: flex;
  flex: 1;
  min-width: 0;
  margin: 0;
}

.formulario-clientes__preferencias-acciones .checkbox-label {
  grid-column: auto;
}

.formulario-clientes .checkbox-field input[type="checkbox"] {
  flex: none; /* Para que el checkbox no intente ocupar todo el ancho */
  width: 16px;
  height: 16px;
  cursor: pointer;
  margin: 0;
}

.formulario-clientes .field .hint {
  font-size: 11px;
  color: #6b7280;
  margin: 2px 0 0;
}

.formulario-clientes .error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  margin-top: 4px;
}

.formulario-clientes__acciones {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.formulario-clientes__eliminar {
  box-sizing: border-box;
  width: 140px;
  min-width: 140px;
  height: 42px;
  min-height: 42px;
  margin: 0;
  padding: 0 12px;
  border: 1.5px solid var(--danger, #a32d2d);
  border-radius: 8px;
  background: transparent;
  color: var(--danger, #a32d2d);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.15s;
}

.formulario-clientes__eliminar:hover {
  transform: translateY(-1px);
  background: var(--danger, #a32d2d);
  color: #fff;
}

.formulario-clientes .producto-form__guardar {
  box-sizing: border-box;
  width: 140px;
  min-width: 140px;
  height: 42px;
  min-height: 42px;
  padding: 0 20px;
  border: 0;
  border-radius: 8px;
  background: var(--vet-purple, #7d1f99);
  color: #fff;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(125, 31, 153, 0.25);
}

.formulario-clientes .producto-form__guardar:hover:not(:disabled) {
  background: var(--vet-purple-light, #9b3db8);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(125, 31, 153, 0.3);
}

.formulario-clientes .producto-form__guardar:active:not(:disabled) {
  transform: scale(0.98);
}

.formulario-clientes .producto-form__guardar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .formulario-clientes .formulario-clientes-card {
    padding: 16px 18px 24px;
  }

  .formulario-clientes .card-title {
    font-size: 30px;
  }

  .formulario-clientes .field {
    grid-template-columns: minmax(105px, 0.45fr) minmax(0, 1fr);
    column-gap: 8px;
  }
}

@media (max-width: 480px) {
  .formulario-clientes__preferencias-acciones {
    flex-wrap: wrap;
  }

  .formulario-clientes .checkbox-field {
    flex-basis: 100%;
  }

  .formulario-clientes__acciones {
    width: 100%;
  }

  .formulario-clientes__acciones > button {
    min-width: 0;
    flex: 1;
    padding-right: 8px;
    padding-left: 8px;
    font-size: 0.78rem;
  }

  .formulario-clientes .formulario-clientes__acciones > .producto-form__guardar {
    min-width: 0;
  }
}
`