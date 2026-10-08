import { useState } from "react";
import axios from "axios";
import CamposVacuna from "./CamposVacuna.jsx";
import {
  hoy,
  vacunaVacia,
} from "../utils/vacuna.js";
import "./FormulariosClinicos.css";
import { motivosConsulta } from "../utils/motivosConsulta.js";

export default function FormularioConsulta({ idMascota, nombreMascota, onClose, onGuardado }) {
  const [consulta, setConsulta] = useState({
    fecha_consulta: hoy(),
    peso: "",
    temperatura: "",
    motivo: "",
    diagnostico: "",
    tratamiento: "",
    observaciones: "",
  });
  const [aplicoVacuna, setAplicoVacuna] = useState(false);
  const [vacuna, setVacuna] = useState(vacunaVacia());
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const motivoSeleccionado = motivosConsulta.find(
    (motivo) => motivo.nombre === consulta.motivo
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "motivo") {
      setConsulta((actual) => ({
        ...actual,
        motivo: value,
        diagnostico: "",
      }));
      return;
    }

    setConsulta((actual) => ({ ...actual, [name]: value }));
  };

  const cambiarFechaConsulta = (event) => {
    const nueva = event.target.value;
    setConsulta((actual) => ({ ...actual, fecha_consulta: nueva }));
    setVacuna((actual) =>
      actual.fecha_aplicacion === consulta.fecha_consulta
        ? { ...actual, fecha_aplicacion: nueva }
        : actual,
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !consulta.fecha_consulta ||
      !consulta.motivo.trim() ||
      !consulta.diagnostico.trim() ||
      !consulta.tratamiento.trim()
    ) {
      setError("Complete fecha, motivo, diagnóstico y tratamiento.");
      return;
    }

    if (consulta.peso !== "" && Number(consulta.peso) <= 0) {
      setError("El peso debe ser mayor a 0.");
      return;
    }

    if (
      consulta.temperatura !== "" &&
      (Number(consulta.temperatura) < 30 || Number(consulta.temperatura) > 45)
    ) {
      setError("Revise la temperatura: debe estar entre 30 y 45 °C.");
      return;
    }

    setError("");
    setGuardando(true);

    const datos = {
      id_mascota: idMascota,
      fecha_consulta: consulta.fecha_consulta,
      peso_actual: consulta.peso === "" ? null : Number(consulta.peso),//paso de peso a peso_actual porque el server pedia peso_actual porque el controlador lo recibe como ausente
      temperatura:
        consulta.temperatura === "" ? null : Number(consulta.temperatura),
      motivo: consulta.motivo.trim(),
      diagnostico: consulta.diagnostico.trim(),
      tratamiento: consulta.tratamiento.trim(),
      observaciones: consulta.observaciones.trim() || null,
    };

    try {
      await axios.post(
        "http://localhost:3000/mascotas/historia/consulta",
        datos,
        { withCredentials: true },
      );

      await onGuardado?.();
      onClose?.();
    } catch (err) {
      console.error("Error al registrar la consulta:", err);
      setError(
        err.response?.data?.message || "No se pudo registrar la consulta.",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="cf-container">
      <h2 className="cf-titulo">Nueva consulta</h2>
      {nombreMascota && <p className="cf-subtitulo">Paciente: {nombreMascota}</p>}

      <form className="cf-form" onSubmit={handleSubmit}>
        <div className="cf-fila cf-fila-3">
          <div className="cf-campo">
            <label htmlFor="consulta-fecha">
              Fecha <span className="cf-obligatorio">*</span>
            </label>
            <input
              type="date"
              id="consulta-fecha"
              name="fecha_consulta"
              max={hoy()}
              value={consulta.fecha_consulta}
              onChange={cambiarFechaConsulta}
            />
          </div>

          <div className="cf-campo">
            <label htmlFor="consulta-peso">Peso (kg)</label>
            <input
              type="number"
              id="consulta-peso"
              name="peso"
              min="0"
              step="0.01"
              value={consulta.peso}
              onChange={handleChange}
            />
          </div>

          <div className="cf-campo">
            <label htmlFor="consulta-temperatura">Temperatura (°C)</label>
            <input
              type="number"
              id="consulta-temperatura"
              name="temperatura"
              min="30"
              max="45"
              step="0.1"
              value={consulta.temperatura}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="cf-campo">
          <label htmlFor="consulta-motivo">
            Motivo de la consulta <span className="cf-obligatorio">*</span>
          </label>
          <select name="motivo" id="consulta-motivo" value={consulta.motivo} onChange={handleChange}>
            <option value="">Seleccione un motivo</option>
            {motivosConsulta.map((motivo) => (
              <option value={motivo.nombre} key={motivo.id}>
                {motivo.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="cf-campo">
          <label htmlFor="consulta-diagnostico">
            Diagnóstico <span className="cf-obligatorio">*</span>
          </label>

          <select name="diagnostico" id="consulta-diagnostico" value={consulta.diagnostico} onChange={handleChange} disabled={!motivoSeleccionado}>
            <option value="">
              {motivoSeleccionado ? "Seleccione un diagnostico" : "Primero seleccione un motivo"}
            </option>

            {motivoSeleccionado?.diagnosticos.map((diagnostico) => (
              <option value={diagnostico} key={diagnostico}>
                {diagnostico}
              </option>
            ))}
          </select>
        </div>

        <div className="cf-campo">
          <label htmlFor="consulta-tratamiento">
            Tratamiento <span className="cf-obligatorio">*</span>
          </label>
          <textarea
            id="consulta-tratamiento"
            name="tratamiento"
            value={consulta.tratamiento}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="cf-campo">
          <label htmlFor="consulta-observaciones">Observaciones</label>
          <textarea
            id="consulta-observaciones"
            name="observaciones"
            value={consulta.observaciones}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="cf-vacuna-bloque">
          <label className="cf-vacuna-toggle" htmlFor="consulta-aplico-vacuna">
            <input
              type="checkbox"
              id="consulta-aplico-vacuna"
              checked={aplicoVacuna}
              onChange={(event) => setAplicoVacuna(event.target.checked)}
            />
            Se usaron insumos
          </label>

          {aplicoVacuna && (
            <div className="cf-vacuna-campos">
              <CamposVacuna
                valor={vacuna}
                onChange={setVacuna}
                prefijo="consulta-vacuna"
              />
            </div>
          )}
        </div>

        {error && <p className="cf-error" role="alert">{error}</p>}

        <div className="cf-acciones">
          <button type="button" className="cf-btn-cancelar" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar consulta"}
          </button>
        </div>
      </form>
    </div>
  );
}
