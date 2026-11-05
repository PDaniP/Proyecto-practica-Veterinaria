
import { useEffect } from "react";

export default function Modal({ isOpen, onClose, children, className = "" }) {
  
  useEffect(() => {
    const styleId = "modal-styles";

    if (!document.getElementById(styleId)) {
      const styleTag = document.createElement("style");
      styleTag.id = styleId;
      styleTag.textContent = modalStyles;
      document.head.appendChild(styleTag);
    }

  }, []);
  
  if (!isOpen) return null;

  return (
    <div className="overlay">
      <div className={`modal ${className}`.trim()}>
        <button
          className="modal__close"
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          &times;
        </button>
        <div className="modal__content">{children}</div>
      </div>
    </div>
  );
}


const modalStyles = `
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  position: relative;
  box-sizing: border-box;
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  color: #252525;
}

.modal__close {
  position: absolute;
  top: 14px;
  right: 14px;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border: 1px solid rgba(102, 80, 164, 0.18);
  border-radius: 50%;
  background: linear-gradient(145deg, #ffffff, #f1eef8);
  color: #514080;
  box-shadow: 0 3px 10px rgba(48, 37, 78, 0.12);
  font: inherit;
  font-size: 1.65rem;
  font-weight: 400;
  line-height: 1;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.modal__close:hover {
  transform: rotate(90deg);
  background: #6650a4;
  color: #ffffff;
  box-shadow: 0 5px 14px rgba(81, 64, 128, 0.28);
}

.modal__close:focus-visible {
  outline: 3px solid #b8a5ed;
  outline-offset: 2px;
}

.modal__content {
  min-width: 0;
  padding-top: 28px;
}

.modal--wide {
  width: min(96vw, 1400px);
  max-width: 1400px;
}

.modal--agenda {
  border: 1px solid #e3e0eb;
  box-shadow: 0 12px 36px rgba(37, 37, 37, 0.18);
}
`;