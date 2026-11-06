import { useState, useEffect } from "react";
import api from "../../config/api.js";

export default function FormularioNuevaVenta({ onClose, onVentaRegistrada }) {
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
  const [categoriaVenta, setCategoriaVenta] = useState("productos");
  const [consultasCliente, setConsultasCliente] = useState([]);
  const [consultaSeleccionada, setConsultaSeleccionada] = useState("");
  const [cargandoConsultas, setCargandoConsultas] = useState(false);
  const [errorConsultas, setErrorConsultas] = useState("");
  const [guardandoVenta, setGuardandoVenta] = useState(false);

  //para traer clientes desde la base de datos
  useEffect(() => {
    api
      .get("clientes", { withCredentials: true })
      .then((res) => setClientes(res.data.clientes))
      .catch((err) => console.error(err));
  }, []);

  //traer id del usuario logeado
  useEffect(() => {
    api
      .get("users/comprobar", { withCredentials: true })
      .then((response) => {
        if (response.data.valid) {
          setUsuario(response.data.user);
        } else {
          setUsuario(null);
        }
      })
      .catch((error) => {
        console.error("Error al comprobar el token:", error);
        setUsuario(null);
      });
  }, []);

  //para traer productos desde la base de datos
  useEffect(() => {
    api
      .get("products", { withCredentials: true })
      .then((res) => setProductos(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (tipoCliente !== "registrado" || !clienteSeleccionado?.id || categoriaVenta !== "consulta") {
      return;
    }

    let activo = true;
    api
      .get(`mascotas/cliente/${clienteSeleccionado.id}/consultas-insumos`, {
        withCredentials: true,
      })
      .then((response) => {
        if (activo) setConsultasCliente(response.data.consultas ?? []);
      })
      .catch((error) => {
        console.error("Error al cargar las consultas del cliente:", error);
        if (activo) setErrorConsultas("No se pudieron cargar las consultas del cliente.");
      })
      .finally(() => {
        if (activo) setCargandoConsultas(false);
      });

    return () => {
      activo = false;
    };
  }, [tipoCliente, clienteSeleccionado, categoriaVenta]);

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

    setProductosVenta((prev) => [
      ...prev,
      { ...producto, lineKey: `producto-${producto.id}`, cantidad: 1 },
    ]);
    setBusquedaProducto("");
  };

  const agregarInsumosConsulta = () => {
    const consulta = consultasCliente.find(
      (item) => Number(item.id) === Number(consultaSeleccionada),
    );
    if (!consulta) return;

    const idsAgregados = new Set(
      productosVenta.map((item) => Number(item.id_detalle_consulta)).filter(Boolean),
    );
    const insumosNuevos = consulta.insumos.filter(
      (insumo) => !idsAgregados.has(Number(insumo.id_detalle_consulta)),
    );
    if (insumosNuevos.length === 0) {
      alert("Los insumos de esta consulta ya están agregados a la venta.");
      return;
    }

    setProductosVenta((prev) => [
      ...prev,
      ...insumosNuevos.map((insumo) => ({
        ...insumo,
        id: insumo.id_producto,
        lineKey: `consulta-${insumo.id_detalle_consulta}`,
        id_detalle_consulta: insumo.id_detalle_consulta,
        precio_venta: insumo.precio_venta ?? "",
      })),
    ]);
    setConsultaSeleccionada("");
  };

  //cmabiaar cantidad
  const cambiarCantidad = (id, cantidad) => {
    setProductosVenta((prev) =>
      prev.map((p) => (p.lineKey === id ? { ...p, cantidad: Number(cantidad) } : p)),
    );
  };

  //eliminar producto
  const eliminarProducto = (id) => {
    setProductosVenta((prev) => prev.filter((p) => p.lineKey !== id));
  };

  //para el totoal
  const total = productosVenta.reduce(
    (acc, p) => acc + (Number(p.precio_venta) || 0) * p.cantidad,
    0,
  );

  const registrarVenta = async () => {
    if (guardandoVenta) return;
    if (!usuario?.id) {
      alert("Debe iniciar sesión para registrar una venta.");
      return;
    }

    if (!clienteSeleccionado?.id) {
      alert("Debe seleccionar un cliente para registrar la venta.");
      return;
    }

    if (!metodoPago) {
      alert("Debe seleccionar un método de pago.");
      return;
    }

    if (productosVenta.length === 0) {
      alert("Debe agregar al menos un producto para registrar la venta.");
      return;
    }

    const insumosSinPrecio = productosVenta.filter(
      (item) =>
        item.id_detalle_consulta &&
        (item.precio_venta == null ||
          item.precio_venta === "" ||
          !Number.isFinite(Number(item.precio_venta)) ||
          Number(item.precio_venta) <= 0),
    );
    if (insumosSinPrecio.length > 0) {
      alert("Defina el precio de venta de los insumos desde Productos antes de registrar la venta.");
      return;
    }

    setGuardandoVenta(true);
    try {
      await api.post(
        "ventas/registrar-completa",
        {
          id_cliente: clienteSeleccionado.id,
          metodoPago,
          items: productosVenta.map((item) => ({
            id_producto: item.id,
            cantidad: item.cantidad,
            ...(item.id_detalle_consulta
            ? { id_detalle_consulta: item.id_detalle_consulta }
            : {}),
          })),
        },
        { withCredentials: true },
      );

      window.alert("La venta se ha efectuado con éxito.");
      if (onVentaRegistrada) await onVentaRegistrada();
      onClose?.();
    } catch (error) {
      console.error("Error al registrar la venta:", error);
      alert(error.response?.data?.message || "No se pudo registrar la venta.");
    } finally {
      setGuardandoVenta(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2 className="card-title">Nueva Venta</h2>

        <form className="form">
          <div className="field cliente-field">
            <label htmlFor="cliente">Cliente:</label>

            <select
              id="cliente"
              value={tipoCliente}
              onChange={(e) => {
                const tipo = e.target.value;
                setTipoCliente(tipo);
                setBusqueda("");
                setCategoriaVenta("productos");
                setProductosVenta([]);
                setConsultasCliente([]);
                setConsultaSeleccionada("");
                setCargandoConsultas(false);
                setErrorConsultas("");

                if (tipo === "generico") {
                  const clienteGeneral = clientes.find(
                    (cliente) => Number(cliente.id) === 1,
                  );

                  setClienteSeleccionado(
                    clienteGeneral ?? { id: 1, nombre: "Cliente", apellido: "General" },
                  );
                  return;
                }

                setClienteSeleccionado(null);
              }}
            >
              <option value="">Seleccione tipo</option>
              <option value="generico">Cliente general</option>
              <option value="registrado">Cliente registrado</option>
            </select>
          </div>

          {tipoCliente === "registrado" && !clienteSeleccionado && (
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
                              setConsultasCliente([]);
                              setConsultaSeleccionada("");
                              setErrorConsultas("");
                            }}
                          >
                            {c.nombre} {c.apellido}
                          </li>
                        ))
                    )}
                  </ul>
                )}
              </div>
            </div>
          )}

          {clienteSeleccionado && (
            <div className="cliente-seleccionado">
              <p className="selected-info">
                Cliente seleccionado: {clienteSeleccionado.nombre}{" "}
                {clienteSeleccionado.apellido}
              </p>
              <button
                type="button"
                className="icon-btn"
                onClick={() => {
                  setClienteSeleccionado(null);
                  setBusqueda("");
                  setCategoriaVenta("productos");
                  setConsultasCliente([]);
                  setConsultaSeleccionada("");
                  setProductosVenta([]);
                }}
              >
                ✕
              </button>
            </div>
          )}

          {clienteSeleccionado && (
            <div className="field">
              <label htmlFor="categoriaVenta">Categoría:</label>
              <select
                id="categoriaVenta"
                value={categoriaVenta}
                onChange={(e) => {
                  const categoria = e.target.value;
                  setCategoriaVenta(categoria);
                  setConsultaSeleccionada("");
                  setErrorConsultas("");
                  setCargandoConsultas(categoria === "consulta");
                  if (categoria !== "consulta") setConsultasCliente([]);
                }}
              >
                <option value="productos">Productos</option>
                <option value="consulta" disabled={tipoCliente !== "registrado"}>
                  Consulta
                </option>
              </select>
            </div>
          )}

          {categoriaVenta === "consulta" && tipoCliente === "registrado" && (
            <div className="field consulta-venta-field">
              <label htmlFor="consultaVenta">Consulta:</label>
              <div className="field-content">
                <div className="consulta-selector-fila">
                  <select
                    id="consultaVenta"
                    value={consultaSeleccionada}
                    onChange={(e) => setConsultaSeleccionada(e.target.value)}
                    disabled={cargandoConsultas || consultasCliente.length === 0}
                  >
                    <option value="">
                      {cargandoConsultas
                        ? "Cargando consultas..."
                        : "Seleccione consulta"}
                    </option>
                    {consultasCliente.map((consulta) => (
                      <option key={consulta.id} value={consulta.id}>
                        {consulta.nombre_mascota} —{" "}
                        {String(consulta.fecha_consulta).slice(0, 10)} —{" "}
                        {consulta.motivo || "Consulta"}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn"
                    onClick={agregarInsumosConsulta}
                    disabled={!consultaSeleccionada || cargandoConsultas}
                  >
                    Agregar insumos
                  </button>
                </div>
                {errorConsultas && <p className="error">{errorConsultas}</p>}
                {!cargandoConsultas && !errorConsultas && consultasCliente.length === 0 && (
                  <p className="helper-text">
                    Este cliente no tiene consultas con insumos registrados.
                  </p>
                )}
              </div>
            </div>
          )}

          {categoriaVenta === "productos" && (
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
                  p.venta_al_publico &&
                  p.precio_venta != null &&
                  p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()),
                  ).length === 0 ? (
                    <li className="suggestion-item">
                      No se encontro el producto
                    </li>
                  ) : (
                    productos
                      .filter((p) =>
                      p.venta_al_publico &&
                      p.precio_venta != null &&
                      p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()),
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
          )}

          {productosVenta.length > 0 && (
            <div className="productos-venta">
              <h4 className="section-title">Productos en la venta</h4>

              {productosVenta.map((p) => (
                <div key={p.lineKey} className="producto-item">
                  <div className="producto-info">
                    <div className="producto-datos">
                      <div className="producto-nombre">{p.nombre}</div>
                      <div className="producto-marca">
                        {p.id_detalle_consulta
                          ? "Insumo cobrado desde consulta"
                          : p.marca}
                      </div>
                    </div>
                    <small className="producto-precio">
                      {p.precio_venta == null || p.precio_venta === ""
                        ? "Precio sin definir"
                        : `$${Number(p.precio_venta).toLocaleString()}`}
                    </small>
                    {p.id_detalle_consulta &&
                      (p.precio_venta == null || p.precio_venta === "") && (
                        <small className="helper-text">
                          Definilo en Productos antes de guardar.
                        </small>
                      )}
                  </div>

                  <input
                    type="number"
                    min="1"
                    className="cantidad-input"
                    value={p.cantidad}
                    disabled={Boolean(p.id_detalle_consulta)}
                    onChange={(e) => cambiarCantidad(p.lineKey, e.target.value)}
                  />

                  <span className="producto-total">
                    $
                    {((Number(p.precio_venta) || 0) * p.cantidad).toLocaleString()}
                  </span>

                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => eliminarProducto(p.lineKey)}
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
            <button className="btn" type="button" onClick={registrarVenta} disabled={guardandoVenta}>
              {guardandoVenta ? "Guardando..." : "Guardar"}
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
  gap: 10px;
}

.cliente-field + .cliente-seleccionado {
  margin-top: -12px;
}

.field {
  display: flex;
  align-items: center;
  gap: 6px;
}

.field label {
  width: 140px;
  text-align: left;
  font-size: 16px;
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
  padding: 10px 10px;
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

.consulta-selector-fila {
  display: flex;
  align-items: center;
  gap: 8px;
}

.consulta-selector-fila select {
  min-width: 0;
  flex: 1;
}

.consulta-selector-fila .btn {
  flex-shrink: 0;
  white-space: nowrap;
}

.selected-info {
  margin: 0;
  padding: 10px 10px;
  border-radius: 8px;
  background: #f5f3ff;
  color: #000000;
  font-size: 16px;
}

.cliente-seleccionado {
  display: flex;
  align-items: center;
  gap: 10px; 
  margin-top: 0px;
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

.helper-text {
  margin: 4px 0 0;
  color: #6b7280;
  font-size: 12px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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
  max-width: 150px;
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

  .field {
    align-items: stretch;
    flex-direction: column;
  }

  .field label {
    width: auto;
    text-align: left;
  }
}
`;
