import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AlertaStockFlotante from "../components/AlertaStockFlotante.jsx";
import api from "../../config/api.js";
import AgendaTurnos from "../components/turnos/AgendaTurnos.jsx";
import {
  obtenerTurnosPorFecha,
  obtenerHorarioAtencion,
  actualizarHorarioAtencion,
  completarTurno,
  cancelarTurno,
} from "../service/turnosService.js";
import Modal from "../components/Modal.jsx";
import FormularioTurno from "../components/turnos/FormularioTurnos.jsx";
import VistaSemana from "../components/turnos/VistaSemana.jsx";
import VistaMes from "../components/turnos/VistaMes.jsx";
import useSystemFeedback from "../hooks/useSystemFeedback.js";

const formatearFecha = (fecha) => {
  return [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, "0"),
    String(fecha.getDate()).padStart(2, "0"),
  ].join("-");
};

const obtenerFechaActual = () => {
  const fecha = new Date();

  return [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, "0"),
    String(fecha.getDate()).padStart(2, "0"),
  ].join("-");
};

const desplazarFecha = (fecha, cantidadDias) => {
  const [anio, mes, dia] = fecha.split("-").map(Number);

  const nuevaFecha = new Date(anio, mes - 1, dia);
  nuevaFecha.setDate(nuevaFecha.getDate() + cantidadDias);

  return formatearFecha(nuevaFecha);
};



