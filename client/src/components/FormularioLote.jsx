import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function FormularioLote({ onClose }) {
  const navegar = useNavigate();

  const [lote, setLote] = useState({
    codigo_lote: "",
    stock_inicial: "",
    stock_actual: "",
    fecha_ingreso: "",
    fecha_vencimiento: "",
    activo: true,
  });

  const [errores, setErrores] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setLote({
      ...lote,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validar = () => {
    const nuevosErrores = {};

    if (!lote.codigo_lote.trim()) {
      nuevosErrores.codigo_lote = "El código de lote es obligatorio.";
    }

    if (!lote.stock_inicial || lote.stock_inicial < 0) {
      nuevosErrores.stock_inicial = "Ingrese un stock inicial válido.";
    }

    if (!lote.stock_actual || lote.stock_actual < 0) {
      nuevosErrores.stock_actual = "Ingrese un stock actual válido.";
    }

    if (Number(lote.stock_actual) > Number(lote.stock_inicial)) {
      nuevosErrores.stock_actual =
        "El stock actual no puede ser mayor al stock inicial.";
    }

    if (!lote.fecha_ingreso) {
      nuevosErrores.fecha_ingreso = "La fecha de ingreso es obligatoria.";
    }

    if (lote.fecha_vencimiento) {
      const ingreso = new Date(lote.fecha_ingreso);
      const vencimiento = new Date(lote.fecha_vencimiento);

      if (vencimiento < ingreso) {
        nuevosErrores.fecha_vencimiento =
          "La fecha de vencimiento no puede ser anterior a la fecha de ingreso.";
      }
    }

    return nuevosErrores;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const erroresValidacion = validar();
    setErrores(erroresValidacion);

    if (Object.keys(erroresValidacion).length > 0) return;

    const loteFormateado = {
      ...lote,
      stock_inicial: Number(lote.stock_inicial),
      stock_actual: Number(lote.stock_actual),
    };

    console.log("Lote listo para enviar:", loteFormateado);

    try {
      await axios.post(
        "http://localhost:3000/lotes/add",
        loteFormateado,
        { withCredentials: true }
      );

      alert("Lote registrado correctamente.");
      onClose();
      navegar("/lotes");

      setLote({
        codigo_lote: "",
        stock_inicial: "",
        stock_actual: "",
        fecha_ingreso: "",
        fecha_vencimiento: "",
        activo: true,
      });

      setErrores({});
    } catch (error) {
      console.error("Error al registrar lote:", error);
      alert("Error al registrar el lote.");
    }
  };

  useEffect(() => {
    const styleId = "formulario-lote-styles";
    if (!document.getElementById(styleId)) {
      const styleTag = document.createElement("style");
      styleTag.id = styleId;
      styleTag.textContent = formStyles;
      document.head.appendChild(styleTag);
    }

    return () => {
      const styleTag = document.getElementById(styleId);
      if (styleTag) styleTag.remove();
    };
  }, []);

  return (
    <div>
      <div className="card">
        <h2 className="card-title">Registrar Lote</h2>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="codigo_lote">Código de lote</label>
            <input
              id="codigo_lote"
              type="text"
              name="codigo_lote"
              value={lote.codigo_lote}
              onChange={handleChange}
            />
            {errores.codigo_lote && (
              <p className="error">{errores.codigo_lote}</p>
            )}
          </div>

          <div className="field">
            <label htmlFor="stock_inicial">Stock inicial</label>
            <input
              id="stock_inicial"
              type="number"
              name="stock_inicial"
              value={lote.stock_inicial}
              onChange={handleChange}
            />
            {errores.stock_inicial && (
              <p className="error">{errores.stock_inicial}</p>
            )}
          </div>

          <div className="field">
            <label htmlFor="stock_actual">Stock actual</label>
            <input
              id="stock_actual"
              type="number"
              name="stock_actual"
              value={lote.stock_actual}
              onChange={handleChange}
            />
            {errores.stock_actual && (
              <p className="error">{errores.stock_actual}</p>
            )}
          </div>

          <div className="field">
            <label htmlFor="fecha_ingreso">Fecha de ingreso</label>
            <input
              id="fecha_ingreso"
              type="date"
              name="fecha_ingreso"
              value={lote.fecha_ingreso}
              onChange={handleChange}
            />
            {errores.fecha_ingreso && (
              <p className="error">{errores.fecha_ingreso}</p>
            )}
          </div>

          <div className="field">
            <label htmlFor="fecha_vencimiento">Fecha de vencimiento</label>
            <input
              id="fecha_vencimiento"
              type="date"
              name="fecha_vencimiento"
              value={lote.fecha_vencimiento}
              onChange={handleChange}
            />
            {errores.fecha_vencimiento && (
              <p className="error">{errores.fecha_vencimiento}</p>
            )}
          </div>

          <div className="field checkbox-field">
            <label htmlFor="activo">Activo</label>
            <input
              id="activo"
              type="checkbox"
              name="activo"
              checked={lote.activo}
              onChange={handleChange}
            />
          </div>

          <button className="btn" type="submit">
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
}

const formStyles = `
.card {
  background: #fff;
  border-radius: 16px;
  padding: 36px 32px;
  width: 100%;
  max-width: 720px;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  box-shadow: 0 0 40px rgba(255, 255, 255, 0.35);
}

.card-title {
  font-size: 40px;
  font-weight: 500;
  color: #111;
  text-align: center;
  margin: 0 0 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.field input {
  color: #111;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  padding: 10px 12px;
  font-size: 13px;
}

.field.checkbox-field {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
}

.field.checkbox-field label {
  width: auto;
}

.field.checkbox-field input[type="checkbox"] {
  flex: 0;
  transform: scale(1);
  width: 16px;
  height: 16px;
  accent-color: #534ab7;
  cursor: pointer;
  margin-left: 20px;
}

.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
}

.btn {
  width: 100%;
  height: 42px;
  background: #534ab7;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
}
`;