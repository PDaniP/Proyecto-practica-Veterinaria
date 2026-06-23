import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/products";

export default function FormularioEdicionProductos({ productoInicial, onClose }) {
  const [producto, setProducto] = useState({
    precio_costo: "",
    precio_venta: "",
    stock_minimo: "",
  });

  const [idProducto, setIdProducto] = useState(productoInicial ? productoInicial.id : null);
  const [errores, setErrores] = useState({});

  // 🔥 Cargar datos del producto a editar
  useEffect(() => {
    if (productoInicial) {
      setProducto({
        precio_costo: productoInicial.precio_costo || "",
        precio_venta: productoInicial.precio_venta || "",
        stock_minimo: productoInicial.stock_minimo || "",
      });
    }
  }, [productoInicial]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProducto({
      ...producto,
      [name]: value,
    });
  };

  const validar = () => {
    const nuevosErrores = {};

    if (!producto.precio_costo || producto.precio_costo <= 0) {
      nuevosErrores.precio_costo = "Ingrese un precio de costo válido.";
    }

    if (!producto.precio_venta || producto.precio_venta <= 0) {
      nuevosErrores.precio_venta = "Ingrese un precio de venta válido.";
    }

    if (producto.precio_venta < producto.precio_costo) {
      nuevosErrores.precio_venta =
        "El precio de venta no puede ser menor al de costo.";
    }

    if (producto.stock_minimo < 0) {
      nuevosErrores.stock_minimo = "El stock mínimo no puede ser negativo.";
    }
    
    return nuevosErrores;
  };  
  

  const handleSubmit = (e) => {
    e.preventDefault();

    const erroresValidacion = validar();
    setErrores(erroresValidacion);

    if (Object.keys(erroresValidacion).length > 0) return;

    const productoFormateado = {
      ...producto,
      precio_costo: Number(producto.precio_costo),
      precio_venta: Number(producto.precio_venta),
      stock_minimo: Number(producto.stock_minimo),
    };

    console.log("Datos a enviar:", productoFormateado);
    axios
      .patch(`${API_URL}/product/update/${idProducto}`, productoFormateado)
      .then((response) => {
        console.log("Producto editado:", response.data);
        alert("Producto actualizado correctamente.");
        onClose();
      })
      .catch((error) => {
        console.error("Error al actualizar el producto:", error);
        alert("Error al actualizar el producto.");
      });
  };

  useEffect(() => {
  const styleId = "form-edicion-styles";

  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = formStyles;
    document.head.appendChild(style);
  }

  return () => {
    const styleTag = document.getElementById(styleId);
    if (styleTag) styleTag.remove();
  };


}, []);

  return (
    <div className="card">
      <h2 className="card-title">Editar Producto</h2>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Precio compra</label>
          <input
            type="number"
            name="precio_costo"
            value={producto.precio_costo}
            onChange={handleChange}
          />
          {errores.precio_costo && <p className="error">{errores.precio_costo}</p>}
        </div>

        <div className="field">
          <label>Precio venta</label>
          <input
            type="number"
            name="precio_venta"
            value={producto.precio_venta}
            onChange={handleChange}
          />
          {errores.precio_venta && <p className="error">{errores.precio_venta}</p>}
        </div>

        <div className="field">
          <label>Stock mínimo</label>
          <input
            type="number"
            name="stock_minimo"
            value={producto.stock_minimo}
            onChange={handleChange}
          />
          {errores.stock_minimo && <p className="error">{errores.stock_minimo}</p>}
        </div>

        <button className="btn" type="submit">
          Guardar cambios
        </button>
      </form>
    </div>
  );
}


const formStyles = `
.page {
  min-height: 100vh;
  width: 100%;
  background: #ffffff;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 110px 20px 20px 20px;
  box-sizing: border-box;
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 36px 32px;
  width: 100%;
  max-width: 720px;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  box-shadow: 0 0 40px rgba(255, 255, 255, 0.35);
}

.card-title {
  font-size: 40px;
  font-weight: 500;
  color: #111;
  text-align: center;
  margin: 0 0 4px;
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

.field input,
.field select,
.field textarea {
color: #111;
  flex: 1;
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



.field select option {
  color: #111;
}

.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  margin-top: 8px;
}

.btn {
  width: 100%;
  height: 42px;
  background: #534ab7;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
`;
