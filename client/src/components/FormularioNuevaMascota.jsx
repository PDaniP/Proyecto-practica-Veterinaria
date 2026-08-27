import { useEffect, useState } from "react";
import axios from "axios";

export default function FormularioNuevaMascota() {
  const [tipoDueño, setTipoDueño] = useState("");
  const [dueño, setDueño] = useState("");
  const [dueños, setDueños] = useState([]);
  const [busquedaDueño, setBusquedaDueño] = useState("");
  const [errorDueños, setErrorDueños] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:3000/clientes")
      .then((response) => setDueños(response.data.clientes ?? []))
      .catch(() => setErrorDueños("No se pudieron cargar los dueños."));
  }, []);

  const dueñosFiltrados = dueños.filter((cliente) => {
    const nombreCompleto = `${cliente.nombre} ${cliente.apellido} ${cliente.dni}`;
    return nombreCompleto.toLowerCase().includes(busquedaDueño.toLowerCase());
  });

  const cambiarTipoDueño = (event) => {
    const tipo = event.target.value;
    setTipoDueño(tipo);
    setBusquedaDueño("");

    if (tipo === "sin-dueño") {
      setDueño("sin dueño");
    } else {
      setDueño("");
    }
  };

  return (
    <div>
      <div className="card">
        <h2 className="card-title">Nueva Mascota</h2>

        <form>
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input type="text" className="form-control" id="nombre" />
          </div>

          <div className="form-group">
            <label htmlFor="especie">Especie</label>
            <input type="text" className="form-control" id="especie" />
          </div>

          <div className="form-group">
            <label htmlFor="raza">Raza</label>
            <input type="text" className="form-control" id="raza" />
          </div>

          <div className="form-group">
            <label htmlFor="sexo">Sexo</label>
            <input type="text" className="form-control" id="sexo" />
          </div>

          <div className="form-group">
            <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
            <input type="date" className="form-control" id="fechaNacimiento" />
          </div>

          <div className="form-group">
            <label htmlFor="tipoDueño">Dueño</label>
            <select
              className="form-control"
              id="tipoDueño"
              value={tipoDueño}
              onChange={cambiarTipoDueño}
            >
              <option value="">Seleccione una opción</option>
              <option value="buscar-dueño">Buscar dueño</option>
              <option value="sin-dueño">Sin dueño</option>
            </select>

            {tipoDueño === "buscar-dueño" && (
              <div className="form-group">
                <label htmlFor="busquedaDueño">Buscar dueño</label>
                <input
                  type="search"
                  className="form-control"
                  id="busquedaDueño"
                  placeholder="Nombre, apellido o DNI"
                  value={busquedaDueño}
                  onChange={(event) => setBusquedaDueño(event.target.value)}
                />
                {errorDueños && <p>{errorDueños}</p>}
                {busquedaDueño && (
                  <ul className="suggestions">
                    {dueñosFiltrados.length === 0 ? (
                      <li className="suggestion-item">
                        No se encontraron dueños
                      </li>
                    ) : (
                      dueñosFiltrados.map((cliente) => (
                        <li key={cliente.id} className="suggestion-item">
                          <button
                            type="button"
                            onClick={() => {
                              setDueño(`${cliente.nombre} ${cliente.apellido}`);
                              setBusquedaDueño(
                                `${cliente.nombre} ${cliente.apellido}`,
                              );
                            }}
                          >
                            {cliente.nombre} {cliente.apellido} ({cliente.dni})
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            )}

            <input type="hidden" name="dueño" id="dueño" value={dueño} />
          </div>

          <div className="form-group">
            <label htmlFor="tieneChip">Tiene chip</label>
            <input
              type="checkbox"
              className="form-check-input"
              id="tieneChip"
            />
          </div>

          <div className="form-group">
            <label htmlFor="numeroChip">Número de chip</label>
            <input type="text" className="form-control" id="numeroChip" />
          </div>
          
          <div className="form-group">
            <label htmlFor="observaciones">Observaciones</label>
            <textarea className="form-control" id="observaciones"></textarea>
          </div>

          <button type="submit" className="btn btn-primary">
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
}
