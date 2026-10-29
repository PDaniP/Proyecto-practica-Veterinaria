import { useState, useEffect } from "react";
import CamposVacuna from "./CamposVacuna.jsx";
import NuevoDiagnostico from "./NuevoDiagnostico.jsx";
import NuevoMotivo from "./NuevoMotivo.jsx";
import { hoy, vacunaVacia } from "../utils/vacuna.js";
import "./FormulariosClinicos.css";
//import { motivosConsulta } from "../utils/motivosConsulta.js";
import api from "../../config/api.js";

export default function FormularioConsulta({ idMascota, nombreMascota, onClose, onGuardado }) {
  const [consulta, setConsulta] = useState({
    //fecha_consulta: hoy(),
    peso: "",
    temperatura: "",
    motivo_id: "",
    diagnostico: "",
    tratamiento: "",
    observaciones: "",
    proxima_dosis: "",
  });
  const [aplicoVacuna, setAplicoVacuna] = useState(false);
  const [vacuna, setVacuna] = useState(vacunaVacia());
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [motivos, setMotivos] = useState([]);
  const [cargandoMotivos, setCargandoMotivos] = useState(true);
  const [errorMotivos, setErrorMotivos] = useState("");

  const [diagnosticos, setDiagnosticos] = useState([]);
  const [cargandoDiagnosticos, setCargandoDiagnosticos] = useState(false);
  const [errorDiagnosticos, setErrorDiagnosticos] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarMotivos = async () => {
      try {
        const { data } = await api.get("mascotas/motivos");

        if (!Array.isArray(data)) {
          throw new Error("La respuesta de motivos no tiene el formato esperado.");
        }

        if (activo) setMotivos(data);
      } catch (err) {
        console.error("Error al cargar los motivos:", err);
        if (activo) {
          setErrorMotivos(
            err.response?.data?.message || "No se pudieron cargar los motivos.",
          );
        }
      } finally {
        if (activo) setCargandoMotivos(false);
      }
    };

    cargarMotivos();

    return () => {
      activo = false;
    };
  }, []);

  const motivoActual = motivos.find(
    (motivo) => String(motivo.id) === consulta.motivo_id,
  );
