import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import api from '../../../config/api.js';
import "./Productos.css";
import "./Ventas.css";
import "./AlertasStock.css";

const API_URL = "/products";

// Postgres devuelve SUM() como string y null si el producto no tiene lotes,
// por eso se convierte con Number() y se toma null como 0.
const stockDe = (producto) => Number(producto.stock_actual) || 0;
const minimoDe = (producto) => Number(producto.stock_minimo) || 0;

// Criterio de FE-14: stock igual o menor al mínimo
const esCritico = (producto) => stockDe(producto) <= minimoDe(producto);

const estadoDe = (producto) => {
  const actual = stockDe(producto);

  if (actual === 0) return { texto: "Sin stock", badge: "badge-danger" };
  if (actual < minimoDe(producto))
    return { texto: "Bajo el mínimo", badge: "badge-warning" };

  return { texto: "En el mínimo", badge: "badge-warning" };
};

export default function AlertasStock() {

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let cancelado = false;

    const cargarProductos = async () => {
      try {
        // TODO BE-11: cuando exista el endpoint de alertas de stock, se puede
        // reemplazar este GET y el filtro de abajo por esa llamada.
        const response = await api.get(API_URL, { withCredentials: true });

        if (!cancelado) {
          setProductos(Array.isArray(response.data) ? response.data : []);
          setError("");
        }
      } catch (err) {
        console.error("Error al cargar los productos:", err);

        if (!cancelado) {
          setProductos([]);
          setError("No se pudieron cargar los productos. Inténtelo de nuevo.");
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    };

    cargarProductos();

    return () => {
      cancelado = true;
    };
  }, [recarga]);

  const actualizar = () => {
    setLoading(true);
    setRecarga((n) => n + 1);
  };

  // Los más críticos primero (los que están más por debajo de su mínimo)
  const criticos = useMemo(() => {
    return productos
      .filter(esCritico)
      .sort(
        (a, b) =>
          stockDe(a) -
            minimoDe(a) -
            (stockDe(b) - minimoDe(b)) ||
          a.nombre.localeCompare(b.nombre),
      );
  }, [productos]);

  const sinStock = useMemo(
    () => criticos.filter((p) => stockDe(p) === 0).length,
    [criticos],
  );

  const renderContenido = () => {
    if (loading) {
      return <p className="alertas-estado">Cargando productos...</p>;
    }

    if (error) {
      return (
        <p className="alertas-aviso" role="alert">
          {error}
        </p>
      );
    }

    if (criticos.length === 0) {
      return (
        <p className="alertas-ok">
          Todos los productos tienen stock por encima del mínimo.
        </p>
      );
    }

    return (
      <>
        <div className="alertas-resumen">
          <div className="resumen-card">
            <span className="resumen-label">Productos críticos</span>
            <span className="resumen-valor">{criticos.length}</span>
          </div>

          <div className="resumen-card">
            <span className="resumen-label">Sin stock</span>
            <span className="resumen-valor">{sinStock}</span>
          </div>
        </div>

        <div className="tabla-wrapper">
          <table className="productos-tabla alertas-stock-tabla">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Marca</th>
                <th className="alertas-num">Stock actual</th>
                <th className="alertas-num">Stock mínimo</th>
                <th className="alertas-num">Faltan</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {criticos.map((p) => {
                const estado = estadoDe(p);

                return (
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td>{p.marca || "—"}</td>
                    <td className="alertas-num">{stockDe(p)}</td>
                    <td className="alertas-num">{minimoDe(p)}</td>
                    <td className="alertas-num">
                      {Math.max(minimoDe(p) - stockDe(p), 0)}
                    </td>
                    <td>
                      <span className={`badge ${estado.badge}`}>
                        {estado.texto}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <section className="page-shell alertas-page">
      <div className="alertas-header">
        <h1>Alertas de stock</h1>

        <button
          type="button"
          className="btn-reset"
          onClick={actualizar}
          disabled={loading}
        >
          Actualizar
        </button>
      </div>

      {renderContenido()}
    </section>
  );
}
