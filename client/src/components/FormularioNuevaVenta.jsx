import { useState, useEffect } from "react";
import axios from "axios";

export default function FormularioNuevaVenta({ onClose }) {
  const [tipoCliente, setTipoCliente] = useState("");
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  //estados para los productos
  const [productos, setProductos] = useState([]);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [productosVenta, setProductosVenta] = useState([]);

  //para traer clientes desde la base de datos
  useEffect(() => {
    axios
      .get("http://localhost:3000/clientes")
      .then((res) => setClientes(res.data))
      .catch((err) => console.error(err));
  }, []);

  //para traer productos desde la base de datos
  useEffect(() => {
    axios
      .get("http://localhost:3000/products")
      .then((res) => setProductos(res.data))
      .catch((err) => console.error(err));
  }, []);

  //fucnion para agregar productos
  const agregarProducto = (producto) => {
    const existe = productosVenta.find((p) => p.id === producto.id);

    if (existe) return;

    setProductosVenta([...productosVenta, { ...producto, cantidad: 1 }]);

    setBusquedaProducto("");
  };

  //cmabiaar cantidad
  const cambiarCantidad = (id, cantidad) => {
    setProductosVenta((prev) =>
      prev.map((p) => (p.id === id ? { ...p, cantidad: Number(cantidad) } : p)),
    );
  };

  //eliminar producto
  const eliminarProducto = (id) => {
    setProductosVenta((prev) => prev.filter((p) => p.id !== id));
  };

  //para el totoal
  const total = productosVenta.reduce(
    (acc, p) => acc + p.precio_venta * p.cantidad,
    0,
  );

  return (
    <div>
      <div className="card">
        <h2 className="card-title">Nueva Venta</h2>

        <form>
          <div className="field">
            <label htmlFor="cliente">Cliente</label>

            <select
              id="cliente"
              value={tipoCliente}
              onChange={(e) => {
                setTipoCliente(e.target.value);
                setClienteSeleccionado(null);
                setBusqueda("");
              }}
            >
              <option value="">Seleccione tipo</option>
              <option value="generico">Cliente general</option>
              <option value="registrado">Cliente registrado</option>
            </select>
          </div>

          {tipoCliente === "registrado" && (
            <div className="field">
              <label>Buscar cliente</label>

              <input
                type="text"
                placeholder="buscar cliente..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              {busqueda && !clienteSeleccionado && (
                <ul style={{ maxHeight: "150px", overflowY: "auto" }}>
                  {clientes.filter((c) =>
                    c.nombre.toLowerCase().includes(busqueda.toLowerCase()),
                  ).length === 0 ? (
                    <li style={{ padding: "5px" }}>
                      No se encontraron clientes
                    </li>
                  ) : (
                    clientes
                      .filter((c) =>
                        c.nombre.toLowerCase().includes(busqueda.toLowerCase()),
                      )
                      .map((c) => (
                        <li
                          key={c.id}
                          onClick={() => {
                            setClienteSeleccionado(c);
                            setBusqueda(c.nombre);
                          }}
                          style={{
                            cursor: "pointer",
                            padding: "5px",
                            borderBottom: "1px solid #ccc",
                          }}
                        >
                          {c.nombre}
                        </li>
                      ))
                  )}
                </ul>
              )}
            </div>
          )}

          {clienteSeleccionado && (
            <p>Cliente seleccionado: {clienteSeleccionado.nombre}</p>
          )}

          {/*buscador de dproductos*/}
          <div className="field">
            <label>Agregar producto</label>

            <input
              type="text"
              placeholder="buscar producto..."
              value={busquedaProducto}
              onChange={(e) => setBusquedaProducto(e.target.value)}
            />

            {busquedaProducto && (
              <ul style={{ maxHeight: "150px", overflowY: "auto" }}>
                {productos
                  .filter((p) =>
                    p.nombre
                      .toLowerCase()
                      .includes(busquedaProducto.toLowerCase()),
                  )
                  .map((p) => (
                    <li
                      key={p.id}
                      onClick={() => agregarProducto(p)}
                      style={{
                        cursor: "pointer",
                        padding: "5px",
                        borderBottom: "1px solid #ccc",
                      }}
                    >
                      {p.nombre}-{p.marca}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {/*lista de productos*/}
          {productosVenta.length > 0 && (
            <div style={{ marginTop: "15px" }}>
              <h4>Productos en la venta</h4>

              {productosVenta.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div>{p.nombre}</div>
                    <div>{p.marca}</div>
                    <small>
                      ${parseFloat(p.precio_venta).toLocaleString()}
                    </small>
                  </div>

                  <input
                    type="number"
                    min="1"
                    value={p.cantidad}
                    onChange={(e) => cambiarCantidad(p.id, e.target.value)}
                    style={{ width: "30px" }}
                  />
                  {/*para mostrar el precio en base a la cantidad */}
                  <span>
                    $
                    {(parseFloat(p.precio_venta) * p.cantidad).toLocaleString()}
                  </span>

                  <button onClick={() => eliminarProducto(p.id)}>❌</button>
                </div>
              ))}
            </div>
          )}

          <h3>Total: ${total.toLocaleString()}</h3>

          <div style={{ marginTop: "10px" }}>
            <button type="button">Guardar</button>
          </div>

          <div style={{ marginTop: "10px" }}>
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