/* 
  const motivoSeleccionado = motivosConsulta.find(
    (motivo) => motivo.nombre === motivoActual?.motivo,
  );
*/
  const esVacunacion = motivoActual?.motivo === "Vacunación";

  const handleMotivoCreado = (motivoNuevo) => {
    setMotivos((actuales) =>
      actuales.some((motivo) => String(motivo.id) === String(motivoNuevo.id))
        ? actuales
        : [...actuales, motivoNuevo],
    );
    setConsulta((actual) => ({
      ...actual,
      motivo_id: String(motivoNuevo.id),
      diagnostico: "",
      proxima_dosis: "",
    }));
    setErrorMotivos("");
  };

  const handleDiagnosticoCreado = (diagnosticoNuevo) => {
    const motivoId = String(diagnosticoNuevo.id_motivo);

    setMotivos((actuales) =>
      actuales.map((motivo) =>
        String(motivo.id) === motivoId
          ? { ...motivo, id_diagnostico: diagnosticoNuevo.id }
          : motivo,
      ),
    );

    if (motivoId !== consulta.motivo_id) return;

    setDiagnosticos((actuales) =>
      actuales.some(
        (diagnostico) => String(diagnostico.id) === String(diagnosticoNuevo.id),
      )
        ? actuales
        : [...actuales, diagnosticoNuevo],
    );
    setConsulta((actual) => ({
      ...actual,
      diagnostico: diagnosticoNuevo.diagnostico,
    }));
    setErrorDiagnosticos("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "motivo_id") {
      const motivoNuevo = motivos.find(
        (motivo) => String(motivo.id) === value,
      );
      setConsulta((actual) => ({
        ...actual,
        motivo_id: value,
        diagnostico: "",
        proxima_dosis:
          motivoNuevo?.motivo === "Vacunación" ? actual.proxima_dosis : "",
      }));
      return;
    }

    setConsulta((actual) => ({ ...actual, [name]: value }));
  };
  /*
  const cambiarFechaConsulta = (event) => {
    const nueva = event.target.value;
    setConsulta((actual) => ({ ...actual, fecha_consulta: nueva }));
    setVacuna((actual) =>
      actual.fecha_aplicacion === consulta.fecha_consulta
        ? { ...actual, fecha_aplicacion: nueva }
        : actual,
    );
  };*/

  const handleSubmit = async (event) => {
    event.preventDefault();
    //el unico campo obligatorio sera el motivo
    if (
      //!consulta.fecha_consulta ||
      !consulta.motivo_id //||
      //!consulta.diagnostico.trim() ||
      //!consulta.tratamiento.trim()
    ) {
      setError("Seleccione el motivo de la consulta.");
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
      //la fecha se obtiene al momento de guardar
      fecha_consulta: hoy()/*consulta.fecha_consulta*/,
      peso_actual: consulta.peso === "" ? null : Number(consulta.peso),//paso de peso a peso_actual porque el server pedia peso_actual porque el controlador lo recibe como ausente
      temperatura:
        consulta.temperatura === "" ? null : Number(consulta.temperatura),
      motivo_id: Number(consulta.motivo_id),
      diagnostico: consulta.diagnostico.trim(),
      tratamiento: consulta.tratamiento.trim(),
      observaciones: consulta.observaciones.trim() || null,

      //solo se envia una fecha si el motivo es vacunacion
      proxima_dosis: esVacunacion && consulta.proxima_dosis ? consulta.proxima_dosis : null,
      insumos: aplicoVacuna
        ? productosSeleccionados.map((producto) => ({
            id_producto: Number(producto.id),
            cantidad: Number(producto.cantidad),
            proxima_dosis:
              esVacunacion && consulta.proxima_dosis
                ? consulta.proxima_dosis
                : null,
          }))
        : [],
    };

    try {
      await api.post(
        "mascotas/historia/consulta",
        datos
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

  useEffect(() => {
    let activo = true;

    const cargarDiagnosticos = async () => {
      setDiagnosticos([]);
      setErrorDiagnosticos("");

      if (!consulta.motivo_id) {
        setCargandoDiagnosticos(false);
        return;
      }

      setCargandoDiagnosticos(true);

      try {
        const { data } = await api.get(
          `mascotas/motivos/${consulta.motivo_id}/diagnosticos`,
        );

        if (!Array.isArray(data)) {
          throw new Error("La respuesta de diagnósticos no tiene el formato esperado.");
        }

        if (activo) setDiagnosticos(data);
      } catch (err) {
        console.error("Error al cargar los diagnósticos:", err);

        if (activo) {
          setErrorDiagnosticos(
            err.response?.data?.message ||
              "No se pudieron cargar los diagnósticos.",
          );
        }
      } finally {
        if (activo) setCargandoDiagnosticos(false);
      }
    };

    cargarDiagnosticos();

    return () => {
      activo = false;
    };
  }, [consulta.motivo_id]);

  return (
    <div className="cf-container">
      <h2 className="cf-titulo">Nueva consulta</h2>
      {nombreMascota && (<p className="cf-subtitulo">Paciente: {nombreMascota}</p>)}

      <form className="cf-form" onSubmit={handleSubmit}>
        <div className="cf-fila cf-fila-3">
          {/** 
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
          </div>*/}

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
          <div className="cf-motivo-control">
            <select name="motivo_id" id="consulta-motivo" value={consulta.motivo_id} onChange={handleChange} required>
              <option value="">{cargandoMotivos ? "Cargando motivos..." : "Seleccione un motivo"}</option>

              {motivos.map((motivo) => (
                <option value={motivo.id} key={motivo.id}>
                  {motivo.motivo}
                </option>
              ))}
            </select>
            <NuevoMotivo onMotivoCreado={handleMotivoCreado} />
          </div>

          {errorMotivos && <p className="cf-error" role="alert">{errorMotivos}</p>}
        </div>

        {esVacunacion && (
          <div className="cf-campo">
            <label htmlFor="consulta-proxima-dosis">Próxima dosis</label>

            <input 
              type="date"
              id="consulta-proxima-dosis"
              name="proxima_dosis"
              min={hoy()}
              value={consulta.proxima_dosis}
              onChange={handleChange} 
            />
          </div>
        )}

        <div className="cf-campo">
          <label htmlFor="consulta-diagnostico">Diagnóstico</label>

          <div className="cf-motivo-control">
            <select
              name="diagnostico"
              id="consulta-diagnostico"
              value={consulta.diagnostico}
              onChange={handleChange}
              disabled={!consulta.motivo_id || cargandoDiagnosticos || diagnosticos.length === 0}
            >
              <option value="">
                {!consulta.motivo_id
                  ? "Primero seleccione un motivo"
                  : cargandoDiagnosticos
                    ? "Cargando diagnósticos..."
                    : diagnosticos.length === 0
                      ? "No hay diagnósticos para este motivo"
                      : "Seleccione un diagnóstico"}
              </option>

              {diagnosticos.map((diagnostico) => (
                <option value={diagnostico.diagnostico} key={diagnostico.id}>
                  {diagnostico.diagnostico}
                </option>
              ))}
            </select>
            <NuevoDiagnostico
              motivos={motivos}
              motivoActualId={consulta.motivo_id}
              onDiagnosticoCreado={handleDiagnosticoCreado}
            />
          </div>

          {errorDiagnosticos && (
            <p className="cf-error" role="alert">
              {errorDiagnosticos}
            </p>
          )}
        </div>

        <div className="cf-campo">
          <label htmlFor="consulta-tratamiento">
            Tratamiento
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
                productosSeleccionados={productosSeleccionados}
                onProductosChange={setProductosSeleccionados}
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
