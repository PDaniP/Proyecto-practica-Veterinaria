import { useState, useEffect } from "react";
import axios from "axios";

export default function FormularioNuevaVenta({ onClose }) {
  const [tipoCliente, setTipoCliente] = useState("");
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [metodoPago, setMetodoPago] = useState("");
  const [usuario, setUsuario] = useState(null); // Estado para almacenar el usuario logueado

  //estados para los productos
  const [productos, setProductos] = useState([]);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [productosVenta, setProductosVenta] = useState([]);

  //para traer clientes desde la base de datos
  useEffect(() => {
    axios
      .get("http://localhost:3000/clientes")
      .then((res) => setClientes(res.data.clientes))
      .catch((err) => console.error(err));
  }, []);

  //traer id del usuario logeado
  useEffect(() => {
    axios.get('http://localhost:3000/users/comprobar',{withCredentials: true})
      .then(response => {
        if (response.data.valid) {
          setUsuario(response.data.user);
        } else {
          setUsuario(null);
        }
      })
      .catch(error => {
        console.error("Error al comprobar el token:", error);
        setUsuario(null);
        
      });
  }, []);
  
  //para traer productos desde la base de datos
  useEffect(() => {
    axios
      .get("http://localhost:3000/products")
      .then((res) => setProductos(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const styleId = "formulario-nueva-venta-styles";
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

  //para la venta
  let venta = {}
  const registrarVenta = async () => {

  
    venta = {
    id_usuario: usuario.id,
    id_cliente: clienteSeleccionado.id,
    metodoPago: metodoPago,
    total,
    
  }
  const lotes = await axios.get("http://localhost:3000/products/product/lotes",{withCredentials: true});
  console.log("Lotes obtenidos:", lotes.data.datos[0].stock_actual);
  for (let i = 0; i < productosVenta.length; i++) {
    const lote = lotes.data.datos.find((l) => l.id_producto === productosVenta[i].id);
    console.log(`Producto: ${productosVenta[i].nombre}, Lote: ${lote ? lote.id : 'No encontrado'}, Stock actual: ${lote ? lote.stock_actual : 'N/A'}`);
    if(!lote || lote.stock_actual < productosVenta[i].cantidad){
      alert(`No hay suficiente stock para el producto ${productosVenta[i].nombre}. Stock disponible: ${lote ? lote.stock_actual : 0}`);
      return;
    }
  }
  const resVenta = await axios.post("http://localhost:3000/ventas/registrar-venta",venta,{withCredentials: true});
  const idVenta = resVenta.data.id_venta;
  const registrarDetallesVenta = async () => {
    for(let i = 0; i < productosVenta.length; i++) {
      const res = await axios.post("http://localhost:3000/ventas/registrar-detalles",{
        id_venta: idVenta,
        id_producto: productosVenta[i].id,
        cantidad: productosVenta[i].cantidad,
      },{withCredentials: true});
      
    }
    
  
  };
  await registrarDetallesVenta();
  const descontarStock = async () => {
    for(let i = 0; i < productosVenta.length; i++) {
      const res = await axios.post("http://localhost:3000/ventas/descontar-stock",{
        id_producto: productosVenta[i].id,
        cantidad: productosVenta[i].cantidad,
      },{withCredentials: true});
      
    }
  };
  await descontarStock();
  }




  return (
    <div>
      <div className="card">
        <h2 className="card-title">Nueva Venta</h2>

        <form className="form">
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
              <div className="field-content">
                <input
                  type="text"
                  placeholder="buscar cliente..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                {busqueda && !clienteSeleccionado && (
                  <ul className="suggestions">
                    {clientes.filter((c) =>
                      c.nombre.toLowerCase().includes(busqueda.toLowerCase()),
                    ).length === 0 ? (
                      <li className="suggestion-item">
                        No se encontraron clientes
                      </li>
                    ) : (
                      clientes
                        .filter((c) =>
                          c.nombre
                            .toLowerCase()
                            .includes(busqueda.toLowerCase()),
                        )
                        .map((c) => (
                          <li
                            key={c.id}
                            className="suggestion-item"
                            onClick={() => {
                              setClienteSeleccionado(c);
                              setBusqueda(c.nombre);
                            }}
                          >
                            {c.nombre}
                          </li>
                        ))
                    )}
                  </ul>
                )}
              </div>
            </div>
          )}

          {clienteSeleccionado && (
            <p className="selected-info">
              Cliente seleccionado: {clienteSeleccionado.nombre}
            </p>
          )}

          <div className="field">
            <label>Agregar producto</label>
            <div className="field-content">
              <input
                type="text"
                placeholder="buscar producto..."
                value={busquedaProducto}
                onChange={(e) => setBusquedaProducto(e.target.value)}
              />

              {busquedaProducto && (
                <ul className="suggestions">
                  {productos.filter((p) =>
                    p.nombre
                      .toLowerCase()
                      .includes(busquedaProducto.toLowerCase()),
                  ).length === 0 ? (
                    <li className="suggestion-item">No se encontro el producto</li>
                  ) : (
                    productos
                      .filter((p) =>
                        p.nombre
                          .toLowerCase()
                          .includes(busquedaProducto.toLowerCase()),
                      )
                      .map((p) => (
                        <li
                          key={p.id}
                          className="suggestion-item"
                          onClick={() => agregarProducto(p)}
                        >
                          {p.nombre} - {p.marca}
                        </li>
                      ))
                  )}
                </ul>
              )}
            </div>
          </div>

          {productosVenta.length > 0 && (
            <div className="productos-venta">
              <h4 className="section-title">Productos en la venta</h4>

              {productosVenta.map((p) => (
                <div key={p.id} className="producto-item">
                  <div className="producto-info">
                    <div className="producto-datos">
                      <div className="producto-nombre">{p.nombre}</div>
                      <div className="producto-marca">{p.marca}</div>
                    </div>
                    <small className="producto-precio">
                      ${parseFloat(p.precio_venta).toLocaleString()}
                    </small>
                  </div>

                  <input
                    type="number"
                    min="1"
                    className="cantidad-input"
                    value={p.cantidad}
                    onChange={(e) => cambiarCantidad(p.id, e.target.value)}
                  />

                  <span className="producto-total">
                    $
                    {(parseFloat(p.precio_venta) * p.cantidad).toLocaleString()}
                  </span>

                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => eliminarProducto(p.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <h3 className="total">Total: ${total.toLocaleString()}</h3>

          <div className="field">
            <label htmlFor="metodoPago">Método de pago</label>

            <select
              id="metodoPago"
              className="selectorMetPago"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
            >
              <option value="">Seleccione método</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="mercadopago">Mercado Pago</option>
            </select>
          </div>

          <div className="actions">
            <button className="btn" type="button" onClick={registrarVenta}>
              Guardar
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
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
  margin-bottom: 25px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  align-items: center;
  gap: 6px;
}

.field label {
  width: 140px
  text-align: right;
  font-size: 12px;
  font-weight: 500;
  color: #000000;
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

.field input:focus,
.field select:focus,
.field textarea:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.16);
}

.field-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.selected-info {
  margin: 0;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f5f3ff;
  color: #5b21b6;
  font-size: 13px;
}

.suggestions {
  position: absolute;
  top: calc(100% + 4px); /* pequeño espacio debajo del input */
  left: 0;
  right: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  max-height: 150px;
  overflow-y: auto;
  padding: 0;
  margin: 0;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  z-index: 999;
}

.suggestion-item {
  cursor: pointer;
  padding: 10px 12px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
  color: #111;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background: #f9fafb;
}

.productos-venta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #111;
  margin: 4px 0 6px;
}

.producto-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #f9fafb;
}

.producto-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.producto-datos {
  display: flex;
  flex-direction: row;
  gap: 25px;
  align-items: center;
}

.producto-nombre {
  font-weight: 600;
  color: #111;
}

.producto-marca {
  font-size: 12px;
  color: #6b7280;
}

.producto-precio {
  font-size: 12px;
  color: #111;
}

.cantidad-input {
  width: 40px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 8px 6px;
  font-size: 13px;
  color: #111;
  background: #fff;
  text-align: center;
}
  
.cantidad-input::-webkit-inner-spin-button {
  opacity: 1;
  height: 20px;
}

.producto-total {
  font-size: 13px;
  color: #111;
  font-weight: 600;
  min-width: 85px;
  text-align: right;
}

.icon-btn {
  border: none;
  background: #fee2e2;
  color: #f80303;
  border-radius: 999px;
  width: 32px;
  height: 32px;
  cursor: pointer;
}

.icon-btn:hover {
  background: #fecaca;
}

.total {
  width: 180px;
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 10px;
  background: #709fcf;
  border: 1px solid #e5e7eb;
  font-size: 18px;
  font-weight: 600;
  color: #111;
  display: flex;
  justify-content: left;
}

.selectorMetPago {
  max-width: 200px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.btn {
  background: #534ab7;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.btn:hover {
  background: #358500;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #f3f4f6;
  color: #111;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #ff0000;
  color: #fff;
}

@media (max-width: 640px) {
  .card {
    padding: 24px 18px;
  }

  .producto-item {
    flex-wrap: wrap;
  }

  .cantidad-input {
    width: 100%;
  }

  .producto-total {
    min-width: auto;
    width: 100%;
    text-align: left;
  }

  .actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
`;
