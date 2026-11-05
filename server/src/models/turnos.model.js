import db from '../config/db.js';

const guardarTurno = async (turno) => {
    // AGREGADO: cliente_id y recibe_notificaciones
    const {cliente_id, nombre_contacto, telefono_contacto, profesional_id, fecha_hora, motivo, observaciones, recibe_notificaciones} = turno;
    const {rows} = await db.query(
        'INSERT INTO turnos (cliente_id, nombre_contacto, telefono_contacto, profesional_id, fecha_hora, motivo, observaciones, recibe_notificaciones) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [cliente_id || null, nombre_contacto, telefono_contacto, profesional_id, fecha_hora, motivo, observaciones || null, recibe_notificaciones || false]
    );
    return rows[0];
}

const editarTurno = async (id, turno) => {
    // AGREGADO: recibe_notificaciones
    const {profesional_id, fecha_hora, motivo, estado, observaciones, recibe_notificaciones} = turno;
    const {rows} = await db.query(
        'UPDATE turnos SET (profesional_id, fecha_hora, motivo, estado, observaciones, recibe_notificaciones) = ($1, $2, $3, $4, $5, $6) WHERE id = $7 RETURNING *',
        [profesional_id, fecha_hora, motivo, estado, observaciones || null, recibe_notificaciones || false, id]
    );
    return rows[0];
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
    reporteTurnos
};