import { useState, useEffect } from "react";

export default function FormularioProductos({ onClose }) {
  const [producto, setProducto] = useState({
    id_categoria: "",
    nombre: "",
    descripcion: "",
    codigo_barras: "",
    precio_compra: "",
    precio_venta: "",
    stock_actual: "",
    stock_minimo: "",
    es_publico: false,
    fecha_vencimiento: "",
    proveedor: "",
  });

  const [errores, setErrores] = useState({});

  // simulación de categorías a traer después del backend
  const categorias = [
    { id: 1, nombre: "Alimentos" },
    { id: 2, nombre: "Accesorios y Juguetes" },
    { id: 3, nombre: "Higiene y Cuidado" },
    { id: 4, nombre: "Medicamentos y Fármacos" },
    { id: 5, nombre: "Vacunas" },
    { id: 6, nombre: "Descartables e Insumos Médicos" },
  ];

  const proveedores = [
    { id: 1, nombre: "Veterinaria Central" },
    { id: 2, nombre: "Distribuidora Animal" },
    { id: 3, nombre: "Dropship Pet" },
    { id: 4, nombre: "Proveedor Salud Animal" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setProducto({
      ...producto,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validar = () => {
    const nuevosErrores = {};

    if (!producto.id_categoria) {
      nuevosErrores.id_categoria = "Seleccione una categoría.";
    }

    if (!producto.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio.";
    }

    if (!producto.precio_compra || producto.precio_compra <= 0) {
      nuevosErrores.precio_compra = "Ingrese el precio de compra válido.";
    }

    if (!producto.precio_venta || producto.precio_venta <= 0) {
      nuevosErrores.precio_venta = "Ingrese el precio de venta válido.";
    }

    if (producto.precio_venta < producto.precio_compra) {
      nuevosErrores.precio_venta =
        "El precio de venta no puede ser menor al precio de compra.";
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
          "La fecha de vencimiento no puede ser anterior a la fecha actual.";
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
      id_categoria: Number(producto.id_categoria),
      proveedor: Number(producto.proveedor),
      precio_compra: Number(producto.precio_compra),
      precio_venta: Number(producto.precio_venta),
      stock_actual: Number(producto.stock_actual),
      stock_minimo: Number(producto.stock_minimo),
    };

    console.log("Producto listo para enviar:", productoFormateado);

    alert("Producto registrado correctamente.");
    onClose(); // Cierra el modal después de guardar

    // Reset del formulario
    setProducto({
      id_categoria: "",
      nombre: "",
      descripcion: "",
      codigo_barras: "",
      precio_compra: "",
      precio_venta: "",
      stock_actual: "",
      stock_minimo: "",
      es_publico: false,
      fecha_vencimiento: "",
      proveedor: "",
    });

    setErrores({});
  };

  useEffect(() => {
    const styleId = "formulario-productos-styles";
    if (!document.getElementById(styleId)) {
      const styleTag = document.createElement("style");
      styleTag.id = styleId;
      styleTag.textContent = formStyles;
      document.head.appendChild(styleTag);
    }

    return () => {
      const styleTag = document.getElementById(styleId);
      if (styleTag) {
        styleTag.remove();
      }
    };
  }, []);

  return (
    <div>
      <div className="card">
        <h2 className="card-title">Registrar Producto</h2>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="id_categoria">Categoría</label>
            <select
              id="id_categoria"
              name="id_categoria"
              value={producto.id_categoria}
              onChange={handleChange}
            >
              <option value="">Seleccione categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
            {errores.id_categoria && (
              <p className="error">{errores.id_categoria}</p>
            )}
          </div>

          <div className="field">
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={producto.nombre}
              onChange={handleChange}
            />
            {errores.nombre && <p className="error">{errores.nombre}</p>}
          </div>

          <div className="field">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              placeholder="Descripción"
              value={producto.descripcion}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="codigo_barras">Código de barras</label>
            <input
              id="codigo_barras"
              type="text"
              name="codigo_barras"
              placeholder="Código de barras"
              value={producto.codigo_barras}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="precio_compra">Precio compra</label>
            <input
              id="precio_compra"
              type="number"
              name="precio_compra"
              placeholder="Precio compra"
              value={producto.precio_compra}
              onChange={handleChange}
            />
            {errores.precio_compra && (
              <p className="error">{errores.precio_compra}</p>
            )}
          </div>

          <div className="field">
            <label htmlFor="precio_venta">Precio venta</label>
            <input
              id="precio_venta"
              type="number"
              name="precio_venta"
              placeholder="Precio venta"
              value={producto.precio_venta}
              onChange={handleChange}
            />
            {errores.precio_venta && (
              <p className="error">{errores.precio_venta}</p>
            )}
          </div>

          <div className="field">
            <label htmlFor="stock_actual">Stock actual</label>
            <input
              id="stock_actual"
              type="number"
              name="stock_actual"
              placeholder="Stock actual"
              value={producto.stock_actual}
              onChange={handleChange}
            />
            {errores.stock_actual && (
              <p className="error">{errores.stock_actual}</p>
            )}
          </div>

          <div className="field">
            <label htmlFor="stock_minimo">Stock mínimo</label>
            <input
              id="stock_minimo"
              type="number"
              name="stock_minimo"
              placeholder="Stock mínimo"
              value={producto.stock_minimo}
              onChange={handleChange}
            />
            {errores.stock_minimo && (
              <p className="error">{errores.stock_minimo}</p>
            )}
          </div>

          <div className="field checkbox-field">
            <label htmlFor="es_publico">Venta al público</label>
            <input
              id="es_publico"
              type="checkbox"
              name="es_publico"
              checked={producto.es_publico}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="fecha_vencimiento">Fecha de vencimiento</label>
            <input
              id="fecha_vencimiento"
              type="date"
              name="fecha_vencimiento"
              value={producto.fecha_vencimiento}
              onChange={handleChange}
              min="2000-01-01"
              max="2100-12-31"
            />
            {errores.fecha_vencimiento && (
              <p className="error">{errores.fecha_vencimiento}</p>
            )}
          </div>

          <div className="field">
            <label htmlFor="proveedor">Proveedor</label>
            <select
              id="proveedor"
              name="proveedor"
              value={producto.proveedor}
              onChange={handleChange}
            >
              <option value="">Seleccione proveedor</option>
              {proveedores.map((prov) => (
                <option key={prov.id} value={prov.id}>
                  {prov.nombre}
                </option>
              ))}
            </select>
            {errores.proveedor && <p className="error">{errores.proveedor}</p>}
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
