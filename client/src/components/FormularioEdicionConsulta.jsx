import { useState, useEffect } from "react";
import CamposVacuna from "./CamposVacuna.jsx";
import { hoy, vacunaVacia } from "../utils/vacuna.js";
import "./FormulariosClinicos.css";
//import { motivosConsulta } from "../utils/motivosConsulta.js";
import api from "../../config/api.js";

export default function FormularioEdicionConsulta({
  nombreMascota,
  onClose,
  onGuardado,
  consulta,
}) {
  
  const [formulario, setFormulario] = useState({
    peso: consulta.peso_actual ?? "",
    temperatura: consulta.temperatura ?? "",
    motivo_id: String(consulta.motivo_id ?? ""),
    diagnostico: consulta.diagnostico ?? "",
    tratamiento: consulta.tratamiento ?? "",
    observaciones: consulta.observaciones ?? "",
    proxima_dosis: consulta.proxima_dosis ?? "",
  });
  const [aplicoVacuna, setAplicoVacuna] = useState(false);
  const [vacuna, setVacuna] = useState(vacunaVacia());
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [cargandoInsumos, setCargandoInsumos] = useState(true);
  const [errorInsumos, setErrorInsumos] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [motivos, setMotivos] = useState([]);
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [cargandoMotivos, setCargandoMotivos] = useState(true);
  const [cargandoDiagnosticos, setCargandoDiagnosticos] = useState(false);
  const [errorMotivos, setErrorMotivos] = useState("");
  const [errorDiagnosticos, setErrorDiagnosticos] = useState("");

  /*const motivoSeleccionado = motivosConsulta.find(
    (motivo) => motivo.nombre === formulario.motivo,
  );*/

  const motivoActual = motivos.find(
    (motivo) => String(motivo.id) === formulario.motivo_id,
  );

  const esVacunacion = motivoActual?.motivo === "Vacunación";

  useEffect(() => {
    let activo = true;

    const cargarInsumos = async () => {
      try {
        const { data } = await api.get(
          `mascotas/historia/consulta/${consulta.id}`,
        );
        if (!activo) return;

        const insumos = Array.isArray(data.insumos) ? data.insumos : [];
        setProductosSeleccionados(
          insumos.map((insumo) => ({
            id: insumo.id_producto,
            id_categoria: insumo.id_categoria,
            nombre: insumo.nombre,
            marca: insumo.marca,
            cantidad: insumo.cantidad,
          })),
        );
        setAplicoVacuna(insumos.length > 0);
      } catch (err) {
        console.error("Error al cargar los insumos de la consulta:", err);
        if (activo) {
          setErrorInsumos(
            err.response?.data?.message ||
              "No se pudieron cargar los insumos de la consulta.",
          );
        }
      } finally {
        if (activo) setCargandoInsumos(false);
      }
    };

    cargarInsumos();

    return () => {
      activo = false;
    };
  }, [consulta.id]);

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

  useEffect(() => {
    const cargarDiagnosticos = async () => {
      try {
        setCargandoDiagnosticos(true);
        const { data } = await api.get(`mascotas/motivos/${formulario.motivo_id}/diagnosticos`);

        if (!Array.isArray(data)) {
          throw new Error("La respuesta de diagnosticos no tiene el formato esperado.");
        }

        setDiagnosticos(data);
      } catch (err) {
        console.error("Error al cargar los diagnosticos:", err);
        setErrorDiagnosticos(
          err.response?.data?.message || "No se pudieron cargar los diagnosticos.",
        );
      } finally {
        setCargandoDiagnosticos(false);
      }
    };

    cargarDiagnosticos();
  }, [formulario.motivo_id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "motivo_id") {
      setFormulario((actual) => ({
        ...actual,
        motivo_id: value,
        diagnostico: "",
        proxima_dosis:
          motivos.find((motivo) => String(motivo.id) === value)?.motivo ===
            "Vacunación"
            ? actual.proxima_dosis
            : "",
      }));
      return;
    }

    setFormulario((actual) => ({ ...actual, [name]: value }));
  };
  /*
  const cambiarFechaConsulta = (event) => {
    const nueva = event.target.value;
    setFormulario((actual) => ({ ...actual, fecha_consulta: nueva }));
    setVacuna((actual) =>
      actual.fecha_aplicacion === consulta.fecha_consulta
        ? { ...actual, fecha_aplicacion: nueva }
        : actual,
    );
  };*/

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (cargandoInsumos || errorInsumos) {
      setError(
        errorInsumos || "Espere a que se carguen los insumos de la consulta.",
      );
      return;
    }

    //el unico campo obligatorio sera el motivo
    if (!formulario.motivo_id) {
      setError("Seleccione el motivo de la consulta.");
      return;
    }

    if (formulario.peso !== "" && Number(formulario.peso) <= 0) {
      setError("El peso debe ser mayor a 0.");
      return;
    }

    if (
      formulario.temperatura !== "" &&
      (Number(formulario.temperatura) < 30 ||
        Number(formulario.temperatura) > 45)
    ) {
      setError("Revise la temperatura: debe estar entre 30 y 45 °C.");
      return;
    }

    setError("");
    setGuardando(true);
    
    const datos = {
      //id_mascota: idMascota,
      //la fecha se obtiene al momento de guardar
      //fecha_consulta: consulta.fecha_consulta,
      peso_actual:
        formulario.peso === "" ? null : Number(formulario.peso),
      temperatura:
        formulario.temperatura === "" ? null : Number(formulario.temperatura),
      motivo_id: formulario.motivo_id,
      diagnostico: formulario.diagnostico.trim(),
      tratamiento: formulario.tratamiento || "",
      observaciones: formulario.observaciones || null,

      //solo se envia una fecha si el motivo es vacunacion
      proxima_dosis:
        esVacunacion && formulario.proxima_dosis ? formulario.proxima_dosis : null,
      insumos: aplicoVacuna
        ? productosSeleccionados.map((producto) => ({
            id_producto: Number(producto.id),
            cantidad: Number(producto.cantidad),
            proxima_dosis:
              esVacunacion && formulario.proxima_dosis
                ? formulario.proxima_dosis
                : null,
          }))
        : [],
    };
    
    try {
      console.log(datos)
      await api.put(
        `mascotas/historia/consulta/editar/${consulta.id}/`, //cambiar el metodo y la ruta para edicion de consulta
        datos,
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
      <h2 className="cf-titulo">Edicion Consulta</h2>
      {nombreMascota && (
        <p className="cf-subtitulo">Paciente: {nombreMascota}</p>
      )}

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
              value={formulario.fecha_consulta}
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
              value={formulario.peso}
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
              value={formulario.temperatura}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="cf-campo">
          <label htmlFor="consulta-motivo">
            Motivo de la consulta <span className="cf-obligatorio">*</span>
          </label>
          <select
            name="motivo_id"
            id="consulta-motivo"
            value={formulario.motivo_id}
            onChange={handleChange}
            required
          >
            <option value="">
              {cargandoMotivos ? "Cargando motivos..." : "Seleccione un motivo"}
            </option>

            {motivos.map((motivo) => (
              <option value={motivo.id} key={motivo.id}>
                {motivo.motivo}
              </option>
            ))}
          </select>
        </div>

        {errorMotivos && (
          <p className="cf-error" role="alert">
            {errorMotivos}
          </p>
        )}

        {esVacunacion && (
          <div className="cf-campo">
            <label htmlFor="consulta-proxima-dosis">Próxima dosis</label>

            <input
              type="date"
              id="consulta-proxima-dosis"
              name="proxima_dosis"
              min={hoy()}
              value={formulario.proxima_dosis}
              onChange={handleChange}
            />
          </div>
        )}

        <div className="cf-campo">
          <label htmlFor="consulta-diagnostico">Diagnóstico</label>

          <select
            name="diagnostico"
            id="consulta-diagnostico"
            value={formulario.diagnostico}
            onChange={handleChange}
            disabled={
              !formulario.motivo_id ||
              cargandoDiagnosticos ||
              diagnosticos.length === 0
            }
          >
            <option value="">
              {!formulario.motivo_id
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
        </div>

        {errorDiagnosticos && (
          <p className="cf-error" role="alert">
            {errorDiagnosticos}
          </p>
        )}

        <div className="cf-campo">
          <label htmlFor="consulta-tratamiento">Tratamiento</label>
          <textarea
            id="consulta-tratamiento"
            name="tratamiento"
            value={formulario.tratamiento}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="cf-campo">
          <label htmlFor="consulta-observaciones">Observaciones</label>
          <textarea
            id="consulta-observaciones"
            name="observaciones"
            value={formulario.observaciones}
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

          {cargandoInsumos && (
            <p className="cf-ayuda">Cargando insumos de la consulta...</p>
          )}
          {errorInsumos && <p className="cf-error" role="alert">{errorInsumos}</p>}

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

        {error && (
          <p className="cf-error" role="alert">
            {error}
          </p>
        )}

        <div className="cf-acciones">
          <button type="button" className="cf-btn-cancelar" onClick={onClose}>
            Cancelar
          </button>

          <button
            type="submit"
            className="btn-primary"
            disabled={guardando || cargandoInsumos || Boolean(errorInsumos)}
          >
            {guardando ? "Guardando..." : "Guardar consulta"}
          </button>
        </div>
      </form>
    </div>
  );
}
