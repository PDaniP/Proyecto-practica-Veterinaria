
import { useEffect } from "react";

export default function Modal({ isOpen, onClose, children }) {
  
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
    <div className="overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()} // evita cerrar al hacer click dentro
      >
        {children}
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
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;

  
}
`;