import { useState, useEffect } from "react";
import axios from "axios";

export default function FormularioNuevaVenta({ onClose }) {
  const [tipoCliente, setTipoCliente] = useState("");
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  //para traer clientes desde la base de datos
  useEffect(() => {
    axios
      .get("http://localhost:3000/clientes")
      .then((res) => setClientes(res.data))
      .catch((err) => console.error(err));
  }, []);

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
