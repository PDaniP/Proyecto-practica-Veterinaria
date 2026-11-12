import turnosModel from '../models/turnos.model.js';
import { enviarNotificacion } from '../config/whatsapp.js';
import { format } from 'date-fns';

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
        
        // Le respondemos rápido al frontend para que el usuario no se quede esperando
        res.status(201).json({message: "Turno asignado", turno});

        // ========================================================
        // NUEVA LÓGICA: Confirmación por WhatsApp a los 2 minutos
        // ========================================================
        const { nombre_contacto, telefono_contacto, fecha_hora } = req.body;

        if (telefono_contacto) {
            setTimeout(async () => {
                try {
                    const fechaObj = new Date(fecha_hora);
                    
                    // date-fns extrae la hora local automáticamente
                    const fechaFormateada = format(fechaObj, 'dd/MM/yyyy');
                    const horaFormateada = format(fechaObj, 'HH:mm');
                    
                    const mensajeConfirmacion = `¡Hola ${nombre_contacto || 'cliente'}! Te confirmamos que tu turno para el día ${fechaFormateada} a las ${horaFormateada} fue registrado exitosamente. ¡Te esperamos! 🐾`;

                    await enviarNotificacion(telefono_contacto, mensajeConfirmacion);
                    console.log(`✅ Confirmación de 2 min enviada a ${telefono_contacto}`);
                } catch (error) {
                    console.error('❌ Error enviando la confirmación de WhatsApp:', error);
                }
            }, 120000);
        }

    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error('Error al asignar el turno:', error);
        return res.status(500).json({ message: 'No se pudo asignar el turno.' });
    }
};

const modificarTurno = async (req, res) => {
    try {
        const errorDisponibilidad = await validarDisponibilidadTurno(req.body?.fecha_hora);

        if (errorDisponibilidad) {
            return res.status(400).json({ message: errorDisponibilidad });
        }

        const turno = await turnosModel.editarTurno(req.params.id, req.body);
        if (!turno) {
            return res.status(404).json({ message: 'No se encontró el turno.' });
        }
        
        // Respondemos rápido al frontend
        res.status(200).json({message: "Turno modificado", turno});

        // ========================================================
        // AVISO DE MODIFICACIÓN POR WHATSAPP (Inmediato)
        // ========================================================
        if (turno.telefono_contacto) {
            try {
                const fechaObj = new Date(turno.fecha_hora);
                const fechaFormateada = format(fechaObj, 'dd/MM/yyyy');
                const horaFormateada = format(fechaObj, 'HH:mm');
                
                const mensaje = `¡Hola ${turno.nombre_contacto || 'cliente'}! Te informamos que tu turno en nuestra veterinaria fue reprogramado para el día ${fechaFormateada} a las ${horaFormateada}. ¡Te esperamos! 🐾`;
                
                await enviarNotificacion(turno.telefono_contacto, mensaje);
                console.log(`✅ Aviso de modificación enviado a ${turno.telefono_contacto}`);
            } catch (error) {
                console.error('❌ Error enviando WhatsApp de modificación:', error);
            }
        }

    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error('Error al modificar el turno:', error);
        return res.status(500).json({ message: 'No se pudo modificar el turno.' });
    }
};

const cancelarTurno = async (req, res) => {
    try {
        const turno = await turnosModel.eliminarTurno(req.params.id);
        
        // Respondemos rápido al frontend
        res.status(200).json({message: "Turno cancelado"});

        // ========================================================
        // AVISO DE CANCELACIÓN POR WHATSAPP (Inmediato)
        // ========================================================
        if (turno && turno.telefono_contacto) {
            try {
                const fechaObj = new Date(turno.fecha_hora);
                const fechaFormateada = format(fechaObj, 'dd/MM/yyyy');
                const horaFormateada = format(fechaObj, 'HH:mm');
                
                const mensaje = `¡Hola ${turno.nombre_contacto || 'cliente'}! Te confirmamos que tu turno del día ${fechaFormateada} a las ${horaFormateada} ha sido cancelado. Si necesitás volver a programarlo, avisanos. ¡Saludos! 🐾`;
                
                await enviarNotificacion(turno.telefono_contacto, mensaje);
                console.log(`✅ Aviso de cancelación enviado a ${turno.telefono_contacto}`);
            } catch (error) {
                console.error('❌ Error enviando WhatsApp de cancelación:', error);
            }
        }

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
    obtenerHorarioAtencion,
    actualizarHorarioAtencion,
    reportesTurnos
};