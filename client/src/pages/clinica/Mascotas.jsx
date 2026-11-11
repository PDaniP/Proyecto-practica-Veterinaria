import { useEffect, useState } from "react";
import api from "../../../config/api.js";
import { useNavigate } from "react-router-dom";
import { normalizarTexto } from "../../utils/normalizarTexto.js";
import Modal from "../../components/Modal";
import FormularioNuevaMascota from "../../components/FormularioNuevaMascota";
import DetalleMascota from "../../components/DetalleMascota";
import ExportarPDF from "../../components/ExportarPDF.jsx";
import "../comercial/Productos.css";
import "./Mascotas.css";
import { obtenerEspecies, obtenerRazas } from "../../service/especiesService";

export default function Mascotas() {
  const navigate = useNavigate();
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [mascotas, setMascotas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const [especies, setEspecies] = useState([]);
  const [razas, setRazas] = useState([]);

  const abrirModalCrear = () => setModalCrearAbierto(true);
  const cerrarModalCrear = () => {
    setModalCrearAbierto(false);
    cargarDatos();
  };

  const cargarDatos = async () => {
    setCargando(true);

    try {
      const [mascotasResponse, clientesResponse, especiesData] =
        await Promise.all([
          api.get("mascotas", {
            withCredentials: true,
          }),
          api.get("clientes", {
            withCredentials: true,
          }),
          obtenerEspecies(),
        ]);
      const mascotasData = mascotasResponse.data.mascotas ?? [];
      const clientesData = clientesResponse.data.clientes ?? [];
      setMascotas(mascotasData);
      setClientes(clientesData);
      setEspecies(especiesData);

      //consultamos las razas de cada especie presente en las mascotas.
      const idsEspecies = [
        ...new Set(
          mascotasData
            .map((mascota) => mascota.id_especie)
            .filter((id) => id != null)
            .map(Number),
        ),
      ];

      const resultadosRazas = await Promise.all(
        idsEspecies.map((idEspecie) => obtenerRazas(idEspecie)),
      );

      setRazas(resultadosRazas.flat());
    } catch (error) {
      if (error.response?.status === 404) {
        setMascotas([]);
        setClientes([]);
        setEspecies([]);
        setRazas([]);
      } else {
        console.error("Error al cargar mascotas o clientes:", error);
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const obtenerDueño = (idCliente) => {
    const cliente = clientes.find(
      (item) => Number(item.id) === Number(idCliente),
    );
    return cliente
      ? `${cliente.nombre} ${cliente.apellido}`
      : "Dueño no disponible";
  };

  const obtenerNombreEspecie = (idEspecie) => {
    const especie = especies.find(
      (item) => Number(item.id) === Number(idEspecie),
    );

    return especie?.nombre ?? "-";
  };

  const obtenerNombreRaza = (idRaza) => {
    const raza = razas.find((item) => Number(item.id) === Number(idRaza));

    return raza?.nombre ?? "-";
  };

  const abrirDetalle = (mascota) => {
    setMascotaSeleccionada(mascota);
    setModalDetalleAbierto(true);
  };

  const actualizarMascota = (mascotaActualizada) => {
    setMascotas((actuales) =>
      actuales
        .map((mascota) =>
          Number(mascota.id) === Number(mascotaActualizada.id)
            ? { ...mascota, ...mascotaActualizada }
            : mascota,
        )
        .filter((mascota) => mascota.activo),
    );
    setMascotaSeleccionada((actual) =>
      actual && Number(actual.id) === Number(mascotaActualizada.id)
        ? { ...actual, ...mascotaActualizada }
        : actual,
    );
  };

  const mascotasFiltradas = mascotas.filter((mascota) => {
    const termino = normalizarTexto(busqueda);
    const dueño = normalizarTexto(obtenerDueño(mascota.id_cliente));

    return (
      normalizarTexto(mascota.nombre).includes(termino) || dueño.includes(termino)
    );
  });

  const POR_PAGINA = 15;
  const [pagina, setPagina] = useState(1);

  const totalPaginas = Math.ceil(mascotasFiltradas.length / POR_PAGINA);
  const paginaActual = Math.min(pagina, Math.max(totalPaginas, 1));
  const filasPagina = mascotasFiltradas.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA,
  );

  return (
    <section className="page-shell mascotas-page">
      <div className="productos-toolbar">
        <h1>Mascotas</h1>
        <input
          className="search-input"
          type="search"
          placeholder="Buscar por mascota o dueño..."
          value={busqueda}
          onChange={(event) => {
            setBusqueda(event.target.value);
            setPagina(1);
          }}
        />
        {!cargando && (
          <ExportarPDF
            titulo="Listado de mascotas"
            nombreArchivo="mascotas"
            secciones={[
              {
                titulo: "Mascotas",
                columnas: [
                  "ID",
                  "Nombre",
                  "Especie",
                  "Raza",
                  "Propietario",
                  "Estado",
                ],
                filas: mascotasFiltradas.map((m) => [
                  m.id,
                  m.nombre,
                  obtenerNombreEspecie(m.id_especie),
                  obtenerNombreRaza(m.id_raza),
                  obtenerDueño(m.id_cliente),
                  m.activo ? "Activo" : "Inactivo",
                ]),
              },
            ]}
          />
        )}
        <button className="btn-primary" onClick={abrirModalCrear}>
          + Nueva mascota
        </button>
      </div>

      {cargando ? (
        <p className="productos-loading">Cargando mascotas...</p>
      ) : mascotasFiltradas.length === 0 ? (
        <p className="productos-empty">No se encontraron mascotas.</p>
      ) : (
        <div className="tabla-wrapper">
          <table className="productos-tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Especie</th>
                <th>Raza</th>
                <th>Dueño</th>
                <th>Detalle</th>
                <th>Historia clínica</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filasPagina.map((mascota) => (
                <tr key={mascota.id}>
                  <td>{mascota.nombre}</td>
                  <td>{obtenerNombreEspecie(mascota.id_especie)}</td>
                  <td>{obtenerNombreRaza(mascota.id_raza)}</td>
                  <td>{obtenerDueño(mascota.id_cliente)}</td>
                  <td>
                    <button
                      className="btn-editar"
                      onClick={() => abrirDetalle(mascota)}
                    >
                      Ver detalle
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn-editar"
                      onClick={() =>
                        navigate(`/historias-clinicas/${mascota.id}`)
                      }
                    >
                      Ver historia
                    </button>
                  </td>
                  <td>
                    {mascota.activo ? (
                      <span className="estado-activo">Activo</span>
                    ) : (
                      <span className="estado-inactivo">Inactivo</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="productos-pagination" aria-label="Paginación">
        <button
          className="productos-pagination__button"
          onClick={() => setPagina((p) => Math.max(p - 1, 1))}
          disabled={paginaActual === 1}
          aria-label="Ir a la página anterior"
        >
          Anterior
        </button>

        <span className="productos-pagination__info">
          Página <strong>{paginaActual}</strong> de{" "}
          <strong>{Math.max(totalPaginas, 1)}</strong>
        </span>

        <button
          className="productos-pagination__button"
          onClick={() => setPagina((p) => Math.min(p + 1, totalPaginas))}
          disabled={paginaActual >= totalPaginas}
          aria-label="Ir a la página siguiente"
        >
          Siguiente
        </button>
      </div>

      <Modal isOpen={modalCrearAbierto} onClose={cerrarModalCrear}>
        <FormularioNuevaMascota onClose={cerrarModalCrear} />
      </Modal>

      <Modal
        isOpen={modalDetalleAbierto}
        onClose={() => setModalDetalleAbierto(false)}
      >
        <DetalleMascota
          key={mascotaSeleccionada?.id}
          mascota={
            mascotaSeleccionada
              ? {
                  ...mascotaSeleccionada,
                  especie: obtenerNombreEspecie(mascotaSeleccionada.id_especie),
                  raza: obtenerNombreRaza(mascotaSeleccionada.id_raza),
                }
              : null
          }
          dueño={
            mascotaSeleccionada
              ? obtenerDueño(mascotaSeleccionada.id_cliente)
              : ""
          }
          onMascotaActualizada={actualizarMascota}
        />
      </Modal>
    </section>
  );
}