export default function Home() {
  const { mostrarAlerta, confirmarAccion } = useSystemFeedback();
  const [stock, setStock] = useState([]);
  const [ventasDiarias, setVentasDiarias] = useState([]);
  const [ventasSemanales, setVentasSemanales] = useState([]);
  const [ventasMensuales, setVentasMensuales] = useState([]);
  const [fechaInicio, setFechaInicio] = useState(obtenerFechaActual);
  const [fechaFin, setFechaFin] = useState(obtenerFechaActual);
  const [fechaElegida, setFechaElegida] = useState("dia");

  const [turnos, setTurnos] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [cargandoTurnos, setCargandoTurnos] = useState(true);
  const [errorTurnos, setErrorTurnos] = useState("");
  const [fechaAgenda, setFechaAgenda] = useState(obtenerFechaActual);
  const [horarioAtencion, setHorarioAtencion] = useState(null);
  const [cargandoHorario, setCargandoHorario] = useState(true);
  const [guardandoHorario, setGuardandoHorario] = useState(false);
  const [errorHorario, setErrorHorario] = useState("");
  const [mensajeHorario, setMensajeHorario] = useState("");
  const [horarioBorrador, setHorarioBorrador] = useState(null);

  const [modalNuevoTurnoAbierto, setModalNuevoTurnoAbierto] = useState(false);
  const [actualizarturnos, setActualizarTurnos] = useState(0);
  const [profesionalSeleccionado, setProfesionalSeleccionado] =
    useState("todos");
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("todos");

  const [modalSemanaAbierto, setModalSemanaAbierto] = useState(false);
  const [turnoEditar, setTurnoEditar] = useState(null);
  const [modalMesAbierto, setModalMesAbierto] = useState(false);

  useEffect(() => {
    const cargarTurnos = async () => {
      try {
        setCargandoTurnos(true);
        setErrorTurnos("");

        const turnosObtenidos = await obtenerTurnosPorFecha(fechaAgenda);

        setTurnos(turnosObtenidos);
      } catch (error) {
        console.error("Error al cargar los turnos:", error);

        setErrorTurnos("No se pudieron cargar los turnos del día.");
      } finally {
        setCargandoTurnos(false);
      }
    };

    cargarTurnos();
  }, [fechaAgenda, actualizarturnos]);

  useEffect(() => {
    let cancelado = false;

    const cargarHorario = async () => {
      try {
        const horario = await obtenerHorarioAtencion();
        if (!cancelado) {
          setHorarioAtencion(horario);
          setHorarioBorrador(horario);
        }
      } catch (error) {
        console.error("Error al cargar el horario de atención:", error);
        if (!cancelado) {
          setErrorHorario(
            error.response?.data?.message ||
              "No se pudo cargar el horario de atención.",
          );
        }
      } finally {
        if (!cancelado) setCargandoHorario(false);
      }
    };

    cargarHorario();

    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    const cargarProfesionales = async () => {
      try {
        const response = await api.get("users/lista", {
          withCredentials: true,
        });

        const usuarios = response.data.usuarios ?? [];

        const usuariosActivos = usuarios.filter(
          (usuario) =>
            (usuario.activo === true || usuario.activo === "true") &&
            usuario.nombre?.trim().toLowerCase() !== "admin",
        );

        setProfesionales(usuariosActivos);
      } catch (error) {
        console.error("Error al cargar los profesionales:", error);
      }
    };

    cargarProfesionales();
  }, []);

  const cambiarEstadoFecha = (nuevaFecha) => {
    setFechaElegida(nuevaFecha);

    const hoy = new Date();

    if (nuevaFecha === "dia") {
      setFechaInicio(obtenerFechaActual());
      setFechaFin(obtenerFechaActual());
    }

    if (nuevaFecha === "semana") {
      const inicio = new Date(hoy);
      inicio.setDate(hoy.getDate() - 6);

      setFechaInicio(formatearFecha(inicio));
      setFechaFin(obtenerFechaActual());
    }

    if (nuevaFecha === "mes") {
      const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

      setFechaInicio(formatearFecha(inicio));
      setFechaFin(obtenerFechaActual());
    }
  };

  const guardarHorario = async (nuevoHorario) => {
    setGuardandoHorario(true);
    setErrorHorario("");
    setMensajeHorario("");

    try {
      const horarioGuardado = await actualizarHorarioAtencion(nuevoHorario);
      setHorarioAtencion(horarioGuardado);
      setHorarioBorrador(horarioGuardado);
      setMensajeHorario("Horario guardado");
    } catch (error) {
      console.error("Error al guardar el horario de atención:", error);
      setErrorHorario(
        error.response?.data?.message ||
          "No se pudo guardar el horario de atención.",
      );
    } finally {
      setGuardandoHorario(false);
    }
  };

  const cambiarHorarioBorrador = (actualizar) => {
    setHorarioBorrador(actualizar);
    setErrorHorario("");
    setMensajeHorario("");
  };

  const manejarCompletarTurno = async (turno) => {
    const confirmar = await confirmarAccion(
      `¿Querés marcar como completado el turno de ${turno.nombre_contacto}?`,
      { variante: "warning", textoConfirmar: "Completar turno" },
    );

    if (!confirmar) return;

    try {
      await completarTurno(turno.id);

      setActualizarTurnos((actual) => actual + 1);
    } catch (error) {
      console.error("Error al completar el turno:", error);
      await mostrarAlerta(error.response?.data?.message || "No se pudo completar el turno.", { variante: "error" });
    }
  };

  const manejarCancelarTurno = async (turno) => {
    const confirmar = await confirmarAccion(
      `¿Querés cancelar el turno de ${turno.nombre_contacto}?`,
      { variante: "error", textoConfirmar: "Cancelar turno" },
    );

    if (!confirmar) return;

    try {
      await cancelarTurno(turno.id);

      setActualizarTurnos((actual) => actual + 1);
    } catch (error) {
      console.error("Error al cancelar el turno:", error);
      await mostrarAlerta(error.response?.data?.message || "No se pudo cancelar el turno.", { variante: "error" });
    }
  };

  return (
    <section className="page-shell home-page">

      <AgendaTurnos
        turnos={turnos}
        profesionales={profesionales}
        cargando={cargandoTurnos}
        error={errorTurnos}
        profesionalSeleccionado={profesionalSeleccionado}
        setProfesionalSeleccionado={setProfesionalSeleccionado}
        estadoSeleccionado={estadoSeleccionado}
        setEstadoSeleccionado={setEstadoSeleccionado}
        fechaAgenda={fechaAgenda}
        onCambiarDia={(cantidad) => {
          setFechaAgenda((fechaActual) =>
            desplazarFecha(fechaActual, cantidad),
          );
        }}
        onVolverHoy={() => setFechaAgenda(obtenerFechaActual())}
        onNuevoTurno={() => {
          setTurnoEditar(null);
          setModalNuevoTurnoAbierto(true);
        }}
        onEditarTurno={(turno) => {
          setTurnoEditar(turno);
          setModalNuevoTurnoAbierto(true);
        }}
        onCompletarTurno={manejarCompletarTurno}
        onCancelarTurno={manejarCancelarTurno}
        onVerSemana={() => setModalSemanaAbierto(true)}
        onVerMes={() => setModalMesAbierto(true)}
        horarioBorrador={horarioBorrador}
        onCambiarHorario={cambiarHorarioBorrador}
        cargandoHorario={cargandoHorario}
        guardandoHorario={guardandoHorario}
        errorHorario={errorHorario}
        mensajeHorario={mensajeHorario}
        onGuardarHorario={guardarHorario}
      />

      {stock.length > 0 && (
        <div>
          <h2>Productos con stock bajo:</h2>
          <ul>
            {stock.map((item, index) => (
              <li key={index}>
                {item.nombre} - Stock actual: {item.stock_actual}
              </li>
            ))}
          </ul>
        </div>
      )}

      <AlertaStockFlotante />

      <Modal
        isOpen={modalNuevoTurnoAbierto}
        className="modal--agenda"
        onClose={() => {
          setModalNuevoTurnoAbierto(false);
          setTurnoEditar(null);
        }}
      >
        <FormularioTurno
          profesionales={profesionales}
          turnoEditar={turnoEditar}
          horarioAtencion={horarioAtencion}
          onClose={() => {
            setModalNuevoTurnoAbierto(false);
            setTurnoEditar(null);
          }}
          onGuardado={async () => {
            setActualizarTurnos((anterior) => anterior + 1);
          }}
        />
      </Modal>

      <Modal
        isOpen={modalSemanaAbierto}
        onClose={() => setModalSemanaAbierto(false)}
        className="modal--wide modal--agenda"
      >
        <VistaSemana
          profesionales={profesionales}
          profesionalSeleccionado={profesionalSeleccionado}
          estadoSeleccionado={estadoSeleccionado}
          actualizarTurnos={actualizarturnos}
          horarioAtencion={horarioAtencion}
          onEditarTurno={(turno) => {
            setTurnoEditar(turno);
            setModalSemanaAbierto(false);
            setModalNuevoTurnoAbierto(true);
          }}
          onCerrar={() => setModalSemanaAbierto(false)}
        />
      </Modal>

      <Modal
        isOpen={modalMesAbierto}
        onClose={() => setModalMesAbierto(false)}
        className="modal--agenda"
      >
        <VistaMes
          profesionalSeleccionado={profesionalSeleccionado}
          estadoSeleccionado={estadoSeleccionado}
          actualizarTurnos={actualizarturnos}
          onCerrar={() => setModalMesAbierto(false)}
          onEditarTurno={(turno) => {
            setTurnoEditar(turno);
            setModalMesAbierto(false);
            setModalNuevoTurnoAbierto(true);
          }}
        />
      </Modal>
    </section>
  );
}
