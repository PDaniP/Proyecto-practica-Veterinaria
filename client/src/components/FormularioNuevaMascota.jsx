import { useEffect, useState } from "react";
import axios from "axios";
import api from "../../config/api.js";
import { normalizarTexto } from "../utils/normalizarTexto.js";
import useSystemFeedback from "../hooks/useSystemFeedback.js";

export default function FormularioNuevaMascota({ onClose }) {
  const { mostrarAlerta } = useSystemFeedback();
  const [tipoDueño, setTipoDueño] = useState("");
  const [tieneChip, setTieneChip] = useState(false);
  const [dueño, setDueño] = useState("");
  const [idCliente, setIdCliente] = useState("");
  const [dueños, setDueños] = useState([]);
  const [busquedaDueño, setBusquedaDueño] = useState("");
  const [errorDueños, setErrorDueños] = useState("");
  const [mascota, setMascota] = useState({
    nombre: "",
    id_especie: "",
    id_raza: "",
    fecha_nacimiento: "",
    genero: "",
    numero_chip: "",
    observaciones: "",
  });
  const [especies, setEspecies] = useState([]);
  const [razas, setRazas] = useState([]);
  const [errorEspecies, setErrorEspecies] = useState("");

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
    api
      .get("clientes", { withCredentials: true })
      .then((response) => setDueños(response.data.clientes ?? []))
      .catch(() => setErrorDueños("No se pudieron cargar los dueños."));
  }, []);

  const dueñosFiltrados = dueños.filter((cliente) => {
    const nombreCompleto = `${cliente.nombre} ${cliente.apellido} ${cliente.dni}`;
    return normalizarTexto(nombreCompleto).includes(
      normalizarTexto(busquedaDueño),
    );
  });

  useEffect(() => {
    api
      .get("especies", { withCredentials: true })
      .then((response) => setEspecies(response.data.especies ?? []))
      .catch(() => setErrorEspecies("No se pudo cargar las especies"));
  }, []);

  const cambiarTipoDueño = (event) => {
    const tipo = event.target.value;
    setTipoDueño(tipo);
    setBusquedaDueño("");
    setIdCliente("");

    if (tipo === "sin-dueño") {
      setDueño("sin dueño");
      setIdCliente(2);
    } else {
      setDueño("");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setMascota((actual) => ({ ...actual, [name]: value }));
  };

  const handleGeneroChange = (generoSeleccionado) => {
    setMascota((actual) => ({
      ...actual,
      genero: actual.genero === generoSeleccionado ? "" : generoSeleccionado,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!idCliente) {
      mostrarAlerta("Seleccione un dueño para registrar la mascota.", { variante: "warning" });
      return;
    }

    if (
      !mascota.nombre.trim() ||
      !mascota.id_especie ||
      !mascota.id_raza ||
      !mascota.fecha_nacimiento ||
      !mascota.genero
    ) {
      mostrarAlerta("Complete todos los campos obligatorios de la mascota.", { variante: "warning" });
      return;
    }

    const mascotaFormateada = {
      id_cliente: Number(idCliente),
      nombre: mascota.nombre,
      id_especie: Number(mascota.id_especie),
      id_raza: Number(mascota.id_raza),
      fecha_nacimiento: mascota.fecha_nacimiento,
      genero: mascota.genero,
      peso: null,
      activo: true,
      numero_chip: tieneChip ? mascota.numero_chip || null : null,
      observaciones: mascota.observaciones,
    };

    try {
      await api.post(
        "mascotas/add",
        mascotaFormateada,
        { withCredentials: true },
      );

      await mostrarAlerta("Mascota registrada correctamente.", { variante: "success" });
      onClose?.();
    } catch (error) {
      console.error("Error al registrar la mascota:", error);
      await mostrarAlerta("No se pudo registrar la mascota.", { variante: "error" });
    }
  };

  const cambiarEspecie = async (event) => {
    const idEspecie = event.target.value;
    const especieSeleccionada = especies.find(
      (especie) => String(especie.id) === idEspecie,
    );

    setMascota((actual) => ({
      ...actual,
      id_especie: especieSeleccionada?.id || "",
      id_raza: "",
    }));

    setRazas([]);

    if (!idEspecie) return;

    try {
      const response = await api.get(
        `especies/${idEspecie}/razas`,
        { withCredentials: true },
      );

      setRazas(response.data.razas ?? []);
    } catch {
      setRazas([]);
    }
  };

  const cambiarRaza = (event) => {
    const idRaza = event.target.value;
    const razaSeleccionada = razas.find((raza) => String(raza.id) === idRaza);

    setMascota((actual) => ({
      ...actual,
      raza: razaSeleccionada?.nombre || "",
      id_raza: razaSeleccionada ? Number(razaSeleccionada.id) : "",
    }));
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
            <select
              className="form-control"
              id="especie"
              value={mascota.id_especie}
              onChange={cambiarEspecie}
              required
            >
              <option value="">Seleccione una especie</option>
              {especies.map((especie) => (
                <option key={especie.id} value={especie.id}>
                  {especie.nombre}
                </option>
              ))}
            </select>
            {errorEspecies && <p>{errorEspecies}</p>}
          </div>

          <div className="field">
            <label htmlFor="raza">Raza</label>
            <select
              className="form-control"
              id="raza"
              name="raza"
              value={mascota.id_raza}
              onChange={cambiarRaza}
              disabled={!mascota.id_especie || razas.length === 0}
              required
            >
              <option value="">Seleccione una raza</option>
              {razas.map((raza) => (
                <option key={raza.id} value={raza.id}>
                  {raza.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="field sexo-field">
            <label className="sexo-label">Sexo</label>
            <div className="sexo-options">
              <label htmlFor="generoMacho" className="sexo-option">
                <span>M</span>
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="generoMacho"
                  checked={mascota.genero === "Macho"}
                  onChange={() => handleGeneroChange("Macho")}
                />
              </label>

              <label htmlFor="generoHembra" className="sexo-option">
                <span>F</span>
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="generoHembra"
                  checked={mascota.genero === "Hembra"}
                  onChange={() => handleGeneroChange("Hembra")}
                />
              </label>
            </div>
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

          <div className="pet-form__actions">
            <button type="submit" className="btn btn-primary">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const formStyles = `
.modal:has(.pet-form-container) {
  overflow-y: auto;
}

.modal:has(.pet-form-container) .modal__content {
  padding-top: 10px;
}

.pet-form-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.pet-form-container .card {
  box-sizing: border-box;
  background: #fff;
  border-radius: 16px;
  padding: 24px 32px 36px;
  width: 100%;
  max-width: 720px;
  max-height: none;
  margin: 0 auto;
}

.pet-form-container .card-title {
  margin: 0 0 12px;
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
  display: grid;
  grid-template-columns: minmax(140px, 0.35fr) minmax(0, 1fr);
  align-items: center;
  gap: 6px 12px;
  margin-bottom: 10px;
}

.pet-form-container .field label {
  color: #374151;
  font-size: 12px;
  font-weight: 500;
}

.pet-form-container .field input:not([type="checkbox"]),
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

.pet-form-container .field > p {
  grid-column: 2;
  margin: 0;
}

.pet-form-container input[type="date"] {
  color-scheme: light;
}

.pet-form-container input[type="date"]::-webkit-calendar-picker-indicator {
  filter: brightness(0);
  opacity: 1;
  cursor: pointer;
}

.pet-form-container .field textarea {
  min-height: 81px;
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
  grid-template-columns: minmax(140px, 0.35fr) minmax(0, 1fr);
}

.pet-form-container .checkbox-field input[type="checkbox"],
.pet-form-container .sexo-option input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #534ab7;
}

.pet-form-container .sexo-field {
  grid-template-columns: minmax(140px, 0.35fr) minmax(0, 1fr);
}

.pet-form-container .sexo-label {
  margin: 0;
}

.pet-form-container .sexo-options {
  grid-column: 2;
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

.pet-form-container .sexo-option {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #374151;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.pet-form-container .owner-search-field {
  grid-column: 1 / -1;
  grid-template-columns: minmax(140px, 0.35fr) minmax(0, 1fr);
  position: relative;
  margin-top: 4px;
}

.pet-form-container .owner-search-field > p {
  grid-column: 2;
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

.pet-form-container .pet-form__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}

.pet-form-container .pet-form__actions .btn {
  box-sizing: border-box;
  width: 140px;
  min-width: 140px;
  height: 42px;
  margin: 0;
  padding: 0 20px;
  color: #fff;
  border: none;
  border-radius: 8px;
  background: var(--vet-purple, #7d1f99);
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(125, 31, 153, 0.25);
}

.pet-form-container .pet-form__actions .btn:hover {
  background: var(--vet-purple-light, #9b3db8);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(125, 31, 153, 0.3);
}

@media (max-width: 600px) {
  .pet-form-container .card {
    padding: 18px 18px 24px;
  }

  .pet-form-container .card-title {
    font-size: 32px;
  }

  .pet-form-container .field,
  .pet-form-container .checkbox-field,
  .pet-form-container .sexo-field,
  .pet-form-container .owner-search-field {
    grid-template-columns: minmax(100px, 0.4fr) minmax(0, 1fr);
    column-gap: 8px;
  }
}
`;
