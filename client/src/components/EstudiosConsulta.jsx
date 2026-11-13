import { useCallback, useEffect, useState } from "react";
import {
  listarEstudios,
  obtenerArchivoEstudio,
  subirEstudio,
} from "../service/estudiosService.js";
import "./EstudiosConsulta.css";

const esVistaPrevia = (tipo) =>
  tipo === "application/pdf" || tipo?.startsWith("image/");

export default function EstudiosConsulta({
  idConsulta,
  permitirAdjuntar = false,
  archivosPendientes = [],
  onArchivosPendientesChange,
  bloqueado = false,
}) {
  const [estudios, setEstudios] = useState([]);
  const [estudioSeleccionado, setEstudioSeleccionado] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  const cargarEstudios = useCallback(async () => {
    try {
      const lista = await listarEstudios(idConsulta);
      setEstudios(lista);
      setEstudioSeleccionado((actual) =>
        lista.find((estudio) => estudio.id === actual?.id) || null,
      );
      setError("");
    } catch (err) {
      console.error("Error al cargar los estudios de la consulta:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "No se pudieron cargar los estudios.",
      );
    } finally {
      setCargando(false);
    }
  }, [idConsulta]);

  useEffect(() => {
    let vigente = true;
    listarEstudios(idConsulta)
      .then((lista) => {
        if (!vigente) return;
        setEstudios(lista);
        setEstudioSeleccionado((actual) =>
          lista.find((estudio) => estudio.id === actual?.id) || null,
        );
        setError("");
      })
      .catch((err) => {
        console.error("Error al cargar los estudios de la consulta:", err);
        if (vigente) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "No se pudieron cargar los estudios.",
          );
        }
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [idConsulta]);

  useEffect(() => {
    let vigente = true;
    let urlTemporal = "";

    const cargarVistaPrevia = async () => {
      if (!estudioSeleccionado) return;
      try {
        const archivo = await obtenerArchivoEstudio(estudioSeleccionado.id);
        urlTemporal = URL.createObjectURL(archivo);
        if (vigente) {
          setVistaPrevia({ id: estudioSeleccionado.id, url: urlTemporal });
        }
        else URL.revokeObjectURL(urlTemporal);
      } catch (err) {
        console.error("Error al abrir el estudio:", err);
        if (vigente) {
          setError(
            err.response?.data?.message ||
              "No se pudo abrir el estudio. Puede descargarlo para intentarlo.",
          );
        }
      }
    };

    cargarVistaPrevia();
    return () => {
      vigente = false;
      if (urlTemporal) URL.revokeObjectURL(urlTemporal);
    };
  }, [estudioSeleccionado]);

  const descargar = async (estudio) => {
    setError("");
    try {
      const archivo = await obtenerArchivoEstudio(estudio.id, true);
      const url = URL.createObjectURL(archivo);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = estudio.nombre_archivo || "estudio";
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al descargar el estudio:", err);
      setError(
        err.response?.data?.message || "No se pudo descargar el estudio.",
      );
    }
  };

  const adjuntar = async (event) => {
    const archivos = Array.from(event.target.files || []);
    event.target.value = "";
    if (!archivos.length) return;

    if (onArchivosPendientesChange) {
      onArchivosPendientesChange((actuales) => [...actuales, ...archivos]);
      return;
    }

    setSubiendo(true);
    setCargando(true);
    setError("");
    try {
      for (const archivo of archivos) {
        await subirEstudio(idConsulta, archivo);
      }
      await cargarEstudios();
    } catch (err) {
      console.error("Error al adjuntar un estudio:", err);
      setError(
        err.response?.data?.message ||
          "No se pudieron adjuntar todos los archivos. Los estudios existentes se conservaron.",
      );
      await cargarEstudios();
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <section className="estudios-consulta cf-campo" aria-label="Estudios adjuntos">
      <div className="cf-adjunto-encabezado">
        <h3>Estudios adjuntos</h3>
      </div>
      {permitirAdjuntar && (
        <input
          id="consulta-estudios-existentes"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
          multiple
          disabled={subiendo || bloqueado}
          aria-label={subiendo ? "Adjuntando estudios" : "Elegir archivos de estudio"}
          onChange={adjuntar}
        />
      )}

      {archivosPendientes.length > 0 && (
        <ul className="estudios-lista estudios-pendientes" aria-label="Archivos pendientes">
          {archivosPendientes.map((archivo, indice) => (
            <li key={`${archivo.name}-${archivo.lastModified}-${indice}`}>
              <span>{archivo.name}</span>
              <button
                type="button"
                className="cf-btn-cancelar"
                disabled={bloqueado}
                aria-label={`Quitar ${archivo.name}`}
                onClick={() =>
                  onArchivosPendientesChange((actuales) =>
                    actuales.filter((_, posicion) => posicion !== indice),
                  )
                }
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}

      {subiendo && <p className="cf-ayuda" role="status">Adjuntando estudios...</p>}
      {error && <p className="cf-error" role="alert">{error}</p>}
      {cargando ? (
        <p className="cf-ayuda">Cargando estudios...</p>
      ) : estudios.length ? (
        <>
          <ul className="estudios-lista">
            {estudios.map((estudio) => (
              <li key={estudio.id}>
                <button
                  type="button"
                  className="estudios-seleccionar"
                  aria-pressed={estudioSeleccionado?.id === estudio.id}
                  onClick={() => {
                    setError("");
                    setEstudioSeleccionado(estudio);
                  }}
                >
                  {estudio.nombre_archivo}
                </button>
                <button
                  type="button"
                  className="cf-btn-cancelar"
                  onClick={() => descargar(estudio)}
                >
                  Descargar
                </button>
              </li>
            ))}
          </ul>

          {estudioSeleccionado && vistaPrevia?.id === estudioSeleccionado.id && (
            <div className="estudios-vista">
              {esVistaPrevia(estudioSeleccionado.tipo_archivo) ? (
                estudioSeleccionado.tipo_archivo === "application/pdf" ? (
                  <iframe
                    title={`Vista previa de ${estudioSeleccionado.nombre_archivo}`}
                    src={vistaPrevia.url}
                  />
                ) : (
                  <img
                    src={vistaPrevia.url}
                    alt={`Vista previa de ${estudioSeleccionado.nombre_archivo}`}
                  />
                )
              ) : (
                <p className="cf-ayuda">
                  Este formato no admite vista previa. Descargue el archivo.
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="cf-ayuda">No hay estudios adjuntos a esta consulta.</p>
      )}
    </section>
  );
}
