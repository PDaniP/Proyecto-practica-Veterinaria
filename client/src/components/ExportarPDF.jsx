import { useState } from "react";

const escaparHTML = (valor) =>
  String(valor ?? "—")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const normalizarNombreArchivo = (nombre) =>
  (nombre || "reporte")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "reporte";

const construirTabla = ({ titulo, columnas = [], filas = [] }) => {
  const encabezado = columnas
    .map((columna) => `<th scope="col">${escaparHTML(columna)}</th>`)
    .join("");
  const cuerpo = filas
    .map(
      (fila) =>
        `<tr>${columnas
          .map((_, indice) => `<td>${escaparHTML(fila[indice])}</td>`)
          .join("")}</tr>`,
    )
    .join("");

  return `
    <section>
      ${titulo ? `<h2>${escaparHTML(titulo)}</h2>` : ""}
      <table>
        <thead><tr>${encabezado}</tr></thead>
        <tbody>${cuerpo}</tbody>
      </table>
    </section>
  `;
};

const crearDocumento = ({ titulo, nombreArchivo, metadata, secciones }) => {
  const datosMetadata = Object.entries(metadata || {})
    .map(
      ([etiqueta, valor]) =>
        `<p><strong>${escaparHTML(etiqueta)}:</strong> ${escaparHTML(valor)}</p>`,
    )
    .join("");
  const contenido = secciones.map(construirTabla).join("");
  const tituloSeguro = escaparHTML(titulo);
  const nombreSeguro = escaparHTML(nombreArchivo);
  const fechaGeneracion = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());

  return `<!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${nombreSeguro}</title>
        <style>
          @page { size: A4 landscape; margin: 14mm; }
          * { box-sizing: border-box; }
          body {
            color: #20242b;
            font: 10pt/1.45 Arial, Helvetica, sans-serif;
            margin: 0;
          }
          header { border-bottom: 2px solid #6650a4; margin-bottom: 18px; padding-bottom: 10px; }
          h1 { color: #3f3268; font-size: 19pt; margin: 0 0 6px; }
          h2 { color: #3f3268; font-size: 13pt; margin: 18px 0 8px; }
          header p { margin: 3px 0; }
          .generado { color: #555; font-size: 9pt; margin-top: 10px; }
          table { border-collapse: collapse; table-layout: fixed; width: 100%; }
          thead { display: table-header-group; }
          th, td {
            border: 1px solid #c9c5d3;
            overflow-wrap: anywhere;
            padding: 6px 7px;
            text-align: left;
            vertical-align: top;
            white-space: pre-wrap;
          }
          th { background: #eeeaf6; color: #332752; font-weight: 700; }
          tr { break-inside: avoid; page-break-inside: avoid; }
          section { break-inside: auto; }
          h2 { break-after: avoid; page-break-after: avoid; }
          @media screen {
            body { margin: 24px auto; max-width: 1100px; padding: 24px; }
            header { margin-bottom: 24px; }
          }
        </style>
      </head>
      <body>
        <header>
          <h1>${tituloSeguro}</h1>
          ${datosMetadata}
          <p class="generado"><strong>Generado:</strong> ${escaparHTML(fechaGeneracion)}</p>
        </header>
        ${contenido}
      </body>
    </html>`;
};

export default function ExportarPDF({
  titulo,
  nombreArchivo,
  metadata,
  secciones = [],
  className = "btn-primary",
  obtenerSecciones,
  ariaLabel,
}) {
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const descargar = async () => {
    setError("");

    if (!obtenerSecciones && (!Array.isArray(secciones) || secciones.length === 0)) {
      setError("No hay datos para exportar.");
      return;
    }

    if (!obtenerSecciones && !secciones.some(
      (seccion) => Array.isArray(seccion.columnas) && seccion.columnas.length > 0 &&
        Array.isArray(seccion.filas) && seccion.filas.length > 0,
    )) {
      setError("No hay datos para exportar.");
      return;
    }

    const ventana = window.open("", "_blank");
    if (!ventana) {
      setError("El navegador bloqueó la ventana de impresión. Permita las ventanas emergentes e inténtelo de nuevo.");
      return;
    }

    try {
      ventana.opener = null;
      setCargando(true);
      const datos = obtenerSecciones ? await obtenerSecciones() : secciones;
      if (!Array.isArray(datos)) {
        throw new Error("Los datos para exportar no tienen el formato esperado.");
      }
      const seccionesValidas = datos.filter(
        (seccion) =>
          Array.isArray(seccion.columnas) &&
          seccion.columnas.length > 0 &&
          Array.isArray(seccion.filas) &&
          seccion.filas.length > 0,
      );
      if (seccionesValidas.length === 0) {
        throw new Error("No hay datos para exportar.");
      }
      if (ventana.closed) {
        throw new Error("Se cerró la ventana de impresión antes de preparar el documento.");
      }
      ventana.document.open();
      ventana.document.write(
        crearDocumento({
          titulo: titulo || "Reporte",
          nombreArchivo: normalizarNombreArchivo(nombreArchivo || titulo),
          metadata,
          secciones: seccionesValidas,
        }),
      );
      ventana.document.close();
      ventana.setTimeout(() => {
        if (!ventana.closed) ventana.print();
      }, 250);
    } catch (errorImpresion) {
      console.error("Error al preparar el documento PDF:", errorImpresion);
      ventana.close();
      setError(
        `No se pudo preparar el documento para imprimir. ${
          errorImpresion.response?.data?.message || errorImpresion.message || ""
        }`.trim(),
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <button type="button" className={className} onClick={descargar} disabled={cargando} aria-label={ariaLabel}>
        {cargando ? "Preparando PDF..." : "Descargar PDF"}
      </button>
      {error && (
        <p role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}
