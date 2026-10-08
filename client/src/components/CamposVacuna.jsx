import { useEffect, useState } from "react";
import axios from "axios";

const categorias_atencion = [
  "Higiene y Cuidado Diario",
  "Medicamentos y Fármacos",
  "Vacunas",
  "Descartables e Insumos Médicos",
  "Servicios Clínicos y Estética",
];

export default function CamposVacuna({ valor, onChange, prefijo = "vacuna" }) {
  const [categorias, setCategorias] = useState([]);
  const [errorCategorias, setErrorCategorias] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [productos, setProductos] = useState([]);
  const [errorProductos, setErrorProductos] = useState("");
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/products/product/categorias", {
        withCredentials: true,
      })
      .then((response) => {
        const permitidas = response.data.filter((categoria) =>
          categorias_atencion.includes(categoria.nombre),
        );

        setCategorias(permitidas);
      })
      .catch(() => {
        setErrorCategorias("No se pudieron cargar las categorías.");
      });

    axios
      .get("http://localhost:3000/products/", {
        withCredentials: true,
      })
      .then((response) => {
        setProductos(response.data);
      })
      .catch(() => {
        setErrorProductos("No se pudieron cargar los productos.");
      });
  }, []);

  const productosDeCategoria = productos.filter(
    (producto) => String(producto.id_categoria) === categoriaSeleccionada,
  );
  const productosCoincidentes = productosDeCategoria.filter((producto) =>
    producto.nombre
      .toLowerCase()
      .includes(busquedaProducto.trim().toLowerCase()),
  );
  const totalInsumos = productosSeleccionados.reduce(
    (total, producto) =>
      total +
      (Number(producto.precio_venta) || 0) * (Number(producto.cantidad) || 0),
    0,
  );

  const actualizar = (cambios) => onChange({ ...valor, ...cambios });

  const handleChange = (event) => {
    const { name, value } = event.target;
    actualizar({ [name]: value });
  };

  const cambiarCategoria = (event) => {
    setCategoriaSeleccionada(event.target.value);
    setBusquedaProducto("");
    setMostrarSugerencias(false);
  };

  const seleccionarProducto = (producto) => {
    setProductosSeleccionados((actuales) =>
      actuales.some((item) => item.id === producto.id)
        ? actuales
        : [...actuales, { ...producto, cantidad: 1 }],
    );
    setBusquedaProducto("");
    setMostrarSugerencias(false);
  };

  const cambiarCantidad = (id, cantidad) => {
    const cantidadValida = Math.max(1, Number.parseInt(cantidad, 10) || 1);
    setProductosSeleccionados((actuales) =>
      actuales.map((producto) =>
        producto.id === id
          ? { ...producto, cantidad: cantidadValida }
          : producto,
      ),
    );
  };

  const quitarProducto = (id) => {
    setProductosSeleccionados((actuales) =>
      actuales.filter((producto) => producto.id !== id),
    );
  };

  return (
    <>
      <div className="cf-campo">
        <label htmlFor={`${prefijo}-categoria`}>Tipo de insumo</label>

        <select
          id={`${prefijo}-categoria`}
          value={categoriaSeleccionada}
          onChange={cambiarCategoria}
        >
          <option value="">Seleccione una categoria</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>
        {errorCategorias && <p className="cf-ayuda">{errorCategorias}</p>}
        {errorProductos && <p className="cf-ayuda">{errorProductos}</p>}
      </div>

      <div className="cf-campo">
        <label htmlFor={`${prefijo}-nombre`}>
          Nombre del insumo <span className="cf-obligatorio">*</span>
        </label>
        <div className="cf-autocomplete">
          <input
            type="text"
            id={`${prefijo}-nombre`}
            placeholder="Ej: Quíntuple Canina, Antirrábica"
            disabled={!categoriaSeleccionada}
            autoComplete="off"
            value={busquedaProducto}
            onFocus={() => setMostrarSugerencias(true)}
            onChange={(event) => {
              setBusquedaProducto(event.target.value);
              setMostrarSugerencias(true);
            }}
          />

          {mostrarSugerencias && busquedaProducto.trim() && (
            <ul className="cf-sugerencias">
              {productosCoincidentes.length === 0 ? (
                <li className="cf-sugerencia">No se encontró el producto</li>
              ) : (
                productosCoincidentes.map((producto) => (
                  <li key={producto.id} className="cf-sugerencia">
                    <button type="button" onClick={() => seleccionarProducto(producto)}>
                      {producto.nombre}
                      {producto.marca ? ` - ${producto.marca}` : ""}
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>

      <div className="cf-insumo-tabla-contenedor">
        <table className="cf-insumo-tabla">
          <thead>
            <tr>
              <th>Tipo de insumo</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio de venta</th>
              <th>Subtotal</th>
              <th aria-label="Acciones"></th>
            </tr>
          </thead>
          <tbody>
            {productosSeleccionados.length === 0 ? (
              <tr>
                <td colSpan="6" className="cf-insumo-vacio">
                  Aún no hay productos seleccionados.
                </td>
              </tr>
            ) : (
              productosSeleccionados.map((producto) => (
                <tr key={producto.id}>
                  <td>
                    {categorias.find(
                      (categoria) =>
                        String(categoria.id) === String(producto.id_categoria),
                    )?.nombre || "-"}
                  </td>
                  <td>
                    {producto.nombre}
                    {producto.marca ? ` - ${producto.marca}` : ""}
                  </td>
                  <td>
                    <input
                      type="number"
                      className="cf-insumo-cantidad"
                      min="1"
                      step="1"
                      aria-label={`Cantidad de ${producto.nombre}`}
                      value={producto.cantidad || 1}
                      onChange={(event) =>
                        cambiarCantidad(producto.id, event.target.value)
                      }
                    />
                  </td>
                  <td>
                    ${(Number(producto.precio_venta) || 0).toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    ${(
                      (Number(producto.precio_venta) || 0) *
                      (Number(producto.cantidad) || 0)
                    ).toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="cf-insumo-quitar"
                      aria-label={`Quitar ${producto.nombre}`}
                      onClick={() => quitarProducto(producto.id)}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan="4">Total</th>
              <th colSpan="2">
                $
                {totalInsumos.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </th>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="cf-fila">
        <div className="cf-campo">
          <label htmlFor={`${prefijo}-fecha`}>
            Fecha de aplicación <span className="cf-obligatorio">*</span>
          </label>
          <input
            type="date"
            id={`${prefijo}-fecha`}
            name="fecha_aplicacion"
            value={valor.fecha_aplicacion}
            onChange={handleChange}
          />
        </div>

        <div className="cf-campo">
          <label htmlFor={`${prefijo}-proxima`}>Próxima dosis</label>
          <input
            type="date"
            id={`${prefijo}-proxima`}
            name="proxima_dosis"
            min={valor.fecha_aplicacion}
            value={valor.proxima_dosis}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="cf-campo">
        <label htmlFor={`${prefijo}-obs`}>Observaciones de la vacuna</label>
        <textarea
          id={`${prefijo}-obs`}
          name="observaciones_vacuna"
          value={valor.observaciones_vacuna}
          onChange={handleChange}
        ></textarea>
      </div>
    </>
  );
}
