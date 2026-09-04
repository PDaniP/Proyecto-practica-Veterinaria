import { useEffect, useState } from "react";
import axios from "axios";

export default function FormularioNuevaMascota({ onClose }) {
  const [tipoDueño, setTipoDueño] = useState("");
  const [tieneChip, setTieneChip] = useState(false);
  const [dueño, setDueño] = useState("");
  const [idCliente, setIdCliente] = useState("");
  const [dueños, setDueños] = useState([]);
  const [busquedaDueño, setBusquedaDueño] = useState("");
  const [errorDueños, setErrorDueños] = useState("");
  const [mascota, setMascota] = useState({
    nombre: "",
    especie: "",
    raza: "",
    fecha_nacimiento: "",
    peso: "",
    genero: "",
    numero_chip: "",
    observaciones: "",
  });

  useEffect(() => {
    const styleId = "formulario-nueva-mascota-styles";

    if (!document.getElementById(styleId)) {
      const styleTag = document.createElement("style");
      styleTag.id = styleId;
      styleTag.textContent = formStyles;
      document.head.appendChild(styleTag);
    }

    return () => {
      document.getElementById(styleId)?.remove();
    };
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:3000/clientes")
      .then((response) => setDueños(response.data.clientes ?? []))
      .catch(() => setErrorDueños("No se pudieron cargar los dueños."));
  }, []);

  const dueñosFiltrados = dueños.filter((cliente) => {
    const nombreCompleto = `${cliente.nombre} ${cliente.apellido} ${cliente.dni}`;
    return nombreCompleto.toLowerCase().includes(busquedaDueño.toLowerCase());
  });

  const cambiarTipoDueño = (event) => {
    const tipo = event.target.value;
    setTipoDueño(tipo);
    setBusquedaDueño("");
    setIdCliente("");

    if (tipo === "sin-dueño") {
      setDueño("sin dueño");
    } else {
      setDueño("");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setMascota((actual) => ({ ...actual, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!idCliente) {
      alert("Seleccione un dueño para registrar la mascota.");
      return;
    }

    if (
      !mascota.nombre.trim() ||
      !mascota.especie.trim() ||
      !mascota.raza.trim() ||
      !mascota.fecha_nacimiento ||
      !mascota.peso ||
      !mascota.genero
    ) {
      alert("Complete todos los campos obligatorios de la mascota.");
      return;
    }

    const mascotaFormateada = {
      id_cliente: Number(idCliente),
      ...mascota,
      peso: Number(mascota.peso),
      numero_chip: tieneChip ? mascota.numero_chip || null : null,
    };

    try {
      await axios.post(
        "http://localhost:3000/mascotas/add",
        mascotaFormateada,
        { withCredentials: true },
      );

      alert("Mascota registrada correctamente.");
      onClose?.();
    } catch (error) {
      console.error("Error al registrar la mascota:", error);
      alert("No se pudo registrar la mascota.");
    }
  };

  return (
    <div className="pet-form-container">
      <div className="card">
        <h2 className="card-title">Nueva Mascota</h2>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              className="form-control"
              id="nombre"
              name="nombre"
              value={mascota.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="especie">Especie</label>
            <input
              type="text"
              className="form-control"
              id="especie"
              name="especie"
              value={mascota.especie}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="raza">Raza</label>
            <input
              type="text"
              className="form-control"
              id="raza"
              name="raza"
              value={mascota.raza}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="sexo">Sexo</label>
            <input
              type="text"
              className="form-control"
              id="sexo"
              name="genero"
              value={mascota.genero}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
            <input
              type="date"
              className="form-control"
              id="fechaNacimiento"
              name="fecha_nacimiento"
              value={mascota.fecha_nacimiento}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="peso">Peso (kg)</label>
            <input
              type="number"
              className="form-control"
              id="peso"
              name="peso"
              min="0"
              step="0.01"
              value={mascota.peso}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field owner-field">
            <label htmlFor="tipoDueño">Dueño</label>
            <select
              className="form-control"
              id="tipoDueño"
              value={tipoDueño}
              onChange={cambiarTipoDueño}
            >
              <option value="">Seleccione una opción</option>
              <option value="buscar-dueño">Buscar dueño</option>
              <option value="sin-dueño">Sin dueño</option>
            </select>

            {tipoDueño === "buscar-dueño" && (
              <div className="field owner-search-field">
                <label htmlFor="busquedaDueño">Buscar dueño</label>
                <input
                  type="search"
                  className="form-control"
                  id="busquedaDueño"
                  placeholder="Nombre, apellido o DNI"
                  value={busquedaDueño}
                  onChange={(event) => {
                    setBusquedaDueño(event.target.value);
                    setDueño("");
                  }}
                />
                {errorDueños && <p>{errorDueños}</p>}
                {busquedaDueño && !dueño && (
                  <ul className="suggestions">
                    {dueñosFiltrados.length === 0 ? (
                      <li className="suggestion-item">
                        No se encontraron dueños
                      </li>
                    ) : (
                      dueñosFiltrados.map((cliente) => (
                        <li key={cliente.id} className="suggestion-item">
                          <button
                            type="button"
                            onClick={() => {
                              setDueño(`${cliente.nombre} ${cliente.apellido}`);
                              setIdCliente(cliente.id);
                              setBusquedaDueño(
                                `${cliente.nombre} ${cliente.apellido}`,
                              );
                            }}
                          >
                            {cliente.nombre} {cliente.apellido} ({cliente.dni})
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            )}

            <input type="hidden" name="dueño" id="dueño" value={dueño} />
          </div>

          <div className="field checkbox-field">
            <label htmlFor="tieneChip">Tiene chip</label>
            <input
              type="checkbox"
              className="form-check-input"
              id="tieneChip"
              checked={tieneChip}
              onChange={(event) => setTieneChip(event.target.checked)}
            />
          </div>

          {tieneChip && (
            <div className="field">
              <label htmlFor="numeroChip">Número de chip</label>
              <input
                type="text"
                className="form-control"
                id="numeroChip"
                name="numero_chip"
                value={mascota.numero_chip}
                onChange={handleChange}
              />
            </div>
          )}
          
          <div className="field">
            <label htmlFor="observaciones">Observaciones</label>
            <textarea
              className="form-control"
              id="observaciones"
              name="observaciones"
              value={mascota.observaciones}
              onChange={handleChange}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary">
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
}

const formStyles = `
.pet-form-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.pet-form-container .card {
  box-sizing: border-box;
  background: #fff;
  border-radius: 16px;
  padding: 36px 32px;
  width: 100%;
  max-width: none;
  max-height: none;
  
}

.pet-form-container .card-title {
  margin: 0 0 25px;
  color: #111;
  font-size: 40px;
  font-weight: 500;
  text-align: center;
}

.pet-form-container .form {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.pet-form-container .field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pet-form-container .field label {
  color: #374151;
  font-size: 12px;
  font-weight: 500;
}

.pet-form-container .field input,
.pet-form-container .field select,
.pet-form-container .field textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 10px 12px;
  color: #111;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  font-size: 13px;
}

.pet-form-container .field textarea {
  min-height: 90px;
  resize: vertical;
}

.pet-form-container .field input:focus,
.pet-form-container .field select:focus,
.pet-form-container .field textarea:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.16);
}

.pet-form-container .checkbox-field {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.pet-form-container .checkbox-field input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #534ab7;
}

.pet-form-container .owner-search-field {
  position: relative;
  margin-top: 4px;
}

.pet-form-container .suggestions {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  left: 0;
  z-index: 2;
  max-height: 150px;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.pet-form-container .suggestion-item {
  padding: 10px 12px;
  color: #111;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
}

.pet-form-container .suggestion-item:last-child {
  border-bottom: none;
}

.pet-form-container .suggestion-item button {
  width: 100%;
  padding: 0;
  color: inherit;
  border: 0;
  background: transparent;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.pet-form-container .suggestion-item:hover {
  background: #f9fafb;
}

.pet-form-container .btn {
  width: 100%;
  height: 42px;
  margin-top: 10px;
  color: #fff;
  border: none;
  border-radius: 8px;
  background: #534ab7;
  cursor: pointer;
}

.pet-form-container .btn:hover {
  background: #4338a3;
}

@media (max-width: 600px) {
  .pet-form-container .card {
    padding: 24px 18px;
  }

  .pet-form-container .card-title {
    font-size: 32px;
  }
}
`;
