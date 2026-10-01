import { useEffect, useState } from "react";
import axios from "axios";
import { hoy } from "../utils/vacuna.js";

export default function CamposVacuna({ valor, onChange, prefijo = "vacuna" }) {
  const [lotes, setLotes] = useState([]);
  const [errorLotes, setErrorLotes] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:3000/products/product/lotes", {
        withCredentials: true,
      })
      .then((response) => setLotes(response.data.datos ?? []))
      .catch(() => setErrorLotes("No se pudieron cargar los lotes."));
  }, []);

  const lotesDisponibles = lotes.filter((lote) => {
    if (!lote.id) return false;
    if (lote.categoria && lote.categoria !== "Vacunas") return false;
    if (lote.activo === false) return false;
    if (Number(lote.stock_actual) <= 0) return false;
    if (lote.fecha_vencimiento && lote.fecha_vencimiento.slice(0, 10) < hoy()) {
      return false;
    }
    return true;
  });

  const actualizar = (cambios) => onChange({ ...valor, ...cambios });

  const handleChange = (event) => {
    const { name, value } = event.target;
    actualizar({ [name]: value });
  };

  const elegirLote = (event) => {
    const id = event.target.value;
    const lote = lotesDisponibles.find((item) => String(item.id) === id);

    actualizar({
      id_lote: id,
      nombre_vacuna: lote ? lote.nombre_producto : valor.nombre_vacuna,
    });
  };

  return (
    <>
      <div className="cf-campo">
        <label htmlFor={`${prefijo}-lote`}>Lote (opcional)</label>
        <select
          id={`${prefijo}-lote`}
          value={valor.id_lote}
          onChange={elegirLote}
        >
          <option value="">Sin lote / vacuna externa</option>
          {lotesDisponibles.map((lote) => (
            <option key={lote.id} value={lote.id}>
              {lote.nombre_producto} · Lote {lote.codigo_lote} · vence{" "}
              {lote.fecha_vencimiento?.slice(0, 10)}
            </option>
          ))}
        </select>
        {errorLotes && <p className="cf-ayuda">{errorLotes}</p>}
      </div>

      <div className="cf-campo">
        <label htmlFor={`${prefijo}-nombre`}>
          Nombre de la vacuna <span className="cf-obligatorio">*</span>
        </label>
        <input
          type="text"
          id={`${prefijo}-nombre`}
          name="nombre_vacuna"
          placeholder="Ej: Quíntuple Canina, Antirrábica"
          value={valor.nombre_vacuna}
          onChange={handleChange}
        />
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
