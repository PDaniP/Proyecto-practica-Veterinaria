import { useState, useEffect } from "react";
import api from "../../config/api.js";
import { normalizarTexto } from "../utils/normalizarTexto.js";
import useSystemFeedback from "../hooks/useSystemFeedback.js";
import "./FormularioNuevaVenta.css";

export default function FormularioNuevaVenta({ onClose, onVentaRegistrada }) {
  const { mostrarAlerta } = useSystemFeedback();
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
      mostrarAlerta("Los insumos de esta consulta ya están agregados a la venta.", { variante: "warning" });
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
      mostrarAlerta("Debe iniciar sesión para registrar una venta.", { variante: "warning" });
      return;
    }

    if (!clienteSeleccionado?.id) {
      mostrarAlerta("Debe seleccionar un cliente para registrar la venta.", { variante: "warning" });
      return;
    }

    if (!metodoPago) {
      mostrarAlerta("Debe seleccionar un método de pago.", { variante: "warning" });
      return;
    }

    if (productosVenta.length === 0) {
      mostrarAlerta("Debe agregar al menos un producto para registrar la venta.", { variante: "warning" });
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
      mostrarAlerta("Defina el precio de venta de los insumos desde Productos antes de registrar la venta.", { variante: "warning" });
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

      await mostrarAlerta("La venta se ha efectuado con éxito.", { variante: "success" });
      if (onVentaRegistrada) await onVentaRegistrada();
      onClose?.();
    } catch (error) {
      console.error("Error al registrar la venta:", error);
      await mostrarAlerta(error.response?.data?.message || "No se pudo registrar la venta.", { variante: "error" });
    } finally {
      setGuardandoVenta(false);
    }
  };

  return (
    <div className="nueva-venta">
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
                      normalizarTexto(c.nombre).includes(
                        normalizarTexto(busqueda),
                      ),
                    ).length === 0 ? (
                      <li className="suggestion-item">
                        No se encontraron clientes
                      </li>
                    ) : (
                      clientes
                        .filter((c) =>
                          normalizarTexto(c.nombre).includes(
                            normalizarTexto(busqueda),
                          ),
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
                  normalizarTexto(p.nombre).includes(
                    normalizarTexto(busquedaProducto),
                  ),
                  ).length === 0 ? (
                    <li className="suggestion-item">
                      No se encontro el producto
                    </li>
                  ) : (
                    productos
                      .filter((p) =>
                      p.venta_al_publico &&
                      p.precio_venta != null &&
                      normalizarTexto(p.nombre).includes(
                        normalizarTexto(busquedaProducto),
                      ),
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
