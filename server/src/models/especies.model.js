import db from "../config/db.js";

const obtenerEspecies = async () => {
    const { rows } = await db.query(
        "SELECT id, nombre FROM especies ORDER BY nombre"
    );
    return rows
};

const obtenerRazas = async (idEspecie) => {
    const { rows } = await db.query(
        `SELECT id, nombre
        FROM razas
        WHERE id_especie = $1
        ORDER BY nombre`,
        [idEspecie]
    );
    return rows
};

export default {
    obtenerEspecies,
    obtenerRazas,
}