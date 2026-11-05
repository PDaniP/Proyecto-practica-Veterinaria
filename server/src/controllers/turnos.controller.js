import turnosModel from '../models/turnos.model.js';

const asignarTurno = async (req, res) => {
    try {
        const turno = await turnosModel.guardarTurno(req.body);
        res.status(201).json({message: "Turno asignado"});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const modificarTurno = async (req, res) => {
    try {
        const turno = await turnosModel.editarTurno(req.params.id, req.body);
        res.status(200).json({message: "Turno modificado"});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const cancelarTurno = async (req, res) => {
    try {
        const turno = await turnosModel.eliminarTurno(req.params.id);
        res.status(200).json({message: "Turno cancelado"});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const turnoCompletado = async (req, res) => {
    try {
        const turno = await turnosModel.completarTurno(req.params.id)
        res.status(200).json({message: "Turno completado"})
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const obtenerDatosTurno = async (req, res) => {
    try {
        const turno = await turnosModel.datosTurno(req.params.id);
        res.status(200).json(turno);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const obtenerTurnosPorFecha = async (req, res) => {
    try {
        const { fecha } = req.query;

        if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            return res.status(400).json({
                message: "Debes proporcionar una fecha válida con formato AAAA-MM-DD"
            });
        }

        const [anio, mes, dia] = fecha.split("-").map(Number);
        const fechaComprobada = new Date(Date.UTC(anio, mes - 1, dia));

        if (
            fechaComprobada.getUTCFullYear() !== anio ||
            fechaComprobada.getUTCMonth() !== mes - 1 ||
            fechaComprobada.getUTCDate() !== dia
        ) {
            return res.status(400).json({
                message: "La fecha indicada no existe"
            });
        }

        const turnos = await turnosModel.obtenerTurnosPorFecha(fecha);

        return res.status(200).json({ turnos });
    } catch (error) {
        console.error("Error al obtener los turnos:", error);

        return res.status(500).json({
            message: "Error al obtener los turnos",
            error: error.message
        });
    }
};

const reportesTurnos = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;

        if (!fecha_inicio || !fecha_fin) {
            return res.status(400).json({
                message: "Debes proporcionar fecha_inicio y fecha_fin"
            });
        }

        const reportes = await turnosModel.reporteTurnos(fecha_inicio, fecha_fin);
        console.log("Reportes obtenidos:", reportes);
        return res.status(200).json(reportes);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export default {
    asignarTurno,
    modificarTurno,
    cancelarTurno,
    turnoCompletado,
    obtenerDatosTurno,
    obtenerTurnosPorFecha,
    reportesTurnos
};