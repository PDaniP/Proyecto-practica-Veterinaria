import turnosModel from '../models/turnos.model.js';

const validarHorarioAtencion = (horario) => {
    const { hora_inicio, hora_fin, dia_inicio, dia_fin } = horario ?? {};
    const formatoHoraValido = (hora) =>
        typeof hora === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);
    const formatoDiaValido = (dia) =>
        Number.isInteger(dia) && dia >= 1 && dia <= 7;

    if (
        !formatoHoraValido(hora_inicio) ||
        !formatoHoraValido(hora_fin) ||
        hora_inicio >= hora_fin ||
        !formatoDiaValido(dia_inicio) ||
        !formatoDiaValido(dia_fin)
    ) {
        return 'El horario, las horas y el rango de días no son válidos.';
    }

    return null;
};

const obtenerHorarioAtencion = async (req, res) => {
    try {
        const horario = await turnosModel.obtenerHorarioAtencion();

        if (!horario) {
            return res.status(500).json({
                message: 'No está configurado el horario de atención. Ejecutá la migración de horario_atencion.'
            });
        }

        return res.status(200).json({ horario });
    } catch (error) {
        console.error('Error al obtener el horario de atención:', error);
        return res.status(500).json({ message: 'No se pudo obtener el horario de atención.' });
    }
};

const actualizarHorarioAtencion = async (req, res) => {
    const errorValidacion = validarHorarioAtencion(req.body);

    if (errorValidacion) {
        return res.status(400).json({ message: errorValidacion });
    }

    try {
        const horario = await turnosModel.guardarHorarioAtencion(req.body);
        return res.status(200).json({ horario, message: 'Horario de atención actualizado.' });
    } catch (error) {
        console.error('Error al actualizar el horario de atención:', error);
        return res.status(500).json({ message: 'No se pudo actualizar el horario de atención.' });
    }
};

const validarDisponibilidadTurno = async (fechaHora) => {
    if (typeof fechaHora !== 'string') {
        return 'La fecha y hora del turno no son válidas.';
    }

    const coincidencia = fechaHora.match(
        /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/
    );

    if (!coincidencia) {
        return 'La fecha y hora del turno no son válidas.';
    }

    const [, anio, mes, dia, hora, minuto] = coincidencia;
    const fecha = new Date(Date.UTC(Number(anio), Number(mes) - 1, Number(dia)));

    if (
        fecha.getUTCFullYear() !== Number(anio) ||
        fecha.getUTCMonth() !== Number(mes) - 1 ||
        fecha.getUTCDate() !== Number(dia)
    ) {
        return 'La fecha del turno no existe.';
    }

    const horario = await turnosModel.obtenerHorarioAtencion();

    if (!horario) {
        throw new Error('No está configurado el horario de atención.');
    }

    const diaSemana = fecha.getUTCDay() || 7;
    const dentroDelRangoDias = horario.dia_inicio <= horario.dia_fin
        ? diaSemana >= horario.dia_inicio && diaSemana <= horario.dia_fin
        : diaSemana >= horario.dia_inicio || diaSemana <= horario.dia_fin;
    const horaTurno = `${hora}:${minuto}`;

    if (!dentroDelRangoDias) {
        return 'La fecha elegida está fuera de los días habilitados para turnos.';
    }

    if (horaTurno < horario.hora_inicio || horaTurno >= horario.hora_fin) {
        return `El horario habilitado es de ${horario.hora_inicio} a ${horario.hora_fin}.`;
    }

    return null;
};

const asignarTurno = async (req, res) => {
    try {
        const errorDisponibilidad = await validarDisponibilidadTurno(req.body?.fecha_hora);

        if (errorDisponibilidad) {
            return res.status(400).json({ message: errorDisponibilidad });
        }

        const turno = await turnosModel.guardarTurno(req.body);
        res.status(201).json({message: "Turno asignado"});
    } catch (error) {
        console.error('Error al asignar el turno:', error);
        res.status(500).json({ error: error.message });
    }
};

const modificarTurno = async (req, res) => {
    try {
        const errorDisponibilidad = await validarDisponibilidadTurno(req.body?.fecha_hora);

        if (errorDisponibilidad) {
            return res.status(400).json({ message: errorDisponibilidad });
        }

        const turno = await turnosModel.editarTurno(req.params.id, req.body);
        res.status(200).json({message: "Turno modificado"});
    } catch (error) {
        console.error('Error al modificar el turno:', error);
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


export default {
    asignarTurno,
    modificarTurno,
    cancelarTurno,
    turnoCompletado,
    obtenerDatosTurno,
    obtenerTurnosPorFecha,
    obtenerHorarioAtencion,
    actualizarHorarioAtencion
};