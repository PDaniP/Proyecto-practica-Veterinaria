import { useState, useEffect } from "react";

export default function FormularioEdicionProductos({ productoInicial, onClose }) {
  const [producto, setProducto] = useState({
    precio_compra: "",
    precio_venta: "",
    //stock_actual: "",
    stock_minimo: "",
    //fecha_vencimiento: "",
    //proveedor: "",
  });

  const [errores, setErrores] = useState({});
  /*
  // proveedores simulados
  const proveedores = [
    { id: 1, nombre: "Veterinaria Central" },
    { id: 2, nombre: "Distribuidora Animal" },
    { id: 3, nombre: "Dropship Pet" },
    { id: 4, nombre: "Proveedor Salud Animal" },
  ];
  
  */
  // 🔥 Cargar datos del producto a editar
  useEffect(() => {
    if (productoInicial) {
      setProducto({
        precio_compra: productoInicial.precio_compra || "",
        precio_venta: productoInicial.precio_venta || "",
        //stock_actual: productoInicial.stock_actual || "",
        stock_minimo: productoInicial.stock_minimo || "",
        //fecha_vencimiento: productoInicial.fecha_vencimiento || "",
        //proveedor: productoInicial.proveedor || "",
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

    if (!producto.precio_compra || producto.precio_compra <= 0) {
      nuevosErrores.precio_compra = "Ingrese un precio de compra válido.";
    }

    if (!producto.precio_venta || producto.precio_venta <= 0) {
      nuevosErrores.precio_venta = "Ingrese un precio de venta válido.";
    }

    if (producto.precio_venta < producto.precio_compra) {
      nuevosErrores.precio_venta =
        "El precio de venta no puede ser menor al de compra.";
    }

    if (producto.stock_actual < 0) {
      nuevosErrores.stock_actual = "El stock no puede ser negativo.";
    }

    if (producto.stock_minimo < 0) {
      nuevosErrores.stock_minimo = "El stock mínimo no puede ser negativo.";
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (producto.fecha_vencimiento) {
      const fecha = new Date(producto.fecha_vencimiento);
      if (fecha < hoy) {
        nuevosErrores.fecha_vencimiento =
          "La fecha no puede ser anterior a hoy.";
      }
    }

    if (!producto.proveedor) {
      nuevosErrores.proveedor = "Seleccione un proveedor.";
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
      precio_compra: Number(producto.precio_compra),
      precio_venta: Number(producto.precio_venta),
      //stock_actual: Number(producto.stock_actual),
      stock_minimo: Number(producto.stock_minimo),
      proveedor: Number(producto.proveedor),
    };

    console.log("Producto editado:", productoFormateado);

    alert("Producto actualizado correctamente.");
    onClose();
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
            name="precio_compra"
            value={producto.precio_compra}
            onChange={handleChange}
          />
          {errores.precio_compra && <p className="error">{errores.precio_compra}</p>}
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
        {/*
        <div className="field">
          <label>Stock actual</label>
          <input
            type="number"
            name="stock_actual"
            value={producto.stock_actual}
            onChange={handleChange}
          />
          {errores.stock_actual && <p className="error">{errores.stock_actual}</p>}
        </div>
        */}
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
        {/**
        <div className="field">
          <label>Fecha de vencimiento</label>
          <input
            type="date"
            name="fecha_vencimiento"
            value={producto.fecha_vencimiento}
            onChange={handleChange}
          />
          {errores.fecha_vencimiento && (
            <p className="error">{errores.fecha_vencimiento}</p>
          )}
        </div>

        <div className="field">
          <label>Proveedor</label>
          <select
            name="proveedor"
            value={producto.proveedor}
            onChange={handleChange}
          >
            <option value="">Seleccione proveedor</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          {errores.proveedor && <p className="error">{errores.proveedor}</p>}
        </div>
        */}
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
