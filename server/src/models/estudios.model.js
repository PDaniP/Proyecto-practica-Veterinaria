import db from '../config/db.js';

const existeConsulta = async (idConsulta) => {
    const { rows } = await db.query(
        'SELECT id FROM consultas WHERE id = $1',
        [idConsulta]
    );
    return rows.length > 0;
};

const añadirEstudio = async (estudio) => {
    const { id_consulta, nombre_archivo, url_archivo, tipo_archivo } = estudio;
    const { rows } = await db.query(
        `INSERT INTO estudios_adjuntos
            (id_consulta, nombre_archivo, url_archivo, tipo_archivo)
         VALUES ($1, $2, $3, $4)
         RETURNING id, id_consulta, nombre_archivo, tipo_archivo, fecha_subida`,
        [id_consulta, nombre_archivo, url_archivo, tipo_archivo]
    );
    return rows[0];
};

const obtenerEstudiosPorConsulta = async (idConsulta) => {
    const { rows } = await db.query(
        `SELECT id, id_consulta, nombre_archivo, tipo_archivo, fecha_subida
         FROM estudios_adjuntos
         WHERE id_consulta = $1
         ORDER BY fecha_subida ASC, id ASC`,
        [idConsulta]
    );
    return rows;
};

const obtenerEstudioPorId = async (id) => {
    const { rows } = await db.query(
        `SELECT id, id_consulta, nombre_archivo, url_archivo, tipo_archivo, fecha_subida
         FROM estudios_adjuntos
         WHERE id = $1`,
        [id]
    );
    return rows[0];
};

export default {
    existeConsulta,
    añadirEstudio,
    obtenerEstudiosPorConsulta,
    obtenerEstudioPorId
};