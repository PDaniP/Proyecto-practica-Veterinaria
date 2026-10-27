import cron from 'node-cron';
import db from './db.js'; 
import { enviarNotificacion } from './whatsapp.js';
import { addDays, format } from 'date-fns';

export const iniciarCronRecordatorios = () => {
    // 0 minutos, 10 horas, todos los días del mes, todos los meses, todos los días de la semana
    // El string '30 21 * * *' significa: ejecutar a las 21:30 todos los días.
    cron.schedule('30 08 * * *', async () => {
        console.log('⏰ Revisando turnos para enviar recordatorios de WhatsApp...');

        try {
            // Calculamos la fecha exacta de mañana en formato YYYY-MM-DD
            const fechaManana = format(addDays(new Date(), 1), 'yyyy-MM-dd');

            // Buscamos turnos para mañana (casteando fecha_hora a date) que acepten notificación y no hayan sido enviados
            const { rows: turnos } = await db.query(`
                SELECT id, nombre_contacto, telefono_contacto, fecha_hora, motivo 
                FROM turnos 
                WHERE fecha_hora::date = $1 
                AND recibe_notificaciones = TRUE 
                AND recordatorio_enviado = FALSE
            `, [fechaManana]);

            if (turnos.length === 0) {
                console.log('No hay recordatorios pendientes para mañana.');
                return;
            }

            // Recorremos cada turno encontrado
            for (const turno of turnos) {
                // Extraemos solo la hora (ej: 15:30) de la fecha del turno
                const horaFormateada = format(new Date(turno.fecha_hora), 'HH:mm');
                
                const mensaje = `¡Hola ${turno.nombre_contacto}! Te recordamos que mañana a las ${horaFormateada} tenés un turno en nuestra Veterinaria por: ${turno.motivo}. ¡Te esperamos!`;
                
                // Enviamos el mensaje
                await enviarNotificacion(turno.telefono_contacto, mensaje);
                
                // Marcamos el turno como notificado en la BDD para no repetir el mensaje si el servidor se reinicia
                await db.query('UPDATE turnos SET recordatorio_enviado = TRUE WHERE id = $1', [turno.id]);
                
                console.log(`✅ Recordatorio enviado a ${turno.nombre_contacto} (${turno.telefono_contacto})`);
            }

        } catch (error) {
            console.error('❌ Error ejecutando el cron de recordatorios:', error);
        }
    });
};