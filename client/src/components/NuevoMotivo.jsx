import { useState } from "react";
import api from "../../config/api.js";
import Modal from "./Modal.jsx";

export default function NuevoMotivo({ onMotivoCreado }) {
  const [mostrar, setMostrar] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const cerrarModal = () => {
    if (guardando) return;
    setMostrar(false);
    setMotivo("");
    setError("");
  };

  const guardarMotivo = async () => {
    const motivoLimpio = motivo.trim();
    if (!motivoLimpio) {
      setError("El motivo es obligatorio.");
      return;
    }

    setGuardando(true);
    setError("");

    try {
      const { data } = await api.post("mascotas/motivos/añadir", {
        motivo: motivoLimpio,
      });

      if (data?.id == null || typeof data.motivo !== "string") {
        throw new Error("La respuesta del servidor no contiene el motivo creado.");
      }

      onMotivoCreado?.(data);
      setMotivo("");
      setMostrar(false);
    } catch (err) {
      console.error("Error al crear el motivo:", err);
      setError(
        err.response?.data?.message || "No se pudo crear el motivo.",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="cf-btn-nuevo-motivo"
        onClick={() => setMostrar(true)}
      >
        ➕ Nuevo motivo
      </button>

      <Modal isOpen={mostrar} onClose={cerrarModal}>
        <div
          className="cf-motivo-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="nuevo-motivo-titulo"
        >
          <h3 id="nuevo-motivo-titulo">Nuevo motivo de consulta</h3>
          <label htmlFor="nuevo-motivo-input">Motivo</label>
          <input
            id="nuevo-motivo-input"
            type="text"
            value={motivo}
            maxLength={255}
            placeholder="Ingrese el motivo"
            onChange={(event) => setMotivo(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                guardarMotivo();
              }
            }}
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
              onClick={guardarMotivo}
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