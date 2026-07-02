import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NuevaCategoria from "./NuevaCategoria";

export default function FormularioProductos({ onClose }) {
  const navegar = useNavigate();
  const [producto, setProducto] = useState({
    id_categoria: "",
    nombre: "",
    marca: "",
    descripcion: "",
    codigo_barras: "",
    precio_costo: "",
    precio_venta: "",
    stock_minimo: "",
    venta_al_publico: false,
  });

  const [errores, setErrores] = useState({});

  const [categorias, setCategorias] = useState([]);
  
  useEffect(() => {
  const obtenerCategorias = async () => {
    try {
      const response = await axios.get("http://localhost:3000/products/product/categorias",{withCredentials:true})
      setCategorias(response.data)
      
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };
  
  obtenerCategorias();
  }, []);

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

    if (!producto.marca.trim()) {
      nuevosErrores.marca = "La marca es obligatoria.";
    }

    if (!producto.precio_costo || producto.precio_costo <= 0) {
      nuevosErrores.precio_costo = "Ingrese el precio de compra válido.";
    }

    if (!producto.precio_venta || producto.precio_venta <= 0) {
      nuevosErrores.precio_venta = "Ingrese el precio de venta válido.";
    }

    if (Number(producto.precio_venta) < Number(producto.precio_costo)) {
      nuevosErrores.precio_venta =
        "El precio de venta no puede ser menor al precio de compra.";
    }

    if (producto.stock_minimo < 0) {
      nuevosErrores.stock_minimo = "El stock mínimo no puede ser negativo.";
    }


    return nuevosErrores;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const erroresValidacion = validar();
    setErrores(erroresValidacion);

    if (Object.keys(erroresValidacion).length > 0) return;

    const productoFormateado = {
      ...producto,
      id_categoria: Number(producto.id_categoria),
      precio_costo: Number(producto.precio_costo),
      precio_venta: Number(producto.precio_venta),
      stock_minimo: Number(producto.stock_minimo),
    };

    console.log("Producto listo para enviar:", productoFormateado);
    try {
      await axios.post(
        "http://localhost:3000/products/product/add",
        productoFormateado,
        { withCredentials: true },
      );

      alert("Producto registrado correctamente.");
      onClose(); // Cierra el modal después de guardar
      navegar("/productos");

      // Reset del formulario
      setProducto({
        id_categoria: "",
        nombre: "",
        marca: "",
        descripcion: "",
        codigo_barras: "",
        precio_costo: "",
        precio_venta: "",
        stock_minimo: "",
        es_publico: false,
      });
      setErrores({});
    } catch (error) {
      console.error("Error al registrar producto:", error);
      alert(
        "Hubo un error al registrar el producto. Por favor, inténtelo de nuevo.",
      );
    }
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

            <div className="categoria-row">
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

              <NuevaCategoria
                onCategoriaCreada={(categoria) => {
                  setCategorias((prev) => [...prev, categoria]);
                  setProducto((prev) => ({
                    ...prev,
                    id_categoria: categoria.id,
                  }));
                }}
              />
            </div>

            
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
            <label htmlFor="marca">Marca</label>
            <input
              id="marca"
              type="text"
              name="marca"
              placeholder="Marca"
              value={producto.marca}
              onChange={handleChange}
            />
            {errores.marca && <p className="error">{errores.marca}</p>}
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
            <label htmlFor="precio_costo">Precio compra</label>
            <input
              id="precio_costo"
              type="number"
              name="precio_costo"
              placeholder="Precio compra"
              value={producto.precio_costo}
              onChange={handleChange}
            />
            {errores.precio_costo && (
              <p className="error">{errores.precio_costo}</p>
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
            <label htmlFor="venta_al_publico">Venta al público</label>
            <input
              id="venta_al_publico"
              type="checkbox"
              name="venta_al_publico"
              checked={producto.venta_al_publico}
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

.categoria-row {
  display: flex;
  gap: 10px;
  align-items: stretch;
  position: relative;
}

.categoria-row select {
  flex: 1;
  height: 38px;
  box-sizing: border-box;
}

.categoria-row > div {
  display: flex;
  flex-direction: column; 
}

.categoria-row .btn-add {
  height: 38px !important; 
  box-sizing: border-box;
  margin: 0 !important;
}

.categoria-row > div > div:nth-child(2) {
  position: absolute;
  top: 44px;
  left: 0;
  right: 0;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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
