import { useRef, useState } from "react";
import SystemFeedbackContext from "./systemFeedbackContext.js";
import "./SystemFeedback.css";

export function SystemFeedbackProvider({ children }) {
  const [dialogo, setDialogo] = useState(null);
  const resolverRef = useRef(null);

  const abrirDialogo = (configuracion) =>
    new Promise((resolve) => {
      resolverRef.current?.(false);
      resolverRef.current = resolve;
      setDialogo(configuracion);
    });

  const mostrarAlerta = (mensaje, opciones = {}) =>
    abrirDialogo({
      tipo: "alerta",
      variante: opciones.variante || "info",
      titulo: opciones.titulo || "Aviso",
      mensaje,
      textoConfirmar: opciones.textoConfirmar || "Aceptar",
    });

  const confirmarAccion = (mensaje, opciones = {}) =>
    abrirDialogo({
      tipo: "confirmacion",
      variante: opciones.variante || "warning",
      titulo: opciones.titulo || "Confirmar acción",
      mensaje,
      textoConfirmar: opciones.textoConfirmar || "Confirmar",
      textoCancelar: opciones.textoCancelar || "Cancelar",
    });

  const resolverDialogo = (resultado) => {
    resolverRef.current?.(resultado);
    resolverRef.current = null;
    setDialogo(null);
  };

  return (
    <SystemFeedbackContext.Provider value={{ mostrarAlerta, confirmarAccion }}>
      {children}
      {dialogo && (
        <div className="system-feedback__backdrop">
          <section
            className={`system-feedback system-feedback--${dialogo.variante}`}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="system-feedback-title"
            aria-describedby="system-feedback-message"
          >
            <div className="system-feedback__icon" aria-hidden="true">
              {dialogo.variante === "success"
                ? "✓"
                : dialogo.variante === "error"
                  ? "!"
                  : "i"}
            </div>
            <h2 id="system-feedback-title">{dialogo.titulo}</h2>
            <p id="system-feedback-message">{dialogo.mensaje}</p>
            <div className="system-feedback__actions">
              {dialogo.tipo === "confirmacion" && (
                <button
                  type="button"
                  className="system-feedback__cancel"
                  onClick={() => resolverDialogo(false)}
                >
                  {dialogo.textoCancelar}
                </button>
              )}
              <button
                type="button"
                className="system-feedback__confirm"
                onClick={() =>
                  resolverDialogo(dialogo.tipo === "confirmacion")
                }
                autoFocus
              >
                {dialogo.textoConfirmar}
              </button>
            </div>
          </section>
        </div>
      )}
    </SystemFeedbackContext.Provider>
  );
}
