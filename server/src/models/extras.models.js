import db from "../config/db.js";

const añadirMotivo = async (motivo) => {
    const { rows } = await db.query(
        'INSERT INTO motivos (motivo) VALUES ($1) RETURNING *',
        [motivo]
    );
    return rows[0];
};

const añadirDiagnosticoSegunMotivo = async (id_motivo, diagnostico) => {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');
        const { rows } = await client.query(
            'INSERT INTO diagnosticos (diagnostico, id_motivo) VALUES ($1, $2) RETURNING *',
            [diagnostico, id_motivo]
        );
        await client.query(
            'UPDATE motivos SET id_diagnostico = $1 WHERE id = $2',
            [rows[0].id, id_motivo]
        );
        await client.query('COMMIT');
        return rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export default {
    añadirMotivo,
    añadirDiagnosticoSegunMotivo
};