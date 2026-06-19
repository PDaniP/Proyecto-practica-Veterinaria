import { useState } from "react";
import axios from 'axios'
import { useNavigate } from "react-router-dom";

export default function FormularioProductos() {
  const navegar = useNavigate()
  const [producto, setProducto] = useState({
    id_categoria: "",
    nombre: "",
    descripcion: "",
    codigo_barras: "",
    precio_costo: "",
    precio_venta: "",
    stock_actual: "",
    stock_minimo: "",
    venta_al_publico: false,
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

    if (!producto.precio_costo || producto.precio_costo <= 0) {
      nuevosErrores.precio_costo = "Ingrese el precio de compra válido.";
    }

    if (!producto.precio_venta || producto.precio_venta <= 0) {
      nuevosErrores.precio_venta = "Ingrese el precio de venta válido.";
    }

    if (producto.precio_venta < producto.precio_costo) {
      nuevosErrores.precio_venta =
        "El precio de venta no puede ser menor al precio de compra.";
    }

    if (producto.stock_actual < 0) {
      nuevosErrores.stock_actual = "El stock no puede ser negativo.";
    }

    if (producto.stock_minimo < 0) {
      nuevosErrores.stock_minimo = "El stock mínimo no puede ser negativo.";
    }

    if (
      producto.fecha_vencimiento &&
      new Date(producto.fecha_vencimiento) < new Date()
    ) {
      nuevosErrores.fecha_vencimiento =
        "La fecha de vencimiento no puede ser anterior a la fecha actual.";
    }

    if (!producto.proveedor) {
      nuevosErrores.proveedor = "Seleccione un proveedor.";
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
      //proveedor: Number(producto.proveedor),
      precio_costo: Number(producto.precio_costo),
      precio_venta: Number(producto.precio_venta),
      stock_actual: Number(producto.stock_actual),
      stock_minimo: Number(producto.stock_minimo),
    };

    console.log("Producto listo para enviar:", productoFormateado);

    alert("Producto registrado correctamente.");

    await axios.post('http://localhost:3000/products/product/add', productoFormateado, {withCredentials:true})

    // Reset del formulario
    setProducto({
      id_categoria: "",
      nombre: "",
      descripcion: "",
      codigo_barras: "",
      precio_costo: "",
      precio_venta: "",
      stock_actual: "",
      stock_minimo: "",
      venta_al_publico: false,
      fecha_vencimiento: "",
//      proveedor: "",
    });
    navegar('/productos')
    setErrores({});
    
  }

  return (
    <>
    <form  style={{ maxWidth: "500px", margin: "auto" }}>
      <h2>Registrar Producto</h2>

      {/* Categoría */}
      <select
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
      <p style={{ color: "red" }}>{errores.id_categoria}</p>

      {/* Nombre */}
      <input
        type="text"
        name="nombre"
        placeholder="Nombre"
        value={producto.nombre}
        onChange={handleChange}
      />
      <p style={{ color: "red" }}>{errores.nombre}</p>

      {/* Descripción */}
      <textarea
        name="descripcion"
        placeholder="Descripción"
        value={producto.descripcion}
        onChange={handleChange}
      />

      {/* Código de barras */}
      <input
        type="text"
        name="codigo_barras"
        placeholder="Código de barras"
        value={producto.codigo_barras}
        onChange={handleChange}
      />

      {/* Precios */}
      <input
        type="number"
        name="precio_costo"
        placeholder="Precio compra"
        value={producto.precio_costo}
        onChange={handleChange}
      />
      <p style={{ color: "red" }}>{errores.precio_costo}</p>

      <input
        type="number"
        name="precio_venta"
        placeholder="Precio venta"
        value={producto.precio_venta}
        onChange={handleChange}
      />
      <p style={{ color: "red" }}>{errores.precio_venta}</p>

      {/* Stock */}
      <input
        type="number"
        name="stock_actual"
        placeholder="Stock actual"
        value={producto.stock_actual}
        onChange={handleChange}
      />
      <p style={{ color: "red" }}>{errores.stock_actual}</p>

      <input
        type="number"
        name="stock_minimo"
        placeholder="Stock mínimo"
        value={producto.stock_minimo}
        onChange={handleChange}
      />
      <p style={{ color: "red" }}>{errores.stock_minimo}</p>

      {/* Checkbox */}
      <label>
        Venta al público:
        <input
          type="checkbox"
          name="venta_al_publico"
          checked={producto.venta_al_publico}
          onChange={handleChange}
        />
      </label>

      {/* Fecha */}
      <input
        type="date"
        name="fecha_vencimiento"
        value={producto.fecha_vencimiento}
        onChange={handleChange}
      />
      <p style={{ color: "red" }}>{errores.fecha_vencimiento}</p>

      <select
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
      <p style={{ color: "red" }}>{errores.proveedor}</p>

      <button type="submit" onClick={()=> handleSubmit}>Guardar</button>
    </form>
    </>
  );
}
