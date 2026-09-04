import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";
import FormularioNuevaMascota from "../../components/FormularioNuevaMascota";
import DetalleMascota from "../../components/DetalleMascota";
import "../comercial/Productos.css";
import "./Mascotas.css";

export default function Mascotas() {
  const navigate = useNavigate();
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [mascotas, setMascotas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const abrirModalCrear = () => setModalCrearAbierto(true);
  const cerrarModalCrear = () => {
    setModalCrearAbierto(false);
    cargarDatos();
  };

  const cargarDatos = async () => {
    setCargando(true);

    try {
      const [mascotasResponse, clientesResponse] = await Promise.all([
        axios.get("http://localhost:3000/mascotas", { withCredentials: true }),
        axios.get("http://localhost:3000/clientes", { withCredentials: true }),
      ]);

      setMascotas(mascotasResponse.data.mascotas ?? []);
      setClientes(clientesResponse.data.clientes ?? []);
    } catch (error) {
      if (error.response?.status === 404) {
        setMascotas([]);
      } else {
        console.error("Error al cargar mascotas:", error);
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const obtenerDueño = (idCliente) => {
    const cliente = clientes.find((item) => item.id === idCliente);
    return cliente
      ? `${cliente.nombre} ${cliente.apellido}`
      : "Dueño no disponible";
  };

  const abrirDetalle = (mascota) => {
    setMascotaSeleccionada(mascota);
    setModalDetalleAbierto(true);
  };

  const mascotasFiltradas = mascotas.filter((mascota) => {
    const termino = busqueda.toLowerCase();
    const dueño = obtenerDueño(mascota.id_cliente).toLowerCase();

    return (
      mascota.nombre?.toLowerCase().includes(termino) || dueño.includes(termino)
    );
  });

  return (
    <section className="page-shell mascotas-page">
      <div className="productos-toolbar">
        <h1>Mascotas</h1>
        <input
          className="search-input"
          type="search"
          placeholder="Buscar por mascota o dueño..."
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
        />
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
              </tr>
            </thead>
            <tbody>
              {mascotasFiltradas.map((mascota) => (
                <tr key={mascota.id}>
                  <td>{mascota.nombre}</td>
                  <td>{mascota.especie}</td>
                  <td>{mascota.raza || "-"}</td>
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
                      onClick={() => navigate("/historias-clinicas")}
                    >
                      Ver historia
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalCrearAbierto} onClose={cerrarModalCrear}>
        <FormularioNuevaMascota onClose={cerrarModalCrear} />
      </Modal>

      <Modal
        isOpen={modalDetalleAbierto}
        onClose={() => setModalDetalleAbierto(false)}
      >
        <DetalleMascota
          mascota={mascotaSeleccionada}
          dueño={mascotaSeleccionada && obtenerDueño(mascotaSeleccionada.id_cliente)}
        />
      </Modal>
    </section>
  );
}
