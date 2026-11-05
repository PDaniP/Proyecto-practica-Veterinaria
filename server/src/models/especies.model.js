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

const cantidadMascotasPorEspecie = async () => {
    const { rows } = await db.query(
        `SELECT e.id, e.nombre, COUNT(m.id) AS cantidad
        FROM especies e
        LEFT JOIN mascotas m ON m.id_especie = e.id
        GROUP BY e.id, e.nombre
        ORDER BY e.nombre`
    );
    return rows
};

export default {
    obtenerEspecies,
    obtenerRazas,
    cantidadMascotasPorEspecie
}