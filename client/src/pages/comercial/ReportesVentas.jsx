import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "./Productos.css";
import "./Ventas.css";
import "./ReportesVentas.css";
import api from "../../../config/api.js"



const FORMAS_PAGO = [
  { clave: "efectivo", label: "Efectivo", badge: "badge-pago-efectivo" },
  { clave: "tarjeta", label: "Tarjeta", badge: "badge-pago-tarjeta" },
  {
    clave: "transferencia",
    label: "Transferencia",
    badge: "badge-pago-transferencia",
  },
];

// Fecha local en formato YYYY-MM-DD (toISOString() devuelve UTC y de noche
// en Argentina podría dar el día siguiente).
const obtenerFechaActual = () => {
  const fecha = new Date();

  return [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, "0"),
    String(fecha.getDate()).padStart(2, "0"),
  ].join("-");
};

const obtenerFechaHace30Dias = (fechaISO) => {
  const [anio, mes, dia] = fechaISO.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  fecha.setDate(fecha.getDate() - 30);

  return [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, "0"),
    String(fecha.getDate()).padStart(2, "0"),
  ].join("-");
};

const formatearMoneda = (valor) =>
  `$${Number(valor).toLocaleString("es-AR", { maximumFractionDigits: 2 })}`;

const formatearDia = (fechaISO) =>
  new Date(fechaISO).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export default function ReportesVentas() {
  const [fechaHasta, setFechaHasta] = useState(obtenerFechaActual);
  const [fechaDesde, setFechaDesde] = useState(() =>
    obtenerFechaHace30Dias(fechaHasta),
  );
  const [reporte, setReporte] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const rangoInvalido =
    Boolean(fechaDesde) && Boolean(fechaHasta) && fechaDesde > fechaHasta;

  useEffect(() => {
    if (!fechaDesde || !fechaHasta || rangoInvalido) return;

    let cancelado = false;

    const cargarReporte = async () => {
      setLoading(true);
      setError("");

      try {
        // BE-12: este endpoint agrupa las ventas por día dentro del rango
        // (aunque se llame "semana" sirve para cualquier rango de fechas).
        const response = await api.get(`/ventas/reporte/semana`, {
          params: { fecha_inicio: fechaDesde, fecha_fin: fechaHasta },
          withCredentials: true,
        });

        if (!cancelado) {
          setReporte(
            Array.isArray(response.data.reporte) ? response.data.reporte : [],
          );
        }
      } catch (err) {
        console.error("Error al cargar el reporte de ventas:", err);

        if (!cancelado) {
          setReporte([]);
          setError("No se pudo cargar el reporte. Inténtelo de nuevo.");
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    };

    cargarReporte();

    return () => {
      cancelado = true;
    };
  }, [fechaDesde, fechaHasta, rangoInvalido]);

  // Postgres devuelve COUNT y SUM como string, por eso se convierte con Number()
  const resumen = useMemo(() => {
    const inicial = {
      cantidad: 0,
      total: 0,
      porPago: {
        efectivo: { cantidad: 0, total: 0 },
        tarjeta: { cantidad: 0, total: 0 },
        transferencia: { cantidad: 0, total: 0 },
      },
    };

    return reporte.reduce((acc, fila) => {
      acc.cantidad += Number(fila.total_ventas) || 0;

      FORMAS_PAGO.forEach(({ clave }) => {
        const monto = Number(fila[clave]) || 0;

        acc.total += monto;
        acc.porPago[clave].total += monto;
        acc.porPago[clave].cantidad += Number(fila[`total_${clave}`]) || 0;
      });

      return acc;
    }, inicial);
  }, [reporte]);

  const totalDelDia = (fila) =>
    FORMAS_PAGO.reduce((suma, { clave }) => suma + (Number(fila[clave]) || 0), 0);

  const porcentaje = (monto) =>
    resumen.total > 0 ? `${((monto / resumen.total) * 100).toFixed(1)}%` : "0%";

  const hoy = () => {
    const hoy = obtenerFechaActual();
    setFechaDesde(obtenerFechaHace30Dias(hoy));
    setFechaHasta(hoy);
  };

  const renderContenido = () => {
    if (rangoInvalido) {
      return (
        <p className="rep-aviso">
          La fecha &quot;Desde&quot; no puede ser posterior a &quot;Hasta&quot;.
        </p>
      );
    }

    if (loading) {
      return <p className="rep-estado">Cargando reporte...</p>;
    }

    if (error) {
      return <p className="rep-aviso">{error}</p>;
    }

    if (reporte.length === 0) {
      return (
        <p className="rep-estado">No hay ventas registradas en ese período.</p>
      );
    }

    return (
      <>
        <div className="rep-resumen">
          <div className="resumen-card">
            <span className="resumen-label">Total vendido</span>
            <span className="resumen-valor">{formatearMoneda(resumen.total)}</span>
          </div>

          <div className="resumen-card">
            <span className="resumen-label">Cantidad de ventas</span>
            <span className="resumen-valor">{resumen.cantidad}</span>
          </div>
        </div>

        <div className="rep-seccion">
          <h2 className="rep-titulo-seccion">Formas de pago</h2>

          <div className="tabla-wrapper">
            <table className="productos-tabla">
              <thead>
                <tr>
                  <th>Forma de pago</th>
                  <th className="rep-num rep-num--centrado">Ventas</th>
                  <th className="rep-num rep-num--centrado">Total</th>
                  <th className="rep-num">% del total</th>
                </tr>
              </thead>

              <tbody>
                {FORMAS_PAGO.map(({ clave, label, badge }) => (
                  <tr key={clave}>
                    <td>
                      <span className={`badge ${badge}`}>{label}</span>
                    </td>
                    <td className="rep-num rep-num--centrado">
                      {resumen.porPago[clave].cantidad}
                    </td>
                    <td className="rep-num rep-num--centrado">
                      {formatearMoneda(resumen.porPago[clave].total)}
                    </td>
                    <td className="rep-num">
                      {porcentaje(resumen.porPago[clave].total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rep-seccion">
          <h2 className="rep-titulo-seccion">Detalle por día</h2>

          <div className="tabla-wrapper">
            <table className="productos-tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th className="rep-num rep-num--centrado">Ventas</th>
                  <th className="rep-num rep-num--centrado">Efectivo</th>
                  <th className="rep-num rep-num--centrado">Tarjeta</th>
                  <th className="rep-num rep-num--centrado">Transferencia</th>
                  <th className="rep-num">Total</th>
                </tr>
              </thead>

              <tbody>
                {reporte.map((fila) => (
                  <tr key={fila.fecha}>
                    <td>{formatearDia(fila.fecha)}</td>
                    <td className="rep-num rep-num--centrado">
                      {Number(fila.total_ventas)}
                    </td>
                    <td className="rep-num rep-num--centrado">
                      {formatearMoneda(fila.efectivo)}
                    </td>
                    <td className="rep-num rep-num--centrado">
                      {formatearMoneda(fila.tarjeta)}
                    </td>
                    <td className="rep-num rep-num--centrado">
                      {formatearMoneda(fila.transferencia)}
                    </td>
                    <td className="rep-num rep-total">
                      {formatearMoneda(totalDelDia(fila))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  return (
    <section className="page-shell reportes-page">
      <div className="ventas-header">
        <h1>Reportes de ventas</h1>
      </div>

      <div className="fecha-filtro rep-filtros">
        <label className="fecha-label fecha-label--desde" htmlFor="rep-desde">
          Desde
        </label>
        <input
          id="rep-desde"
          type="date"
          className="search-input fecha-input fecha-input--desde"
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
        />
        <label className="fecha-label fecha-label--hasta" htmlFor="rep-hasta">
          Hasta
        </label>
        <input
          id="rep-hasta"
          type="date"
          className="search-input fecha-input fecha-input--hasta"
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
        />
        <button type="button" className="btn-reset" onClick={hoy}>
          Hoy
        </button>
      </div>

      {renderContenido()}
    </section>
  );
}
