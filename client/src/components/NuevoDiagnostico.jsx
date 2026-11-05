import { useState } from "react";
import api from "../../config/api.js";
import Modal from "./Modal.jsx";

export default function NuevoDiagnostico({
  motivos,
  motivoActualId,
  onDiagnosticoCreado,
}) {
  const [mostrar, setMostrar] = useState(false);
  const [motivoId, setMotivoId] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const abrirModal = () => {
    setMotivoId(motivoActualId || "");
    setDiagnostico("");
    setError("");
    setMostrar(true);
  };

  const cerrarModal = () => {
    if (guardando) return;
    setMostrar(false);
    setMotivoId("");
    setDiagnostico("");
    setError("");
  };

  const guardarDiagnostico = async () => {
    const diagnosticoLimpio = diagnostico.trim();
    if (!motivoId) {
      setError("Seleccione un motivo.");
      return;
    }
    if (!diagnosticoLimpio) {
      setError("El diagnóstico es obligatorio.");
      return;
    }

    setGuardando(true);
    setError("");

    try {
      const { data } = await api.post("mascotas/motivos/diagnostico/anadir", {
        id_motivo: Number(motivoId),
        diagnostico: diagnosticoLimpio,
      });

      if (
        data?.id == null ||
        String(data.id_motivo) !== motivoId ||
        typeof data.diagnostico !== "string"
      ) {
        throw new Error("La respuesta del servidor no contiene el diagnóstico creado.");
      }

      onDiagnosticoCreado?.(data);
      setMostrar(false);
      setMotivoId("");
      setDiagnostico("");
    } catch (err) {
      console.error("Error al crear el diagnóstico:", err);
      setError(
        err.response?.data?.message || "No se pudo crear el diagnóstico.",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="cf-btn-nuevo-diagnostico"
        onClick={abrirModal}
        disabled={motivos.length === 0}
      >
        ➕ Nuevo diagnóstico
      </button>

      <Modal isOpen={mostrar} onClose={cerrarModal}>
        <div
          className="cf-diagnostico-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="nuevo-diagnostico-titulo"
        >
          <h3 id="nuevo-diagnostico-titulo">Nuevo diagnóstico</h3>
          <label htmlFor="nuevo-diagnostico-motivo">Motivo</label>
          <select
            id="nuevo-diagnostico-motivo"
            value={motivoId}
            onChange={(event) => setMotivoId(event.target.value)}
            disabled={guardando}
          >
            <option value="">Seleccione un motivo</option>
            {motivos.map((motivo) => (
              <option value={motivo.id} key={motivo.id}>
                {motivo.motivo}
              </option>
            ))}
          </select>

          <label htmlFor="nuevo-diagnostico-input">Diagnóstico</label>
          <input
            id="nuevo-diagnostico-input"
            type="text"
            value={diagnostico}
            placeholder="Ingrese el diagnóstico"
            onChange={(event) => setDiagnostico(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                guardarDiagnostico();
              }
            }}
            disabled={guardando}
            autoFocus
          />

          {error && <p className="cf-error" role="alert">{error}</p>}

          <div className="cf-acciones">
            <button
              type="button"
              className="cf-btn-cancelar"
              onClick={cerrarModal}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="cf-btn-guardar-motivo"
              onClick={guardarDiagnostico}
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
