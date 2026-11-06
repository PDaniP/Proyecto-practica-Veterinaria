import db from '../config/db.js';

const bloquearHorarioProfesional = async (client, profesionalId, fechaHora) => {
    if (profesionalId == null) return;

    await client.query(
        `SELECT pg_advisory_xact_lock($1::integer, hashtext(($2::timestamp)::date::text))`,
        [profesionalId, fechaHora]
    );
};

const verificarHorarioDisponible = async (client, profesionalId, fechaHora, idExcluir = null) => {
    if (profesionalId == null) return;

    const { rows } = await client.query(
        `SELECT id
         FROM turnos
         WHERE profesional_id = $1
           AND fecha_hora = $2::timestamp
           AND LOWER(COALESCE(estado, 'pendiente')) <> 'cancelado'
           AND ($3::integer IS NULL OR id <> $3)
         LIMIT 1`,
        [profesionalId, fechaHora, idExcluir]
    );

    if (rows.length > 0) {
        const error = new Error('El profesional ya tiene un turno asignado en esa fecha y hora.');
        error.statusCode = 409;
        throw error;
    }
};

const guardarTurno = async (turno) => {
    const {cliente_id, nombre_contacto, telefono_contacto, profesional_id, fecha_hora, motivo, observaciones, recibe_notificaciones} = turno;
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');
        await bloquearHorarioProfesional(client, profesional_id, fecha_hora);
        await verificarHorarioDisponible(client, profesional_id, fecha_hora);
        const {rows} = await client.query(
            'INSERT INTO turnos (cliente_id, nombre_contacto, telefono_contacto, profesional_id, fecha_hora, motivo, observaciones, recibe_notificaciones) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [cliente_id || null, nombre_contacto, telefono_contacto, profesional_id, fecha_hora, motivo, observaciones || null, recibe_notificaciones || false]
        );
        await client.query('COMMIT');
        return rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

const editarTurno = async (id, turno) => {
    const {profesional_id, fecha_hora, motivo, estado, observaciones, recibe_notificaciones} = turno;
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');
        if (String(estado).toLowerCase() !== 'cancelado') {
            await bloquearHorarioProfesional(client, profesional_id, fecha_hora);
            await verificarHorarioDisponible(client, profesional_id, fecha_hora, id);
        }
        const {rows} = await client.query(
            'UPDATE turnos SET (profesional_id, fecha_hora, motivo, estado, observaciones, recibe_notificaciones) = ($1, $2, $3, $4, $5, $6) WHERE id = $7 RETURNING *',
            [profesional_id, fecha_hora, motivo, estado, observaciones || null, recibe_notificaciones || false, id]
        );
        await client.query('COMMIT');
        return rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

const eliminarTurno = async (id) => {
    const {rows} = await db.query('UPDATE turnos SET estado = $1 WHERE id = $2 RETURNING *', ['cancelado', id]);
    return rows[0];
};

const completarTurno = async (id) => {
    const {rows} = await db.query('UPDATE turnos SET estado = $1 WHERE id = $2 RETURNING *', ['completado',id])
    return rows[0]
}

const datosTurno = async () => {
    const {rows} = await db.query('SELECT * FROM turnos');
    return rows[0];
}


const obtenerTurnosPorFecha = async (fecha) => {
    const { rows } = await db.query(
        `SELECT
            t.*,
            u.nombre AS profesional_nombre
         FROM turnos t
         LEFT JOIN usuarios u ON u.id = t.profesional_id
         WHERE t.fecha_hora >= $1::date
           AND t.fecha_hora < ($1::date + INTERVAL '1 day')
         ORDER BY t.fecha_hora ASC`,
        [fecha]
    );

    return rows;
};

const obtenerHorarioAtencion = async () => {
    const { rows } = await db.query(
        `SELECT
            to_char(hora_inicio, 'HH24:MI') AS hora_inicio,
            to_char(hora_fin, 'HH24:MI') AS hora_fin,
            dia_inicio,
            dia_fin
         FROM horario_atencion
         WHERE id = 1`
    );

    return rows[0];
};

const guardarHorarioAtencion = async (horario) => {
    const { hora_inicio, hora_fin, dia_inicio, dia_fin } = horario;
    const { rows } = await db.query(
        `INSERT INTO horario_atencion (id, hora_inicio, hora_fin, dia_inicio, dia_fin)
         VALUES (1, $1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET
            hora_inicio = EXCLUDED.hora_inicio,
            hora_fin = EXCLUDED.hora_fin,
            dia_inicio = EXCLUDED.dia_inicio,
            dia_fin = EXCLUDED.dia_fin
         RETURNING
            to_char(hora_inicio, 'HH24:MI') AS hora_inicio,
            to_char(hora_fin, 'HH24:MI') AS hora_fin,
            dia_inicio,
            dia_fin`,
        [hora_inicio, hora_fin, dia_inicio, dia_fin]
    );

    return rows[0];
};
const reporteTurnos = async (fecha_inicio, fecha_fin) => {
    const query = `
        SELECT 
            COALESCE(estado,'Sin estado') AS estado,
            COUNT(*)::int AS cantidad
        FROM turnos
        WHERE fecha_hora >= $1::date
          AND fecha_hora < ($2::date + INTERVAL '1 day')
        GROUP BY estado
        ORDER BY cantidad ASC
    `;
    const { rows } = await db.query(query, [fecha_inicio, fecha_fin]);
    const query2 = `
        SELECT
            u.nombre as profesional,
            COUNT(*)::int AS turnos_asignados
        FROM turnos
        LEFT JOIN usuarios u ON u.id = turnos.profesional_id
        WHERE fecha_hora >= $1::date
          AND fecha_hora < ($2::date + INTERVAL '1 day')
        GROUP BY u.nombre
        ORDER BY turnos_asignados ASC
    `;
    const {rows:rows2 } = await db.query(query2, [fecha_inicio, fecha_fin]);
    return { rows, rows2 };

}

export default {
    guardarTurno,
    editarTurno,
    eliminarTurno,
    completarTurno,
    datosTurno,
    obtenerTurnosPorFecha,
    obtenerHorarioAtencion,
    guardarHorarioAtencion,
    reporteTurnos
};